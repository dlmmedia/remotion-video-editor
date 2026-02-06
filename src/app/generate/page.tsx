"use client";

import { useState, useCallback, useEffect, useRef, useMemo, Suspense } from "react";
import type { NextPage } from "next";
import { useSearchParams } from "next/navigation";
import { CodeEditor } from "../../components/CodeEditor";
import { AnimationPlayer } from "../../components/AnimationPlayer";
import { PageLayout } from "../../components/PageLayout";
import { ChatSidebar, type ChatSidebarRef } from "../../components/ChatSidebar";
import type { StreamPhase, GenerationErrorType } from "../../types/generation";
import { examples } from "../../examples/code";
import { useAnimationState } from "../../hooks/useAnimationState";
import { useConversationState } from "../../hooks/useConversationState";
import { useAutoCorrection } from "../../hooks/useAutoCorrection";
import { useProjectAutoSave } from "../../hooks/useProjects";
import type { Project } from "../../types/project";
import type {
  AssistantMetadata,
  ErrorCorrectionContext,
  EditOperation,
} from "../../types/conversation";

const MAX_CORRECTION_ATTEMPTS = 3;

function GeneratePageContent() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") || "";
  const projectId = searchParams.get("projectId") || null;

  const [durationInFrames, setDurationInFrames] = useState(
    examples[0]?.durationInFrames || 150,
  );
  const [fps, setFps] = useState(examples[0]?.fps || 30);
  const [currentFrame, setCurrentFrame] = useState(0);
  // Don't start streaming immediately — wait until we know whether the project
  // already has saved code (otherwise a page refresh re-triggers generation).
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamPhase, setStreamPhase] = useState<StreamPhase>("idle");
  const [prompt, setPrompt] = useState(initialPrompt);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);
  const [generationError, setGenerationError] = useState<{
    message: string;
    type: GenerationErrorType;
    failedEdit?: EditOperation;
  } | null>(null);
  // Only mark as loaded immediately when there's no project to fetch
  const [projectLoaded, setProjectLoaded] = useState(!projectId);

  // Self-correction state
  const [errorCorrection, setErrorCorrection] =
    useState<ErrorCorrectionContext | null>(null);

  // Conversation state for follow-up edits
  const {
    messages,
    hasManualEdits,
    pendingMessage,
    addUserMessage,
    addAssistantMessage,
    addErrorMessage,
    markManualEdit,
    getFullContext,
    getPreviouslyUsedSkills,
    setPendingMessage,
    clearPendingMessage,
    isFirstGeneration,
    loadMessages,
  } = useConversationState();

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { code, Component, error: compilationError, isCompiling, setCode, compileCode } =
    useAnimationState(examples[0]?.code || "");

  // Runtime errors from the Player (e.g., "cannot access variable before initialization")
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  // Combined error for display - either compilation or runtime error
  const codeError = compilationError || runtimeError;

  // Refs
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isStreamingRef = useRef(isStreaming);
  const codeRef = useRef(code);
  const chatSidebarRef = useRef<ChatSidebarRef>(null);

  // ─── Load existing project data ─────────────────────────────────
  // Always attempt to load the project when a projectId exists so that
  // a page refresh correctly restores saved code instead of re-generating.
  useEffect(() => {
    if (!projectId) return;

    let cancelled = false;
    async function loadProject() {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        if (!res.ok || cancelled) {
          // Project not found or request failed — still allow auto-start
          setProjectLoaded(true);
          return;
        }
        const project: Project = await res.json();
        if (cancelled) return;

        const hasExistingCode = Boolean(project.code && project.code.trim());

        // Restore project state
        if (hasExistingCode) {
          setCode(project.code);
          compileCode(project.code);
          setHasGeneratedOnce(true);
          // Project already has code — prevent the auto-start effect from
          // re-triggering generation (the key fix for the refresh bug).
          setHasAutoStarted(true);
        }
        if (project.messages && project.messages.length > 0) {
          loadMessages(project.messages);
        }
        if (project.prompt) {
          setPrompt(project.prompt);
        }
        if (project.durationInFrames) {
          setDurationInFrames(project.durationInFrames);
        }
        if (project.fps) {
          setFps(project.fps);
        }

        // If the project already has code, clean the URL to remove the
        // prompt/model params so future refreshes don't look like new generations.
        if (hasExistingCode && initialPrompt) {
          const url = new URL(window.location.href);
          url.searchParams.delete("prompt");
          url.searchParams.delete("model");
          window.history.replaceState({}, "", url.toString());
        }

        setProjectLoaded(true);
      } catch (err) {
        console.error("Failed to load project:", err);
        setProjectLoaded(true);
      }
    }

    loadProject();
    return () => {
      cancelled = true;
    };
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Auto-save project state ────────────────────────────────────
  // Include prompt so it's persisted even if the URL params get cleaned up.
  const autoSaveData = useMemo(
    () => ({
      code,
      prompt,
      messages,
      durationInFrames,
      fps,
      status: "draft" as const,
    }),
    [code, prompt, messages, durationInFrames, fps],
  );

  useProjectAutoSave(
    projectId && projectLoaded ? projectId : null,
    autoSaveData,
    3000,
  );

  // Auto-correction hook - use combined code error (compilation + runtime)
  const { markAsAiGenerated, markAsUserEdited } = useAutoCorrection({
    maxAttempts: MAX_CORRECTION_ATTEMPTS,
    compilationError: codeError,
    generationError,
    isStreaming,
    isCompiling,
    hasGeneratedOnce,
    code,
    errorCorrection,
    onTriggerCorrection: useCallback((correctionPrompt: string, context: ErrorCorrectionContext) => {
      setErrorCorrection(context);
      setPrompt(correctionPrompt);
      setTimeout(() => {
        // Use silent mode to avoid showing retry as a user message
        chatSidebarRef.current?.triggerGeneration({ silent: true });
      }, 100);
    }, []),
    onAddErrorMessage: addErrorMessage,
    onClearGenerationError: useCallback(() => setGenerationError(null), []),
    onClearErrorCorrection: useCallback(() => setErrorCorrection(null), []),
  });

  // Sync refs
  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    const wasStreaming = isStreamingRef.current;
    isStreamingRef.current = isStreaming;

    // Compile when streaming ends - mark as AI change
    if (wasStreaming && !isStreaming) {
      markAsAiGenerated();
      compileCode(codeRef.current);
    }
  }, [isStreaming, compileCode, markAsAiGenerated]);

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      setHasGeneratedOnce(true);

      // Mark as manual edit if not streaming (user typing)
      if (!isStreamingRef.current) {
        markManualEdit(newCode);
        markAsUserEdited();
      }

      // Clear existing debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Skip compilation while streaming - will compile when streaming ends
      if (isStreamingRef.current) {
        return;
      }

      // Set new debounce
      debounceRef.current = setTimeout(() => {
        compileCode(newCode);
      }, 500);
    },
    [setCode, compileCode, markManualEdit, markAsUserEdited],
  );

  // Handle message sent for history
  const handleMessageSent = useCallback(
    (promptText: string, attachedImages?: string[]) => {
      addUserMessage(promptText, attachedImages);
    },
    [addUserMessage],
  );

  // Handle generation complete for history
  const handleGenerationComplete = useCallback(
    (generatedCode: string, summary?: string, metadata?: AssistantMetadata) => {
      const content = summary || "Generated your animation, any follow up edits?";
      addAssistantMessage(content, generatedCode, metadata);
      markAsAiGenerated();

      // Clean the URL after the first generation so that a page refresh
      // won't re-trigger generation — only projectId needs to remain.
      if (projectId) {
        try {
          const url = new URL(window.location.href);
          if (url.searchParams.has("prompt")) {
            url.searchParams.delete("prompt");
            url.searchParams.delete("model");
            window.history.replaceState({}, "", url.toString());
          }
        } catch {
          // Ignore URL manipulation errors
        }
      }
    },
    [addAssistantMessage, markAsAiGenerated, projectId],
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleStreamingChange = useCallback((streaming: boolean) => {
    setIsStreaming(streaming);
    // Clear errors when starting a new generation
    if (streaming) {
      setGenerationError(null);
      setRuntimeError(null);
      // Reset error correction state for fresh retry attempts
      setErrorCorrection(null);
    }
  }, []);

  const handleError = useCallback(
    (message: string, type: GenerationErrorType, failedEdit?: EditOperation) => {
      setGenerationError({ message, type, failedEdit });
    },
    [],
  );

  // Handle runtime errors from the Player (e.g., "cannot access variable before initialization")
  const handleRuntimeError = useCallback(
    (errorMessage: string) => {
      // Set runtime error - this will be combined with compilation errors via codeError
      // The useAutoCorrection hook will pick this up via the compilationError prop
      setRuntimeError(errorMessage);
    },
    [],
  );

  // Auto-trigger generation if prompt came from URL.
  // Must wait for projectLoaded so we know whether the project already has
  // saved code (in which case hasAutoStarted will already be true).
  useEffect(() => {
    if (initialPrompt && !hasAutoStarted && projectLoaded && chatSidebarRef.current) {
      setHasAutoStarted(true);
      // Enter streaming UI state now that we've confirmed auto-start is needed
      setIsStreaming(true);
      setStreamPhase("reasoning");
      // Check for initial attached images from sessionStorage
      const storedImagesJson = sessionStorage.getItem("initialAttachedImages");
      let storedImages: string[] | undefined;
      if (storedImagesJson) {
        try {
          storedImages = JSON.parse(storedImagesJson);
        } catch {
          // Ignore parse errors
        }
        sessionStorage.removeItem("initialAttachedImages");
      }
      setTimeout(() => {
        chatSidebarRef.current?.triggerGeneration({ attachedImages: storedImages });
      }, 100);
    }
  }, [initialPrompt, hasAutoStarted, projectLoaded]);

  return (
    <PageLayout showLogoAsLink>
      <div className="flex-1 flex min-w-0 overflow-hidden bg-grid">
        {/* Chat History Sidebar */}
        <ChatSidebar
          ref={chatSidebarRef}
          messages={messages}
          pendingMessage={pendingMessage}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          hasManualEdits={hasManualEdits}
          // Generation props for embedded input
          onCodeGenerated={handleCodeChange}
          onStreamingChange={handleStreamingChange}
          onStreamPhaseChange={setStreamPhase}
          onError={handleError}
          prompt={prompt}
          onPromptChange={setPrompt}
          currentCode={code}
          conversationHistory={getFullContext()}
          previouslyUsedSkills={getPreviouslyUsedSkills()}
          isFollowUp={!isFirstGeneration}
          onMessageSent={handleMessageSent}
          onGenerationComplete={handleGenerationComplete}
          onErrorMessage={addErrorMessage}
          errorCorrection={errorCorrection ?? undefined}
          onPendingMessage={setPendingMessage}
          onClearPendingMessage={clearPendingMessage}
          // Frame capture props
          Component={Component}
          fps={fps}
          durationInFrames={durationInFrames}
          currentFrame={currentFrame}
        />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 px-12 pb-8 gap-8 overflow-hidden">
          <div className="flex-1 flex flex-col lg:flex-row overflow-auto lg:overflow-hidden gap-8">
            <CodeEditor
              code={hasGeneratedOnce && !generationError ? code : ""}
              onChange={handleCodeChange}
              isStreaming={isStreaming}
              streamPhase={streamPhase}
            />
            <div className="shrink-0 lg:shrink lg:flex-[2.5] lg:min-w-0 lg:h-full">
              <AnimationPlayer
                Component={generationError ? null : Component}
                durationInFrames={durationInFrames}
                fps={fps}
                onDurationChange={setDurationInFrames}
                onFpsChange={setFps}
                isCompiling={isCompiling}
                isStreaming={isStreaming}
                error={generationError?.message || codeError}
                errorType={generationError?.type || "compilation"}
                code={code}
                onRuntimeError={handleRuntimeError}
                onFrameChange={setCurrentFrame}
              />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

function LoadingFallback() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background bg-grid">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-violet-glow/20 border-t-violet-glow rounded-full animate-spin" />
        <span className="text-xs text-muted-foreground font-['Space_Grotesk',sans-serif]">Loading Video Agent...</span>
      </div>
    </div>
  );
}

const GeneratePage: NextPage = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GeneratePageContent />
    </Suspense>
  );
};

export default GeneratePage;
