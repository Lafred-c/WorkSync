import {createContext, useContext, useState, useEffect} from "react";
import type {ReactNode} from "react";

import {API_URL as BASE_URL} from "../config";

const API_URL = `${BASE_URL}/api/teams`;

export interface TeamMember {
  user: {
    _id: string;
    name: string;
    email: string;
    photo?: string;
  };
  role: "Manager" | "Member";
  joinedAt: string;
}

export interface Team {
  _id: string;
  name: string;
  description?: string;
  image?: string | null;
  admin: {
    _id: string;
    name: string;
    email: string;
  };
  members: TeamMember[];
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

interface TeamContextType {
  teams: Team[];
  loading: boolean;
  error: string | null;
  createTeam: (teamData: {
    name: string;
    description?: string;
    image?: string | null;
  }) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  addMember: (teamId: string, userId: string, role: string) => Promise<void>;
  removeMember: (teamId: string, userId: string) => Promise<void>;
  updateMemberRole: (
    teamId: string,
    userId: string,
    role: string,
  ) => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider = ({children}: {children: ReactNode}) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch teams on mount
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_URL, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch teams");
        }

        const data = await res.json();
        setTeams(data.data.teams);
        setError(null);
      } catch (err) {
        console.error("Error fetching teams:", err);
        setError("Failed to load teams");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const createTeam = async (teamData: {name: string; description?: string}) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(teamData),
      });

      if (!res.ok) {
        throw new Error("Failed to create team");
      }

      const data = await res.json();
      setTeams([data.data.team, ...teams]);
    } catch (err) {
      console.error("Error creating team:", err);
      setError("Failed to create team");
      throw err;
    }
  };

  const deleteTeam = async (teamId: string) => {
    try {
      const res = await fetch(`${API_URL}/${teamId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to delete team");
      }

      setTeams(teams.filter((team) => team._id !== teamId));
    } catch (err) {
      console.error("Error deleting team:", err);
      setError("Failed to delete team");
      throw err;
    }
  };

  const addMember = async (teamId: string, userId: string, role: string) => {
    try {
      const res = await fetch(`${API_URL}/${teamId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({userId, role}),
      });

      if (!res.ok) {
        throw new Error("Failed to add member");
      }

      const data = await res.json();
      setTeams(
        teams.map((team) => (team._id === teamId ? data.data.team : team)),
      );
    } catch (err) {
      console.error("Error adding member:", err);
      setError("Failed to add member");
      throw err;
    }
  };

  const removeMember = async (teamId: string, userId: string) => {
    try {
      const res = await fetch(`${API_URL}/${teamId}/members/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to remove member");
      }

      const data = await res.json();
      setTeams(
        teams.map((team) => (team._id === teamId ? data.data.team : team)),
      );
    } catch (err) {
      console.error("Error removing member:", err);
      setError("Failed to remove member");
      throw err;
    }
  };

  const updateMemberRole = async (
    teamId: string,
    userId: string,
    role: string,
  ) => {
    try {
      const res = await fetch(`${API_URL}/${teamId}/members/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({role}),
      });

      if (!res.ok) {
        throw new Error("Failed to update member role");
      }

      const data = await res.json();
      setTeams(
        teams.map((team) => (team._id === teamId ? data.data.team : team)),
      );
    } catch (err) {
      console.error("Error updating member role:", err);
      setError("Failed to update member role");
      throw err;
    }
  };

  return (
    <TeamContext.Provider
      value={{
        teams,
        loading,
        error,
        createTeam,
        deleteTeam,
        addMember,
        removeMember,
        updateMemberRole,
      }}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeams = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error("useTeams must be used within a TeamProvider");
  }
  return context;
};
