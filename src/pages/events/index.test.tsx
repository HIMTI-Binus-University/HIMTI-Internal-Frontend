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
import { EventsProvider, useEventsStore } from "./store";

vi.mock("@/components/Utils", () => ({
  PageLayout: ({ title, children, actions }: { title: string; children: React.ReactNode; actions?: React.ReactNode }) => <main><h1>{title}</h1>{actions}{children}</main>,
  Container: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
}));
const Location = () => { const location = useLocation(); return <output data-testid="location">{location.pathname}{location.search}</output>; };
const renderAt = (path: string, element: React.ReactNode, route: string) => render(<EventsProvider><MemoryRouter initialEntries={[path]}><Routes><Route path={route} element={element} /></Routes><Location /></MemoryRouter></EventsProvider>);
afterEach(cleanup);

describe("updated Events hierarchy", () => {
  it("renders ERD-shaped event summaries and filters to an empty state", () => {
    renderAt("/events", <EventsPage />, "/events");
    expect(screen.getByText("TECHNO 2026: Wondrous Wonderland")).toBeInTheDocument();
    expect(screen.getByText("2 subevents")).toBeInTheDocument();
    expect(screen.getByText("Events (3)")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("Search event name or description"), { target: { value: "nothing matches this" } });
    expect(screen.getByText("Events (0)")).toBeInTheDocument();
    expect(screen.getByText("No events match these filters")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Clear filters" })[0]);
    expect(screen.getByText("Events (3)")).toBeInTheDocument();
  });

  it("uses each compact card as the only workspace action", () => {
    renderAt("/events", <EventsPage />, "/events");
    expect(screen.queryByRole("link", { name: "Open" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Actions for/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "Open HIMTI Hackathon 2026 workspace" }));
    expect(screen.getByTestId("location")).toHaveTextContent("/events/evt-hackathon-2026");
  });

  it("uses a blank gradient when the event has no real cover", () => {
    const { container } = renderAt("/events", <EventsPage />, "/events");
    expect(container.querySelector('img[src="/himti-icon.svg"]')).not.toBeInTheDocument();
  });

  it("keeps create-event navigation inside Events", () => {
    renderAt("/events", <EventsPage />, "/events");
    fireEvent.click(screen.getByRole("link", { name: "Create event" }));
    expect(screen.getByTestId("location")).toHaveTextContent("/events/new");
  });

  it("orders event actions as Edit, Archive, then next status action", () => {
    renderAt("/events/evt-techno-2026", <EventWorkspacePage />, "/events/:eventId");
    expect(screen.getByRole("link", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Archive" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Status" })).not.toBeInTheDocument();
  });

  it("closes an event and hard-cascades published subevents and forms", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const CascadeProbe = () => {
      const { data } = useEventsStore();
      const event = data.events.find((item) => item.id === "evt-techno-2026");
      const kids = data.subevents.filter((item) => item.eventId === "evt-techno-2026");
      const forms = data.forms.filter((item) => ["form-profile", "form-diet"].includes(item.id));
      return <output data-testid="cascade">{JSON.stringify({ event: event?.status, kids: kids.map((item) => item.status), forms: forms.map((item) => item.status) })}</output>;
    };
    render(<EventsProvider><MemoryRouter initialEntries={["/events/evt-techno-2026"]}><Routes><Route path="/events/:eventId" element={<EventWorkspacePage />} /></Routes><CascadeProbe /></MemoryRouter></EventsProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    const cascade = JSON.parse(screen.getByTestId("cascade").textContent!);
    expect(cascade.event).toBe("CLOSED");
    expect(cascade.kids.every((status: string) => status === "CLOSED")).toBe(true);
    expect(cascade.forms.every((status: string) => status === "CLOSED")).toBe(true);
  });

  it("lets a closed event reopen and a draft event publish", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const Probe = () => {
      const { data } = useEventsStore();
      return <output data-testid="event-status">{data.events.find((item) => item.id === "evt-techno-2026")?.status}</output>;
    };
    render(<EventsProvider><MemoryRouter initialEntries={["/events/evt-techno-2026"]}><Routes><Route path="/events/:eventId" element={<EventWorkspacePage />} /></Routes><Probe /></MemoryRouter></EventsProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.getByTestId("event-status")).toHaveTextContent("CLOSED");
    expect(screen.getByRole("button", { name: "Reopen" })).toBeInTheDocument();

    // draft event shows Publish
    cleanup();
    renderAt("/events/evt-hackathon-2026", <EventWorkspacePage />, "/events/:eventId");
    expect(screen.getByRole("button", { name: "Publish" })).toBeInTheDocument();
  });

  it("uses neutral event and subevent headers with explicit status controls", () => {
    const { unmount } = renderAt("/events/evt-techno-2026", <EventWorkspacePage />, "/events/:eventId");
    expect(screen.getByText("Event", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toBeEnabled();
    unmount();

    renderAt("/events/evt-techno-2026/subevents/sub-jkt/overview", <SubeventWorkspacePage />, "/events/:eventId/subevents/:subeventId/:section");
    expect(screen.getByText("Subevent", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Archive" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Close" })).toBeEnabled();
  });

  it("limits subevent card actions to edit and archive", () => {
    renderAt("/events/evt-techno-2026", <EventWorkspacePage />, "/events/:eventId");
    fireEvent.pointerDown(screen.getByRole("button", { name: "Actions for TECHNO Greater Jakarta" }), { button: 0, ctrlKey: false });
    expect(screen.getByRole("menuitem", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Archive" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: /Duplicate|Publish|Close|Cancel|Delete/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
    expect(screen.getByTestId("location")).toHaveTextContent("/events/evt-techno-2026/subevents/sub-jkt/overview?edit=true");
  });

  it("keeps an existing form inside its owning subevent", () => {
    renderAt("/events/evt-techno-2026/subevents/sub-smg/forms/form-profile", <FormEditorPage />, "/events/:eventId/subevents/:subeventId/forms/:formId");
    expect(screen.getByTestId("location")).toHaveTextContent("/events/evt-techno-2026/subevents/sub-smg/forms");
  });

  it.each([
    ["/events/new", "/events/new", "Create new event"],
    ["/events/evt-techno-2026/edit", "/events/:eventId/edit", "Edit event"],
  ])("simplifies the event editor at %s", (path, route, cardHeading) => {
    renderAt(path, <EventEditorPage />, route);
    expect(screen.getAllByText(cardHeading)).not.toHaveLength(0);
    expect(screen.getByText("Cover image")).toBeInTheDocument();
    expect(screen.queryByText("General participant requirements")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Save as draft" })).not.toBeInTheDocument();
  });

  it("moves through the contained subevent setup flow without losing draft fields", () => {
    renderAt("/events/evt-techno-2026/subevents/new/details", <SubeventSetupPage />, "/events/:eventId/subevents/new/:step");
    expect(screen.getByRole("heading", { name: "New Subevent", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Subevent setup progress" }).children).toHaveLength(4);
    expect(screen.getByTestId("subevent-setup-actions")).toHaveClass("w-full");
    fireEvent.change(screen.getByPlaceholderText("e.g. TECHNO Greater Jakarta"), { target: { value: "TECHNO Bandung" } });
    const progress = screen.getByRole("list", { name: "Subevent setup progress" });
    expect(progress.children[2].firstChild).toHaveClass("bg-muted");
    fireEvent.click(screen.getByRole("button", { name: /Continue/ }));
    expect(screen.getByTestId("location")).toHaveTextContent("/events/evt-techno-2026/subevents/new/registration");
    expect(screen.getByText("Registration rules")).toBeInTheDocument();
    expect(progress.children[0].firstChild).toHaveClass("bg-semantic-success");
    expect(progress.children[2].firstChild).toHaveClass("bg-muted");
    fireEvent.click(screen.getByRole("link", { name: /Previous/ }));
    expect(screen.getByDisplayValue("TECHNO Bandung")).toBeInTheDocument();
  });

  it("removes forms from setup and redirects the obsolete step", () => {
    renderAt("/events/evt-techno-2026/subevents/new/forms", <SubeventSetupPage />, "/events/:eventId/subevents/new/:step");
    expect(screen.getByTestId("location")).toHaveTextContent("/events/evt-techno-2026/subevents/new/details");
    expect(screen.queryByText("Forms assigned to this subevent")).not.toBeInTheDocument();
    expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
  });

  it("shows description guidance and omits payment upload constraints", () => {
    const { unmount } = renderAt("/events/evt-techno-2026/subevents/new/details", <SubeventSetupPage />, "/events/:eventId/subevents/new/:step");
    expect(screen.getByText("Shown to people before they are accepted.")).toBeInTheDocument();
    expect(screen.getByText("Shown to participants after they are accepted.")).toBeInTheDocument();
    unmount();
    renderAt("/events/evt-techno-2026/subevents/new/payment", <SubeventSetupPage />, "/events/:eventId/subevents/new/:step");
    const paymentSwitch = screen.getByRole("switch", { name: "Payment required" });
    expect(paymentSwitch).toHaveAttribute("aria-checked", "false");
    fireEvent.click(paymentSwitch);
    expect(paymentSwitch).toHaveAttribute("aria-checked", "true");
    expect(screen.queryByText("Accepted file types")).not.toBeInTheDocument();
    expect(screen.queryByText("Maximum file size (MB)")).not.toBeInTheDocument();
  });

  it("combines configuration and preview into one review summary", () => {
    renderAt("/events/evt-techno-2026/subevents/new/review", <SubeventSetupPage />, "/events/:eventId/subevents/new/:step");
    expect(screen.getByText("Review summary")).toBeInTheDocument();
    expect(screen.getByText("Details and descriptions")).toBeInTheDocument();
    expect(screen.getByText("Schedule, location, and limits")).toBeInTheDocument();
    expect(screen.getByText("Registration rules")).toBeInTheDocument();
    expect(screen.getByText("Payment", { selector: "h3" })).toBeInTheDocument();
    expect(screen.queryByText("Participant preview")).not.toBeInTheDocument();
  });

  it("locks published subevent forms and exposes archive instead of delete", () => {
    renderAt("/events/evt-techno-2026/subevents/sub-jkt/forms", <SubeventWorkspacePage />, "/events/:eventId/subevents/:subeventId/:section");
    expect(screen.getByText("Forms created here belong only to this subevent.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create form" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Archive" }).length).toBeGreaterThan(0);
  });

  it("uses a switch and omits payment preview and upload constraints", () => {
    renderAt("/events/evt-techno-2026/subevents/sub-jkt/payment", <SubeventWorkspacePage />, "/events/:eventId/subevents/:subeventId/:section");
    expect(screen.getByRole("switch", { name: "Payment required" })).toHaveAttribute("aria-checked", "true");
    expect(screen.queryByText("Participant preview")).not.toBeInTheDocument();
    expect(screen.queryByText("Accepted MIME types")).not.toBeInTheDocument();
    expect(screen.queryByText("Maximum size (MB)")).not.toBeInTheDocument();
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
