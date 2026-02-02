import {ArrowLeft, Plus, Search} from "lucide-react";
import {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import TaskModal from "../components/ui/TaskModal";
import TaskCard from "../components/ui/TaskCard";
import Toast from "../components/ui/Toast";
import CircularIndeterminate from "../components/ui/isLoading";
import {useUser} from "../hooks/useUser";
import {useTasks} from "../context/TaskContext";
import type {Task} from "../context/TaskContext";

const API_URL = "http://localhost:3000/api/projects";

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  dueDate: string;
  admin: string; // ID of the admin
}

const ProjectTasks = () => {
  const {projectId} = useParams<{projectId: string}>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [priorityFilter, setPriorityFilter] = useState("All Priority");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const {updateTask, deleteTask} = useTasks();
  const {user: currentUser} = useUser();

  const isProjectAdmin =
    project && currentUser && project.admin === currentUser._id;

  // Fetch project details and tasks
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);

        // Fetch project details
        const projectRes = await fetch(`${API_URL}/${projectId}`, {
          credentials: "include",
        });

        if (!projectRes.ok) {
          throw new Error("Failed to fetch project");
        }

        const projectData = await projectRes.json();
        setProject({
          id: projectData.data.project._id,
          name: projectData.data.project.name,
          description: projectData.data.project.description,
          status: projectData.data.project.status,
          priority: projectData.data.project.priority,
          startDate: projectData.data.project.startDate,
          dueDate: projectData.data.project.dueDate,
          admin: projectData.data.project.admin,
        });

        // Fetch project tasks
        const tasksRes = await fetch(`${API_URL}/${projectId}/tasks`, {
          credentials: "include",
        });

        if (!tasksRes.ok) {
          throw new Error("Failed to fetch tasks");
        }

        const tasksData = await tasksRes.json();
        const transformedTasks = tasksData.data.tasks.map((task: any) => ({
          id: task._id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          projectId: task.project,
          assignedTo: task.assignedTo,
          notes: task.notes,
        }));
        setProjectTasks(transformedTasks);
      } catch (error) {
        console.error("Error fetching project data:", error);
        setToastMessage("Failed to load project data");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const handleAddTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleTaskCreate = async (taskData: Omit<Task, "id">) => {
    try {
      // Add project ID to task data
      const taskWithProject = {
        ...taskData,
        project: projectId,
      };

      const res = await fetch("http://localhost:3000/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(taskWithProject),
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
        projectId: data.data.task.project,
      };

      setProjectTasks([newTask, ...projectTasks]);
      setToastMessage("Task created successfully");
    } catch (error) {
      setToastMessage("Failed to create task");
    }
  };

  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      await updateTask(updatedTask);
      // We need to reload tasks or handle the optimistic update carefully since assignedTo object might change
      // For simplicity, let's just update the local state assuming success, but for full object (name/photo) we might need a refetch or proper response usage

      // Actually, updateTask in context returns void.
      // Let's refetch tasks to get the populated assignedTo field correctly
      // Or we can just manually update what we can.

      // Let's trigger a refetch of tasks to be safe about the populated data
      const tasksRes = await fetch(`${API_URL}/${projectId}/tasks`, {
        credentials: "include",
      });
      const tasksData = await tasksRes.json();
      const transformedTasks = tasksData.data.tasks.map((task: any) => ({
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        projectId: task.project,
        assignedTo: task.assignedTo,
        notes: task.notes,
      }));
      setProjectTasks(transformedTasks);

      setToastMessage("Task updated successfully");
    } catch (error) {
      setToastMessage("Failed to update task");
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setProjectTasks(projectTasks.filter((task) => task.id !== taskId));
      setToastMessage("Task deleted successfully");
    } catch (error) {
      setToastMessage("Failed to delete task");
    }
  };

  // Filter tasks based on search query, status, and priority
  const filteredTasks = projectTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All Status" || task.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All Priority" || task.priority === priorityFilter;

    // Filter by assignment (Admin sees all, others see only assigned)
    const isAssigned =
      isProjectAdmin ||
      (task.assignedTo &&
        Array.isArray(task.assignedTo) &&
        task.assignedTo.some((u: any) =>
          typeof u === "string"
            ? u === currentUser?._id
            : u._id === currentUser?._id,
        ));

    return matchesSearch && matchesStatus && matchesPriority && isAssigned;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      case "Low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-blue-100 text-blue-700";
      case "On Hold":
        return "bg-orange-100 text-orange-700";
      case "Completed":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularIndeterminate />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-500 text-base">Project not found</p>
        <button
          onClick={() => navigate("/projects")}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer">
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Back Button and Project Header */}
      <main className="px-6 pt-6">
        <button
          onClick={() => navigate("/projects")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 mb-4 cursor-pointer">
          <ArrowLeft size={20} />
          <span>Back to Projects</span>
        </button>

        {/* Project Info Card */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-black dark:text-white mb-2">
                {project.name}
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                {project.description}
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                  {project.priority}
                </span>
              </div>
            </div>
            <button
              onClick={handleAddTask}
              className="bg-gray-100 dark:bg-zinc-800 text-black dark:text-white text-sm border border-gray-200 dark:border-gray-700 p-2 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all duration-300">
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Task Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search tasks"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer bg-white dark:bg-zinc-900 dark:text-white">
            <option value="All Status">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer bg-white dark:bg-zinc-900 dark:text-white">
            <option value="All Priority">All Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        {/* Task Grid */}
        <div>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-base">No tasks found</p>
              <p className="text-gray-400 text-xs mt-2">
                {projectTasks.length === 0
                  ? "Click 'Add Task' to create your first task for this project"
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onTaskCreate={handleTaskCreate}
        editTask={editingTask}
        onTaskUpdate={handleTaskUpdate}
        canEditDetails={!!isProjectAdmin}
      />

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </>
  );
};

export default ProjectTasks;
