import { describe, expect, it } from "vitest";
import { eventSeed } from "@/data/events";
import { applyEventTransition, canSetEventStatus, canSetSubeventStatus, eventOpenBlockers, subeventOpenBlockers } from "./lifecycle";

describe("status visibility lifecycle", () => {
  it("requires a ready open subevent before opening an event", () => {
    const data = structuredClone(eventSeed);
    const event = data.events.find((item) => item.id === "evt-hackathon-2026")!;
    expect(canSetEventStatus(data, event, "OPEN")).toBe(false);
    expect(eventOpenBlockers(data, event)).toHaveLength(1);
  });

  it("requires an open ticket and required forms before opening a subevent", () => {
    const data = structuredClone(eventSeed);
    const subevent = data.subevents.find((item) => item.id === "sub-hack")!;
    expect(subeventOpenBlockers(data, subevent)).not.toHaveLength(0);
    expect(canSetSubeventStatus(data, subevent, "OPEN")).toBe(false);
  });

  it("cascades draft, closed, and archived event statuses to descendants", () => {
    const next = applyEventTransition(structuredClone(eventSeed), "evt-techno-2026", "CLOSED")!;
    expect(next.subevents.filter((item) => item.eventId === "evt-techno-2026").every((item) => item.status === "CLOSED")).toBe(true);
    expect(next.ticketOptions.filter((item) => ["sub-jkt", "sub-smg"].includes(item.subeventId)).every((item) => item.status === "CLOSED")).toBe(true);
  });
});
