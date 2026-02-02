import {Users, CircleCheck, Clock4} from "lucide-react";
import {useQuery} from "@tanstack/react-query";
import CircularIndeterminate from "./isLoading";

const Dashcard = () => {
  // Fetch task statistics
  const {data: taskStats, isLoading: loadingTasks} = useQuery({
    queryKey: ["taskStats"],
    queryFn: async () => {
      const res = await fetch(
        "http://localhost:3000/api/tasks/stats/dashboard",
        {
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error("Failed to fetch task stats");
      const data = await res.json();
      return data.data;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Fetch team statistics
  const {data: teamStats, isLoading: loadingTeams} = useQuery({
    queryKey: ["teamStats"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/api/teams/stats", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch team stats");
      const data = await res.json();
      return data.data;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const isLoading = loadingTasks || loadingTeams;

  const cardData = [
    {
      title: "Total Tasks",
      icon: <CircleCheck className="w-8 h-8 text-green-400" />,
      count: taskStats?.totalTasks || 0,
    },
    {
      title: "Teams",
      icon: <Users className="w-8 h-8 text-blue-400" />,
      count: teamStats?.totalTeams || 0,
    },
    {
      title: "Completed",
      icon: <Clock4 className="w-8 h-8 text-yellow-400" />,
      count: taskStats?.completedTasks || 0,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-row gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-row justify-between items-center w-full py-10 px-6 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 shadow-gray-300 dark:shadow-none shadow-sm rounded-xl">
            <CircularIndeterminate />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-6">
      {cardData.map((card, index) => (
        <div
          key={index}
          className="flex flex-row justify-between items-center w-full py-10 px-6 bg-white border border-gray-200 dark:bg-[#1a1a1a] dark:border-gray-800 shadow-gray-300 dark:shadow-none shadow-sm rounded-xl">
          <div className="flex flex-col">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {card.title}
            </p>
            <h1 className="text-2xl font-bold text-black dark:text-white">
              {card.count}
            </h1>
          </div>
          <div className="flex items-center">{card.icon}</div>
        </div>
      ))}
    </div>
  );
};

export default Dashcard;
