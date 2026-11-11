import { useRef, useState } from "react";
import { AppWindow, BookOpen, FolderKanban, Palette, UserCheck } from "lucide-react";
import { PageLayout } from "@/components/Utils";
import { gsap, useGSAP } from "@/lib/motion";
import { AppearanceTab } from "./components/appearance-tab";
import { AttendeesTab } from "./components/attendees-tab";
import { ResourcesTab } from "./components/resources-tab";
import { SoftwareTab } from "./components/software-tab";

type TabType = "resources" | "software" | "attendees" | "appearance";

export default function HimtiKitDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("resources");
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-tab-content]", {
          autoAlpha: 0,
          y: 8,
          duration: 0.35,
          ease: "power2.out",
        });
      });
      return () => mm.revert();
    },
    { dependencies: [activeTab] }
  );

  return (
    <PageLayout
      icon={FolderKanban}
      title="HIMTI KIT Management"
    >
      <div ref={containerRef} className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("resources")}
            className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === "resources"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Learning Materials (Rangkuman)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("software")}
            className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === "software"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            }`}
          >
            <AppWindow className="h-4 w-4" />
            <span>Software Directory</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("attendees")}
            className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === "attendees"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>TECHNO Attendees</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("appearance")}
            className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === "appearance"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            }`}
          >
            <Palette className="h-4 w-4" />
            <span>Website Appearance</span>
          </button>
        </div>

        {/* Tab Content */}
        <div data-tab-content key={activeTab}>
          {activeTab === "resources" && <ResourcesTab />}
          {activeTab === "software" && <SoftwareTab />}
          {activeTab === "attendees" && <AttendeesTab />}
          {activeTab === "appearance" && <AppearanceTab />}
        </div>
      </div>
    </PageLayout>
  );
}
