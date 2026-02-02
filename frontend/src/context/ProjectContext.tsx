import {createContext, useContext, useState, useEffect} from "react";
import type {ReactNode} from "react";

import {API_URL as BASE_URL} from "../config";

const API_URL = `${BASE_URL}/api/projects`;

export interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  dueDate: string;
}

interface ProjectContextType {
  projects: Project[];
  addProject: (projectData: Omit<Project, "id">) => Promise<void>;
  updateProject: (updatedProject: Project) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({children}: {children: ReactNode}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects from backend on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_URL, {
          method: "GET",
          credentials: "include", // Include JWT cookie
        });

        if (!res.ok) {
          throw new Error("Failed to fetch projects");
        }

        const data = await res.json();
        // Transform backend data to match frontend Project interface
        const transformedProjects = data.data.projects.map((project: any) => ({
          id: project._id,
          name: project.name,
          description: project.description,
          status: project.status,
          priority: project.priority,
          startDate: project.startDate,
          dueDate: project.dueDate,
        }));
        setProjects(transformedProjects);
        setError(null);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const addProject = async (projectData: Omit<Project, "id">) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(projectData),
      });

      if (!res.ok) {
        throw new Error("Failed to create project");
      }

      const data = await res.json();
      const newProject: Project = {
        id: data.data.project._id,
        name: data.data.project.name,
        description: data.data.project.description,
        status: data.data.project.status,
        priority: data.data.project.priority,
        startDate: data.data.project.startDate,
        dueDate: data.data.project.dueDate,
      };
      setProjects([newProject, ...projects]);
    } catch (err) {
      console.error("Error creating project:", err);
      setError("Failed to create project");
      throw err;
    }
  };

  const updateProject = async (updatedProject: Project) => {
    try {
      const res = await fetch(`${API_URL}/${updatedProject.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: updatedProject.name,
          description: updatedProject.description,
          status: updatedProject.status,
          priority: updatedProject.priority,
          startDate: updatedProject.startDate,
          dueDate: updatedProject.dueDate,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update project");
      }

      setProjects(
        projects.map((project) =>
          project.id === updatedProject.id ? updatedProject : project,
        ),
      );
    } catch (err) {
      console.error("Error updating project:", err);
      setError("Failed to update project");
      throw err;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const res = await fetch(`${API_URL}/${projectId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to delete project");
      }

      setProjects(projects.filter((project) => project.id !== projectId));
    } catch (err) {
      console.error("Error deleting project:", err);
      setError("Failed to delete project");
      throw err;
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        addProject,
        updateProject,
        deleteProject,
        loading,
        error,
      }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
};
