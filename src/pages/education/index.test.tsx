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

  it("filters and selects a Course Group with its Responsi resources", () => {
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
    expect(screen.getByText("Limits and Continuity")).toBeInTheDocument();
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
});
