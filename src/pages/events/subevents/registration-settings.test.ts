import { describe, expect, it } from "vitest";
import { registrationSettingsPayload } from "./registration-settings";

describe("registrationSettingsPayload", () => {
  it("builds internal free one-seat registration settings", () => {
    const form = new FormData();
    form.set("registrationMode", "INTERNAL");
    form.set("approvalMode", "MANUAL_REVIEW");
    form.set("isRegistrationOpen", "on");
    form.set("maxParticipants", "30");
    expect(registrationSettingsPayload(form, "OPEN")).toMatchObject({
      registrationMode: "INTERNAL",
      approvalMode: "MANUAL_REVIEW",
      isRegistrationOpen: true,
      maxParticipants: 30,
      destinationUrl: null,
    });
  });

  it("rejects opening native registration unless the subevent is OPEN", () => {
    const form = new FormData();
    form.set("registrationMode", "INTERNAL");
    form.set("approvalMode", "AUTO_APPROVE");
    form.set("isRegistrationOpen", "on");
    expect(() => registrationSettingsPayload(form, "DRAFT")).toThrow("OPEN");
  });

  it("requires a safe external destination", () => {
    const form = new FormData();
    form.set("registrationMode", "EXTERNAL");
    form.set("approvalMode", "AUTO_APPROVE");
    form.set("destinationUrl", "javascript:alert(1)");
    expect(() => registrationSettingsPayload(form, "OPEN")).toThrow("HTTP(S)");
  });
});
