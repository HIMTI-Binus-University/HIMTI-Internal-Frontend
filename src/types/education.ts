export type EducationTabId =
  "summaries" | "schedules" | "videos" | "course-groups";

export type ResponsiStatus =
  "DRAFT" | "UNDER_REVIEW" | "PUBLISHED" | "ARCHIVED";

export type ResponsiExamType = "Mid Exam" | "Final Exam";
export type SummaryType = "Responsi" | "Study Club";

export type CourseGroupStatus = "ACTIVE" | "INACTIVE";

export interface CourseGroup {
  id: string;
  name: string;
  code: string | null;
  description?: string | null;
  status: CourseGroupStatus;
}

export interface CreateCourseGroupPayload {
  name: string;
  code?: string | null;
  description?: string | null;
}

export interface UpdateCourseGroupPayload {
  name?: string;
  code?: string | null;
  description?: string | null;
  status?: CourseGroupStatus;
}

export interface CourseGroupListResponse {
  data: CourseGroup[];
}

export interface ResponsiSummary {
  summaryType?: SummaryType;
  id: string;
  title: string;
  course: string;
  courseId?: string;
  academicPeriod: string;
  examType: ResponsiExamType;
  pic: string;
  status: ResponsiStatus;
  lastUpdated: string;
  createdAt?: string;
}

export interface ResponsiDetail extends ResponsiSummary {
  content: string;
  semester?: number | null;
}

export interface ResponsiVersion {
  id: string;
  responsiId: string;
  version: string;
  content: string;
  summary: string | null;
  author: string | null;
  createdAt: string;
}

export interface ResponsiPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ResponsiListResponse {
  data: ResponsiSummary[];
  pagination: ResponsiPagination;
}

export interface ResponsiDetailResponse {
  data: ResponsiDetail;
}

export interface ResponsiVersionsResponse {
  data: ResponsiVersion[];
}

export interface ResponsiQueryParams {
  summaryType?: SummaryType;
  search?: string;
  course?: string;
  academicPeriod?: string;
  examType?: string;
  status?: ResponsiStatus;
  page?: number;
  limit?: number;
}

export interface CreateResponsiPayload {
  summaryType?: SummaryType;
  title: string;
  course: string;
  academicPeriod: string;
  examType: ResponsiExamType;
  pic: string;
  content?: string;
  status?: ResponsiStatus;
}

export interface UpdateResponsiPayload {
  summaryType?: SummaryType;
  title?: string;
  course?: string;
  academicPeriod?: string;
  examType?: ResponsiExamType;
  pic?: string;
  content?: string;
  status?: ResponsiStatus;
}
