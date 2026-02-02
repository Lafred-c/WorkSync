import {Plus, Search} from "lucide-react";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import ProjectModal from "../components/ui/ProjectModal";
import ProjectCard from "../components/ui/ProjectCard";
import Toast from "../components/ui/Toast";
import CircularIndeterminate from "../components/ui/isLoading";
import {useProjects} from "../context/ProjectContext";
import type {Project} from "../context/ProjectContext";

const Projects = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [priorityFilter, setPriorityFilter] = useState("All Priority");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const {projects, addProject, updateProject, deleteProject, loading} =
    useProjects();

  const handleAddProject = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleProjectCreate = async (projectData: Omit<Project, "id">) => {
    try {
      await addProject(projectData);
      setToastMessage("Project created successfully");
    } catch (error) {
      setToastMessage("Failed to create project");
    }
  };

  const handleProjectUpdate = async (updatedProject: Project) => {
    try {
      await updateProject(updatedProject);
      setToastMessage("Project updated successfully");
    } catch (error) {
      setToastMessage("Failed to update project");
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?",
    );

    if (!confirmed) {
      return;
    }

    try {
      // Check if project has incomplete tasks
      const tasksRes = await fetch(
        `http://localhost:3000/api/projects/${projectId}/tasks`,
        {
          credentials: "include",
        },
      );

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        const tasks = tasksData.data.tasks;

        // Check if there are any pending or in progress tasks
        const incompleteTasks = tasks.filter(
          (task: any) =>
            task.status === "Pending" || task.status === "In Progress",
        );

        if (incompleteTasks.length > 0) {
          setToastMessage(
            `Cannot delete project. There are ${incompleteTasks.length} incomplete task(s). Complete all tasks first.`,
          );
          return;
        }
      }

      // If all tasks are completed or no tasks, proceed with deletion
      await deleteProject(projectId);
      setToastMessage("Project deleted successfully");
    } catch (error) {
      setToastMessage("Failed to delete project");
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}/tasks`);
  };

  // Filter projects based on search query, status, and priority
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All Status" || project.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All Priority" || project.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <>
      <main className="flex flex-row gap-4 justify-between px-6 pt-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Projects
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage and track your projects
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddProject}
            className="bg-white dark:bg-[#1a1a1a] text-xs text-black dark:text-white border border-gray-200 dark:border-gray-800 p-3 rounded-lg flex items-center gap-2 cursor-pointer hover:opacity-90 transition-all duration-300">
            <Plus size={18} />
            Add Project
          </button>
        </div>
      </main>

      {/* Filters */}
      <div className="mt-6 flex items-center gap-3 px-6">
        <div className="relative w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search projects"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer bg-white dark:bg-zinc-900 dark:text-white">
          <option value="All Status">All Status</option>
          <option value="Active">Active</option>
          <option value="On Hold">On Hold</option>
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

      {/* Project Grid */}
      <div className="mt-6 px-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <CircularIndeterminate />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-base">No projects found</p>
            <p className="text-gray-400 text-xs mt-2">
              {projects.length === 0
                ? "Click 'Add Project' to create your first project"
                : "Try adjusting your filters"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
                onClick={handleProjectClick}
              />
            ))}
          </div>
        )}
      </div>

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onProjectCreate={handleProjectCreate}
        editProject={editingProject}
        onProjectUpdate={handleProjectUpdate}
      />

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </>
  );
};

export default Projects;
