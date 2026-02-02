import {X} from "lucide-react";
import Modal from "./Modal";
import type {Team} from "../../context/TeamContext";

interface TeamDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
}

const TeamDetailsModal = ({isOpen, onClose, team}: TeamDetailsModalProps) => {
  if (!team) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-black">{team.name}</h2>
            {team.description && (
              <p className="text-gray-500 text-sm mt-1">{team.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <X size={24} />
          </button>
        </div>

        {/* Team Members Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-black">
              Team Members ({team.members.length})
            </h3>
          </div>

          {team.members.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No members yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Add members to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {team.members.map((member) => (
                <div
                  key={member.user._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {getInitials(member.user.name)}
                    </div>
                    <div>
                      <p className="font-medium text-black">
                        {member.user.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                      {member.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admin Info */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Team Admin:</span> {team.admin.name}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default TeamDetailsModal;
