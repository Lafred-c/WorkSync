import {useTasks} from "../../context/TaskContext";
import {ArrowRight, Inbox} from "lucide-react";
import {useNavigate} from "react-router-dom";

export const Card = () => {
  const {tasks, loading} = useTasks();
  const navigate = useNavigate();

  // Get the 5 most recent tasks
  const recentTasks = tasks.slice(0, 5);

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

  // Priority colors
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-600";
      case "Medium":
        return "text-orange-600";
      case "Low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-gray-300 dark:shadow-none shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-black dark:text-white">
          Recent Tasks
        </h1>
        {recentTasks.length > 0 && (
          <button
            onClick={() => navigate("/projects")}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer">
            View all
            <ArrowRight size={16} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-400 text-sm">Loading tasks...</p>
        </div>
      ) : recentTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Inbox className="w-16 h-16 text-gray-300" />
          <p className="text-gray-400 text-sm">
            No tasks yet. Create your first task!
          </p>
          <button
            onClick={() => navigate("/projects")}
            className="px-4 py-2 text-sm bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer">
            Create Task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {recentTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => {
                if (task.projectId) {
                  navigate(`/projects/${task.projectId}/tasks`);
                } else {
                  // If task has no project, navigate to projects page
                  navigate("/projects");
                }
              }}
              className="border-l-2 border-indigo-500 pl-3 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex-1 line-clamp-1">
                  {task.title}
                </h3>
                <span
                  className={`text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                  {task.priority.toUpperCase()}
                </span>
              </div>
              <div className="mt-1">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    task.status,
                  )}`}>
                  {task.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
