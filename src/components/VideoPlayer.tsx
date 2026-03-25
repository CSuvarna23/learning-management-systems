import { useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

interface VideoPlayerProps {
  video: {
    id: string;
    title: string;
    description: string | null;
    youtube_url: string;
    duration_seconds: number | null;
  };
  startPosition: number;
  onComplete: () => void;
  onProgress: (position: number) => void;
  prevVideoId?: string;
  nextVideoId?: string;
  onNavigate: (videoId: string) => void;
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^?&/#]+)/);
  return match ? match[1] : url;
}

export function VideoPlayer({
  video,
  startPosition,
  onComplete,
  onProgress,
  prevVideoId,
  nextVideoId,
  onNavigate,
}: VideoPlayerProps) {
  const intervalRef = useRef<number>();
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasCompletedRef = useRef(false);

  const youtubeId = extractYouTubeId(video.youtube_url);

  // Reset completion flag on video change
  useEffect(() => {
    hasCompletedRef.current = false;
  }, [video.id]);

  useEffect(() => {
    if (!youtubeId) return;

    // Load YouTube IFrame API if not present
    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

    const createPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new (window as any).YT.Player(`yt-player-${video.id}`, {
        videoId: youtubeId,
        playerVars: {
          start: Math.max(0, startPosition - 3),
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onStateChange: (event: any) => {
            if (event.data === 1) {
              // Playing - start tracking
              if (intervalRef.current) clearInterval(intervalRef.current);
              intervalRef.current = window.setInterval(() => {
                if (playerRef.current) {
                  const time = playerRef.current.getCurrentTime?.() || 0;
                  onProgress(time);
                }
              }, 10000);
            } else if (event.data === 2 || event.data === -1) {
              // Paused or unstarted
              if (intervalRef.current) clearInterval(intervalRef.current);
              if (playerRef.current && event.data === 2) {
                const time = playerRef.current.getCurrentTime?.() || 0;
                onProgress(time);
              }
            } else if (event.data === 0) {
              // Ended
              if (intervalRef.current) clearInterval(intervalRef.current);
              if (!hasCompletedRef.current) {
                hasCompletedRef.current = true;
                onComplete();
              }
            }
          },
        },
      });
    };

    if ((window as any).YT && (window as any).YT.Player) {
      createPlayer();
    } else {
      (window as any).onYouTubeIframeAPIReady = createPlayer;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [youtubeId, video.id]);

  return (
    <div className="animate-fade-in">
      {/* Player */}
      <div className="bg-foreground/5">
        <div className="max-w-5xl mx-auto">
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <div
              id={`yt-player-${video.id}`}
              ref={containerRef}
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* Video info & navigation */}
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-display text-foreground">{video.title}</h2>
            {video.description && (
              <p className="mt-2 text-muted-foreground">{video.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 pt-6 border-t">
          {prevVideoId && (
            <Button variant="outline" size="sm" onClick={() => onNavigate(prevVideoId)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
          )}
          <div className="flex-1" />
          {nextVideoId && (
            <Button size="sm" onClick={() => onNavigate(nextVideoId)}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
