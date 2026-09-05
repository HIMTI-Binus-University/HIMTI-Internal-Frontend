import { describe, expect, it } from "vitest";
import {
  buildPackagePayload,
  buildRegistrationFormPayload,
  emptyPackageDraft,
  validatePackageDraft,
  validateRegistrationFormDraft,
} from "./event-registration";

describe("event registration payload helpers", () => {
  it("builds an IDR whole-order package payload", () => {
    expect(
      buildPackagePayload({
        ...emptyPackageDraft(),
        name: " Team of four ",
        description: " Group pass ",
        seatCount: "4",
        priceIdr: "180000",
      }),
    ).toMatchObject({
      name: "Team of four",
      description: "Group pass",
      seatCount: 4,
      priceMinor: "180000",
      currency: "IDR",
    });
  });

  it("rejects invalid package ranges", () => {
    expect(
      validatePackageDraft({
        ...emptyPackageDraft(),
        name: "Pass",
        salesStartAt: "2026-09-06T10:00",
        salesEndAt: "2026-09-05T10:00",
      }),
    ).toContain("after");
  });

  it("rejects duplicate form field keys", () => {
    expect(
      validateRegistrationFormDraft({
        name: "Registration",
        sections: [
          {
            title: "Details",
            questions: ["One", "Two"].map((label) => ({
              label,
              fieldKey: "same_key",
              type: "TEXT" as const,
              isRequired: true,
              options: [],
              validation: {},
            })),
          },
        ],
      }),
    ).toContain("unique");
  });

  it("preserves section, question, and option order in form payloads", () => {
    const payload = buildRegistrationFormPayload({
      name: " Registration ",
      description: "",
      sections: [
        {
          title: " Choices ",
          description: "",
          questions: [
            {
              fieldKey: " track ",
              label: " Track ",
              type: "SELECT",
              isRequired: true,
              validation: {},
              options: [
                { label: " Web ", value: "web" },
                { label: " Mobile ", value: "mobile" },
              ],
            },
          ],
        },
      ],
    });
    expect(payload.name).toBe("Registration");
    expect(
      payload.sections[0].questions[0].options?.map(({ value }) => value),
    ).toEqual(["web", "mobile"]);
  });
});
