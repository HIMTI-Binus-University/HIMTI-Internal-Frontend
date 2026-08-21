import { describe, expect, it } from "vitest";

import { paymentApiError } from "./payment-utils";

describe("payment workspace errors", () => {
  it("handles an idle query with no error", () => {
    expect(paymentApiError(null)).toBe("The payment operation failed.");
    expect(paymentApiError(undefined)).toBe("The payment operation failed.");
  });

  it("uses ordinary error messages", () => {
    expect(paymentApiError(new Error("Payment failed"))).toBe("Payment failed");
  });
});
