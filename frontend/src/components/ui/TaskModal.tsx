import {useState, useEffect} from "react";
import {X} from "lucide-react";
import Modal from "./Modal";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreate: (task: {
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate: string;
    assigneeEmail?: string;
  }) => void;
  editTask?: {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate: string;
    assignedTo?:
      | {
          _id: string;
          name: string;
          email: string;
          photo?: string;
        }[]
      | string[];
    notes?: {
      text: string;
      createdBy: string;
      createdAt: string;
    }[];
    note?: string;
  } | null;
  onTaskUpdate?: (task: {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate: string;
    assigneeEmail?: string;
    removeAssigneeId?: string;
    note?: string;
  }) => void;
  canEditDetails?: boolean;
}

const TaskModal = ({
  isOpen,
  onClose,
  onTaskCreate,
  editTask,
  onTaskUpdate,
  canEditDetails = true,
}: TaskModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Pending");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [assigneeEmail, setAssigneeEmail] = useState("");
  const [assignedTo, setAssignedTo] = useState<any[]>([]);
  const [note, setNote] = useState("");

  // Populate form when editing
  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description);
      setStatus(editTask.status);
      setPriority(editTask.priority);
      // Format date to yyyy-MM-dd for input type="date"
      setDueDate(
        editTask.dueDate
          ? new Date(editTask.dueDate).toISOString().split("T")[0]
          : "",
      );

      // Handle assignedTo population
      setAssignedTo(editTask.assignedTo || []);

      setAssigneeEmail(""); // Start empty for adding new
      setNote(editTask.note || "");
    } else {
      // Reset form when not editing
      setTitle("");
      setDescription("");
      setStatus("Pending");
      setPriority("Medium");
      setDueDate("");
      setAssignedTo([]);
      setAssigneeEmail("");
      setNote("");
    }
  }, [editTask]);

  const handleRemoveAssignee = (userId: string, userName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${userName} from the task?`,
      )
    ) {
      // Optimistic update
      setAssignedTo((prev) =>
        prev.filter((u) =>
          typeof u === "string" ? u !== userId : u._id !== userId,
        ),
      );

      if (onTaskUpdate && editTask) {
        onTaskUpdate({
          id: editTask.id,
          title,
          description,
          status,
          priority,
          dueDate,
          removeAssigneeId: userId,
          note,
        });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editTask && onTaskUpdate) {
      // Update existing task
      const updatedTask = {
        id: editTask.id,
        title,
        description,
        status,
        priority,
        dueDate,
        note,
      };
      onTaskUpdate(updatedTask);
    } else {
      // Create new task
      const newTask = {
        title,
        description,
        status,
        priority,
        dueDate,
        assigneeEmail,
        note,
      };
      onTaskCreate(newTask);
    }
    handleClose();
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setStatus("Pending");
    setPriority("Medium");
    setDueDate("");
    setAssigneeEmail("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth={editTask ? "max-w-4xl" : "max-w-2xl"}>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black dark:text-white">
            {editTask ? "Edit Task" : "Create New Task"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-6">
            {/* Left Column: Task Info */}
            <div
              className={`flex-1 flex flex-col gap-4 ${!canEditDetails && editTask ? "pointer-events-none" : ""}`}>
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Title
                </label>
                {!canEditDetails && editTask ? (
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-zinc-900 p-2 rounded border border-gray-200 dark:border-gray-700">
                    {title}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-zinc-900 dark:text-white"
                    placeholder="Task Title"
                  />
                )}
              </div>

              {/* Description */}
              <div className="flex-1 flex flex-col min-h-0">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Description
                </label>
                {!canEditDetails && editTask ? (
                  <div className="flex-1 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-zinc-900 p-2 rounded border border-gray-200 dark:border-gray-700 overflow-y-auto">
                    {description}
                  </div>
                ) : (
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="flex-1 w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded focus:ring-1 focus:ring-indigo-500 resize-none bg-white dark:bg-zinc-900 dark:text-white"
                    placeholder="Task Description"
                  />
                )}
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 bg-gray-50 dark:bg-zinc-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={`w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-700 rounded focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-zinc-800 dark:text-white ${!canEditDetails && editTask && "pointer-events-auto"}`}>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className={`w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-700 rounded focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-zinc-800 dark:text-white ${!canEditDetails && editTask && "pointer-events-auto"}`}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-700 rounded focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 dark:disabled:bg-zinc-900 bg-white dark:bg-[#1a1a1a] dark:text-white dark:disabled:text-gray-400"
                    disabled={!canEditDetails && !!editTask}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Assigned To
                  </label>
                  {!canEditDetails && editTask ? (
                    <div className="flex flex-wrap gap-1">
                      {assignedTo &&
                        Array.isArray(assignedTo) &&
                        assignedTo.map(
                          (u: any) =>
                            typeof u !== "string" && (
                              <span
                                key={u._id}
                                className="text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100">
                                {u.name?.split(" ")[0]}
                              </span>
                            ),
                        )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex flex-wrap gap-1 mb-1">
                        {assignedTo &&
                          Array.isArray(assignedTo) &&
                          assignedTo.map(
                            (u: any) =>
                              typeof u !== "string" && (
                                <span
                                  key={u._id}
                                  className="inline-flex items-center text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100">
                                  {u.name?.split(" ")[0]}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveAssignee(u._id, u.name)
                                    }
                                    className="ml-1 text-indigo-400 hover:text-indigo-600 cursor-pointer">
                                    <X size={10} />
                                  </button>
                                </span>
                              ),
                          )}
                      </div>
                      <input
                        type="email"
                        value={assigneeEmail}
                        onChange={(e) => setAssigneeEmail(e.target.value)}
                        className="w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-700 rounded focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-zinc-800 dark:text-white"
                        placeholder="Add assignee by email"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Activity / Notes */}
            {editTask && (
              <div className="w-1/3 border-l border-gray-100 dark:border-gray-800 pl-4 flex flex-col h-[400px]">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Activity
                </h3>
                <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
                  {editTask.notes && editTask.notes.length > 0 ? (
                    editTask.notes.map((n: any, idx: number) => (
                      <div
                        key={idx}
                        className="text-xs bg-gray-50 dark:bg-zinc-900 p-2 rounded border border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            User
                          </span>
                          <span className="text-gray-400 dark:text-gray-500 text-[10px]">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          {n.text}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 text-xs py-4">
                      No notes yet
                    </div>
                  )}
                </div>
                <div>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    className="w-full text-xs px-2 py-1.5 border border-gray-300 dark:border-gray-700 rounded focus:ring-1 focus:ring-indigo-500 resize-none bg-white dark:bg-zinc-900 dark:text-white"
                    placeholder="Add a note..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons - Always visible */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-sm font-medium">
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer text-sm font-medium shadow-sm">
              {editTask ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default TaskModal;
