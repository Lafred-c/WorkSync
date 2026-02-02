import {useState, useEffect} from "react";
import {X} from "lucide-react";
import Modal from "./Modal";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreate: (project: {
    name: string;
    description: string;
    status: string;
    priority: string;
    startDate: string;
    dueDate: string;
  }) => void;
  editProject?: {
    id: string;
    name: string;
    description: string;
    status: string;
    priority: string;
    startDate: string;
    dueDate: string;
  } | null;
  onProjectUpdate?: (project: {
    id: string;
    name: string;
    description: string;
    status: string;
    priority: string;
    startDate: string;
    dueDate: string;
  }) => void;
}

const ProjectModal = ({
  isOpen,
  onClose,
  onProjectCreate,
  editProject,
  onProjectUpdate,
}: ProjectModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");
  const [priority, setPriority] = useState("Medium");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Populate form when editing
  useEffect(() => {
    if (editProject) {
      setName(editProject.name);
      setDescription(editProject.description);
      setStatus(editProject.status);
      setPriority(editProject.priority);
      setStartDate(editProject.startDate);
      setDueDate(editProject.dueDate);
    } else {
      // Reset form when not editing
      setName("");
      setDescription("");
      setStatus("Active");
      setPriority("Medium");
      setStartDate("");
      setDueDate("");
    }
  }, [editProject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editProject && onProjectUpdate) {
      // Update existing project
      const updatedProject = {
        id: editProject.id,
        name,
        description,
        status,
        priority,
        startDate,
        dueDate,
      };
      onProjectUpdate(updatedProject);
    } else {
      // Create new project
      const newProject = {
        name,
        description,
        status,
        priority,
        startDate,
        dueDate,
      };
      onProjectCreate(newProject);
    }
    handleClose();
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setStatus("Active");
    setPriority("Medium");
    setStartDate("");
    setDueDate("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black dark:text-white">
            {editProject ? "Edit Project" : "Create New Project"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-zinc-900 dark:text-white"
              placeholder="Enter project name"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none bg-white dark:bg-zinc-900 dark:text-white"
              placeholder="Enter project description"
              required
            />
          </div>

          {/* Status and Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-zinc-900 dark:text-white">
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-zinc-900 dark:text-white">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Start Date and Due Date Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-zinc-900 dark:text-white"
              />
            </div>

            {/* Due Date */}
            <div>
              <label
                htmlFor="dueDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-zinc-900 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer">
              {editProject ? "Update Project" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ProjectModal;
