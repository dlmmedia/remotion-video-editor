import { NextResponse } from "next/server";
import { listProjects, createProject } from "@/lib/project-storage";

/** GET /api/projects — list all projects */
export async function GET() {
  try {
    const projects = listProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Failed to list projects:", error);
    return NextResponse.json(
      { error: "Failed to list projects" },
      { status: 500 },
    );
  }
}

/** POST /api/projects — create a new project */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const project = createProject(body);
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}
