"use client";

import React from "react";
import { ChevronDown, ChevronRight, FileCode2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { CopyButton } from "./CopyButton";

interface EditorHeaderProps {
  filename: string;
  code: string;
  lineCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isStreaming?: boolean;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  filename,
  code,
  lineCount,
  isCollapsed,
  onToggleCollapse,
  isStreaming = false,
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-3 py-2.5",
        "bg-[#0d0b1e]",
        isCollapsed
          ? "rounded-lg"
          : "rounded-t-lg border-b border-[#1e1b4b]/50",
        "select-none",
      )}
    >
      {/* Left side: collapse toggle + file info */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onToggleCollapse}
          className="flex items-center justify-center w-5 h-5 rounded text-muted-foreground hover:text-foreground hover:bg-[#1a1740]/60 transition-colors"
          aria-label={isCollapsed ? "Expand editor" : "Collapse editor"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        <div className="flex items-center gap-2 min-w-0">
          {/* File type icon with streaming pulse */}
          <div className="relative flex-shrink-0">
            <FileCode2 className="w-4 h-4 text-[#7c3aed]/70" />
            {isStreaming && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#06b6d4] rounded-full animate-pulse" />
            )}
          </div>
          <span className="text-xs text-foreground/80 font-mono truncate">
            {filename}
          </span>
        </div>
      </div>

      {/* Right side: line count + copy */}
      <div className="flex items-center gap-1.5">
        {lineCount > 0 && (
          <span className="text-[10px] text-muted-foreground/50 font-mono tabular-nums px-1.5 py-0.5 rounded-sm bg-[#1a1740]/30">
            {lineCount} {lineCount === 1 ? "line" : "lines"}
          </span>
        )}
        <CopyButton text={code} />
      </div>
    </div>
  );
};
