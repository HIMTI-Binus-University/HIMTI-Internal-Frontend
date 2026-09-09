import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { OutstandingAnswers } from "./OutstandingAnswers";

vi.mock("@/api/event-registration/queries", () => ({
  useOutstandingAnswers: () => ({
    data: [
      {
        id: "member",
        registrationOrderId: "order",
        user: { name: "Participant", email: "participant@example.com" },
        supplementalRequests: [
          { id: "request", question: { label: "Dietary needs" } },
        ],
      },
    ],
  }),
}));

test("registrations shows who owes required answers and manual contact", () => {
  render(<OutstandingAnswers eventId="event" />);
  expect(
    screen.getByRole("heading", {
      name: "Required additional answers outstanding",
    }),
  ).toBeInTheDocument();
  expect(screen.getByText("Dietary needs")).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "participant@example.com" }),
  ).toHaveAttribute("href", "mailto:participant@example.com");
  expect(screen.getByText(/No notifications are sent/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
});
