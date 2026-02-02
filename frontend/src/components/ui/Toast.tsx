import {useEffect, useState} from "react";
import {CheckCircle, X, AlertCircle} from "lucide-react";

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
  type?: "success" | "error";
}

const Toast = ({
  message,
  onClose,
  duration = 3000,
  type = "success",
}: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setIsVisible(true);

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";
  const hoverColor =
    type === "success" ? "hover:bg-green-700" : "hover:bg-red-700";
  const Icon = type === "success" ? CheckCircle : AlertCircle;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 transition-all duration-300"
      style={{
        transform: isVisible ? "translateY(0)" : "translateY(100px)",
        opacity: isVisible ? 1 : 0,
      }}>
      <div
        className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]`}>
        <Icon size={20} className="flex-shrink-0" />
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          onClick={onClose}
          className={`flex-shrink-0 ${hoverColor} rounded p-1 transition-colors`}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
