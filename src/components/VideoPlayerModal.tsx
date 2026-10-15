import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';
import { extractCleanVideoId, getTargetBoardIframeSrc } from '../utils/videoHelper';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoTitle?: string;
  assetId?: string;
  embedUrl?: string;
  videoUrl?: string;
  loading?: boolean;
  courseTitle?: string;
  lectureNumber?: number;
  onNextLecture?: () => void;
  onPrevLecture?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  videoTitle = '',
  assetId = '',
  embedUrl,
  videoUrl,
  loading = false,
  courseTitle,
  lectureNumber,
  onNextLecture,
  onPrevLecture,
  hasNext,
  hasPrev
}) => {
  const [isTheater, setIsTheater] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [, setIframeLoaded] = useState(false);

  // 1. Safely extract JUST the video ID string from assetId, videoUrl, or embedUrl
  // 3. If assetId or videoUrl is missing, fallback to parsing 'v' query directly from window.location.search
  const cleanVideoId = extractCleanVideoId(assetId || videoUrl || embedUrl, true);

  // 4. Guarantee that iframe src is always constructed as:
  //    https://targetboard.co.in/dashboard/video?v=${cleanVideoId}
  //    where cleanVideoId is never empty, undefined, or null.
  const playerSrc = getTargetBoardIframeSrc(cleanVideoId);

  const effectiveTitle = videoTitle || (cleanVideoId ? `Lecture Stream (${cleanVideoId})` : 'GB STUDY Lecture Stream');

  // Fallback check from URL for rendering permission
  const urlParamV = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('v')
    : null;

  // Reset error state when video source changes
  useEffect(() => {
    setIframeError(false);
    setIframeLoaded(false);
  }, [cleanVideoId, playerSrc]);

  // If modal is not open and there is no URL video query, do not render
  if (!isOpen && !urlParamV) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className={`relative w-full bg-[#120818] rounded-2xl sm:rounded-3xl border-2 border-pink-500/50 shadow-2xl shadow-pink-600/40 overflow-hidden flex flex-col transition-all duration-300 ${
          isTheater ? 'max-w-6xl max-h-[98vh]' : 'max-w-4xl max-h-[92vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Bar */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-gradient-to-r from-[#1a0a24] to-[#14081c] border-b border-pink-500/25 flex items-center justify-between gap-3 shrink-0 flex-wrap sm:flex-nowrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-pink-500/25 text-pink-300 border border-pink-500/40 uppercase tracking-wide">
                {lectureNumber ? `Lecture #${lectureNumber}` : 'Video Lecture'}
              </span>
              {courseTitle && (
                <span className="text-xs text-pink-300/80 font-medium truncate hidden sm:inline">
                  {courseTitle}
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white font-heading truncate mt-1">
              {effectiveTitle}
            </h3>
          </div>

          {/* Top Actions: Direct link + Theater mode + Close */}
          <div className="flex items-center gap-2 shrink-0">
            {playerSrc && (
              <a
                href={playerSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-pink-gradient px-3 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition hover:scale-105"
                title="Open directly in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Open in New Tab</span>
              </a>
            )}

            <button
              onClick={() => setIsTheater(!isTheater)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-950/60 hover:bg-pink-900 text-pink-300 hover:text-white border border-pink-500/30 text-xs font-semibold transition cursor-pointer"
              title={isTheater ? 'Standard View' : 'Theater Mode'}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{isTheater ? 'Compact' : 'Theater'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-pink-950/70 hover:bg-pink-900 text-pink-300 hover:text-white border border-pink-500/40 transition cursor-pointer"
              aria-label="Close Player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Area */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="w-10 h-10 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
              <p className="text-sm font-bold text-pink-300 font-heading">
                Loading GB STUDY Stream...
              </p>
              <p className="text-xs text-pink-400/70 font-mono">
                Connecting lecture stream
              </p>
            </div>
          ) : iframeError || !playerSrc ? (
            /* Fallback Card when iframe cannot load or cleanVideoId is missing */
            <div className="flex flex-col items-center justify-center gap-4 p-8 text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-pink-950/80 border border-pink-500/40 flex items-center justify-center text-pink-400 shadow-lg shadow-pink-600/30">
                <AlertCircle className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white font-heading">
                  {playerSrc ? 'Video Stream Ready' : 'No Video ID Provided'}
                </h4>
                <p className="text-xs text-pink-300/80 mt-1 leading-relaxed">
                  {playerSrc
                    ? 'Due to browser security/cross-origin policies, this lecture stream can be viewed directly in the official player window.'
                    : 'Please select a lecture from the course batches, or provide a valid video parameter (e.g. ?v=...) in the URL.'}
                </p>
              </div>
              {playerSrc && (
                <a
                  href={playerSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pink-gradient py-2.5 px-6 rounded-xl font-bold text-sm text-white flex items-center gap-2 shadow-lg shadow-pink-600/40 hover:scale-105 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Play Lecture in New Window</span>
                </a>
              )}
              {playerSrc && (
                <button
                  onClick={() => setIframeError(false)}
                  className="text-xs text-pink-400 hover:text-pink-300 underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry in-app player</span>
                </button>
              )}
            </div>
          ) : (
            <iframe
              src={playerSrc}
              title={effectiveTitle}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={() => setIframeLoaded(true)}
              onError={() => setIframeError(true)}
            />
          )}
        </div>

        {/* Modal Footer Bar: Navigation & Quality Badge */}
        <div className="p-3 sm:p-4 bg-[#14081c] border-t border-pink-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          {/* Status info */}
          <div className="flex items-center gap-2 text-pink-200/90 flex-wrap">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-white">Direct Streaming Active</span>
            <span className="text-pink-300/60">• 100% Free on GB STUDY</span>
            {playerSrc && (
              <a
                href={playerSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 hover:text-white underline font-semibold ml-2 flex items-center gap-1"
              >
                <span>Direct Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Next / Previous Lecture navigation */}
          <div className="flex items-center gap-2">
            {hasPrev && onPrevLecture && (
              <button
                onClick={onPrevLecture}
                className="px-3 py-1.5 rounded-xl bg-pink-950/60 hover:bg-pink-900 text-pink-200 border border-pink-500/30 flex items-center gap-1 font-semibold transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev Lecture</span>
              </button>
            )}

            {hasNext && onNextLecture && (
              <button
                onClick={onNextLecture}
                className="btn-pink-gradient px-3 py-1.5 rounded-xl text-white font-bold flex items-center gap-1 shadow-md shadow-pink-600/30 transition cursor-pointer"
              >
                <span>Next Lecture</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
