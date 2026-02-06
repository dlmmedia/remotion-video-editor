"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  Project,
  ProjectSummary,
  CreateProjectInput,
  UpdateProjectInput,
} from "@/types/project";

export function useProjects() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Fetch the list of projects */
  const fetchProjects = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data: ProjectSummary[] = await res.json();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Create a new project */
  const createProject = useCallback(
    async (input: CreateProjectInput = {}): Promise<Project | null> => {
      try {
        setError(null);
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (!res.ok) throw new Error("Failed to create project");
        const project: Project = await res.json();
        // Re-fetch list to get updated order
        await fetchProjects();
        return project;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return null;
      }
    },
    [fetchProjects],
  );

  /** Update a project (partial) */
  const updateProject = useCallback(
    async (
      id: string,
      input: UpdateProjectInput,
    ): Promise<Project | null> => {
      try {
        setError(null);
        const res = await fetch(`/api/projects/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (!res.ok) throw new Error("Failed to update project");
        const project: Project = await res.json();
        // Update local list
        setProjects((prev) =>
          prev
            .map((p) =>
              p.id === id
                ? {
                    ...p,
                    name: project.name,
                    status: project.status,
                    starred: project.starred,
                    updatedAt: project.updatedAt,
                  }
                : p,
            )
            .sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime(),
            ),
        );
        return project;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return null;
      }
    },
    [],
  );

  /** Delete a project */
  const deleteProject = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setError(null);
        const res = await fetch(`/api/projects/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete project");
        setProjects((prev) => prev.filter((p) => p.id !== id));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return false;
      }
    },
    [],
  );

  /** Rename a project */
  const renameProject = useCallback(
    async (id: string, name: string): Promise<Project | null> => {
      return updateProject(id, { name });
    },
    [updateProject],
  );

  /** Toggle starred status */
  const toggleStar = useCallback(
    async (id: string): Promise<Project | null> => {
      const project = projects.find((p) => p.id === id);
      if (!project) return null;
      return updateProject(id, { starred: !project.starred });
    },
    [projects, updateProject],
  );

  /** Get a single project with full data */
  const getProject = useCallback(
    async (id: string): Promise<Project | null> => {
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },
    [],
  );

  // Initial fetch
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    isLoading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    renameProject,
    toggleStar,
    getProject,
  };
}

/**
 * Hook for auto-saving the current project state.
 * Debounces saves to avoid excessive API calls.
 * Uses refs to avoid stale closure issues on unmount.
 */
export function useProjectAutoSave(
  projectId: string | null,
  data: UpdateProjectInput,
  /** Debounce interval in ms (default 2000) */
  debounceMs = 2000,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");
  // Use refs to always have the latest values available (avoids stale closures)
  const dataRef = useRef(data);
  const projectIdRef = useRef(projectId);

  // Keep refs up to date
  dataRef.current = data;
  projectIdRef.current = projectId;

  const saveNow = useCallback(async () => {
    const pid = projectIdRef.current;
    if (!pid) return;
    const serialized = JSON.stringify(dataRef.current);
    // Don't save if nothing changed
    if (serialized === lastSavedRef.current) return;
    lastSavedRef.current = serialized;

    try {
      await fetch(`/api/projects/${pid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: serialized,
      });
    } catch (err) {
      console.error("Auto-save failed:", err);
    }
  }, []);

  // Debounced auto-save whenever data changes
  useEffect(() => {
    if (!projectId) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(saveNow, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [projectId, data, saveNow, debounceMs]);

  // Helper: flush unsaved changes via sendBeacon (survives page unload)
  const flushViaSendBeacon = useCallback(() => {
    const pid = projectIdRef.current;
    if (!pid) return;
    const serialized = JSON.stringify(dataRef.current);
    if (serialized === lastSavedRef.current) return;
    lastSavedRef.current = serialized;
    try {
      navigator.sendBeacon(
        `/api/projects/${pid}`,
        new Blob([serialized], { type: "application/json" }),
      );
    } catch {
      fetch(`/api/projects/${pid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: serialized,
        keepalive: true,
      }).catch(() => {});
    }
  }, []);

  // Save on browser refresh / tab close via beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      flushViaSendBeacon();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [flushViaSendBeacon]);

  // Save immediately on unmount (best-effort via sendBeacon)
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      flushViaSendBeacon();
    };
  }, [flushViaSendBeacon]);

  return { saveNow };
}
