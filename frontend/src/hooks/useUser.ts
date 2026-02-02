import {useQuery} from "@tanstack/react-query";

interface User {
  _id: string; // or id? Backend usually returns _id but transforms to id in JSON? Check authController.
  name: string;
  email: string;
  photo?: string;
  bio?: string;
  id: string; // The backend usually provides id via toJSON virtual
}

export const useUser = () => {
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/api/users/me", {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }
      const data = await res.json();
      return data.data.user as User;
    },
    retry: false,
    staleTime: Infinity, // User data rarely changes
  });

  return {user, isLoading, error};
};
