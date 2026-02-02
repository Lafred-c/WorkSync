import {CheckSquare, ArrowRight, Zap, Users, BarChart3} from "lucide-react";
import {Button} from "../components/ui/Button";
import {useNavigate} from "react-router-dom";
import Navbar from "../components/layout/Navbar";

const features = [
  {
    icon: CheckSquare,
    title: "Task Management",
    description: "Create, organize, and track tasks with ease",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Work together with your team in real-time",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Get insights into your productivity",
  },
];

export const Index = () => {
  const navigate = useNavigate();
  function handleClick() {
    navigate("/register");
  }
  function handleClickLog() {
    navigate("/login");
  }

  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <Navbar showNotifications={false} />
      <div>
        {/* Logo */}
        <div className="gradient-bg w-16 h-16 rounded-2xl mx-auto mt-24 shadow-gray-100 shadow-2xl flex items-center justify-center">
          <CheckSquare className="w-10 h-10 text-white" />
        </div>
        {/* Title */}
        <div className="mt-8 w-1/2 mx-auto">
          <h1 className="text-6xl font-bold text-center mt-6 tracking-tight text-gray-900 dark:text-white">
            Manage tasks with
          </h1>
          <h1 className="text-indigo-600 dark:text-indigo-500 text-6xl font-bold text-center mt-4 line-clamp-1 tracking-tight">
            clarity & speed
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-light text-lg leading-relaxed max-w-xl text-center mx-auto mt-6">
            A modern task management system designed for teams who want to ship
            faster. Stay organized, collaborate better, achieve more.
          </p>
          {/* Button */}
          <div className="mt-8 flex justify-center gap-4">
            <Button
              onClick={handleClick}
              className="bg-indigo-600 text-white p-3 pl-6 flex items-center rounded-xl hover:opacity-90 transition-all duration-300 cursor-pointer">
              Get Started Free <ArrowRight className="w-4 h-4 mx-3" />
            </Button>
            <Button
              onClick={handleClickLog}
              className="bg-white text-black p-3 px-6 rounded-xl border border-gray-200 hover:text-indigo-600 hover:bg-gray-50 transition-all duration-300 cursor-pointer">
              Sign In
            </Button>
          </div>
          {/* Sub-Icons */}
          <div className="mt-16 mb-32 flex justify-center gap-12 text-sm text-gray-400 font-extralight">
            <Button textOnly className="flex items-center gap-2">
              <Zap size={14} color="#FF8C00" />
              Fast & Intuitive
            </Button>
            <Button textOnly className="flex items-center gap-2">
              <Users size={16} color="#8B008B" />
              Team Ready
            </Button>
          </div>
        </div>
      </div>
      {/* Features */}
      <div className="flex flex-wrap justify-center gap-6 mx-2 my-32">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="w-md bg-white dark:bg-[#1e1e1e] text-center p-6 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg">
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <feature.icon color="#4f39f6" />
              </div>

              <h2 className="font-medium text-gray-900 dark:text-white">
                {feature.title}
              </h2>

              <p className="text-gray-500 font-light text-sm">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="flex justify-center text-xs text-gray-500 dark:text-gray-500 font-light border-t border-gray-200 dark:border-gray-800 py-10">
        ©{new Date().getFullYear()} Developed by Mark Alfred Pardillo.
      </footer>
    </main>
  );
};
