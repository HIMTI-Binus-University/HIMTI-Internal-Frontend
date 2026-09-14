import { describe, expect, it } from "vitest";
import {
  buildRegistrationSettingsPayload,
  type RegistrationSettingsDraft,
} from "@/types/event-registration";

describe("registration settings payload", () => {
  it("converts UI values without sending response-only fields", () => {
    const draft: RegistrationSettingsDraft = {
      isRegistrationOpen: false,
      registrationOpensAt: "",
      registrationClosesAt: "",
      cancellationClosesAt: "",
      capacity: "",
      paymentCurrency: "IDR",
      paymentBankName: "BCA",
      paymentAccountNumber: "123213213123",
      paymentAccountHolder: "Daffa",
      paymentInstructions: "Transfer instructions",
      attendanceEnabled: false,
      attendanceCheckoutEnabled: false,
    };

    expect(buildRegistrationSettingsPayload(draft)).toEqual({
      isRegistrationOpen: false,
      registrationOpensAt: null,
      registrationClosesAt: null,
      cancellationClosesAt: null,
      capacity: null,
      paymentCurrency: "IDR",
      paymentBankName: "BCA",
      paymentAccountNumber: "123213213123",
      paymentAccountHolder: "Daffa",
      paymentInstructions: "Transfer instructions",
      attendanceEnabled: false,
      attendanceCheckoutEnabled: false,
    });
    expect(buildRegistrationSettingsPayload(draft)).not.toHaveProperty(
      "paymentProofMaxBytes",
    );
    expect(buildRegistrationSettingsPayload(draft)).not.toHaveProperty(
      "paymentProofTypes",
    );
  });
});
