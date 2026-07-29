import { describe, expect, it } from "vitest";
import { needsRegistrationCompletion } from "@/utils/registration-access";

describe("needsRegistrationCompletion", () => {
  it("requires completed registration for every user", () => {
    expect(
      needsRegistrationCompletion({
        institutionType: "NON_BINUS",
        outlookEmailVerified: false,
        registrationCompleted: false,
      }),
    ).toBe(true);
  });

  it("requires Outlook verification for BINUS users", () => {
    expect(
      needsRegistrationCompletion({
        institutionType: "BINUS",
        outlookEmailVerified: false,
        registrationCompleted: true,
      }),
    ).toBe(true);
  });

  it("does not require Outlook verification for non-BINUS users", () => {
    expect(
      needsRegistrationCompletion({
        institutionType: "NON_BINUS",
        outlookEmailVerified: false,
        registrationCompleted: true,
      }),
    ).toBe(false);
  });

  it("allows completed and verified BINUS users", () => {
    expect(
      needsRegistrationCompletion({
        institutionType: "BINUS",
        outlookEmailVerified: true,
        registrationCompleted: true,
      }),
    ).toBe(false);
  });
});
