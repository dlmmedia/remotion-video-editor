import React from "react";

const isLambdaNotConfiguredError = (message: string): boolean => {
  return (
    message.includes("Set up DLM Media Lambda") ||
    message.includes("Function not found:")
  );
};

export const ErrorComp: React.FC<{
  message: string;
}> = ({ message }) => {
  const isLambdaError = isLambdaNotConfiguredError(message);

  if (isLambdaError) {
    return (
      <div className="py-2">
        <div className="text-destructive text-sm font-semibold font-sans">
          Lambda not configured
        </div>
        <div className="text-destructive-foreground text-sm font-sans mt-1">
          To render videos, set up DLM Media Lambda and add your AWS credentials
          to the <code className="font-mono text-xs">.env</code> file.
        </div>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="text-destructive text-sm font-semibold font-sans">
        Error
      </div>
      <div className="text-destructive-foreground text-sm font-mono mt-1 whitespace-pre-wrap break-words">
        {message}
      </div>
    </div>
  );
};
