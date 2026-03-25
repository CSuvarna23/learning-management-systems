/// <reference types="vite/client" />

interface YTPlayer {
  destroy(): void;
  getCurrentTime(): number;
  getDuration(): number;
}

interface Window {
  YT: {
    Player: new (elementId: string, options: any) => YTPlayer;
  };
  onYouTubeIframeAPIReady: (() => void) | undefined;
}
