import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import EventsPage from ".";
import EventEditorPage from "./editor";
import EventWorkspacePage from "./workspace";
import FormEditorPage from "./subevents/form-editor";
import RegistrationReviewPage from "./subevents/registration-review";
import SubeventSetupPage from "./subevents/setup";
import SubeventWorkspacePage from "./subevents/workspace";
import { EventsProvider } from "./store";

vi.mock("@/components/Utils", () => ({ PageLayout: ({ title, children, actions }: { title: string; children: React.ReactNode; actions?: React.ReactNode }) => <main><h1>{title}</h1>{actions}{children}</main> }));
const Location = () => { const location = useLocation(); return <output data-testid="location">{location.pathname}</output>; };
const renderAt = (path: string, element: React.ReactNode, route: string) => render(<EventsProvider><MemoryRouter initialEntries={[path]}><Routes><Route path={route} element={element} /></Routes><Location /></MemoryRouter></EventsProvider>);
afterEach(cleanup);

describe("updated Events hierarchy", () => {
  it("renders ERD-shaped event summaries and filters to an empty state", () => {
    renderAt("/events", <EventsPage />, "/events");
    expect(screen.getByText("TECHNO 2026: Wondrous Wonderland")).toBeInTheDocument();
    expect(screen.getByText("2 subevents")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("Search event name or description"), { target: { value: "nothing matches this" } });
    expect(screen.getByText("No events match these filters")).toBeInTheDocument();
  });

  it("keeps create-event navigation inside Events", () => {
    renderAt("/events", <EventsPage />, "/events");
    fireEvent.click(screen.getByRole("link", { name: "Create event" }));
    expect(screen.getByTestId("location")).toHaveTextContent("/events/new");
  });

  it("moves through the contained subevent setup flow without losing draft fields", () => {
    renderAt("/events/evt-techno-2026/subevents/new/details", <SubeventSetupPage />, "/events/:eventId/subevents/new/:step");
    fireEvent.change(screen.getByPlaceholderText("e.g. TECHNO Greater Jakarta"), { target: { value: "TECHNO Bandung" } });
    fireEvent.click(screen.getByRole("button", { name: /Continue/ }));
    expect(screen.getByTestId("location")).toHaveTextContent("/events/evt-techno-2026/subevents/new/registration");
    expect(screen.getByText("TECHNO Bandung")).toBeInTheDocument();
    expect(screen.getByText("Registration rules")).toBeInTheDocument();
  });

  it.each([
    ["event editor", "/events/evt-techno-2026/edit", "/events/:eventId/edit", <EventEditorPage />, "Edit event"],
    ["event workspace", "/events/evt-techno-2026", "/events/:eventId", <EventWorkspacePage />, "Event workspace"],
    ["subevent overview", "/events/evt-techno-2026/subevents/sub-jkt/overview", "/events/:eventId/subevents/:subeventId/:section", <SubeventWorkspacePage />, "Subevent workspace"],
    ["form editor", "/events/evt-techno-2026/subevents/sub-jkt/forms/form-profile", "/events/:eventId/subevents/:subeventId/forms/:formId", <FormEditorPage />, "Edit form"],
    ["registration review", "/events/evt-techno-2026/subevents/sub-jkt/registrations/reg-alya", "/events/:eventId/subevents/:subeventId/registrations/:registrationId", <RegistrationReviewPage />, "Registration review"],
  ])("renders the %s route in its event context", (_name, path, route, element, heading) => {
    renderAt(path as string, element as React.ReactNode, route as string);
    expect(screen.getByRole("heading", { name: heading as string, level: 1 })).toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent(path as string);
  });
});
