import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import EducationPage from ".";

vi.mock("@/components/Utils", async (original) => ({
  ...(await original<object>()),
  PageLayout: ({ children }: { children: React.ReactNode }) => (
    <main>{children}</main>
  ),
}));

const mockCreate = vi.fn().mockResolvedValue({
  id: "new-course",
  name: "New Course",
  code: "NC-101",
  status: "ACTIVE",
});
const mockCreateResponsi = vi.fn().mockResolvedValue({
  id: "created-responsi",
  title: "New Responsi",
  course: "Algorithm & Programming",
  academicPeriod: "2026/2027",
  examType: "Mid Exam",
  pic: "Joshua",
  status: "DRAFT",
  lastUpdated: new Date().toISOString(),
});
const mockUpdateResponsi = vi.fn().mockResolvedValue({
  id: "dynamic-programming",
  title: "Dynamic Programming",
  course: "Algorithm & Programming",
  academicPeriod: "2026/2027",
  examType: "Mid Exam",
  pic: "Joshua",
  status: "UNDER_REVIEW",
  lastUpdated: new Date().toISOString(),
});
const mockUpdate = vi.fn().mockResolvedValue({
  id: "algorithm-programming",
  name: "Algorithm & Programming Updated",
  code: "CS-101",
  status: "ACTIVE",
});

vi.mock("@/api/education/queries", () => ({
  useGetCourseGroups: () => ({
    data: [
      {
        id: "algorithm-programming",
        name: "Algorithm & Programming",
        code: "CS-101",
        status: "ACTIVE",
      },
      { id: "calculus", name: "Calculus", code: "MA-101", status: "ACTIVE" },
      {
        id: "database-systems",
        name: "Database Systems",
        code: "CS-204",
        status: "ACTIVE",
      },
    ],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useCreateCourseGroup: () => ({
    mutateAsync: mockCreate,
    isPending: false,
  }),
  useUpdateCourseGroup: () => ({
    mutateAsync: mockUpdate,
    isPending: false,
  }),
  useGetResponsies: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useGetResponsi: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
  }),
  useGetResponsiVersions: () => ({
    data: [],
    isLoading: false,
    isError: false,
  }),
  useCreateResponsi: () => ({
    mutateAsync: mockCreateResponsi,
    isPending: false,
  }),
  useUpdateResponsi: () => ({
    mutateAsync: mockUpdateResponsi,
    isPending: false,
  }),
  useDeleteResponsi: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ success: true }),
    isPending: false,
  }),
}));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/education"]}>
      <EducationPage />
    </MemoryRouter>,
  );

describe("EducationPage", () => {
  it("opens on the Responsi tab with its summary table", () => {
    renderPage();

    expect(screen.getByRole("tab", { name: "Responsi" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("Dynamic Programming")).toBeInTheDocument();
    expect(screen.getAllByText("Published").length).toBeGreaterThan(0);
    expect(screen.getByText(/Showing 1-6 of \d+ results/)).toBeInTheDocument();
  });

  it("filters summaries by search", () => {
    renderPage();

    fireEvent.change(screen.getByLabelText("Search Responsi"), {
      target: { value: "Database Normalization" },
    });

    expect(screen.queryByText("Dynamic Programming")).not.toBeInTheDocument();
    expect(
      screen.getAllByText("Database Normalization").length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("Showing 1-4 of 4 results")).toBeInTheDocument();
  });

  it("opens the Responsi workspace from a row and returns to the table", () => {
    renderPage();

    fireEvent.click(
      screen.getByRole("button", { name: "Dynamic Programming" }),
    );

    expect(
      screen.getByRole("heading", { name: "Document" }),
    ).toBeInTheDocument();
    expect(
      (screen.getByLabelText("Responsi content") as HTMLTextAreaElement).value,
    ).toContain("Dynamic Programming");

    fireEvent.click(
      screen.getByRole("button", { name: "Back to Responsi list" }),
    );

    expect(screen.getByText(/Showing 1-6 of \d+ results/)).toBeInTheDocument();
  });

  it("filters and selects a Course Group with its brief summary", () => {
    renderPage();

    fireEvent.click(screen.getByRole("tab", { name: "Course Groups" }));
    expect(
      screen.getByRole("heading", { name: "Course Groups" }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Search courses"), {
      target: { value: "Calculus" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Calculus/ }));

    expect(
      screen.getByRole("heading", { name: "Calculus" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Brief Summary" })).toBeInTheDocument();
  });

  it("switches tabs and keeps the shell tab state", () => {
    renderPage();

    fireEvent.click(screen.getByRole("tab", { name: "Study Clubs" }));

    expect(screen.getByRole("tab", { name: "Study Clubs" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByText("Maintain Study Club schedules and sessions."),
    ).toBeInTheDocument();
  });

  it("preselects course when opened with course query param", () => {
    render(
      <MemoryRouter initialEntries={["/education?tab=responsi&course=Calculus"]}>
        <EducationPage />
      </MemoryRouter>,
    );

    expect(
      screen.getAllByText("Limits and Continuity").length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText("Dynamic Programming")).not.toBeInTheDocument();
  });

  it("opens a new draft with preselected course on create action", () => {
    render(
      <MemoryRouter
        initialEntries={[
          "/education?tab=responsi&course=Calculus&action=create",
        ]}
      >
        <EducationPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Document" }),
    ).toBeInTheDocument();
    expect(
      (screen.getByLabelText("Responsi content") as HTMLTextAreaElement).value,
    ).toContain("Calculus");
  });

  it("calls create course mutation when submitting add course form", async () => {
    renderPage();

    fireEvent.click(screen.getByRole("tab", { name: "Course Groups" }));
    fireEvent.click(screen.getByRole("button", { name: "Add course" }));

    fireEvent.change(screen.getByLabelText("Course name"), {
      target: { value: "Linear Algebra" },
    });
    fireEvent.change(screen.getByLabelText("Course code"), {
      target: { value: "MA-201" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Add course" }));

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Linear Algebra",
        code: "MA-201",
      }),
    );
  });

  it("calls update course mutation when editing a course", async () => {
    renderPage();

    fireEvent.click(screen.getByRole("tab", { name: "Course Groups" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit course" }));

    fireEvent.change(screen.getByLabelText("Course name"), {
      target: { value: "Algorithm & Programming Advanced" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "algorithm-programming",
        name: "Algorithm & Programming Advanced",
        code: "CS-101",
      }),
    );
  });
  it("saves responsi draft in workspace via mutation", async () => {
    renderPage();

    fireEvent.click(
      screen.getByRole("button", { name: "Dynamic Programming" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));

    expect(mockUpdateResponsi).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "dynamic-programming",
        title: "Dynamic Programming",
      }),
    );
  });
});
