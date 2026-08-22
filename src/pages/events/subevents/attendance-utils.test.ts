import { describe, expect, it } from "vitest";
import {
  attendanceState,
  eligibilityCopy,
  normalizeCredential,
  resultCopy,
  ticketStatus,
} from "./attendance-utils";

describe("attendance operator copy", () => {
  it("uses clear ticket states", () => {
    expect(ticketStatus("ACTIVE")).toBe("Ready to check in");
    expect(ticketStatus("USED")).toBe("Already checked in");
    expect(ticketStatus("REVOKED")).toBe("Cannot be used");
  });

  it("prioritizes cancelled records", () => {
    expect(attendanceState({ checkedOutAt: "now", voidedAt: "now" })).toBe("Check-in cancelled");
  });

  it("trims scanner input", () => expect(normalizeCredential("  ticket  ")).toBe("ticket"));

  it("explains blocked eligibility without internal codes", () => {
    expect(
      eligibilityCopy({
        eligible: false,
        reason: "REQUIRED_ATTENDEE_FORM_INCOMPLETE",
      }),
    ).toContain("completes the required information");
  });

  it("distinguishes duplicate and checked-out results", () => {
    expect(
      resultCopy({
        participant: { name: "Daffa" },
        replay: true,
        state: "CHECKED_OUT",
      }),
    ).toContain("has checked out");
    expect(
      resultCopy({
        participant: { name: "Daffa" },
        replay: true,
        state: "CHECKED_IN",
      }),
    ).toContain("No duplicate was added");
  });
});
