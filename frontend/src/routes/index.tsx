import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";
import { HomePage } from "../pages/HomePage";
import { ProjectPage } from "../pages/ProjectPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "project/:id",
        element: <ProjectPage />,
      },
    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
