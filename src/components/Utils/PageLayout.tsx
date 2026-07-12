import { useState } from "react";
import type { ReactNode } from "react";
import { ArrowLeft, ChevronRight, Menu } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { publicRoutes } from "@/config/routes";

import Sidebar from "./Sidebar";

interface PageLayoutProps {
  icon: LucideIcon;
  title: string;
  breadcrumbs?: string[];
  backTo?: string;
  actions?: ReactNode;
  children: ReactNode;
}

const PageLayout = ({
  icon: _Icon,
  title,
  breadcrumbs: customBreadcrumbs,
  backTo,
  actions,
  children,
}: PageLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const breadcrumbs = customBreadcrumbs ?? getBreadcrumbs(location.pathname, title);
  const parentPath = getBreadcrumbParentPath(location.pathname) ?? backTo;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="min-w-0 flex-1 p-4 font-sans sm:p-6">
        <header className="motion-enter relative mb-6 flex min-h-14 items-center justify-between gap-3 rounded-xl border border-border bg-card/70 px-3 py-2 text-card-foreground sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              aria-label="Go back"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
              disabled={!parentPath}
              onClick={() => parentPath && navigate(parentPath)}
            >
              <ArrowLeft aria-hidden="true" className="h-5 w-5 stroke-[1.75]" />
            </button>

            <button
              type="button"
              aria-label="Open navigation"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu aria-hidden="true" className="h-5 w-5 stroke-[1.75]" />
            </button>

            <nav aria-label="Breadcrumb" className="min-w-0">
              <ol className="flex min-w-0 items-center gap-1 text-sm leading-5">
                {breadcrumbs.map((crumb, index) => {
                  const isCurrent = index === breadcrumbs.length - 1;

                  return (
                    <li key={`${crumb}-${index}`} className="flex min-w-0 items-center gap-1">
                      {index > 0 && (
                        <ChevronRight
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 text-muted-foreground/70 stroke-[1.75]"
                        />
                      )}
                      {isCurrent ? (
                        <h1 className="min-w-0 truncate text-sm font-semibold text-foreground">
                          {crumb}
                        </h1>
                      ) : (
                        <span className="min-w-0 truncate text-muted-foreground">{crumb}</span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>

          {actions && <div className="shrink-0">{actions}</div>}
        </header>

        <div className="motion-enter motion-delay-1 flex flex-col gap-6">{children}</div>
      </main>
    </div>
  );
};

const getBreadcrumbs = (pathname: string, title: string) => {
  const matchedRoute = publicRoutes
    .filter((route) => route.group)
    .sort((a, b) => b.path.length - a.path.length)
    .find(
      (route) => pathname === route.path || pathname.startsWith(`${route.path}/`),
    );

  if (!matchedRoute) return [title];

  const breadcrumbs = [matchedRoute.group, matchedRoute.title].filter(Boolean);
  if (pathname !== matchedRoute.path && title !== matchedRoute.title) {
    breadcrumbs.push(title);
  }

  return breadcrumbs;
};

const getBreadcrumbParentPath = (pathname: string) => {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "events" || parts.length < 2) return;

  if (parts[1] === "new" || parts.length === 2) return "/events";
  if (parts[2] === "edit") return `/events/${parts[1]}`;
  if (parts[2] !== "subevents") return "/events";
  if (parts[3] === "new") return `/events/${parts[1]}`;
  if (["forms", "registrations"].includes(parts[4]) && parts.length > 5) {
    return `/${parts.slice(0, 5).join("/")}`;
  }

  return `/events/${parts[1]}`;
};

export default PageLayout;
