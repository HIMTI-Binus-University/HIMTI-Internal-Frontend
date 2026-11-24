import { isAxiosError } from "axios";
import { FileText } from "lucide-react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { useGetCourseGroups, useGetResponsi } from "@/api/education/queries";
import { Container, PageLayout } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import type { ResponsiSummary } from "@/types/education";
import ResponsiWorkspace from "./responsi-workspace";

export default function SummaryEditorPage() {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const isNew = id === "new";
  const { data: courses = [], isLoading: coursesLoading } = useGetCourseGroups();
  const detail = useGetResponsi(isNew ? undefined : id);
  const course = params.get("course");
  const listUrl = course
    ? `/education?tab=summaries&course=${encodeURIComponent(course)}`
    : "/education?tab=summaries";
  const summary: ResponsiSummary | undefined = isNew
    ? {
        id: "draft-new",
        title: "Untitled summary",
        summaryType: params.get("type") === "Study Club" ? "Study Club" : "Responsi",
        course: course || courses[0]?.name || "",
        academicPeriod: "2026/2027",
        examType: "Mid Exam",
        pic: "Unassigned",
        status: "DRAFT",
        lastUpdated: new Date().toISOString(),
      }
    : detail.data;
  const loading = isNew ? coursesLoading : detail.isLoading;
  const notFound = isAxiosError(detail.error) && detail.error.response?.status === 404;
  const courseOptions = [...new Set([
    ...courses.map((group) => group.name),
    ...(summary?.course ? [summary.course] : []),
  ])].sort();
  const periodOptions = [...new Set([
    "2026/2027", "2025/2026", "2024/2025", "2023/2024",
    ...(summary ? [summary.academicPeriod] : []),
  ])];

  return (
    <PageLayout
      icon={FileText}
      title={isNew ? "Create summary" : "Summary editor"}
      breadcrumbs={["Education", "Summaries", isNew ? "Create" : "Editor"]}
      fullHeight
    >
      {loading ? (
        <Container><p role="status" className="p-6">Loading summary editor...</p></Container>
      ) : summary ? (
        <ResponsiWorkspace
          key={summary.id}
          summary={summary}
          initialContent={detail.data?.content}
          initialPreview={!isNew && params.get("preview") === "1"}
          courseOptions={courseOptions}
          periodOptions={periodOptions}
          onClose={() => navigate(listUrl, { replace: true })}
          onSaved={(saved) => {
            if (isNew) {
              const search = course ? `?course=${encodeURIComponent(course)}` : "";
              navigate(`/education/summaries/${encodeURIComponent(saved.id)}${search}`, { replace: true });
            }
          }}
        />
      ) : (
        <Container className="space-y-4 p-6">
          <p role="alert">{notFound ? "Summary not found." : "Could not load the summary."}</p>
          {!notFound && (
            <Button variant="outline" onClick={() => void detail.refetch()}>Retry</Button>
          )}
          <Button asChild variant="outline"><Link to={listUrl}>Back to summaries</Link></Button>
        </Container>
      )}
    </PageLayout>
  );
}
