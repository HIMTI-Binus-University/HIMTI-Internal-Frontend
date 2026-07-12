import { describe, expect, it } from "vitest";
import { eventSeed } from "@/data/events";
import {
  applyEventTransition,
  applySubeventTransition,
  canPublishEvent,
  canTransition,
  canArchiveStatus,
  nextStatuses,
  statusActionLabel,
  statusActions,
} from "./lifecycle";

describe("lifecycle transitions", () => {
  it("allows only documented edges", () => {
    expect(canTransition("DRAFT", "PUBLISHED")).toBe(true);
    expect(canTransition("DRAFT", "ARCHIVED")).toBe(true);
    expect(canTransition("PUBLISHED", "CLOSED")).toBe(true);
    expect(canTransition("CLOSED", "PUBLISHED")).toBe(true);
    expect(canTransition("CLOSED", "ARCHIVED")).toBe(true);
    expect(canTransition("ARCHIVED", "DRAFT")).toBe(true);
    expect(canTransition("PUBLISHED", "DRAFT")).toBe(false);
    expect(canTransition("PUBLISHED", "ARCHIVED")).toBe(false);
    expect(canTransition("CLOSED", "DRAFT")).toBe(false);
    expect(canArchiveStatus("PUBLISHED")).toBe(false);
    expect(nextStatuses("PUBLISHED")).toEqual(["CLOSED"]);
    expect(statusActions("DRAFT")).toEqual(["PUBLISHED"]);
    expect(statusActions("CLOSED")).toEqual(["PUBLISHED"]);
    expect(statusActionLabel("CLOSED", "PUBLISHED")).toBe("Reopen");
    expect(statusActionLabel("DRAFT", "PUBLISHED")).toBe("Publish");
  });

  it("closes event and cascades published subevents and forms", () => {
    const next = applyEventTransition(structuredClone(eventSeed), "evt-techno-2026", "CLOSED");
    expect(next?.events.find((item) => item.id === "evt-techno-2026")?.status).toBe("CLOSED");
    expect(next?.subevents.filter((item) => item.eventId === "evt-techno-2026").every((item) => item.status === "CLOSED")).toBe(true);
    expect(next?.forms.find((item) => item.id === "form-profile")?.status).toBe("CLOSED");
  });

  it("auto-closes event when last published subevent closes", () => {
    let data = structuredClone(eventSeed);
    data = applySubeventTransition(data, "sub-jkt", "CLOSED")!;
    expect(data.events.find((item) => item.id === "evt-techno-2026")?.status).toBe("PUBLISHED");
    data = applySubeventTransition(data, "sub-smg", "CLOSED")!;
    expect(data.events.find((item) => item.id === "evt-techno-2026")?.status).toBe("CLOSED");
  });

  it("archives event with all children", () => {
    const closed = applyEventTransition(structuredClone(eventSeed), "evt-techno-2026", "CLOSED")!;
    const archived = applyEventTransition(closed, "evt-techno-2026", "ARCHIVED")!;
    expect(archived.events.find((item) => item.id === "evt-techno-2026")?.status).toBe("ARCHIVED");
    expect(archived.subevents.filter((item) => item.eventId === "evt-techno-2026").every((item) => item.status === "ARCHIVED")).toBe(true);
  });

  it("unarchive does not cascade", () => {
    const closed = applyEventTransition(structuredClone(eventSeed), "evt-techno-2026", "CLOSED")!;
    const archived = applyEventTransition(closed, "evt-techno-2026", "ARCHIVED")!;
    const draft = applyEventTransition(archived, "evt-techno-2026", "DRAFT")!;
    expect(draft.events.find((item) => item.id === "evt-techno-2026")?.status).toBe("DRAFT");
    expect(draft.subevents.find((item) => item.id === "sub-jkt")?.status).toBe("ARCHIVED");
  });

  it("event publish requires selected valid subevents", () => {
    const draftEvent = structuredClone(eventSeed);
    draftEvent.events = draftEvent.events.map((item) =>
      item.id === "evt-hackathon-2026" ? { ...item, status: "DRAFT" as const } : item,
    );
    const forms = {
      assignments: draftEvent.subeventForms,
      versions: draftEvent.formVersions,
      forms: draftEvent.forms,
    };
    expect(
      canPublishEvent(
        draftEvent.events.find((item) => item.id === "evt-hackathon-2026")!,
        [draftEvent.subevents.find((item) => item.id === "sub-hack")!],
        forms,
        { "sub-hack": 1 },
      ),
    ).toBe(true);
    const published = applyEventTransition(draftEvent, "evt-hackathon-2026", "PUBLISHED", ["sub-hack"]);
    expect(published?.events.find((item) => item.id === "evt-hackathon-2026")?.status).toBe("PUBLISHED");
    expect(published?.subevents.find((item) => item.id === "sub-hack")?.status).toBe("PUBLISHED");
  });
});
