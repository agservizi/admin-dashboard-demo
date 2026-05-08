import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";

import { DashboardShell } from "@/components/dashboard-shell";
import { HomePage } from "@/pages/home-page";
import { LoginPage } from "@/pages/login-page";
import { ResourcesPage } from "@/pages/resources-page";
import { isDemoAuthenticated } from "@/lib/auth";

function ProtectedLayout() {
  if (!isDemoAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <DashboardShell />;
}

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
        handle: { title: "Home" },
      },
      {
        path: "resources",
        element: <ResourcesPage />,
        handle: { title: "Risorse" },
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
