import { useState } from "react";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { FaBars } from "react-icons/fa";
import Sidebar from "./Sidebar";

interface PageLayoutProps {
  icon: IconType;
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}

const PageLayout = ({ icon: Icon, title, actions, children }: PageLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-semantic-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 p-8 font-sans">
        <header className="flex justify-between items-center relative mb-8">
          <div className="flex flex-row gap-4">
            <button
              className="xl:hidden p-2 rounded-lg hover:bg-semantic-muted opacity-30"
              onClick={() => setSidebarOpen(true)}
            >
              <FaBars size={24} />
            </button>

            <div className="flex items-center gap-5 p-2 min-w-0">
              <Icon
                size={48}
                className="text-semantic-foreground/30 max-xl:w-[36px] max-xl:h-[36px]"
              />
              <h2 className="min-w-0 text-h3 max-xl:text-h4 max-xl:font-bold max-lg:text-h5 max-lg:font-bold font-bold text-semantic-foreground/50">
                {title}
              </h2>
            </div>
          </div>

          {actions && <div className="shrink-0">{actions}</div>}
        </header>

        <div className="flex flex-col gap-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default PageLayout;
