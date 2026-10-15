/**
 * Utility functions for extracting clean video ID strings and constructing
 * reliable TargetBoard video player iframe URLs.
 */

/**
 * Safely extracts JUST the clean video ID string from:
 * - A raw ID: "32dPpeFk5kQ"
 * - A full URL: "https://targetboard.co.in/dashboard/video?v=32dPpeFk5kQ"
 * - An embed URL or path: "https://.../video/32dPpeFk5kQ"
 * - A parameter string: "?v=32dPpeFk5kQ" or "v=32dPpeFk5kQ"
 * - An object containing asset, assetId, v, id, videoUrl, or embedUrl
 * - Fallback: new URLSearchParams(window.location.search).get('v')
 */
export function extractCleanVideoId(
  input: unknown,
  fallbackToUrl: boolean = true
): string {
  let raw = '';

  if (typeof input === 'string') {
    raw = input.trim();
  } else if (input && typeof input === 'object') {
    const obj = input as Record<string, unknown>;
    if (typeof obj.asset === 'string') raw = obj.asset.trim();
    else if (typeof obj.assetId === 'string') raw = obj.assetId.trim();
    else if (typeof obj.v === 'string') raw = obj.v.trim();
    else if (typeof obj.id === 'string') raw = obj.id.trim();
    else if (typeof obj.videoUrl === 'string') raw = obj.videoUrl.trim();
    else if (typeof obj.embedUrl === 'string') raw = obj.embedUrl.trim();
    else if (typeof obj.video === 'object' && obj.video) {
      return extractCleanVideoId(obj.video, fallbackToUrl);
    }
  }

  // Check if raw is non-empty and not literal 'undefined' or 'null'
  if (raw && raw !== 'undefined' && raw !== 'null') {
    // 1. Try extracting from query parameter ?v= or &v= or v=
    if (raw.includes('v=')) {
      try {
        const url = new URL(raw.startsWith('http') ? raw : `https://targetboard.co.in/${raw.replace(/^\?/, '')}`);
        const v = url.searchParams.get('v');
        if (v && v.trim() && v !== 'undefined' && v !== 'null') {
          return v.trim();
        }
      } catch {
        const match = raw.match(/[?&]v=([^&#]+)/);
        if (match && match[1] && match[1] !== 'undefined' && match[1] !== 'null') {
          return decodeURIComponent(match[1]).trim();
        }
      }
    }

    // 2. Try extracting from /video/<id> path
    if (raw.includes('/video/')) {
      const parts = raw.split('/video/');
      if (parts[1]) {
        const cleanPart = parts[1].split(/[?&#]/)[0];
        if (cleanPart && cleanPart.trim() && cleanPart !== 'undefined' && cleanPart !== 'null') {
          return cleanPart.trim();
        }
      }
    }

    // 3. If raw doesn't contain url characters (no slashes, question marks, or ampersands)
    if (!raw.includes('/') && !raw.includes('?') && !raw.includes('&') && !raw.includes('=')) {
      return raw;
    }
  }

  // 4. Fallback: Parse 'v' query parameter directly from window.location.search
  if (fallbackToUrl && typeof window !== 'undefined') {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const urlV = searchParams.get('v');
      if (urlV && urlV.trim() && urlV !== 'undefined' && urlV !== 'null') {
        return urlV.trim();
      }
    } catch {}
  }

  return '';
}

/**
 * Guarantee that iframe src is strictly constructed as:
 * https://targetboard.co.in/dashboard/video?v=${cleanVideoId}
 * where cleanVideoId is never empty, undefined, or null.
 * Returns empty string if cleanVideoId is invalid so that no broken iframe is loaded.
 */
export function getTargetBoardIframeSrc(cleanVideoId: string): string {
  const safeId = extractCleanVideoId(cleanVideoId, false);
  if (!safeId || safeId === 'undefined' || safeId === 'null') {
    return '';
  }
  return `https://targetboard.co.in/dashboard/video?v=${encodeURIComponent(safeId)}`;
}
