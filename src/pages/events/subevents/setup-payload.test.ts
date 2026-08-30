import { describe, expect, it } from "vitest";
import { buildSubeventCreatePayload } from "./setup-payload";

const validForm = () => {
  const form = new FormData();
  form.set("name", "New activity");
  form.set("date", "2026-08-20");
  form.set("time", "10:00");
  form.set("type", "WORKSHOP");
  form.set("visibility", "PUBLIC");
  return form;
};

describe("buildSubeventCreatePayload", () => {
  it("defaults to closed internal registration with the legacy setup limit", () => {
    expect(buildSubeventCreatePayload(validForm(), "event-1")).toMatchObject({
      registrationMode: "INTERNAL",
      approvalMode: "AUTO_APPROVE",
      isRegistrationOpen: false,
      price: 0,
      paid: false,
      maxTicketsPerUser: 1,
    });
  });

  it("uses the paid individual ticket price", () => {
    const form = validForm();
    form.set("pricing", "PAID");
    form.set("individualPrice", "50000");
    expect(buildSubeventCreatePayload(form, "event-1")).toMatchObject({
      paid: true,
      price: 50000,
    });
  });

  it("requires a positive paid individual ticket price", () => {
    const form = validForm();
    form.set("pricing", "PAID");
    form.set("individualPrice", "0");
    expect(() => buildSubeventCreatePayload(form, "event-1")).toThrow(
      "greater than 0",
    );
  });

  it("requires an external destination URL", () => {
    const form = validForm();
    form.set("registrationMode", "EXTERNAL");
    expect(() => buildSubeventCreatePayload(form, "event-1")).toThrow(
      "destination URL",
    );
  });
});
