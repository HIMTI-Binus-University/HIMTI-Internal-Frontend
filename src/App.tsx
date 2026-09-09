import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { publicRoutes, linkRoutes } from "./config/routes";
import { ProtectedRoute } from "@/components/Utils/ProtectedRoute";
import { routeMode } from "@/config/runtime";
import { NotificationProvider } from "@/components/notification";

const isLinkSubdomain = routeMode.isLinkHost(window.location.hostname);
const activeRoutes = isLinkSubdomain ? linkRoutes : publicRoutes;

const router = createBrowserRouter(
  activeRoutes.map((route) => {
    const Component = route.component;
    const element = route.isProtected ? (
      <ProtectedRoute
        requiredPermission={route.requiredPermission}
        allowedRoles={route.allowedRoles}
      >
        <Component />
      </ProtectedRoute>
    ) : (
      <Component />
    );
    return {
      path: route.path,
      element,
      children: route.children?.map((childRoute) => {
        const ChildComponent = childRoute.component;
        return {
          path: childRoute.path,
          element: childRoute.isProtected ? (
            <ProtectedRoute>
              <ChildComponent />
            </ProtectedRoute>
          ) : (
            <ChildComponent />
          ),
        };
      }),
    };
  }),
);

function App() {
  return (
    <NotificationProvider>
      <RouterProvider router={router} />
    </NotificationProvider>
  );
}

export default App;
