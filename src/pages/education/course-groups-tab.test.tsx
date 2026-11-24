import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import CourseGroupsTab from "./course-groups-tab";

vi.mock("@/api/education/queries", () => ({
  useGetCourseGroups: () => ({
    data: [
      { id: "a", name: "Calculus", code: "MATH1" },
      { id: "b", name: "Data Structures", code: "CS1", counts: { summaries: 0, schedules: 4, videos: 7 } },
    ],
  }),
  useCreateCourseGroup: () => ({}),
  useUpdateCourseGroup: () => ({}),
}));

it("selects course details and edits the requested row without changing selection", () => {
  render(<MemoryRouter><CourseGroupsTab /></MemoryRouter>);
  const table = within(screen.getByRole("table", { name: "Course groups" }));
  expect(table.getAllByRole("columnheader")).toHaveLength(3);

  fireEvent.click(table.getByRole("button", { name: "Data Structures" }));
  expect(screen.getByRole("heading", { name: "Data Structures" })).toBeInTheDocument();
  const resources = within(screen.getByRole("region", { name: "Associated Resources" }));
  for (const count of ["0", "4", "7"]) expect(resources.getByText(count)).toBeInTheDocument();
  expect(resources.getByRole("link", { name: /View Videos/ }))
    .toHaveAttribute("href", "/education?tab=videos&courseId=b");
  expect(resources.getByRole("link", { name: /View Schedules/ }))
    .toHaveAttribute("href", "/education?tab=schedules&schedule=all&course=Data%20Structures");

  fireEvent.click(table.getByRole("button", { name: "Edit Calculus" }));
  expect(screen.getByRole("dialog", { name: "Edit course" })).toBeInTheDocument();
  expect(screen.getByLabelText("Course name")).toHaveValue("Calculus");
});
