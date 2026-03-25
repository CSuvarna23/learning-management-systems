import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { SubjectSidebar } from "@/components/SubjectSidebar";
import { VideoPlayer } from "@/components/VideoPlayer";
import { BookOpen, Menu, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Video {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  order_index: number;
  duration_seconds: number | null;
  section_id: string;
}

interface Section {
  id: string;
  title: string;
  order_index: number;
  videos: Video[];
}

interface SubjectData {
  id: string;
  title: string;
  description: string | null;
  sections: Section[];
}

interface ProgressMap {
  [videoId: string]: { last_position_seconds: number; is_completed: boolean };
}

export default function SubjectView() {
  const { subjectId, videoId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<SubjectData | null>(null);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Fetch subject tree
  useEffect(() => {
    if (!subjectId) return;

    const fetchData = async () => {
      const { data: subjectData } = await supabase
        .from("subjects")
        .select("id, title, description")
        .eq("id", subjectId)
        .single();

      const { data: sectionsData } = await supabase
        .from("sections")
        .select("id, title, order_index")
        .eq("subject_id", subjectId)
        .order("order_index");

      const { data: videosData } = await supabase
        .from("videos")
        .select("id, title, description, youtube_url, order_index, duration_seconds, section_id")
        .in("section_id", (sectionsData || []).map(s => s.id))
        .order("order_index");

      if (subjectData && sectionsData) {
        const sections: Section[] = sectionsData.map(s => ({
          ...s,
          videos: (videosData || []).filter(v => v.section_id === s.id),
        }));
        setSubject({ ...subjectData, sections });
      }
      setLoading(false);
    };

    fetchData();
  }, [subjectId]);

  // Fetch progress
  useEffect(() => {
    if (!user || !subject) return;

    const allVideoIds = subject.sections.flatMap(s => s.videos.map(v => v.id));
    if (allVideoIds.length === 0) return;

    supabase
      .from("video_progress")
      .select("video_id, last_position_seconds, is_completed")
      .eq("user_id", user.id)
      .in("video_id", allVideoIds)
      .then(({ data }) => {
        const map: ProgressMap = {};
        (data || []).forEach(p => {
          map[p.video_id] = { last_position_seconds: p.last_position_seconds, is_completed: p.is_completed };
        });
        setProgress(map);
      });
  }, [user, subject]);

  // Flatten videos for ordering
  const allVideos = subject?.sections.flatMap(s => s.videos) || [];

  // Auto-navigate to first video if none selected
  useEffect(() => {
    if (!videoId && allVideos.length > 0 && !loading) {
      navigate(`/subjects/${subjectId}/video/${allVideos[0].id}`, { replace: true });
    }
  }, [videoId, allVideos.length, loading]);

  const currentVideo = allVideos.find(v => v.id === videoId);
  const currentIndex = allVideos.findIndex(v => v.id === videoId);

  // Check if a video is locked (strict sequential)
  const isVideoLocked = useCallback((vid: string) => {
    const idx = allVideos.findIndex(v => v.id === vid);
    if (idx <= 0) return false;
    const prevVideo = allVideos[idx - 1];
    return !progress[prevVideo.id]?.is_completed;
  }, [allVideos, progress]);

  const handleVideoComplete = useCallback(async (vid: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("video_progress")
      .upsert({
        user_id: user.id,
        video_id: vid,
        is_completed: true,
        completed_at: new Date().toISOString(),
        last_position_seconds: currentVideo?.duration_seconds || 0,
      }, { onConflict: "user_id,video_id" });

    if (!error) {
      setProgress(prev => ({
        ...prev,
        [vid]: { last_position_seconds: 0, is_completed: true },
      }));

      // Auto-advance to next
      if (currentIndex < allVideos.length - 1) {
        const nextVid = allVideos[currentIndex + 1];
        navigate(`/subjects/${subjectId}/video/${nextVid.id}`);
      }
    }
  }, [user, currentVideo, currentIndex, allVideos, subjectId, navigate]);

  const handleProgressUpdate = useCallback(async (vid: string, position: number) => {
    if (!user) return;
    await supabase
      .from("video_progress")
      .upsert({
        user_id: user.id,
        video_id: vid,
        last_position_seconds: Math.floor(position),
        is_completed: false,
      }, { onConflict: "user_id,video_id" });

    setProgress(prev => ({
      ...prev,
      [vid]: { ...prev[vid], last_position_seconds: Math.floor(position) },
    }));
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Subject not found.</p>
      </div>
    );
  }

  const completedCount = allVideos.filter(v => progress[v.id]?.is_completed).length;
  const totalVideos = allVideos.length;
  const progressPercent = totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-80" : "w-0"} transition-all duration-300 overflow-hidden flex-shrink-0`}>
        <SubjectSidebar
          subject={subject}
          progress={progress}
          currentVideoId={videoId}
          isVideoLocked={isVideoLocked}
          progressPercent={progressPercent}
          onVideoSelect={(vid) => {
            if (!isVideoLocked(vid)) {
              navigate(`/subjects/${subjectId}/video/${vid}`);
            }
          }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b bg-card/80 backdrop-blur-sm flex items-center px-4 gap-3 flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            <div className="h-6 w-6 rounded-md gradient-hero flex items-center justify-center">
              <BookOpen className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-display text-sm hidden sm:inline text-foreground">LearnFromScratch</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{completedCount}/{totalVideos} completed</span>
            <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-accent to-sky transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </header>

        {/* Video area */}
        <main className="flex-1 overflow-y-auto">
          {currentVideo ? (
            isVideoLocked(currentVideo.id) ? (
              <div className="flex items-center justify-center h-full p-8">
                <div className="text-center animate-fade-in">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <h3 className="text-xl font-display text-foreground">Video locked</h3>
                  <p className="text-muted-foreground mt-2">Complete the previous video to unlock this one.</p>
                </div>
              </div>
            ) : (
              <VideoPlayer
                video={currentVideo}
                startPosition={progress[currentVideo.id]?.last_position_seconds || 0}
                onComplete={() => handleVideoComplete(currentVideo.id)}
                onProgress={(pos) => handleProgressUpdate(currentVideo.id, pos)}
                prevVideoId={currentIndex > 0 ? allVideos[currentIndex - 1].id : undefined}
                nextVideoId={currentIndex < allVideos.length - 1 ? allVideos[currentIndex + 1].id : undefined}
                onNavigate={(vid) => navigate(`/subjects/${subjectId}/video/${vid}`)}
              />
            )
          ) : (
            <div className="flex items-center justify-center h-full p-8">
              <p className="text-muted-foreground">Select a video from the sidebar to start learning.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
