// lib/extract-frames.ts
// Pulls evenly spaced frames from a video file in the browser, so only small JPEGs are
// uploaded instead of the whole video.

const MAX_FRAME_WIDTH = 960;
const JPEG_QUALITY = 0.85;
const LOAD_TIMEOUT_MS = 15000;

const UNREADABLE_VIDEO =
  "We couldn't read that video in this browser. Try an MP4, or on iPhone set Camera → Formats → Most Compatible.";

function waitFor(video: HTMLVideoElement, event: "loadeddata" | "seeked"): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(UNREADABLE_VIDEO));
    }, LOAD_TIMEOUT_MS);
    const onDone = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error(UNREADABLE_VIDEO));
    };
    const cleanup = () => {
      clearTimeout(timer);
      video.removeEventListener(event, onDone);
      video.removeEventListener("error", onError);
    };
    video.addEventListener(event, onDone);
    video.addEventListener("error", onError);
  });
}

// Returns base64 JPEG data (no "data:" prefix), taken at 1/(n+1) … n/(n+1) of the clip.
export async function extractFrames(file: File, count: number = 6): Promise<string[]> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;

  try {
    const loaded = waitFor(video, "loadeddata");
    video.load();
    await loaded;

    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0 || !video.videoWidth) {
      throw new Error(UNREADABLE_VIDEO);
    }

    const scale = Math.min(1, MAX_FRAME_WIDTH / video.videoWidth);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error(UNREADABLE_VIDEO);

    const frames: string[] = [];
    for (let i = 1; i <= count; i++) {
      const seeked = waitFor(video, "seeked");
      video.currentTime = (duration * i) / (count + 1);
      await seeked;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      frames.push(canvas.toDataURL("image/jpeg", JPEG_QUALITY).split(",")[1]);
    }
    return frames;
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(url);
  }
}
