import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {Index} from "./pages/Index";
import {Register} from "./pages/Register";
import {Login} from "./pages/Login";
import {ResetPassword} from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Teams from "./pages/Teams";
import Projects from "./pages/Projects";
import ProjectTasks from "./pages/ProjectTasks";
import Settings from "./pages/Settings";
import RootLayout from "./components/RootLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import {TaskProvider} from "./context/TaskContext";
import {TeamProvider} from "./context/TeamContext";
import {ProjectProvider} from "./context/ProjectContext";
import {ThemeProvider} from "./context/ThemeContext";
import {NotificationProvider} from "./context/NotificationContext";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/reset-password/:token",
    element: <ResetPassword />,
  },
  {
    element: (
      <ProtectedRoute>
        <NotificationProvider>
          <TaskProvider>
            <TeamProvider>
              <ProjectProvider>
                <RootLayout />
              </ProjectProvider>
            </TeamProvider>
          </TaskProvider>
        </NotificationProvider>
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "teams",
        element: <Teams />,
      },
      {
        path: "projects",
        element: <Projects />,
      },
      {
        path: "projects/:projectId/tasks",
        element: <ProjectTasks />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
]);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
