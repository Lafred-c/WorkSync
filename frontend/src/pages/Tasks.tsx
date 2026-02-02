import {Eye, EyeOff, Plus, Search} from "lucide-react";
import {useState} from "react";
import TaskModal from "../components/ui/TaskModal";
import TaskCard from "../components/ui/TaskCard";
import Toast from "../components/ui/Toast";
import CircularIndeterminate from "../components/ui/isLoading";
import {useTasks} from "../context/TaskContext";
import type {Task} from "../context/TaskContext";

const Tasks = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [priorityFilter, setPriorityFilter] = useState("All Priority");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);

  const {tasks, addTask, updateTask, deleteTask, loading} = useTasks();

  const handleAddTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleTaskCreate = async (taskData: Omit<Task, "id">) => {
    try {
      await addTask(taskData);
      setToastMessage("Task created successfully");
    } catch (error) {
      setToastMessage("Failed to create task");
    }
  };

  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      await updateTask(updatedTask);
      setToastMessage("Task edited successfully");
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
      setToastMessage("Task deleted successfully");
    } catch (error) {
      setToastMessage("Failed to delete task");
    }
  };

  // Filter tasks based on search query, status, priority, and completed visibility
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All Status" || task.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All Priority" || task.priority === priorityFilter;

    const matchesCompleted = showCompleted || task.status !== "Completed";

    return (
      matchesSearch && matchesStatus && matchesPriority && matchesCompleted
    );
  });

  return (
    <>
      <main className="flex flex-row gap-4 justify-between px-6 pt-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-black">Tasks</h1>
          <p className="text-sm text-gray-500">
            Manage and track your team's tasks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="bg-white text-black p-3 rounded-md border border-gray-200 flex items-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer"
            title={
              showCompleted ? "Hide completed tasks" : "Show completed tasks"
            }>
            {showCompleted ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
          <button
            onClick={handleAddTask}
            className="bg-white text-xs text-black border border-gray-200 p-3 rounded-lg flex items-center gap-2 cursor-pointer hover:opacity-90 transition-all duration-300">
            <Plus size={18} />
            Add Task
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
            placeholder="Search tasks"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer bg-white">
          <option value="All Status">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="text-xs px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer bg-white">
          <option value="All Priority">All Priority</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      {/* Task Grid */}
      <div className="mt-6 px-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <CircularIndeterminate />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-base">No tasks found</p>
            <p className="text-gray-400 text-xs mt-2">
              {tasks.length === 0
                ? "Click 'Add Task' to create your first task"
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

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onTaskCreate={handleTaskCreate}
        editTask={editingTask}
        onTaskUpdate={handleTaskUpdate}
      />

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </>
  );
};

export default Tasks;
