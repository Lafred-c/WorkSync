import {User, Shield, Trash2, UserPlus} from "lucide-react";
import type {Team, TeamMember} from "@/context/TeamContext";
import {useTeamMutations} from "../../hooks/useTeamMutations";

interface TeamInfoProps {
  team: Team;
  currentUserEmail?: string;
  onBack: () => void;
  onAddMember: () => void;
}

const TeamInfo = ({
  team,
  currentUserEmail,
  onBack,
  onAddMember,
}: TeamInfoProps) => {
  // We need to pass dummy setters for the hooks we aren't using
  // This is a bit of a hack because we're reusing a big hook
  const {updateMemberRoleMutation, removeMemberMutation} = useTeamMutations(
    () => {}, // setToastMessage
    () => {}, // setIsModalOpen
    () => {}, // setEditingTeam
    () => {}, // setSelectedTeam
    () => {}, // setIsAddMemberModalOpen
  );

  const isAdmin = team.admin.email === currentUserEmail;

  const handleRoleChange = (userId: string, newRole: string) => {
    updateMemberRoleMutation.mutate({
      teamId: team._id,
      userId,
      role: newRole,
    });
  };

  const handleRemoveMember = (userId: string) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      removeMemberMutation.mutate({
        teamId: team._id,
        userId,
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 dark:bg-black dark:border-gray-800">
        <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
          Team Information
        </h3>
        <button
          onClick={onBack}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer">
          Back to Chat
        </button>
      </div>

      <div className="p-6 overflow-y-auto flex-1">
        {/* Team Details */}
        <div className="mb-8">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
            Details
          </h4>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 dark:bg-black dark:border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 dark:bg-gray-800 dark:text-gray-200">
                <Shield size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {team.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {team.members.length + 1} Members
                </p>
              </div>
            </div>
            {team.description && (
              <p className="text-sm text-gray-600 mt-2 pl-13">
                {team.description}
              </p>
            )}
          </div>
        </div>

        {/* Members List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Members
            </h4>
            {isAdmin && (
              <button
                onClick={onAddMember}
                className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer">
                <UserPlus size={14} />
                Add Member
              </button>
            )}
          </div>

          <div className="space-y-3">
            {/* Admin */}
            <div className="flex items-center justify-between p-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-lg hover:border-indigo-100 dark:hover:border-indigo-900 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                  <Shield size={14} />
                </div>
                <div className="dark:text-white">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {team.admin.name}{" "}
                    <span className="text-xs text-purple-600 ml-1 dark:text-purple-400">
                      (Admin)
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {team.admin.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Other Members */}
            {team.members
              .filter((member: TeamMember) => member.user) // Filter out members with null user references
              .map((member: TeamMember) => (
                <div
                  key={member.user._id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-lg hover:border-indigo-100 dark:hover:border-indigo-900 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 overflow-hidden">
                      {/* safely access photo or initial */}
                      {member.user.photo ? (
                        <img
                          src={member.user.photo}
                          alt={member.user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={14} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {member.user.email}
                      </p>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleRoleChange(member.user._id, e.target.value)
                        }
                        className="text-xs border-gray-200 dark:border-gray-700 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-zinc-800 dark:text-white py-1">
                        <option value="Member">Member</option>
                        <option value="Manager">Manager</option>
                      </select>
                      <button
                        onClick={() => handleRemoveMember(member.user._id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove Member">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                  {!isAdmin && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded">
                      {member.role}
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamInfo;
