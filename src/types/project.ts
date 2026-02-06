import type { ConversationMessage } from "./conversation";

export interface Project {
  id: string;
  name: string;
  /** The current Remotion code */
  code: string;
  /** The initial prompt that started this project */
  prompt: string;
  /** Conversation history (user/assistant messages) */
  messages: ConversationMessage[];
  /** Project status */
  status: "draft" | "rendering" | "complete";
  /** Whether the project is starred/favorited */
  starred: boolean;
  /** Frames duration */
  durationInFrames: number;
  /** Frames per second */
  fps: number;
  /** Model used for generation */
  model: string;
  /** ISO date string */
  createdAt: string;
  /** ISO date string */
  updatedAt: string;
}

export type ProjectSummary = Pick<
  Project,
  "id" | "name" | "status" | "starred" | "createdAt" | "updatedAt"
>;

export interface CreateProjectInput {
  name?: string;
  prompt?: string;
  model?: string;
}

export interface UpdateProjectInput {
  name?: string;
  code?: string;
  prompt?: string;
  messages?: ConversationMessage[];
  status?: Project["status"];
  starred?: boolean;
  durationInFrames?: number;
  fps?: number;
  model?: string;
}
