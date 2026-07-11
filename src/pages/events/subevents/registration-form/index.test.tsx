import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import RegistrationFormPage from ".";

vi.mock("@/components/Utils/Sidebar", () => ({
  default: () => <div data-testid="sidebar" />,
}));

const renderRegistrationFormPage = (
  initialEntry = "/events/evt-techno-2026/subevents/sub-techno-bandung/registration-form",
) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/events/:eventId/subevents/:subeventId/registration-form" element={<RegistrationFormPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe("RegistrationFormPage", () => {
  afterEach(cleanup);

  it("renders the draft form connected to its existing sub-event", () => {
    renderRegistrationFormPage();

    expect(screen.getAllByText("TECHNO 2026 — Bandung")).toHaveLength(2);
    expect(screen.getByDisplayValue("Student ID number")).toBeInTheDocument();
    expect(screen.getByDisplayValue("T-shirt size")).toBeInTheDocument();
    expect(screen.getByText("3 questions in this form")).toBeInTheDocument();
  });

  it("adds a question and saves changes locally", () => {
    renderRegistrationFormPage();

    fireEvent.click(screen.getByRole("button", { name: "Add question" }));
    fireEvent.click(screen.getByRole("button", { name: /Short text/i }));

    expect(screen.getByText("4 questions in this form")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(screen.getByRole("status")).toHaveTextContent("Saved locally");
  });

  it("only shows option management for option-based question types", () => {
    renderRegistrationFormPage();

    expect(screen.getByRole("region", { name: "Question options" })).toBeInTheDocument();
    expect(screen.getAllByRole("region", { name: "Question options" })).toHaveLength(1);
  });

  it("keeps form settings available while a closed form locks question editing", () => {
    renderRegistrationFormPage("/events/evt-company-visit/subevents/sub-company-visit/registration-form");

    expect(screen.getByLabelText("Registration status")).toHaveValue("CLOSED");
    expect(screen.getByRole("button", { name: "Add question" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled();
  });

  it("keeps an open form accessible for managing its registration settings", () => {
    renderRegistrationFormPage("/events/evt-techno-2026/subevents/sub-techno-jakarta/registration-form");

    expect(screen.getByLabelText("Registration status")).toHaveValue("PUBLISHED");
    expect(screen.getByRole("button", { name: "Add question" })).toBeEnabled();
  });

  it("starts an empty draft editor when a sub-event has no form yet", () => {
    renderRegistrationFormPage("/events/evt-hackathon-2026/subevents/sub-hackathon-final/registration-form");

    expect(screen.getByText("0 questions in this form")).toBeInTheDocument();
    expect(screen.getByLabelText("Registration status")).toHaveValue("DRAFT");
    expect(screen.getByRole("button", { name: "Add question" })).toBeEnabled();
  });
});
