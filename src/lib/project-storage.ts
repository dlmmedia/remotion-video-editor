import fs from "fs";
import path from "path";
import type {
  Project,
  ProjectSummary,
  CreateProjectInput,
  UpdateProjectInput,
} from "@/types/project";

const DATA_DIR = path.join(process.cwd(), "data");
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");

/** Ensure data directory and file exist */
function ensureStorage(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PROJECTS_FILE)) {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

/** Read all projects from disk */
function readProjects(): Project[] {
  ensureStorage();
  try {
    const data = fs.readFileSync(PROJECTS_FILE, "utf-8");
    return JSON.parse(data) as Project[];
  } catch {
    return [];
  }
}

/** Write all projects to disk */
function writeProjects(projects: Project[]): void {
  ensureStorage();
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf-8");
}

/** Generate a unique ID */
function generateId(): string {
  return `proj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ─── Public API ──────────────────────────────────────────────

/** List all projects (returns summaries sorted by updatedAt desc) */
export function listProjects(): ProjectSummary[] {
  const projects = readProjects();
  return projects
    .map(({ id, name, status, starred, createdAt, updatedAt }) => ({
      id,
      name,
      status,
      starred,
      createdAt,
      updatedAt,
    }))
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}

/** Get a single project by ID */
export function getProject(id: string): Project | null {
  const projects = readProjects();
  return projects.find((p) => p.id === id) ?? null;
}

/** Create a new project */
export function createProject(input: CreateProjectInput = {}): Project {
  const projects = readProjects();
  const now = new Date().toISOString();

  const project: Project = {
    id: generateId(),
    name: input.name || "Untitled Project",
    code: "",
    prompt: input.prompt || "",
    messages: [],
    status: "draft",
    starred: false,
    durationInFrames: 150,
    fps: 30,
    model: input.model || "gpt-5.2:low",
    createdAt: now,
    updatedAt: now,
  };

  projects.push(project);
  writeProjects(projects);
  return project;
}

/** Update a project (partial update) */
export function updateProject(
  id: string,
  input: UpdateProjectInput,
): Project | null {
  const projects = readProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updated: Project = {
    ...projects[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };

  projects[index] = updated;
  writeProjects(projects);
  return updated;
}

/** Delete a project */
export function deleteProject(id: string): boolean {
  const projects = readProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) return false;

  projects.splice(index, 1);
  writeProjects(projects);
  return true;
}
