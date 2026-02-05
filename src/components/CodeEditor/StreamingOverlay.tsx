"use client";

import React from "react";

interface StreamingOverlayProps {
  visible: boolean;
  message?: string;
}

export const StreamingOverlay: React.FC<StreamingOverlayProps> = ({
  visible,
  message = "Generating code...",
}) => {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 bg-[#030014]/60 z-10 flex items-center justify-center pointer-events-none">
      <div className="flex items-center gap-3 bg-[#0c0a1d] px-4 py-3 rounded-lg border border-violet-glow/20">
        <div className="w-4 h-4 border-2 border-violet-glow/30 border-t-violet-glow rounded-full animate-spin" />
        <span className="text-foreground text-sm font-sans">{message}</span>
      </div>
    </div>
  );
};
