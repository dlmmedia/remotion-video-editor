import { getDb } from "./db";
import type {
  Project,
  ProjectSummary,
  CreateProjectInput,
  UpdateProjectInput,
} from "@/types/project";

/** Generate a unique project ID */
function generateId(): string {
  return `proj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ─── Public API ──────────────────────────────────────────────

/** List all projects (returns summaries sorted by updatedAt desc) */
export async function listProjects(): Promise<ProjectSummary[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT id, name, status, starred, created_at, updated_at
    FROM projects
    ORDER BY updated_at DESC
  `;
  return rows.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    status: r.status as Project["status"],
    starred: r.starred as boolean,
    createdAt: (r.created_at as Date).toISOString(),
    updatedAt: (r.updated_at as Date).toISOString(),
  }));
}

/** Get a single project by ID */
export async function getProject(id: string): Promise<Project | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM projects WHERE id = ${id} LIMIT 1
  `;
  if (rows.length === 0) return null;
  return rowToProject(rows[0]);
}

/** Create a new project */
export async function createProject(
  input: CreateProjectInput = {},
): Promise<Project> {
  const sql = getDb();
  const id = generateId();
  const name = input.name || "Untitled Project";
  const prompt = input.prompt || "";
  const model = input.model || "gpt-5.2:low";

  const rows = await sql`
    INSERT INTO projects (id, name, prompt, model)
    VALUES (${id}, ${name}, ${prompt}, ${model})
    RETURNING *
  `;
  return rowToProject(rows[0]);
}

/** Update a project (partial update) */
export async function updateProject(
  id: string,
  input: UpdateProjectInput,
): Promise<Project | null> {
  const sql = getDb();

  // Build the SET clause dynamically based on provided fields
  // We need to map camelCase to snake_case column names
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIdx = 2; // $1 is the id

  if (input.name !== undefined) {
    updates.push(`name = $${paramIdx++}`);
    values.push(input.name);
  }
  if (input.code !== undefined) {
    updates.push(`code = $${paramIdx++}`);
    values.push(input.code);
  }
  if (input.prompt !== undefined) {
    updates.push(`prompt = $${paramIdx++}`);
    values.push(input.prompt);
  }
  if (input.messages !== undefined) {
    updates.push(`messages = $${paramIdx++}`);
    values.push(JSON.stringify(input.messages));
  }
  if (input.status !== undefined) {
    updates.push(`status = $${paramIdx++}`);
    values.push(input.status);
  }
  if (input.starred !== undefined) {
    updates.push(`starred = $${paramIdx++}`);
    values.push(input.starred);
  }
  if (input.durationInFrames !== undefined) {
    updates.push(`duration_in_frames = $${paramIdx++}`);
    values.push(input.durationInFrames);
  }
  if (input.fps !== undefined) {
    updates.push(`fps = $${paramIdx++}`);
    values.push(input.fps);
  }
  if (input.model !== undefined) {
    updates.push(`model = $${paramIdx++}`);
    values.push(input.model);
  }

  if (updates.length === 0) {
    return getProject(id);
  }

  updates.push("updated_at = now()");

  const query = `
    UPDATE projects
    SET ${updates.join(", ")}
    WHERE id = $1
    RETURNING *
  `;

  const rows = await sql.query(query, [id, ...values]);
  if (rows.length === 0) return null;
  return rowToProject(rows[0]);
}

/** Delete a project */
export async function deleteProject(id: string): Promise<boolean> {
  const sql = getDb();
  const rows = await sql`
    DELETE FROM projects WHERE id = ${id} RETURNING id
  `;
  return rows.length > 0;
}

// ─── Helpers ─────────────────────────────────────────────────

/** Convert a database row to a Project object */
function rowToProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    name: row.name as string,
    code: row.code as string,
    prompt: row.prompt as string,
    messages:
      typeof row.messages === "string"
        ? JSON.parse(row.messages)
        : (row.messages as Project["messages"]) ?? [],
    status: row.status as Project["status"],
    starred: row.starred as boolean,
    durationInFrames: row.duration_in_frames as number,
    fps: row.fps as number,
    model: row.model as string,
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}
