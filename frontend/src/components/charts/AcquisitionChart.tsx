import {useEffect, useRef} from "react";
import {useQuery} from "@tanstack/react-query";
import Chart from "chart.js/auto";
import CircularIndeterminate from "../ui/isLoading";

const AcquisitionChart = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  // Fetch task statistics for distribution
  const {data: taskStats, isLoading} = useQuery({
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

  // Check if there's any task data
  const hasData = taskStats && taskStats.totalTasks > 0;

  useEffect(() => {
    if (!canvasRef.current || !taskStats || !hasData) return;

    // Destroy existing chart if it exists
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Create doughnut chart with task status distribution
    chartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        labels: ["Pending", "In Progress", "Completed"],
        datasets: [
          {
            data: [
              taskStats.tasksByStatus?.Pending || taskStats.todoTasks || 0,
              taskStats.tasksByStatus?.["In Progress"] ||
                taskStats.inProgressTasks ||
                0,
              taskStats.tasksByStatus?.Completed ||
                taskStats.completedTasks ||
                0,
            ],
            backgroundColor: [
              "rgba(156, 163, 175, 0.8)", // Gray for Pending
              "rgba(251, 146, 60, 0.8)", // Orange for In Progress
              "rgba(34, 197, 94, 0.8)", // Green for Completed
            ],
            borderColor: [
              "rgba(156, 163, 175, 1)",
              "rgba(251, 146, 60, 1)",
              "rgba(34, 197, 94, 1)",
            ],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: {
              padding: 15,
              font: {
                size: 12,
              },
            },
          },
          title: {
            display: false,
          },
        },
      },
    });

    // Cleanup function
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [taskStats, hasData]);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-gray-300 shadow-sm h-full flex flex-col">
        <h2 className="text-lg font-bold mb-4">Task Distribution</h2>
        <div className="flex-1 flex items-center justify-center">
          <CircularIndeterminate />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-gray-300 dark:shadow-none shadow-sm h-full flex flex-col">
      <h2 className="text-lg font-bold mb-4 text-black dark:text-white">
        Task Distribution
      </h2>
      {!hasData ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-sm">No tasks yet</p>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[280px]">
            <canvas ref={canvasRef}></canvas>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcquisitionChart;
