import React, { useState, useEffect } from 'react';
import { X, Phone, KeyRound, ShieldCheck, ArrowRight, CheckCircle2, RefreshCw, User, Sparkles } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { phone: string; name: string }) => void;
  currentUser?: { phone: string; name: string } | null;
  onLogout?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser,
  onLogout
}) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Timer countdown when on OTP step
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [isOpen, step, timer]);

  // Reset modal when opened
  useEffect(() => {
    if (isOpen) {
      if (currentUser) {
        setStep('success');
      } else {
        setStep('phone');
        setPhone('');
        setOtp('');
        setError('');
        setTimer(30);
        setCanResend(false);
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Handle Send OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    // Simulate API call to send OTP
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      setTimer(30);
      setCanResend(false);
    }, 600);
  };

  // Handle Verify & Login Button
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanOtp = otp.trim();
    if (cleanOtp.length === 6) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        const user = {
          phone: phone.slice(-10) || '9876543210',
          name: `Student (${(phone.slice(-4) || '3210')})`
        };
        setStep('success');
        setTimeout(() => {
          onLoginSuccess(user);
          onClose();
        }, 500);
      }, 300);
    } else {
      setError('Please enter a valid 6-digit OTP.');
    }
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (!canResend) return;
    setError('');
    setCanResend(false);
    setTimer(30);
    // Mock resend
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#120818] rounded-3xl border-2 border-pink-500/40 shadow-2xl shadow-pink-600/30 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-b from-pink-950/60 to-transparent border-b border-pink-500/20">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-xl bg-pink-950/60 hover:bg-pink-900 text-pink-300 hover:text-white border border-pink-500/30 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-pink-600/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-pink-400">
                  GB STUDY ACCOUNT
                </span>
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              </div>
              <h3 className="text-lg font-black text-white font-heading">
                {currentUser ? 'Student Profile' : step === 'otp' ? 'Verify OTP' : 'Student Login / Signup'}
              </h3>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* LOGGED IN STATE */}
          {currentUser && step === 'success' ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Logged in Successfully!</h4>
                <p className="text-xs text-pink-300/80 mt-1">
                  Mobile Number: <span className="font-mono text-white font-semibold">+91 {currentUser.phone}</span>
                </p>
                <p className="text-[11px] text-pink-400/70 mt-1">
                  Enjoy unlimited access to all 29+ free batches, notes, and lectures.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={onClose}
                  className="btn-pink-gradient py-2.5 px-6 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md shadow-pink-600/30"
                >
                  Continue Learning
                </button>
                {onLogout && (
                  <button
                    onClick={() => {
                      onLogout();
                      setStep('phone');
                    }}
                    className="py-2.5 px-4 rounded-xl font-semibold text-xs text-pink-400 hover:text-white bg-pink-950/40 hover:bg-pink-900 border border-pink-500/30 transition"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          ) : step === 'phone' ? (
            /* STEP 1: ENTER PHONE NUMBER */
            <form onSubmit={handleSendOtp} className="space-y-4">
              <p className="text-xs text-pink-200/80 leading-relaxed">
                Enter your mobile number to verify and sync your saved batches, notes, and study progress across devices.
              </p>

              <div>
                <label className="block text-xs font-semibold text-pink-300 mb-1.5">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-pink-400 font-semibold text-xs">
                    <Phone className="w-4 h-4" />
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit number"
                    className="w-full pl-16 pr-4 py-3 rounded-2xl bg-pink-950/30 border border-pink-500/40 text-white placeholder-pink-400/40 text-sm font-medium focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400/50 tracking-wider"
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || phone.length < 10}
                className="w-full btn-pink-gradient py-3 px-5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30 hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-[11px] text-pink-400/60">
                <span>By continuing, you agree to GB STUDY's Free Education Terms.</span>
              </div>
            </form>
          ) : (
            /* STEP 2: ENTER OTP & VERIFY & LOGIN */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="flex items-center justify-between text-xs text-pink-200/80">
                <span>OTP sent to <b className="text-white font-mono">+91 {phone}</b></span>
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setError('');
                  }}
                  className="text-pink-400 hover:text-pink-300 font-semibold underline cursor-pointer"
                >
                  Edit
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-pink-300 mb-1.5">
                  Verification Code (OTP)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP (e.g. 123456)"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-pink-950/30 border border-pink-500/40 text-white placeholder-pink-400/40 text-sm font-mono tracking-widest text-center focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400/50"
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              {/* Verify & Login Button */}
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full btn-pink-gradient py-3 px-5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30 hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Login</span>
                  </>
                )}
              </button>

              {/* Resend OTP */}
              <div className="flex items-center justify-between text-xs text-pink-300/80 pt-1">
                <span>Didn't receive code?</span>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-pink-400 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend OTP</span>
                  </button>
                ) : (
                  <span className="text-pink-400/60 font-mono">
                    Resend in {timer}s
                  </span>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
