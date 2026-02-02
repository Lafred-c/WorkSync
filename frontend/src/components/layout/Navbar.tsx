import {Moon, Sun} from "lucide-react";
import {useTheme} from "../../context/ThemeContext";
import NotificationDropdown from "../ui/NotificationDropdown";

interface NavbarProps {
  showNotifications?: boolean;
}
const Navbar = ({showNotifications = true}: NavbarProps) => {
  const {theme, toggleTheme} = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-end px-6 backdrop-blur-md bg-white/70 dark:bg-black/90 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Notifications - Only show if logged in */}
        {showNotifications && <NotificationDropdown />}
      </div>
    </header>
  );
};

export default Navbar;
