import {useState, useEffect, useRef} from "react";
import {io, Socket} from "socket.io-client";
import {Send, Pencil, Trash2, User} from "lucide-react";
import {useUser} from "../../hooks/useUser";
import CircularIndeterminate from "./isLoading";
import {API_URL} from "../../config";

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    photo?: string;
  };
  createdAt: string;
  isEdited?: boolean;
}

interface TeamChatProps {
  teamId: string;
}

const TeamChat = ({teamId}: TeamChatProps) => {
  const {user} = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Connect to socket and fetch initial messages
  useEffect(() => {
    // Clear messages immediately when switching teams
    setMessages([]);
    setLoading(true);

    const newSocket = io(API_URL);
    setSocket(newSocket);

    // Join team room
    newSocket.emit("join_team", teamId);

    // Listen for messages
    newSocket.on("receive_message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Fetch message history
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_URL}/api/teams/${teamId}/messages`, {
          credentials: "include",
        });

        if (res.status === 403) {
          console.error("Unauthorized to view messages");
          return;
        }

        const data = await res.json();
        if (data.status === "success") {
          setMessages(data.data.messages);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Cleanup
    return () => {
      newSocket.off("receive_message");
      newSocket.disconnect();
      setMessages([]); // Clear messages on unmount/change
    };
  }, [teamId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !user) return;

    socket.emit("send_message", {
      content: newMessage,
      teamId,
      senderId: user.id, // Assuming user.id exists in AuthContext
    });

    setNewMessage("");
  };

  const handleEditClick = (msg: Message) => {
    setEditingMessageId(msg._id);
    setEditContent(msg.content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent("");
  };

  const handleUpdateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim() || !editingMessageId) return;

    try {
      const res = await fetch(
        `${API_URL}/api/teams/${teamId}/messages/${editingMessageId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({content: editContent}),
        },
      );

      if (res.ok) {
        const data = await res.json();
        // Update local state
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === editingMessageId ? data.data.message : msg,
          ),
        );
        setEditingMessageId(null);
        setEditContent("");
      }
    } catch (err) {
      console.error("Error updating message:", err);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm("Are you sure you want to delete this message?"))
      return;

    try {
      const res = await fetch(
        `${API_URL}/api/teams/${teamId}/messages/${messageId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (res.ok) {
        // Update local state by filtering out the deleted message
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      }
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <CircularIndeterminate />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(98vh-145px)] bg-gray-50 dark:bg-black">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender._id === user?.id;
            const isEditing = editingMessageId === msg._id;

            return (
              <div
                key={msg._id}
                className={`flex gap-3 group ${isMe ? "justify-end" : "justify-start"}`}>
                {!isMe && (
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
                    {msg.sender.photo && msg.sender.photo !== "default.jpg" ? (
                      <img
                        src={msg.sender.photo}
                        alt={msg.sender.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={18} />
                    )}
                  </div>
                )}

                <div className={`max-w-[40ch] ${isMe ? "order-1" : "order-2"}`}>
                  <div
                    className={`p-3 rounded-lg relative ${
                      isMe
                        ? "bg-gray-600 text-white rounded-br-none"
                        : "bg-gray-200 dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm"
                    }`}>
                    {!isMe && (
                      <p className="text-xs font-bold mb-1 text-gray-500">
                        {msg.sender.name}
                      </p>
                    )}

                    {isEditing ? (
                      <form
                        onSubmit={handleUpdateMessage}
                        className="flex flex-col gap-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => {
                            setEditContent(e.target.value);
                            e.target.style.height = "auto";
                            e.target.style.height =
                              e.target.scrollHeight + "px";
                          }}
                          className="text-white bg-gray-800 dark:bg-[#1a1a1a] text-sm px-2 py-1 rounded border border-gray-600 dark:border-gray-700 focus:outline-none w-full max-w-[280px] min-h-[30px] resize-none overflow-hidden"
                          autoFocus
                          rows={1}
                          onFocus={(e) => {
                            e.target.style.height = "auto";
                            e.target.style.height =
                              e.target.scrollHeight + "px";
                          }}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="text-xs text-gray-200 hover:text-white">
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="text-xs bg-black dark:bg-[#1a1a1a] text-white px-2 py-0.5 rounded font-bold">
                            Save
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <p className="text-sm break-words whitespace-pre-wrap">
                          {msg.content}
                        </p>
                        {msg.isEdited && (
                          <span className="text-[10px] opacity-70 italic ml-1">
                            (edited)
                          </span>
                        )}
                      </>
                    )}

                    <p
                      className={`text-[10px] mt-1 text-right ${
                        isMe ? "text-indigo-200" : "text-gray-400"
                      }`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {/* Edit/Delete Actions for My Messages */}
                {isMe && !isEditing && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity self-center order-0 mr-2">
                    <button
                      onClick={() => handleEditClick(msg)}
                      className="p-1 text-gray-400 hover:text-indigo-600 rounded">
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(msg._id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-gray-800">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-900 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeamChat;
