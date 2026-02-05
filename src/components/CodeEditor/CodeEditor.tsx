"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import {
  MonacoJsxSyntaxHighlight,
  getWorker,
} from "monaco-jsx-syntax-highlight";
import { cn } from "../../lib/utils";

import { EditorHeader } from "./EditorHeader";
import { StreamingOverlay } from "./StreamingOverlay";

// Monaco must be loaded client-side only
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex justify-center items-center bg-[#0a0a1a]">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-[#7c3aed]/30 border-t-[#7c3aed] rounded-full animate-spin" />
        <span className="text-[#8b84a8]/60 text-xs font-mono">
          Loading editor...
        </span>
      </div>
    </div>
  ),
});

type StreamPhase = "idle" | "reasoning" | "generating";

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  isStreaming?: boolean;
  streamPhase?: StreamPhase;
}

/**
 * Custom Monaco theme that matches the space UI.
 * Violet keywords, cyan types, pink JSX tags, green strings, amber numbers.
 */
function defineSpaceTheme(monaco: Monaco) {
  monaco.editor.defineTheme("space-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "5b5578", fontStyle: "italic" },
      { token: "keyword", foreground: "c084fc" },
      { token: "keyword.control", foreground: "c084fc" },
      { token: "storage", foreground: "c084fc" },
      { token: "storage.type", foreground: "c084fc" },
      { token: "string", foreground: "86efac" },
      { token: "string.key.json", foreground: "93c5fd" },
      { token: "number", foreground: "fbbf24" },
      { token: "type", foreground: "67e8f9" },
      { token: "type.identifier", foreground: "67e8f9" },
      { token: "identifier", foreground: "e8e4f0" },
      { token: "function", foreground: "93c5fd" },
      { token: "variable", foreground: "e8e4f0" },
      { token: "variable.predefined", foreground: "c4b5fd" },
      { token: "operator", foreground: "c4b5fd" },
      { token: "delimiter", foreground: "6b6490" },
      { token: "delimiter.bracket", foreground: "8b84a8" },
      { token: "tag", foreground: "f472b6" },
      { token: "metatag", foreground: "8b84a8" },
      { token: "attribute.name", foreground: "67e8f9" },
      { token: "attribute.value", foreground: "86efac" },
      { token: "constant", foreground: "fbbf24" },
      { token: "regexp", foreground: "f472b6" },
    ],
    colors: {
      "editor.background": "#0a0a1a",
      "editor.foreground": "#e8e4f0",
      "editor.lineHighlightBackground": "#1a174015",
      "editor.lineHighlightBorder": "#00000000",
      "editor.selectionBackground": "#7c3aed33",
      "editor.inactiveSelectionBackground": "#7c3aed1a",
      "editorLineNumber.foreground": "#2e2a50",
      "editorLineNumber.activeForeground": "#7c3aed88",
      "editorCursor.foreground": "#c084fc",
      "editor.selectionHighlightBackground": "#7c3aed1a",
      "editorBracketMatch.background": "#7c3aed22",
      "editorBracketMatch.border": "#7c3aed44",
      "editorIndentGuide.background": "#1e1b4b22",
      "editorIndentGuide.activeBackground": "#1e1b4b55",
      "scrollbar.shadow": "#00000000",
      "scrollbarSlider.background": "#1e1b4b44",
      "scrollbarSlider.hoverBackground": "#312e8166",
      "scrollbarSlider.activeBackground": "#312e8188",
      "editorWidget.background": "#0c0a1d",
      "editorWidget.border": "#1e1b4b",
      "editorSuggestWidget.background": "#0c0a1d",
      "editorSuggestWidget.border": "#1e1b4b",
      "editorSuggestWidget.selectedBackground": "#1a1740",
      "editorOverviewRuler.border": "#00000000",
      "editorGutter.background": "#0a0a1a",
    },
  });
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  isStreaming = false,
  streamPhase = "idle",
}) => {
  const monacoRef = useRef<Monaco | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const isStreamingRef = useRef(isStreaming);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const lineCount = useMemo(() => {
    return code ? code.split("\n").length : 0;
  }, [code]);

  // Keep ref in sync with prop and clear markers during streaming
  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  // Auto-expand when streaming starts so user can watch code stream in
  useEffect(() => {
    if (isStreaming && isCollapsed) {
      setIsCollapsed(false);
    }
  }, [isStreaming, isCollapsed]);

  // Use typescript for semantic checking, plaintext during streaming
  const editorLanguage = isStreaming ? "plaintext" : "typescript";

  // Continuously clear markers while streaming
  useEffect(() => {
    if (!isStreaming || !monacoRef.current) return;

    const clearAllMarkers = () => {
      monacoRef.current?.editor.getModels().forEach((model) => {
        monacoRef.current?.editor.setModelMarkers(model, "javascript", []);
        monacoRef.current?.editor.setModelMarkers(model, "typescript", []);
        monacoRef.current?.editor.setModelMarkers(model, "owner", []);
      });
    };

    clearAllMarkers();
    const interval = setInterval(clearAllMarkers, 100);

    return () => clearInterval(interval);
  }, [isStreaming, code]);

  // Define theme before Monaco mounts (prevents flash)
  const handleEditorWillMount = (monaco: Monaco) => {
    defineSpaceTheme(monaco);
  };

  const handleEditorMount = (
    editorInstance: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => {
    monacoRef.current = monaco;
    editorRef.current = editorInstance;

    // Ensure theme is applied
    monaco.editor.setTheme("space-dark");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ts = (monaco.languages as any).typescript;

    // Configure TypeScript compiler options for JSX support
    ts?.typescriptDefaults?.setCompilerOptions({
      target: ts.ScriptTarget?.ESNext,
      module: ts.ModuleKind?.ESNext,
      jsx: ts.JsxEmit?.Preserve,
      allowNonTsExtensions: true,
      strict: false,
      noEmit: true,
      esModuleInterop: true,
      moduleResolution: ts.ModuleResolutionKind?.NodeJs,
      skipLibCheck: true,
    });

    // Enable semantic validation for import checking
    ts?.typescriptDefaults?.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    // Add React types so TS understands JSX
    ts?.typescriptDefaults?.addExtraLib(
      `
      declare namespace React {
        type ReactNode = string | number | boolean | null | undefined | ReactElement | ReactNode[];
        interface ReactElement<P = any> { type: any; props: P; key: string | null; }
        type FC<P = {}> = (props: P) => ReactElement | null;
        type CSSProperties = { [key: string]: string | number | undefined };
        interface HTMLAttributes<T> {
          className?: string;
          style?: CSSProperties;
          children?: ReactNode;
          [key: string]: any;
        }
        interface SVGAttributes<T> {
          className?: string;
          style?: CSSProperties;
          children?: ReactNode;
          [key: string]: any;
        }
        function createElement(type: any, props?: any, ...children: any[]): ReactElement;
        function useState<T>(initial: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
        function useEffect(effect: () => void | (() => void), deps?: any[]): void;
        function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
        function useMemo<T>(factory: () => T, deps: any[]): T;
        function useRef<T>(initial: T): { current: T };
      }
      declare const React: typeof React;
      declare namespace JSX {
        interface Element extends React.ReactElement<any, any> {}
        interface IntrinsicElements {
          div: React.HTMLAttributes<HTMLDivElement>;
          span: React.HTMLAttributes<HTMLSpanElement>;
          p: React.HTMLAttributes<HTMLParagraphElement>;
          h1: React.HTMLAttributes<HTMLHeadingElement>;
          h2: React.HTMLAttributes<HTMLHeadingElement>;
          h3: React.HTMLAttributes<HTMLHeadingElement>;
          img: React.HTMLAttributes<HTMLImageElement> & { src?: string; alt?: string };
          svg: React.SVGAttributes<SVGSVGElement>;
          path: React.SVGAttributes<SVGPathElement> & { d?: string };
          circle: React.SVGAttributes<SVGCircleElement> & { cx?: number; cy?: number; r?: number };
          rect: React.SVGAttributes<SVGRectElement> & { x?: number; y?: number; width?: number; height?: number };
          polygon: React.SVGAttributes<SVGPolygonElement> & { points?: string };
          line: React.SVGAttributes<SVGLineElement> & { x1?: number; y1?: number; x2?: number; y2?: number };
          text: React.SVGAttributes<SVGTextElement> & { x?: number; y?: number };
          g: React.SVGAttributes<SVGGElement>;
          defs: React.SVGAttributes<SVGDefsElement>;
          filter: React.SVGAttributes<SVGFilterElement> & { id?: string };
          feGaussianBlur: React.SVGAttributes<SVGFEGaussianBlurElement> & { stdDeviation?: number | string; result?: string };
          feMerge: React.SVGAttributes<SVGFEMergeElement>;
          feMergeNode: React.SVGAttributes<SVGFEMergeNodeElement> & { in?: string };
          mesh: any;
          group: any;
          ambientLight: any;
          pointLight: any;
          sphereGeometry: any;
          meshStandardMaterial: any;
          planeGeometry: any;
          [elemName: string]: any;
        }
      }
      `,
      "react.d.ts",
    );

    // Add module declaration for 'react' to allow imports
    ts?.typescriptDefaults?.addExtraLib(
      `declare module 'react' {
        export const useState: typeof React.useState;
        export const useEffect: typeof React.useEffect;
        export const useCallback: typeof React.useCallback;
        export const useMemo: typeof React.useMemo;
        export const useRef: typeof React.useRef;
        export default React;
      }`,
      "react-module.d.ts",
    );

    // Add type declarations for all whitelisted libraries
    ts?.typescriptDefaults?.addExtraLib(
      `declare module 'remotion' {
        export const AbsoluteFill: React.FC<React.HTMLAttributes<HTMLDivElement>>;
        export function useCurrentFrame(): number;
        export function useVideoConfig(): { fps: number; durationInFrames: number; width: number; height: number };
        export function interpolate(input: number, inputRange: number[], outputRange: number[], options?: any): number;
        export function spring(options: { frame: number; fps: number; config?: any; durationInFrames?: number }): number;
        export const Sequence: React.FC<{ from?: number; durationInFrames?: number; children: React.ReactNode }>;
      }`,
      "remotion.d.ts",
    );

    ts?.typescriptDefaults?.addExtraLib(
      `declare module '@remotion/shapes' {
        interface ShapeProps {
          fill?: string;
          stroke?: string;
          strokeWidth?: number;
          style?: React.CSSProperties;
        }
        export const Rect: React.FC<ShapeProps & { width: number; height: number; cornerRadius?: number }>;
        export const Circle: React.FC<ShapeProps & { radius: number }>;
        export const Triangle: React.FC<ShapeProps & { length: number; direction?: 'up' | 'down' | 'left' | 'right' }>;
        export const Star: React.FC<ShapeProps & { innerRadius: number; outerRadius: number; points?: number }>;
        export const Polygon: React.FC<ShapeProps & { radius: number; points: number }>;
        export const Ellipse: React.FC<ShapeProps & { rx: number; ry: number }>;
      }`,
      "remotion-shapes.d.ts",
    );

    ts?.typescriptDefaults?.addExtraLib(
      `declare module '@remotion/lottie' {
        export const Lottie: React.FC<{ animationData?: any; src?: string; playbackRate?: number; style?: React.CSSProperties }>;
      }`,
      "remotion-lottie.d.ts",
    );

    ts?.typescriptDefaults?.addExtraLib(
      `declare module '@remotion/three' {
        export const ThreeCanvas: React.FC<{
          children?: any;
          style?: React.CSSProperties;
          width?: number;
          height?: number;
          camera?: { position?: number[]; fov?: number; near?: number; far?: number; [key: string]: any };
          orthographic?: boolean;
          [key: string]: any;
        }>;
      }`,
      "remotion-three.d.ts",
    );

    ts?.typescriptDefaults?.addExtraLib(
      `declare module 'three' {
        export class Vector3 { constructor(x?: number, y?: number, z?: number); x: number; y: number; z: number; }
        export class Color { constructor(color?: string | number); }
        export class MeshStandardMaterial { constructor(params?: any); }
        export class BoxGeometry { constructor(width?: number, height?: number, depth?: number); }
        export class SphereGeometry { constructor(radius?: number, widthSegments?: number, heightSegments?: number); }
        export class Mesh { constructor(geometry?: any, material?: any); position: Vector3; rotation: Vector3; }
        export const DoubleSide: number;
      }`,
      "three.d.ts",
    );

    // Override marker setting to suppress during streaming
    const originalSetModelMarkers = monaco.editor.setModelMarkers;
    monaco.editor.setModelMarkers = (mdl, owner, markers) => {
      if (isStreamingRef.current) {
        return;
      }
      originalSetModelMarkers.call(monaco.editor, mdl, owner, markers);
    };

    // Set up JSX syntax highlighting
    const monacoJsxSyntaxHighlight = new MonacoJsxSyntaxHighlight(
      getWorker(),
      monaco,
    );
    const { highlighter } = monacoJsxSyntaxHighlight.highlighterBuilder({
      editor: editorInstance,
    });
    highlighter();
    editorInstance.onDidChangeModelContent(() => {
      highlighter();
    });
  };

  // Simple pass-through: code is displayed and edited as-is
  const handleChange = (value: string | undefined) => {
    onChange(value || "");
  };

  return (
    <div
      className={cn(
        "flex flex-col min-w-0 rounded-lg overflow-hidden",
        "border border-[#1e1b4b]/40",
        "transition-shadow duration-500",
        isCollapsed ? "" : "h-[500px] lg:h-full",
        isStreaming &&
          !isCollapsed &&
          "shadow-[0_0_20px_rgba(124,58,237,0.06)] border-[#7c3aed]/20",
      )}
      style={{
        flex: isCollapsed ? "0 0 auto" : "2 1 0%",
      }}
    >
      <EditorHeader
        filename="MyAnimation.tsx"
        code={code}
        lineCount={lineCount}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isStreaming={isStreaming}
      />

      {!isCollapsed && (
        <div className="flex-1 overflow-hidden relative bg-[#0a0a1a]">
          <StreamingOverlay
            visible={isStreaming}
            message={
              streamPhase === "reasoning" ? "Thinking..." : "Generating code..."
            }
          />
          <MonacoEditor
            height="100%"
            language={editorLanguage}
            theme="space-dark"
            path="MyAnimation.tsx"
            value={code}
            onChange={handleChange}
            beforeMount={handleEditorWillMount}
            onMount={handleEditorMount}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily:
                "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace",
              fontLigatures: true,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: "on",
              padding: { top: 16, bottom: 16 },
              glyphMargin: false,
              lineNumbersMinChars: 3,
              lineDecorationsWidth: 8,
              folding: true,
              foldingHighlight: false,
              renderLineHighlight: "gutter",
              renderWhitespace: "none",
              smoothScrolling: true,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              bracketPairColorization: { enabled: true },
              overviewRulerBorder: false,
              overviewRulerLanes: 0,
              hideCursorInOverviewRuler: true,
              scrollbar: {
                vertical: "auto",
                horizontal: "hidden",
                verticalScrollbarSize: 6,
                useShadows: false,
              },
            }}
          />
        </div>
      )}
    </div>
  );
};
