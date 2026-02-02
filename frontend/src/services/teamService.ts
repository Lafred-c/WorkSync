import {API_URL as BASE_URL} from "../config";

const API_URL = `${BASE_URL}/api/teams`;

export const teamService = {
  // Fetch all teams
  getAllTeams: async () => {
    const res = await fetch(API_URL, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch teams");
    const data = await res.json();
    return data.data.teams;
  },

  // Create new team
  createTeam: async (teamData: {
    name: string;
    description: string;
    image?: string | null;
  }) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify(teamData),
    });
    if (!res.ok) throw new Error("Failed to create team");
    return res.json();
  },

  // Update team
  updateTeam: async (team: {
    _id: string;
    name: string;
    description: string;
    image?: string | null;
  }) => {
    const res = await fetch(`${API_URL}/${team._id}`, {
      method: "PATCH",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify({
        name: team.name,
        description: team.description,
        image: team.image,
      }),
    });
    if (!res.ok) throw new Error("Failed to update team");
    return res.json();
  },

  // Delete team
  deleteTeam: async (teamId: string) => {
    const res = await fetch(`${API_URL}/${teamId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to delete team");
  },

  // Add member to team
  addMember: async (teamId: string, userId: string, role: string) => {
    const res = await fetch(`${API_URL}/${teamId}/members`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify({userId, role}),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to add member");
    }
    return res.json();
  },

  // Remove member from team
  removeMember: async (teamId: string, userId: string) => {
    const res = await fetch(`${API_URL}/${teamId}/members/${userId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to remove member");
    return res.json();
  },

  // Update member role
  updateMemberRole: async (teamId: string, userId: string, role: string) => {
    const res = await fetch(`${API_URL}/${teamId}/members/${userId}`, {
      method: "PATCH",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify({role}),
    });
    if (!res.ok) throw new Error("Failed to update role");
    return res.json();
  },
};
