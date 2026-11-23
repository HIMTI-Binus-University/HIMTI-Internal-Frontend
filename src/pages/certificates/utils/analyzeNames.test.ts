import { describe, expect, it } from "vitest";

import { analyzeNames } from "./analyzeNames";

describe("analyzeNames", () => {
  it("trims names and keeps their order", () => {
    const result = analyzeNames(["  Ada Wong ", "Jill Valentine"]);

    expect(result.names).toEqual(["Ada Wong", "Jill Valentine"]);
    expect(result.longest).toBe("Jill Valentine");
  });

  it("counts empty rows and case-insensitive duplicates", () => {
    const result = analyzeNames(["Ada", "", "   ", "ada", "Bob"]);

    expect(result.names).toEqual(["Ada", "Bob"]);
    expect(result.emptyRows).toBe(2);
    expect(result.duplicates).toBe(1);
  });

  it("skips names over the length limit", () => {
    const result = analyzeNames(["x".repeat(11), "ok"], 400, 10);

    expect(result.names).toEqual(["ok"]);
    expect(result.tooLong).toBe(1);
  });

  it("reports names dropped by the batch limit instead of hiding them", () => {
    const result = analyzeNames(["a", "b", "c", "d"], 2);

    expect(result.names).toEqual(["a", "b"]);
    expect(result.overLimit).toBe(2);
  });
});
