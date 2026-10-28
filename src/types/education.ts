export type EducationTabId =
  "responsi" | "study-clubs" | "videos" | "course-groups";

export type ResponsiStatus =
  "DRAFT" | "UNDER_REVIEW" | "PUBLISHED" | "ARCHIVED";

export type ResponsiExamType = "Mid Exam" | "Final Exam";

export type CourseGroupStatus = "ACTIVE" | "INACTIVE";

export interface CourseGroup {
  id: string;
  name: string;
  code: string | null;
  status: CourseGroupStatus;
}

export interface CreateCourseGroupPayload {
  name: string;
  code?: string | null;
}

export interface UpdateCourseGroupPayload {
  name?: string;
  code?: string | null;
  status?: CourseGroupStatus;
}

export interface CourseGroupListResponse {
  data: CourseGroup[];
}

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
