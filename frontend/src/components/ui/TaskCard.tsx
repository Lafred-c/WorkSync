import {Calendar, MoreVertical, Edit, Trash2, AlertCircle} from "lucide-react";
import {useState} from "react";
import type {Task} from "../../context/TaskContext";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

const TaskCard = ({task, onEdit, onDelete}: TaskCardProps) => {
  const [showMenu, setShowMenu] = useState(false);

  // Check if task is overdue
  const isOverdue = () => {
    if (!task.dueDate || task.status === "Completed") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const taskIsOverdue = isOverdue();

  // Status badge colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "In Progress":
        return "bg-orange-100 text-orange-700";
      case "Pending":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Priority badge colors
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-600 bg-red-50";
      case "Medium":
        return "text-orange-600 bg-orange-50";
      case "Low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className={`rounded-xl p-5 hover:shadow-md transition-shadow relative ${
        taskIsOverdue
          ? "bg-red-50 border-2 border-red-500 dark:bg-red-900/20 dark:border-red-500"
          : "bg-white border border-gray-200 dark:bg-[#1a1a1a] dark:border-gray-800"
      }`}>
      {/* Header with Title and Priority */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex-1 pr-2">
          {task.title}
        </h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
            task.priority,
          )}`}>
          {task.priority.toUpperCase()}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
        {task.description}
      </p>

      {/* Status badge */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            task.status,
          )}`}>
          {task.status === "In Progress" ? "In Progress" : task.status}
        </span>

        {/* Assignees */}
        {task.assignedTo &&
          Array.isArray(task.assignedTo) &&
          task.assignedTo.length > 0 && (
            <div className="flex -space-x-2 ml-auto overflow-hidden">
              {task.assignedTo.slice(0, 3).map(
                (assignee: any) =>
                  typeof assignee !== "string" && (
                    <div
                      key={assignee._id}
                      className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] text-indigo-700 font-bold"
                      title={`Assigned to ${assignee.name}`}>
                      {assignee.photo ? (
                        <img
                          src={assignee.photo}
                          alt={assignee.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        assignee.name.charAt(0)
                      )}
                    </div>
                  ),
              )}
              {task.assignedTo.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] text-gray-500 font-bold">
                  +{task.assignedTo.length - 3}
                </div>
              )}
            </div>
          )}
      </div>

      {/* Footer with Due Date and Menu */}
      <div className="flex items-center justify-between">
        {/* Due Date */}
        {task.dueDate && (
          <div className="flex flex-col gap-1">
            {taskIsOverdue ? (
              <div className="flex items-center gap-1 text-xs text-red-600 font-semibold">
                <AlertCircle size={14} />
                <span>Overdue: {formatDate(task.dueDate)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar size={14} />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}
          </div>
        )}

        {/* Ellipsis Menu */}
        <div className="relative ml-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors">
            <MoreVertical size={16} className="text-gray-500" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              {/* Backdrop to close menu */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />

              {/* Menu Items */}
              <div className="absolute right-0 bottom-full mb-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 min-w-[120px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onEdit?.(task);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <Edit size={14} />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onDelete?.(task.id);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
