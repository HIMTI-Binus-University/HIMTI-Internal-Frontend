import { describe, expect, it } from "vitest";

import { computeFitWidth } from "./fitCanvas";

const base = { aspectRatio: 0.7, templateWidth: 1600 };

describe("computeFitWidth", () => {
  it("fits the available width when the height is unconstrained", () => {
    expect(
      computeFitWidth({ ...base, availableWidth: 500, availableHeight: Infinity }),
    ).toBe(500);
  });

  it("never exceeds the template's own width", () => {
    expect(
      computeFitWidth({ ...base, availableWidth: 5000, availableHeight: Infinity }),
    ).toBe(1600);
  });

  it("shrinks to fit a moderate height limit", () => {
    // Height 280 at ratio 0.7 means a 400 px wide canvas fits exactly.
    expect(computeFitWidth({ ...base, availableWidth: 500, availableHeight: 280 })).toBe(400);
  });

  it("keeps at least 70% of the width fit when the height is very tight", () => {
    // Height 100 would give a 142 px canvas; the floor is 0.7 * 500 = 350.
    expect(computeFitWidth({ ...base, availableWidth: 500, availableHeight: 100 })).toBe(350);
  });
});
