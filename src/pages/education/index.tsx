import { BookOpen, CalendarDays, CirclePlay, FileText } from "lucide-react";
import { useRef } from "react";
import type { KeyboardEvent } from "react";
import type { LucideIcon } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { Container, PageLayout } from "@/components/Utils";
import type { EducationTabId } from "@/types/education";
import CourseGroupsTab from "./course-groups-tab";
import ResponsiTab from "./responsi-tab";

type EducationTab = {
  id: EducationTabId;
  label: string;
  icon: LucideIcon;
  description: string;
};

const EDUCATION_TABS: EducationTab[] = [
  {
    id: "responsi",
    label: "Responsi",
    icon: FileText,
    description: "Create, edit, and manage Responsi summaries.",
  },
  {
    id: "study-clubs",
    label: "Study Clubs",
    icon: CalendarDays,
    description: "Maintain Study Club schedules and sessions.",
  },
  {
    id: "videos",
    label: "Videos",
    icon: CirclePlay,
    description: "Publish Responsi recordings and connect them to summaries.",
  },
  {
    id: "course-groups",
    label: "Course Groups",
    icon: BookOpen,
    description:
      "Organize courses and connect their Responsi, Study Clubs, and videos.",
  },
];

const DEFAULT_TAB = EDUCATION_TABS[0];

const PlaceholderTab = ({ tab }: { tab: EducationTab }) => {
  const Icon = tab.icon;

  return (
    <Container className="flex h-full min-h-[320px] flex-col items-center justify-center px-6 py-10 text-center lg:min-h-0">
      <span className="flex size-12 items-center justify-center rounded-xl bg-semantic-info-background text-primary">
        <Icon aria-hidden="true" className="size-6" />
      </span>
      <h2 className="mt-4 text-lg font-semibold leading-7 tracking-tight text-foreground">
        {tab.label}
      </h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        {tab.description}
      </p>
    </Container>
  );
};

const EducationPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const requestedTab = searchParams.get("tab");
  const activeTab =
    EDUCATION_TABS.find((tab) => tab.id === requestedTab) ?? DEFAULT_TAB;

  const selectTab = (tab: EducationTab) => {
    if (tab.id === DEFAULT_TAB.id) {
      setSearchParams({}, { replace: true });
      return;
    }

    setSearchParams({ tab: tab.id }, { replace: true });
  };

  const moveTabFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = EDUCATION_TABS.findIndex(
      (tab) => tab.id === activeTab.id,
    );
    const lastIndex = EDUCATION_TABS.length - 1;
    const nextIndex =
      event.key === "ArrowRight"
        ? (currentIndex + 1) % EDUCATION_TABS.length
        : event.key === "ArrowLeft"
          ? (currentIndex - 1 + EDUCATION_TABS.length) % EDUCATION_TABS.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? lastIndex
              : null;

    if (nextIndex === null) return;

    event.preventDefault();
    const nextTab = EDUCATION_TABS[nextIndex];
    selectTab(nextTab);
    tabRefs.current[nextTab.id]?.focus();
  };

  return (
    <PageLayout
      icon={BookOpen}
      title="Education"
      breadcrumbs={["Education", activeTab.label]}
      fullHeight
    >
      <div className="flex flex-col gap-4 lg:min-h-0 lg:flex-1 lg:gap-5">
        <section aria-labelledby="education-heading">
          <h2
            id="education-heading"
            className="text-ds-h2 font-bold tracking-tight text-foreground"
          >
            Education
          </h2>
          <p className="mt-1 text-base text-muted-foreground">
            Manage Responsi content, Study Clubs, videos, and course groups.
          </p>
        </section>

        <div
          role="tablist"
          aria-label="Education sections"
          onKeyDown={moveTabFocus}
          className="grid grid-cols-2 gap-0 rounded-xl border border-border bg-card p-1 lg:grid-cols-4"
        >
          {EDUCATION_TABS.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab.id;
            const previousIsActive = EDUCATION_TABS[index - 1]?.id === activeTab.id;

            return (
              <button
                key={tab.id}
                ref={(element) => {
                  tabRefs.current[tab.id] = element;
                }}
                type="button"
                role="tab"
                id={`education-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`education-panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => selectTab(tab)}
                className={`flex min-h-12 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
                  isActive
                    ? "bg-semantic-info-background font-semibold text-primary"
                    : "text-foreground hover:bg-muted/60"
                } ${
                  index > 0 && !isActive && !previousIsActive
                    ? "lg:border-l lg:border-border"
                    : ""
                }`}
              >
                <Icon
                  aria-hidden="true"
                  className="size-[18px] shrink-0 stroke-[1.75]"
                />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`education-panel-${activeTab.id}`}
          aria-labelledby={`education-tab-${activeTab.id}`}
          className="flex min-h-0 flex-1 flex-col"
        >
          {activeTab.id === "responsi" ? (
            <ResponsiTab />
          ) : activeTab.id === "course-groups" ? (
            <CourseGroupsTab />
          ) : (
            <PlaceholderTab tab={activeTab} />
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default EducationPage;
