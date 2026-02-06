import React, { useEffect, useState } from "react";

export const ProgressBar: React.FC<{
  progress: number;
  onCancel?: () => void;
}> = ({ progress, onCancel }) => {
  const percentage = Math.round(progress * 100);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0
      ? `${mins}m ${secs.toString().padStart(2, "0")}s`
      : `${secs}s`;
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Rendering... {formatTime(elapsed)}
        </span>
        <div className="flex items-center gap-3">
          <span className="font-medium">{percentage}%</span>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
