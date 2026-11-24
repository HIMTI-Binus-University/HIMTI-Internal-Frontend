import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import EducationPage from ".";
import SummaryEditorPage from "./summary-editor-page";
const mockResponsiQueries = vi.hoisted(() => vi.fn());

vi.mock("@/api/study-clubs/queries", () => ({
  useGetStudyClubs: () => ({
    data: {
      data: [],
      pagination: { page: 1, limit: 6, total: 0, totalPages: 1 },
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useCreateStudyClub: () => ({ mutateAsync: vi.fn() }),
  useUpdateStudyClub: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock("@/components/Utils/PageLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
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
  useGetResponsies: (params: unknown) => {
    mockResponsiQueries(params);
    return {
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
  },
  useGetResponsi: (id?: string) => ({
    data: id === "dynamic-programming"
      ? { ...mockUpdateResponsiSnapshot, content: "## Dynamic Programming\n\nStored Markdown" }
      : id === "created-responsi"
        ? { ...mockCreatedResponsiSnapshot, content: "## Draft" }
        : undefined,
    error: id === "missing" ? { isAxiosError: true, response: { status: 404 } } : null,
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

const mockUpdateResponsiSnapshot = {
  id: "dynamic-programming",
  title: "Dynamic Programming",
  course: "Algorithm & Programming",
  academicPeriod: "2026/2027",
  examType: "Mid Exam",
  pic: "Joshua",
  status: "DRAFT",
};
const mockCreatedResponsiSnapshot = {
  ...mockUpdateResponsiSnapshot,
  id: "created-responsi",
  title: "New Responsi",
  summaryType: "Study Club",
};

const TestRoutes = () => {
  const location = useLocation();
  return (
    <>
      <output aria-label="Current URL">{location.pathname}{location.search}</output>
      <Routes>
        <Route path="/education" element={<EducationPage />} />
        <Route path="/education/summaries/:id" element={<SummaryEditorPage />} />
      </Routes>
    </>
  );
};

const renderPage = (url = "/education") =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <TestRoutes />
    </MemoryRouter>,
  );

const selectEducationOption = async (label: string, option: string) => {
  const trigger = screen.getByRole("combobox", { name: label });
  fireEvent.click(trigger);
  const item = await screen.findByRole("option", { name: option });
  fireEvent.mouseMove(item);
  fireEvent.click(item);
  await waitFor(() =>
    expect(trigger).toHaveAttribute("aria-expanded", "false"),
  );
};

describe("EducationPage", () => {
  it("opens on the Summaries tab with its summary table", () => {
    renderPage();

    expect(screen.getByRole("tab", { name: "Summaries" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("Dynamic Programming")).toBeInTheDocument();
    expect(screen.getAllByText("Published").length).toBeGreaterThan(0);
    expect(screen.getByText(/Showing 1-6 of \d+ results/)).toBeInTheDocument();
  });

  it("filters summaries by search", () => {
    renderPage();

    fireEvent.change(screen.getByLabelText("Search summaries"), {
      target: { value: "Database Normalization" },
    });

    expect(screen.queryByText("Dynamic Programming")).not.toBeInTheDocument();
    expect(
      screen.getAllByText("Database Normalization").length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("Showing 1-4 of 4 results")).toBeInTheDocument();
  });

  it("filters summary type before pagination and resets all filters with the icon button", async () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Page 2" }));
    await selectEducationOption("Filter by summary type", "Study Club");
    expect(mockResponsiQueries).toHaveBeenLastCalledWith(
      expect.objectContaining({ summaryType: "Study Club", page: 1 }),
    );
    expect(
      screen.getByText("No summaries match these filters."),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Search summaries"), {
      target: { value: "nothing matches" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Reset filters" }));
    expect(screen.getByLabelText("Search summaries")).toHaveValue("");
    expect(
      screen.getByRole("combobox", { name: "Filter by summary type" }),
    ).toHaveTextContent("All Types");
    expect(mockResponsiQueries).toHaveBeenLastCalledWith(
      expect.objectContaining({ summaryType: undefined, page: 1 }),
    );
    expect(screen.getByText("Dynamic Programming")).toBeInTheDocument();
  });

  it("preselects the filtered type for new summaries and sends type on create and edit", async () => {
    renderPage();
    await selectEducationOption("Filter by summary type", "Study Club");
    fireEvent.click(screen.getByRole("link", { name: "Create summary" }));
    expect(
      screen.getByRole("combobox", { name: "Summary type" }),
    ).toHaveTextContent("Study Club");
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));
    await waitFor(() =>
      expect(mockCreateResponsi).toHaveBeenLastCalledWith(
        expect.objectContaining({ summaryType: "Study Club" }),
      ),
    );
    expect(screen.getByLabelText("Current URL")).toHaveTextContent("/education/summaries/created-responsi");
    await selectEducationOption("Summary type", "Responsi");
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));
    await waitFor(() =>
      expect(mockUpdateResponsi).toHaveBeenLastCalledWith(
        expect.objectContaining({
          id: "created-responsi",
          summaryType: "Responsi",
        }),
      ),
    );
  });

  it("opens the Responsi workspace from a row and returns to the table", async () => {
    renderPage();

    fireEvent.click(
      screen.getByRole("link", { name: "Dynamic Programming" }),
    );

    expect(
      screen.getByRole("heading", { name: "Document" }),
    ).toBeInTheDocument();
    expect(await screen.findByRole("textbox", { name: "Summary content" }))
      .toHaveTextContent("Dynamic Programming");
    expect(screen.getByLabelText("Current URL")).toHaveTextContent("/education/summaries/dynamic-programming");

    fireEvent.click(
      screen.getByRole("button", { name: "Back to summaries list" }),
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
    fireEvent.click(screen.getByRole("button", { name: "Calculus" }));

    expect(
      screen.getByRole("heading", { name: "Calculus" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Brief Summary" }),
    ).toBeInTheDocument();
  });

  it("switches tabs and keeps the shell tab state", () => {
    renderPage();

    fireEvent.click(screen.getByRole("tab", { name: "Schedules" }));

    expect(screen.getByRole("tab", { name: "Schedules" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByText("Manage Study Club and Responsi schedules."),
    ).toBeInTheDocument();
  });

  it.each([
    ["summaries", "Summaries"],
    ["schedules", "Schedules"],
    ["responsi", "Summaries"],
    ["study-clubs", "Schedules"],
  ])("opens %s links on the %s tab", (tab, label) => {
    render(
      <MemoryRouter initialEntries={[`/education?tab=${tab}`]}>
        <EducationPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole("tab", { name: label })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("heading", { name: label })).toBeInTheDocument();
  });

  it("preselects course when opened with course query param", () => {
    render(
      <MemoryRouter
        initialEntries={["/education?tab=responsi&course=Calculus"]}
      >
        <EducationPage />
      </MemoryRouter>,
    );

    expect(screen.getAllByText("Limits and Continuity").length).toBeGreaterThan(
      0,
    );
    expect(screen.queryByText("Dynamic Programming")).not.toBeInTheDocument();
  });

  it("opens a new draft with preselected course on create action", async () => {
    renderPage("/education?tab=responsi&course=Calculus&action=create");

    expect(
      screen.getByRole("heading", { name: "Document" }),
    ).toBeInTheDocument();
    expect(await screen.findByRole("textbox", { name: "Summary content" }))
      .toHaveTextContent("Calculus");
  });

  it("loads stored Markdown and metadata directly from the summary URL", async () => {
    renderPage("/education/summaries/dynamic-programming");
    expect(await screen.findByRole("textbox", { name: "Summary content" })).toHaveTextContent("Stored Markdown");
    expect(screen.getByLabelText("Title")).toHaveValue("Dynamic Programming");
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  });

  it("does not open an editable fallback for a missing summary", () => {
    renderPage("/education/summaries/missing");
    expect(screen.getByRole("alert")).toHaveTextContent("Summary not found.");
    expect(screen.queryByRole("button", { name: "Save draft" })).not.toBeInTheDocument();
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
    fireEvent.click(
      screen.getByRole("button", { name: "Edit Algorithm & Programming" }),
    );

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
      screen.getByRole("link", { name: "Dynamic Programming" }),
    );
    const editor = await screen.findByRole("textbox", { name: "Summary content" });
    fireEvent.paste(editor, { clipboardData: {
      getData: (type: string) => type === "text/html" ? "<p><strong>Verified Markdown</strong></p>" : "",
    } });
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));

    expect(mockUpdateResponsi).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "dynamic-programming",
        title: "Dynamic Programming",
        content: expect.stringContaining("**Verified Markdown**"),
      }),
    );
  });
});
