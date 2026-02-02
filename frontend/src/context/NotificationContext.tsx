import {createContext, useContext, useState, useEffect} from "react";
import type {ReactNode} from "react";
import {API_URL} from "../config";

interface Notification {
  _id: string;
  recipient: string;
  type: "task_status_change" | "task_assigned" | "team_added" | "note_added";
  message: string;
  relatedTask?: {
    _id: string;
    title: string;
  };
  relatedTeam?: {
    _id: string;
    name: string;
  };
  triggeredBy: {
    _id: string;
    name: string;
    email: string;
  };
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAll: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({children}: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data.notifications);
        setUnreadCount(data.unreadCount);
      } else {
        console.error(
          "Failed to fetch notifications:",
          res.status,
          await res.text(),
        );
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: "PATCH",
        credentials: "include",
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === id ? {...notif, isRead: true} : notif,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch(`${API_URL}/api/notifications/read-all`, {
        method: "PATCH",
        credentials: "include",
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((notif) => ({...notif, isRead: true})),
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/notifications/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setNotifications((prev) => prev.filter((notif) => notif._id !== id));
        // Recalculate unread count
        setUnreadCount((prev) => {
          const deletedNotif = notifications.find((n) => n._id === id);
          return deletedNotif && !deletedNotif.isRead
            ? Math.max(0, prev - 1)
            : prev;
        });
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const deleteAll = async () => {
    try {
      const res = await fetch(`${API_URL}/api/notifications/delete-all`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Error deleting all notifications:", err);
    }
  };

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Poll for new notifications every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
