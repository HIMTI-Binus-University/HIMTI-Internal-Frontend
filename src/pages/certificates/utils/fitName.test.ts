import { describe, expect, it } from "vitest";

import {
  countLines,
  fitName,
  getBoxWidth,
  summarizeFits,
  type FitSettings,
  type MeasureText,
} from "./fitName";

// Every character is half the font size wide, so widths are easy to reason about.
const measure: MeasureText = (text, size) => text.length * size * 0.5;

const settings = (overrides: Partial<FitSettings> = {}): FitSettings => ({
  fontSize: 40,
  minFontSize: 20,
  maxLines: 1,
  uppercase: false,
  autoFit: true,
  abbreviate: { firstName: false, middleName: false, lastName: false },
  ...overrides,
});

describe("countLines", () => {
  it("wraps by words and counts the lines", () => {
    // "aaa bbb" is 7 chars * 10 = 70 wide; the box is 40, so it wraps in two.
    expect(countLines("aaa bbb", 20, 40, measure)).toBe(2);
  });

  it("treats a word wider than the box as never fitting", () => {
    expect(countLines("abcdefghij", 20, 40, measure)).toBe(Infinity);
  });
});

describe("fitName", () => {
  it("keeps a short name at the configured size", () => {
    const result = fitName("Ada", settings(), 200, measure);

    expect(result).toMatchObject({ text: "Ada", fontSize: 40, status: "full" });
  });

  it("shrinks to the largest size that fits when auto fit is on", () => {
    // 10 chars: width = 10 * size * 0.5; box 150 -> largest size is 30.
    const result = fitName("Ada Wong 1", settings(), 150, measure);

    expect(result.fontSize).toBe(30);
    expect(result.status).toBe("smaller");
  });

  it("reports the minimum size when it only fits at the minimum", () => {
    // 10 chars at size 20 = 100 wide, box 100.
    const result = fitName("Ada Wong 1", settings(), 100, measure);

    expect(result.fontSize).toBe(20);
    expect(result.status).toBe("atMinimum");
  });

  it("does not shrink when auto fit is off", () => {
    const result = fitName(
      "Ada Wong 1",
      settings({ autoFit: false }),
      150,
      measure,
    );

    expect(result.status).toBe("overflow");
    expect(result.fontSize).toBe(40);
  });

  it("abbreviates only after shrinking cannot make the name fit", () => {
    // Full name: 17 chars, never fits in 80 at size 20 (needs 170).
    // "Ada B. Wong" is 11 chars = 110 at size 20, still too wide; with the
    // middle name only abbreviated it gets shorter than the original.
    const result = fitName(
      "Ada Beatrice Wong",
      settings({ abbreviate: { firstName: false, middleName: true, lastName: false } }),
      120,
      measure,
    );

    expect(result.text).toBe("Ada B. Wong");
    expect(result.status).toBe("abbreviated");
  });

  it("flags a name that fits nowhere and draws it at the minimum size", () => {
    const result = fitName("Averyveryverylongsingleword", settings(), 60, measure);

    expect(result.status).toBe("overflow");
    expect(result.fontSize).toBe(20);
  });

  it("honours max lines", () => {
    // Two words, 3 chars each: one line needs 7 * size * 0.5; box 60 at size 40
    // does not fit on one line but fits on two.
    const oneLine = fitName("aaa bbb", settings({ fontSize: 40, autoFit: false }), 60, measure);
    const twoLines = fitName(
      "aaa bbb",
      settings({ fontSize: 40, autoFit: false, maxLines: 2 }),
      60,
      measure,
    );

    expect(oneLine.status).toBe("overflow");
    expect(twoLines.status).toBe("full");
    expect(twoLines.lines).toBe(2);
  });

  it("applies uppercase before measuring", () => {
    const result = fitName("ada", settings({ uppercase: true }), 200, measure);

    expect(result.text).toBe("ADA");
  });

  it("never abbreviates a single-word name", () => {
    const result = fitName(
      "Cher",
      settings({ abbreviate: { firstName: true, middleName: false, lastName: true } }),
      10,
      measure,
    );

    expect(result.text).toBe("Cher");
    expect(result.status).toBe("overflow");
  });
});

describe("summarizeFits", () => {
  it("counts each status", () => {
    const base = { text: "x", fontSize: 1, lines: 1 };

    expect(
      summarizeFits([
        { ...base, status: "full" },
        { ...base, status: "full" },
        { ...base, status: "overflow" },
        { ...base, status: "atMinimum" },
      ]),
    ).toEqual({
      total: 4,
      full: 2,
      smaller: 0,
      atMinimum: 1,
      abbreviated: 0,
      overflow: 1,
    });
  });
});

describe("getBoxWidth", () => {
  it("converts the percent width to template pixels with a floor", () => {
    expect(getBoxWidth({ width: 30 }, 1600)).toBe(480);
    expect(getBoxWidth({ width: 0 }, 1600)).toBe(40);
  });
});
