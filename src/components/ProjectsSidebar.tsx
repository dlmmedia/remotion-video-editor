"use client";

import { useState } from "react";
import {
  Plus,
  FolderOpen,
  Clock,
  MoreHorizontal,
  Search,
  Film,
  Sparkles,
  Archive,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  updatedAt: string;
  status: "draft" | "rendering" | "complete";
  starred: boolean;
  thumbnail?: string;
}

const DEMO_PROJECTS: Project[] = [
  {
    id: "1",
    name: "Product Launch Intro",
    updatedAt: "2 min ago",
    status: "complete",
    starred: true,
  },
  {
    id: "2",
    name: "Data Visualization",
    updatedAt: "1 hour ago",
    status: "draft",
    starred: false,
  },
  {
    id: "3",
    name: "Logo Reveal Animation",
    updatedAt: "3 hours ago",
    status: "rendering",
    starred: true,
  },
  {
    id: "4",
    name: "Social Media Ad",
    updatedAt: "Yesterday",
    status: "complete",
    starred: false,
  },
  {
    id: "5",
    name: "Tutorial Explainer",
    updatedAt: "2 days ago",
    status: "draft",
    starred: false,
  },
];

interface ProjectsSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewProject: () => void;
  onSelectProject?: (id: string) => void;
}

export function ProjectsSidebar({
  isOpen,
  onToggle,
  onNewProject,
  onSelectProject,
}: ProjectsSidebarProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "starred" | "recent">("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>("1");

  const filteredProjects = DEMO_PROJECTS.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "starred" && p.starred) ||
      filter === "recent";
    return matchesSearch && matchesFilter;
  });

  return (
    <aside
      className={cn(
        "fixed top-16 left-0 bottom-0 z-40 bg-[#050219]/95 backdrop-blur-xl border-r border-violet-glow/10 transition-all duration-300 flex flex-col",
        isOpen ? "w-72" : "w-0 overflow-hidden",
      )}
    >
      {/* Header */}
      <div className="p-4 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground font-['Space_Grotesk',sans-serif] flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-violet-glow" />
            Projects
          </h2>
          <button
            onClick={onNewProject}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-glow/10 border border-violet-glow/20 text-violet-glow text-xs font-medium hover:bg-violet-glow/20 transition-colors"
          >
            <Plus className="w-3 h-3" />
            New
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground-dim" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-accent/50 border border-border-dim rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground-dim focus:outline-none focus:border-violet-glow/30 transition-colors"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1">
          {(["all", "starred", "recent"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-all",
                filter === f
                  ? "bg-violet-glow/15 text-violet-glow border border-violet-glow/20"
                  : "text-muted-foreground-dim hover:text-muted-foreground hover:bg-accent/30",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Projects list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        {filteredProjects.map((project) => (
          <button
            key={project.id}
            onMouseEnter={() => setHoveredId(project.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => {
              setActiveId(project.id);
              onSelectProject?.(project.id);
            }}
            className={cn(
              "w-full group flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-all",
              activeId === project.id
                ? "bg-violet-glow/10 border border-violet-glow/20"
                : "hover:bg-accent/40 border border-transparent",
            )}
          >
            {/* Icon */}
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                project.status === "rendering"
                  ? "bg-amber-glow/10"
                  : project.status === "complete"
                    ? "bg-cyan-glow/10"
                    : "bg-accent",
              )}
            >
              {project.status === "rendering" ? (
                <Sparkles className="w-3.5 h-3.5 text-amber-glow animate-pulse" />
              ) : (
                <Film className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-foreground truncate block flex-1">
                  {project.name}
                </span>
                {project.starred && (
                  <Star className="w-3 h-3 text-amber-glow shrink-0 fill-amber-glow" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Clock className="w-2.5 h-2.5 text-muted-foreground-dim" />
                <span className="text-[10px] text-muted-foreground-dim">
                  {project.updatedAt}
                </span>
                <StatusDot status={project.status} />
              </div>
            </div>

            {/* Actions */}
            {hoveredId === project.id && (
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded-md hover:bg-accent text-muted-foreground-dim hover:text-muted-foreground transition-colors shrink-0"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            )}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border-dim shrink-0">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground-dim">
          <span>{filteredProjects.length} projects</span>
          <button className="flex items-center gap-1 hover:text-muted-foreground transition-colors">
            <Archive className="w-3 h-3" />
            Archive
          </button>
        </div>
      </div>
    </aside>
  );
}

function StatusDot({ status }: { status: Project["status"] }) {
  const colors = {
    draft: "bg-muted-foreground-dim",
    rendering: "bg-amber-glow animate-pulse",
    complete: "bg-cyan-glow",
  };

  return <div className={cn("w-1.5 h-1.5 rounded-full", colors[status])} />;
}
