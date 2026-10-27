export type EducationTabId =
  "responsi" | "study-clubs" | "videos" | "course-groups";

export type ResponsiStatus =
  "DRAFT" | "UNDER_REVIEW" | "PUBLISHED" | "ARCHIVED";

export type ResponsiExamType = "Mid Exam" | "Final Exam";

export interface ResponsiSummary {
  id: string;
  title: string;
  course: string;
  academicPeriod: string;
  examType: ResponsiExamType;
  pic: string;
  status: ResponsiStatus;
  lastUpdated: string;
}
