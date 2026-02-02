import {useState, useEffect} from "react";
import {useNavigate, useLocation} from "react-router-dom";
import {useUser} from "../../hooks/useUser";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  LogOut,
  CheckSquare,
} from "lucide-react";
import {API_URL} from "../../config";
const SidebarPages = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    title: "Projects",
    icon: FolderKanban,
    path: "/projects",
  },
  {
    title: "Teams",
    icon: Users,
    path: "/teams",
  },
];

type SidebarProps = {
  title: string;
};

const Sidebar = ({title}: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {user} = useUser();
  const [activePage, setActivePage] = useState("Dashboard");

  // Sync active page with current URL
  useEffect(() => {
    const currentPage = SidebarPages.find(
      (page) => page.path === location.pathname,
    );
    if (currentPage) {
      setActivePage(currentPage.title);
    }
  }, [location.pathname]);

  const handlePageClick = (page: (typeof SidebarPages)[0]) => {
    setActivePage(page.title);
    navigate(page.path);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/logout`, {
        method: "POST",
        credentials: "include", // Include cookies in request
      });

      if (res.ok) {
        // Clear any local storage or session data if needed
        localStorage.clear();
        sessionStorage.clear();

        // Redirect to login page
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      // Still redirect to login even if API call fails
      navigate("/login");
    }
  };

  return (
    <aside className="w-64 h-screen sticky top-0 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 flex flex-col transition-colors duration-300 shrink-0">
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-800 mb-4">
        <div className="gradient-bg w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <CheckSquare className="text-white w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
      </div>
      <div className="flex-grow">
        {SidebarPages.map((page) => (
          <div
            className={
              activePage === page.title
                ? "flex items-center gap-3 p-3 mx-4 my-2 rounded-lg bg-black text-white dark:bg-zinc-800 dark:text-white"
                : "flex items-center gap-3 p-3 mx-4 my-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 cursor-pointer text-gray-700 dark:text-gray-400 theme-transition"
            }
            key={page.title}
            onClick={() => handlePageClick(page)}>
            <page.icon className="w-5 h-5" />
            <h2 className="text-md">{page.title}</h2>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-black">
        {user && (
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center overflow-hidden cursor-pointer flex-shrink-0"
              onClick={() => navigate("/settings")}>
              {user.photo && user.photo !== "default.jpg" ? (
                <img
                  src={user.photo}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => navigate("/settings")}>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              title="Sign out">
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
