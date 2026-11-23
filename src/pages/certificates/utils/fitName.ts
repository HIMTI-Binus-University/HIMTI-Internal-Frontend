import type { TextSettings } from "../types";
import { abbreviateName } from "./nameFormat";

/**
 * Decides how a participant name is drawn so the preview, the stats and the
 * exported files always agree.
 *
 * Order of attempts: draw the name as is; if it does not fit and `autoFit` is
 * on, shrink it down to `minFontSize`; if it still does not fit and any
 * abbreviation option is on, repeat with the abbreviated name. If nothing
 * fits the name is flagged `overflow` and drawn at the smallest allowed size
 * so someone can review it.
 */
export type FitStatus =
  | "full"
  | "smaller"
  | "atMinimum"
  | "abbreviated"
  | "overflow";

export type FitSettings = Pick<
  TextSettings,
  "fontSize" | "minFontSize" | "maxLines" | "uppercase" | "autoFit" | "abbreviate"
>;

/** Width in template pixels of `text` drawn at `fontSize`. */
export type MeasureText = (text: string, fontSize: number) => number;

export interface FitResult {
  text: string;
  fontSize: number;
  lines: number;
  status: FitStatus;
}

export interface FitSummary {
  total: number;
  full: number;
  smaller: number;
  atMinimum: number;
  abbreviated: number;
  overflow: number;
}

/**
 * Greedy word wrap, like the canvas textbox does. A single word wider than
 * the box cannot be wrapped (words are not split), so it never fits.
 */
export const countLines = (
  text: string,
  fontSize: number,
  boxWidth: number,
  measure: MeasureText,
): number => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 1;

  let lines = 1;
  let current = "";

  for (const word of words) {
    if (measure(word, fontSize) > boxWidth) return Number.POSITIVE_INFINITY;

    const candidate = current ? `${current} ${word}` : word;
    if (measure(candidate, fontSize) <= boxWidth) {
      current = candidate;
    } else {
      lines += 1;
      current = word;
    }
  }

  return lines;
};

const hasAbbreviation = (abbreviate: FitSettings["abbreviate"]) =>
  abbreviate.firstName || abbreviate.middleName || abbreviate.lastName;

export const fitName = (
  name: string,
  settings: FitSettings,
  boxWidth: number,
  measure: MeasureText,
): FitResult => {
  const base = settings.uppercase ? name.toUpperCase() : name;
  const maxLines = Math.max(1, Math.floor(settings.maxLines) || 1);
  const baseSize = settings.fontSize;
  const minSize = Math.min(Math.max(1, settings.minFontSize), baseSize);

  const fits = (text: string, size: number) =>
    countLines(text, size, boxWidth, measure) <= maxLines;

  // Largest integer size in [minSize, baseSize] that fits, or null. Fit is
  // monotonic in size, so a binary search is enough.
  const largestFittingSize = (text: string): number | null => {
    if (fits(text, baseSize)) return baseSize;
    if (!fits(text, minSize)) return null;

    let low = minSize; // fits
    let high = baseSize; // does not fit
    while (high - low > 1) {
      const mid = Math.floor((low + high) / 2);
      if (fits(text, mid)) low = mid;
      else high = mid;
    }
    return low;
  };

  const candidates: Array<{ text: string; abbreviated: boolean }> = [
    { text: base, abbreviated: false },
  ];

  if (hasAbbreviation(settings.abbreviate)) {
    const short = abbreviateName(base, settings.abbreviate);
    if (short !== base) candidates.push({ text: short, abbreviated: true });
  }

  for (const candidate of candidates) {
    const size = settings.autoFit
      ? largestFittingSize(candidate.text)
      : fits(candidate.text, baseSize)
        ? baseSize
        : null;

    if (size === null) continue;

    const status: FitStatus = candidate.abbreviated
      ? "abbreviated"
      : size >= baseSize
        ? "full"
        : size <= minSize
          ? "atMinimum"
          : "smaller";

    return {
      text: candidate.text,
      fontSize: size,
      lines: countLines(candidate.text, size, boxWidth, measure),
      status,
    };
  }

  const last = candidates[candidates.length - 1];
  const size = settings.autoFit ? minSize : baseSize;

  return {
    text: last.text,
    fontSize: size,
    lines: countLines(last.text, size, boxWidth, measure),
    status: "overflow",
  };
};

export const summarizeFits = (results: FitResult[]): FitSummary => {
  const summary: FitSummary = {
    total: results.length,
    full: 0,
    smaller: 0,
    atMinimum: 0,
    abbreviated: 0,
    overflow: 0,
  };

  for (const result of results) summary[result.status] += 1;

  return summary;
};

/** Width of the name box in template pixels (the same rule the canvas uses). */
export const getBoxWidth = (settings: Pick<TextSettings, "width">, templateWidth: number) =>
  Math.max(40, (settings.width / 100) * templateWidth);

const GENERIC_FAMILIES = new Set(["sans-serif", "serif", "monospace"]);

export const toCssFont = (
  settings: Pick<TextSettings, "fontFamily" | "fontWeight">,
  size: number,
) => {
  const family = GENERIC_FAMILIES.has(settings.fontFamily)
    ? settings.fontFamily
    : `"${settings.fontFamily}"`;
  return `${settings.fontWeight} ${size}px ${family}`;
};

/**
 * Measures text with a 2D canvas context. Letter spacing is added the same
 * way the canvas textbox applies it (`charSpacing` is 1/1000 em, and the app
 * stores `letterSpacing * 10`).
 */
export const createCanvasMeasure = (
  settings: Pick<TextSettings, "fontFamily" | "fontWeight" | "letterSpacing">,
): MeasureText => {
  const context = document.createElement("canvas").getContext("2d");

  return (text, fontSize) => {
    const spacing = (text.length * fontSize * settings.letterSpacing) / 100;
    if (!context) return text.length * fontSize * 0.55 + spacing;

    context.font = toCssFont(settings, fontSize);
    return context.measureText(text).width + spacing;
  };
};

/** Make sure the font is usable before measuring or drawing with it. */
export const ensureFontReady = async (
  settings: Pick<TextSettings, "fontFamily" | "fontWeight">,
) => {
  try {
    await document.fonts.load(toCssFont(settings, 48), "Abc");
  } catch {
    // A missing font falls back to the browser default; measuring still works.
  }
};
