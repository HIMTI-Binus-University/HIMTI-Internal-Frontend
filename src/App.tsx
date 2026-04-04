import { BrowserRouter, Route, Routes } from "react-router-dom";
import { publicRoutes, linkRoutes } from "./config/routes";
import { ProtectedRoute } from "@/components/Utils/ProtectedRoute";
import { routeMode } from "@/config/runtime";

const isLinkSubdomain = routeMode.isLinkHost(window.location.hostname);
const activeRoutes = isLinkSubdomain ? linkRoutes : publicRoutes;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {activeRoutes.map((route) => {
          // Determine if we should wrap this component
          const Component = route.component;
          const element = route.isProtected ? (
            <ProtectedRoute requiredPermission={route.requiredPermission}>
              <Component />
            </ProtectedRoute>
          ) : (
            <Component />
          );

          if (route.children && route.children.length > 0) {
            return (
              <Route path={route.path} element={element} key={route.key}>
                {route.children.map((childRoute) => {
                  const ChildComponent = childRoute.component;
                  // Handle protection for children as well
                  const childElement = childRoute.isProtected ? (
                    <ProtectedRoute>
                      <ChildComponent />
                    </ProtectedRoute>
                  ) : (
                    <ChildComponent />
                  );

                  return (
                    <Route
                      path={childRoute.path}
                      element={childElement}
                      key={childRoute.key}
                    />
                  );
                })}
              </Route>
            );
          }

          return <Route path={route.path} element={element} key={route.key} />;
        })}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
