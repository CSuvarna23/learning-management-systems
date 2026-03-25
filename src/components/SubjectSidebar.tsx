import { CheckCircle2, Lock, PlayCircle, ChevronDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

interface Video {
  id: string;
  title: string;
  order_index: number;
}

interface Section {
  id: string;
  title: string;
  order_index: number;
  videos: Video[];
}

interface ProgressMap {
  [videoId: string]: { last_position_seconds: number; is_completed: boolean };
}

interface SubjectSidebarProps {
  subject: { id: string; title: string; sections: Section[] };
  progress: ProgressMap;
  currentVideoId?: string;
  isVideoLocked: (videoId: string) => boolean;
  progressPercent: number;
  onVideoSelect: (videoId: string) => void;
}

export function SubjectSidebar({
  subject,
  progress,
  currentVideoId,
  isVideoLocked,
  progressPercent,
  onVideoSelect,
}: SubjectSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(subject.sections.map(s => s.id))
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  return (
    <div className="h-screen flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="font-display text-sidebar-primary text-lg leading-tight">{subject.title}</h2>
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-sidebar-muted mb-1">
            <span>Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-1.5 bg-sidebar-accent" />
        </div>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto py-2">
        {subject.sections.map(section => (
          <div key={section.id}>
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-sidebar-muted hover:text-sidebar-foreground transition-colors"
            >
              <span>{section.title}</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${expandedSections.has(section.id) ? "" : "-rotate-90"}`} />
            </button>

            {expandedSections.has(section.id) && (
              <div className="pb-2">
                {section.videos.map(video => {
                  const locked = isVideoLocked(video.id);
                  const completed = progress[video.id]?.is_completed;
                  const isCurrent = video.id === currentVideoId;

                  return (
                    <button
                      key={video.id}
                      onClick={() => onVideoSelect(video.id)}
                      disabled={locked}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${
                        isCurrent
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : locked
                          ? "text-sidebar-muted cursor-not-allowed opacity-50"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                      }`}
                    >
                      {completed ? (
                        <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                      ) : locked ? (
                        <Lock className="h-4 w-4 flex-shrink-0" />
                      ) : (
                        <PlayCircle className={`h-4 w-4 flex-shrink-0 ${isCurrent ? "text-accent" : ""}`} />
                      )}
                      <span className="truncate">{video.title}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
