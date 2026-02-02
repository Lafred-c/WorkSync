import {useMutation, useQueryClient} from "@tanstack/react-query";
import {teamService} from "../services/teamService";
import {userService} from "../services/userService";

export const useTeamMutations = (
  setToastMessage: (message: string) => void,
  setIsModalOpen: (open: boolean) => void,
  setEditingTeam: (team: any) => void,
  setSelectedTeam: (team: any) => void,
  setIsAddMemberModalOpen: (open: boolean) => void,
) => {
  const queryClient = useQueryClient();

  const createTeamMutation = useMutation({
    mutationFn: teamService.createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["teams"]});
      setToastMessage("Team created successfully");
      setIsModalOpen(false);
    },
    onError: () => {
      setToastMessage("Failed to create team");
    },
  });

  const updateTeamMutation = useMutation({
    mutationFn: teamService.updateTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["teams"]});
      setToastMessage("Team updated successfully");
      setIsModalOpen(false);
      setEditingTeam(null);
    },
    onError: () => {
      setToastMessage("Failed to update team");
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: teamService.deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["teams"]});
      setToastMessage("Team deleted successfully");
      setSelectedTeam(null);
    },
    onError: () => {
      setToastMessage("Failed to delete team");
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: async ({
      teamId,
      email,
      role,
    }: {
      teamId: string;
      email: string;
      role: string;
    }) => {
      const user = await userService.findUserByEmail(email);
      return teamService.addMember(teamId, user._id, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["teams"]});
      setToastMessage("Member added successfully");
      setIsAddMemberModalOpen(false);
    },
    onError: (error: any) => {
      setToastMessage(error.message || "Failed to add member");
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({teamId, userId}: {teamId: string; userId: string}) =>
      teamService.removeMember(teamId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["teams"]});
      setToastMessage("Member removed successfully");
    },
    onError: () => {
      setToastMessage("Failed to remove member");
    },
  });

  const updateMemberRoleMutation = useMutation({
    mutationFn: ({
      teamId,
      userId,
      role,
    }: {
      teamId: string;
      userId: string;
      role: string;
    }) => teamService.updateMemberRole(teamId, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["teams"]});
      setToastMessage("Role updated successfully");
    },
    onError: () => {
      setToastMessage("Failed to update role");
    },
  });

  return {
    createTeamMutation,
    updateTeamMutation,
    deleteTeamMutation,
    addMemberMutation,
    removeMemberMutation,
    updateMemberRoleMutation,
  };
};
