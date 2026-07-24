const YOUTUBE_VIDEO_URL_MAX_LENGTH = 500;

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

const YOUTUBE_PATHS_WITH_VIDEO_ID = new Set([
  "embed",
  "live",
  "shorts",
  "v",
]);

function createCanonicalYouTubeUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

function hasUsableVideoId(value: string | null): boolean {
  return Boolean(value && /^[A-Za-z0-9_-]{6,}$/.test(value));
}

export function getYouTubeVideoId(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.toLowerCase();
  const pathSegments = url.pathname.split("/").filter(Boolean);

  if (host === "youtu.be") {
    const videoId = pathSegments[0] ?? null;
    return hasUsableVideoId(videoId) ? videoId : null;
  }

  if (!YOUTUBE_HOSTS.has(host)) return null;

  if (url.pathname === "/watch") {
    const videoId = url.searchParams.get("v");
    return hasUsableVideoId(videoId) ? videoId : null;
  }

  const firstSegment = pathSegments[0]?.toLowerCase();
  if (firstSegment && YOUTUBE_PATHS_WITH_VIDEO_ID.has(firstSegment)) {
    const videoId = pathSegments[1] ?? null;
    return hasUsableVideoId(videoId) ? videoId : null;
  }

  return null;
}

export function getCanonicalYouTubeVideoUrl(value: string): string | null {
  const videoId = getYouTubeVideoId(value);
  return videoId ? createCanonicalYouTubeUrl(videoId) : null;
}

export function normalizeOptionalYouTubeUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmedValue = value.trim();
  if (!trimmedValue) return null;

  return getCanonicalYouTubeVideoUrl(trimmedValue) ?? trimmedValue;
}

export function isValidYouTubeUrl(value: string): boolean {
  if (!value || value.length > YOUTUBE_VIDEO_URL_MAX_LENGTH) return false;

  return getYouTubeVideoId(value) !== null;
}

export function validateOptionalYouTubeUrl(value: unknown) {
  const youtubeVideoUrl = normalizeOptionalYouTubeUrl(value);

  if (!youtubeVideoUrl) {
    return { success: true as const, data: null };
  }

  if (youtubeVideoUrl.length > YOUTUBE_VIDEO_URL_MAX_LENGTH) {
    return {
      success: false as const,
      error: `La URL de YouTube no puede superar ${YOUTUBE_VIDEO_URL_MAX_LENGTH} caracteres`,
    };
  }

  if (!isValidYouTubeUrl(youtubeVideoUrl)) {
    return {
      success: false as const,
      error:
        "Ingresá una URL válida de YouTube, por ejemplo youtube.com/watch, youtu.be, Shorts, live o embed.",
    };
  }

  return { success: true as const, data: youtubeVideoUrl };
}
