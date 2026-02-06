"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Plus,
  FolderOpen,
  Clock,
  MoreHorizontal,
  Search,
  Film,
  Sparkles,
  Star,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectSummary } from "@/types/project";

/** Format a date string into a human-readable relative time */
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;
  return date.toLocaleDateString();
}

interface ProjectsSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewProject: () => void;
  onSelectProject?: (id: string) => void;
  /** The list of project summaries to display */
  projects: ProjectSummary[];
  /** Currently active project ID */
  activeProjectId?: string | null;
  /** Loading state */
  isLoading?: boolean;
  /** Callback to rename a project */
  onRenameProject?: (id: string, newName: string) => Promise<void>;
  /** Callback to delete a project */
  onDeleteProject?: (id: string) => Promise<void>;
  /** Callback to toggle star on a project */
  onToggleStar?: (id: string) => Promise<void>;
}

export function ProjectsSidebar({
  isOpen,
  onToggle,
  onNewProject,
  onSelectProject,
  projects,
  activeProjectId,
  isLoading = false,
  onRenameProject,
  onDeleteProject,
  onToggleStar,
}: ProjectsSidebarProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "starred" | "recent">("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "starred" && p.starred) ||
      filter === "recent";
    return matchesSearch && matchesFilter;
  });

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    }
    if (menuOpenId) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpenId]);

  // Focus rename input when entering rename mode
  useEffect(() => {
    if (renamingId) {
      setTimeout(() => renameInputRef.current?.focus(), 50);
    }
  }, [renamingId]);

  const startRename = useCallback(
    (project: ProjectSummary) => {
      setRenamingId(project.id);
      setRenameValue(project.name);
      setMenuOpenId(null);
    },
    [],
  );

  const confirmRename = useCallback(async () => {
    if (!renamingId || !renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    await onRenameProject?.(renamingId, renameValue.trim());
    setRenamingId(null);
  }, [renamingId, renameValue, onRenameProject]);

  const cancelRename = useCallback(() => {
    setRenamingId(null);
    setRenameValue("");
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      setMenuOpenId(null);
      await onDeleteProject?.(id);
    },
    [onDeleteProject],
  );

  const handleToggleStar = useCallback(
    async (id: string) => {
      setMenuOpenId(null);
      await onToggleStar?.(id);
    },
    [onToggleStar],
  );

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
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-5 h-5 border-2 border-violet-glow/20 border-t-violet-glow rounded-full animate-spin" />
            <span className="text-[11px] text-muted-foreground-dim">
              Loading projects...
            </span>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Film className="w-8 h-8 text-muted-foreground-dim/50" />
            <span className="text-[11px] text-muted-foreground-dim">
              {search
                ? "No matching projects"
                : "No projects yet. Create one!"}
            </span>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div
              key={project.id}
              className="relative"
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => {
                setHoveredId(null);
                // Don't close menu on mouse leave
              }}
            >
              <button
                onClick={() => {
                  if (renamingId !== project.id) {
                    onSelectProject?.(project.id);
                  }
                }}
                className={cn(
                  "w-full group flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-all",
                  activeProjectId === project.id
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
                    {renamingId === project.id ? (
                      <div
                        className="flex items-center gap-1 flex-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          ref={renameInputRef}
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") confirmRename();
                            if (e.key === "Escape") cancelRename();
                          }}
                          onBlur={confirmRename}
                          className="flex-1 bg-accent/80 border border-violet-glow/30 rounded px-1.5 py-0.5 text-xs text-foreground focus:outline-none focus:border-violet-glow/50 min-w-0"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmRename();
                          }}
                          className="p-0.5 rounded hover:bg-cyan-glow/20 text-cyan-glow transition-colors"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelRename();
                          }}
                          className="p-0.5 rounded hover:bg-red-500/20 text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-xs font-medium text-foreground truncate block flex-1">
                          {project.name}
                        </span>
                        {project.starred && (
                          <Star className="w-3 h-3 text-amber-glow shrink-0 fill-amber-glow" />
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Clock className="w-2.5 h-2.5 text-muted-foreground-dim" />
                    <span className="text-[10px] text-muted-foreground-dim">
                      {formatRelativeTime(project.updatedAt)}
                    </span>
                    <StatusDot status={project.status} />
                  </div>
                </div>

                {/* More actions button */}
                {(hoveredId === project.id || menuOpenId === project.id) &&
                  renamingId !== project.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(
                          menuOpenId === project.id ? null : project.id,
                        );
                      }}
                      className="p-1 rounded-md hover:bg-accent text-muted-foreground-dim hover:text-muted-foreground transition-colors shrink-0"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  )}
              </button>

              {/* Context menu */}
              {menuOpenId === project.id && (
                <div
                  ref={menuRef}
                  className="absolute right-2 top-full mt-1 z-50 bg-[#0c0a1d] border border-violet-glow/20 rounded-lg shadow-xl py-1 min-w-[140px] animate-fade-in"
                >
                  <button
                    onClick={() => startRename(project)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-violet-glow/10 transition-colors"
                  >
                    <Pencil className="w-3 h-3 text-muted-foreground" />
                    Rename
                  </button>
                  <button
                    onClick={() => handleToggleStar(project.id)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-violet-glow/10 transition-colors"
                  >
                    <Star
                      className={cn(
                        "w-3 h-3",
                        project.starred
                          ? "text-amber-glow fill-amber-glow"
                          : "text-muted-foreground",
                      )}
                    />
                    {project.starred ? "Unstar" : "Star"}
                  </button>
                  <div className="my-1 border-t border-violet-glow/10" />
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border-dim shrink-0">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground-dim">
          <span>{projects.length} project{projects.length !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </aside>
  );
}

function StatusDot({ status }: { status: ProjectSummary["status"] }) {
  const colors = {
    draft: "bg-muted-foreground-dim",
    rendering: "bg-amber-glow animate-pulse",
    complete: "bg-cyan-glow",
  };

  return <div className={cn("w-1.5 h-1.5 rounded-full", colors[status])} />;
}
