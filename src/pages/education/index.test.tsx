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
    expect(screen.getByText("Showing 1-6 of 24 results")).toBeInTheDocument();
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
});
