import { useState } from "react";
import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import Sidebar from "./Sidebar";

interface PageLayoutProps {
  icon: LucideIcon;
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}

const PageLayout = ({
  icon: Icon,
  title,
  actions,
  children,
}: PageLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="min-w-0 flex-1 p-4 font-sans sm:p-6">
        <header className="motion-enter relative mb-6 flex min-h-10 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu aria-hidden="true" className="h-5 w-5 stroke-[1.75]" />
            </button>

            <div className="flex min-w-0 items-center gap-3">
              <Icon
                aria-hidden="true"
                size={24}
                strokeWidth={1.75}
                className="shrink-0 text-primary"
              />
              <h1 className="min-w-0 truncate text-2xl font-semibold leading-8 tracking-tight text-foreground">
                {title}
              </h1>
            </div>
          </div>

          {actions && <div className="shrink-0">{actions}</div>}
        </header>

        <div className="motion-enter motion-delay-1 flex flex-col gap-6">{children}</div>
      </main>
    </div>
  );
};

export default PageLayout;
