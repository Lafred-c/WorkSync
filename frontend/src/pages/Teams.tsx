import {useState, useRef, useEffect} from "react";
import {
  Plus,
  Search,
  Wrench,
  MoreVertical,
  Pencil,
  Trash2,
  UserPlus,
  Info,
} from "lucide-react";
import {useQuery} from "@tanstack/react-query";
import type {Team} from "../context/TeamContext";
import Toast from "../components/ui/Toast";
import CircularIndeterminate from "../components/ui/isLoading";
import TeamModal from "../components/ui/TeamModal";
import AddMemberModal from "../components/ui/AddMemberModal";
import TeamChat from "../components/ui/TeamChat";
import TeamInfo from "../components/ui/TeamInfo"; // Import new component
import {teamService} from "../services/teamService";
import {useTeamMutations} from "../hooks/useTeamMutations";
import {useUser} from "../hooks/useUser"; // Import useUser hook

const Teams = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [viewMode, setViewMode] = useState<"chat" | "info">("chat");
  const {user} = useUser();
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // Resize state
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const isCollapsed = sidebarWidth < 180;
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      // Calculate new width restricted by min/max
      // We need to account for the sidebar's position relative to the viewport
      // If there is a global navigation on the left, e.clientX will include its width
      let newWidth = e.clientX;

      if (sidebarRef.current) {
        const sidebarRect = sidebarRef.current.getBoundingClientRect();
        newWidth = e.clientX - sidebarRect.left;
      }

      if (newWidth < 80) newWidth = 80; // Min width to show icons
      if (newWidth > 480) newWidth = 480; // Max width

      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto"; // Re-enable selection
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize"; // Force cursor global
      document.body.style.userSelect = "none"; // Prevent text selection while dragging
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };
  }, [isResizing]);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  // Reset view to chat when selecting new team and mark messages as read
  const handleTeamSelect = async (teamId: string) => {
    setSelectedTeamId(teamId);
    setViewMode("chat");

    // Mark messages as read
    try {
      await fetch(
        `http://localhost:3000/api/teams/${teamId}/messages/mark-read`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );
      // Update local unread count
      setUnreadCounts((prev) => ({...prev, [teamId]: 0}));
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  };

  // Fetch teams using TanStack Query
  const {data: teams = [], isLoading} = useQuery({
    queryKey: ["teams"],
    queryFn: teamService.getAllTeams,
  });

  // Fetch unread counts
  const {data: unreadData} = useQuery({
    queryKey: ["unread-counts"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/api/teams/unread-counts", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch unread counts");
      const data = await res.json();
      return data.data.unreadCounts;
    },
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Update unread counts when data changes
  useEffect(() => {
    if (unreadData) {
      setUnreadCounts(unreadData);
    }
  }, [unreadData]);

  const selectedTeam =
    teams.find((t: Team) => t._id === selectedTeamId) || null;

  // Team mutations
  const {
    createTeamMutation,
    updateTeamMutation,
    deleteTeamMutation,
    addMemberMutation,
  } = useTeamMutations(
    setToastMessage,
    setIsModalOpen,
    setEditingTeam,
    (team: any) => setSelectedTeamId(team ? team._id : null),
    setIsAddMemberModalOpen,
  );

  // Handlers
  const handleCreateTeam = (teamData: {name: string; description: string}) => {
    createTeamMutation.mutate(teamData);
  };

  const handleUpdateTeam = (team: {
    _id: string;
    name: string;
    description: string;
  }) => {
    updateTeamMutation.mutate(team);
  };

  const handleEditTeam = () => {
    if (selectedTeam) {
      setEditingTeam(selectedTeam);
      setIsModalOpen(true);
      setShowMenu(false);
    }
  };

  const handleDeleteTeam = () => {
    if (
      selectedTeam &&
      window.confirm("Are you sure you want to delete this team?")
    ) {
      deleteTeamMutation.mutate(selectedTeam._id);
      setShowMenu(false);
    }
  };

  const handleAddMember = (email: string, role: string) => {
    if (selectedTeam) {
      addMemberMutation.mutate({teamId: selectedTeam._id, email, role});
    }
  };

  const filteredTeams = teams.filter((team: Team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <div className="flex h-[calc(102vh-80px)]">
        {/* Sidebar - Team List */}
        <div
          ref={sidebarRef}
          className="bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 flex flex-col relative transition-all duration-75 ease-out"
          style={{width: sidebarWidth}}>
          {/* Resize Handle */}
          <div
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-indigo-300 transition-colors z-10 opacity-0 hover:opacity-100 active:opacity-100 flex items-center justify-center group"
            onMouseDown={startResizing}>
            <div className="w-[1px] h-8 bg-gray-300 group-hover:bg-indigo-400 rounded-full" />
          </div>

          <div
            className={`p-4 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
            {!isCollapsed && (
              <h2 className="text-2xl font-bold text-black dark:text-white p-2 mb-2">
                Teams
              </h2>
            )}

            {/* Search */}
            <div
              className={`relative mb-4 ${isCollapsed ? "flex justify-center" : ""}`}>
              {isCollapsed ? (
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-zinc-800 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-zinc-700 transition-colors"
                  title="Search teams"
                  onClick={() => setSidebarWidth(320)} // Expand on click
                >
                  <Search size={20} />
                </button>
              ) : (
                <>
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search teams..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </>
              )}
            </div>

            {/* Team List */}
            <div
              className={`flex-1 overflow-y-auto ${isCollapsed ? "px-2" : ""}`}>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <CircularIndeterminate />
                </div>
              ) : filteredTeams.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-xs">No teams found</p>
                </div>
              ) : (
                filteredTeams.map((team: Team) => (
                  <div
                    key={team._id}
                    onClick={() => handleTeamSelect(team._id)}
                    className={`rounded-lg cursor-pointer transition-all mb-2 ${
                      isCollapsed
                        ? "p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 flex justify-center"
                        : "p-3 " +
                          (selectedTeamId === team._id
                            ? "bg-gray-100 dark:bg-zinc-800 text-black dark:text-white"
                            : "hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-700 dark:text-gray-300")
                    } ${selectedTeamId === team._id && isCollapsed ? "bg-gray-200 dark:bg-zinc-800" : ""}`}>
                    <div
                      className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden ${
                          selectedTeamId === team._id
                            ? "bg-gray-200 dark:bg-zinc-700"
                            : "bg-gray-100 dark:bg-zinc-800"
                        }`}>
                        {team.image ? (
                          <img
                            src={team.image}
                            alt={team.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Wrench
                            size={20}
                            className={
                              selectedTeamId === team._id
                                ? "text-black dark:text-white"
                                : "text-gray-600 dark:text-gray-400"
                            }
                          />
                        )}
                      </div>
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0 flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-xs truncate">
                              {team.name}
                            </p>
                            <p
                              className={`text-xs ${
                                selectedTeamId === team._id
                                  ? "text-black/70 dark:text-white/70"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}>
                              {team.members.length} members
                            </p>
                          </div>
                          {/* Unread Badge */}
                          {unreadCounts[team._id] > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                              {unreadCounts[team._id] > 99
                                ? "99+"
                                : unreadCounts[team._id]}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* New Team Button */}
            <button
              onClick={() => {
                if (isCollapsed) setSidebarWidth(320);
                setEditingTeam(null);
                setIsModalOpen(true);
              }}
              className={`py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 dark:hover:bg-zinc-900 dark:text-white transition-colors flex items-center justify-center gap-2 mt-4 cursor-pointer ${isCollapsed ? "w-10 h-10 p-0 mx-auto" : "w-full"}`}
              title="New Team">
              <Plus size={18} />
              {!isCollapsed && "New Team"}
            </button>
          </div>
        </div>

        {/* Main Area - Team Details */}
        <div className="flex-1 bg-white dark:bg-black flex flex-col">
          {selectedTeam ? (
            <>
              {/* Team Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-zinc-800 rounded-lg flex items-center justify-center overflow-hidden">
                    {selectedTeam.image ? (
                      <img
                        src={selectedTeam.image}
                        alt={selectedTeam.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Wrench
                        size={24}
                        className="text-gray-600 dark:text-gray-400"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-black dark:text-white">
                      {selectedTeam.name}
                    </h2>
                    {selectedTeam.description && (
                      <p className="text-gray-500 text-xs mt-1">
                        {selectedTeam.description}
                      </p>
                    )}
                  </div>
                  {/* Ellipsis Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                      <MoreVertical size={20} className="text-gray-600" />
                    </button>
                    {showMenu && (
                      <div className="absolute right-0 top-12 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-10 py-1 w-48 cursor-pointer">
                        <button
                          onClick={handleEditTeam}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-gray-200 flex items-center gap-2 cursor-pointer">
                          <Pencil size={16} />
                          Edit Team Details
                        </button>
                        <button
                          onClick={() => {
                            setIsAddMemberModalOpen(true);
                            setShowMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-gray-200 flex items-center gap-2 cursor-pointer">
                          <UserPlus size={16} />
                          Add Members
                        </button>
                        <button
                          onClick={() => {
                            setViewMode("info");
                            setShowMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-gray-200 flex items-center gap-2 cursor-pointer">
                          <Info size={16} />
                          View Info
                        </button>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={handleDeleteTeam}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-red-600 cursor-pointer">
                          <Trash2 size={16} />
                          Delete Team
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Area - Chat or Info */}
              <div className="flex-1 bg-gray-50 dark:bg-black relative">
                {viewMode === "info" ? (
                  <TeamInfo
                    team={selectedTeam}
                    currentUserEmail={user?.email}
                    onBack={() => setViewMode("chat")}
                    onAddMember={() => setIsAddMemberModalOpen(true)}
                  />
                ) : (
                  <TeamChat teamId={selectedTeam._id} />
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wrench
                    size={32}
                    className="text-gray-400 dark:text-gray-600"
                  />
                </div>
                <p className="text-gray-500 text-base font-medium">
                  Select a team to chat
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Choose a team from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Team Modal */}
      <TeamModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTeam(null);
        }}
        onTeamCreate={handleCreateTeam}
        editTeam={editingTeam}
        onTeamUpdate={handleUpdateTeam}
      />

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onAddMember={handleAddMember}
      />

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </>
  );
};

export default Teams;
