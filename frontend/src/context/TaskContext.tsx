import {createContext, useContext, useState, useEffect} from "react";
import type {ReactNode} from "react";

import {API_URL as BASE_URL} from "../config";

const API_URL = `${BASE_URL}/api/tasks`;

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  projectId?: string;
  assignedTo?:
    | {
        _id: string;
        name: string;
        email: string;
        photo?: string;
      }[]
    | string[]; // Can be populated array of objects or array of IDs
  assigneeEmail?: string; // For creating task
  notes?: {
    text: string;
    createdBy: string;
    createdAt: string;
  }[];
  note?: string;
  removeAssigneeId?: string;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (taskData: Omit<Task, "id">) => Promise<void>;
  updateTask: (updatedTask: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({children}: {children: ReactNode}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks from backend on mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_URL, {
          method: "GET",
          credentials: "include", // Include JWT cookie
        });

        if (!res.ok) {
          throw new Error("Failed to fetch tasks");
        }

        const data = await res.json();
        // Transform backend data to match frontend Task interface
        const transformedTasks = data.data.tasks.map((task: any) => ({
          id: task._id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          notes: task.notes,
          projectId: task.project, // Include project ID for navigation
        }));
        setTasks(transformedTasks);
        setError(null);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const addTask = async (taskData: Omit<Task, "id">) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(taskData),
      });

      if (!res.ok) {
        throw new Error("Failed to create task");
      }

      const data = await res.json();
      const newTask: Task = {
        id: data.data.task._id,
        title: data.data.task.title,
        description: data.data.task.description,
        status: data.data.task.status,
        priority: data.data.task.priority,
        dueDate: data.data.task.dueDate,
        notes: data.data.task.notes,
      };
      setTasks([newTask, ...tasks]);
    } catch (err) {
      console.error("Error creating task:", err);
      setError("Failed to create task");
      throw err;
    }
  };

  const updateTask = async (updatedTask: Task) => {
    try {
      const res = await fetch(`${API_URL}/${updatedTask.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: updatedTask.title,
          description: updatedTask.description,
          status: updatedTask.status,
          priority: updatedTask.priority,
          dueDate: updatedTask.dueDate,
          note: updatedTask.note,
          removeAssigneeId: updatedTask.removeAssigneeId,
          assigneeEmail: updatedTask.assigneeEmail,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update task");
      }

      setTasks(
        tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
      );
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task");
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`${API_URL}/${taskId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to delete task");
      }

      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
      setError("Failed to delete task");
      throw err;
    }
  };

  return (
    <TaskContext.Provider
      value={{tasks, addTask, updateTask, deleteTask, loading, error}}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
};
