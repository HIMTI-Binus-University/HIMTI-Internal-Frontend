import { DEFAULT_TEXT_SETTINGS } from "../constants";
import type { NameEntry, TextSettings } from "../types";

export const SESSION_VERSION = 1;
/** Saved sessions contain participant names, so they are not kept for long. */
export const SESSION_TTL_MS = 3 * 24 * 60 * 60 * 1000;

export interface SessionSnapshot {
  version: number;
  savedAt: number;
  currentStep: 1 | 2 | 3;
  names: NameEntry[];
  textSettings: TextSettings;
  /** The image itself lives in IndexedDB; this is what is needed to rebuild it. */
  template: { name: string; type: string; width: number; height: number } | null;
  /** Names of custom fonts whose files are stored alongside. */
  fonts: string[];
}

interface SnapshotInput {
  currentStep: 1 | 2 | 3;
  names: NameEntry[];
  textSettings: TextSettings;
  template: { file: { name: string; type: string }; width: number; height: number } | null;
  fonts: string[];
}

export const buildSnapshot = (input: SnapshotInput, now: number): SessionSnapshot => ({
  version: SESSION_VERSION,
  savedAt: now,
  currentStep: input.currentStep,
  names: input.names,
  textSettings: input.textSettings,
  template: input.template
    ? {
        name: input.template.file.name,
        type: input.template.file.type,
        width: input.template.width,
        height: input.template.height,
      }
    : null,
  fonts: input.fonts,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Builds a value shaped exactly like `defaults`: keys it does not know (for
 * example settings removed in a later version) are dropped, missing or
 * wrong-typed values fall back to the default.
 */
const coerceLike = <T>(defaults: T, saved: unknown): T => {
  if (isRecord(defaults)) {
    const source = isRecord(saved) ? saved : {};
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(defaults)) {
      result[key] = coerceLike((defaults as Record<string, unknown>)[key], source[key]);
    }
    return result as T;
  }

  if (typeof saved === typeof defaults) {
    if (typeof saved === "number" && !Number.isFinite(saved)) return defaults;
    return saved as T;
  }

  return defaults;
};

export const coerceSettings = (saved: unknown): TextSettings =>
  coerceLike(DEFAULT_TEXT_SETTINGS, saved);

const coerceNames = (saved: unknown): NameEntry[] => {
  if (!Array.isArray(saved)) return [];

  return saved.flatMap((entry, index) =>
    isRecord(entry) && typeof entry.name === "string" && entry.name.trim() !== ""
      ? [
          {
            id: typeof entry.id === "string" ? entry.id : `restored-${index}`,
            name: entry.name,
            order: index + 1,
          },
        ]
      : [],
  );
};

/** Returns the snapshot, or null when the data is missing, broken, from another version or expired. */
export const parseSnapshot = (raw: string | null, now: number): SessionSnapshot | null => {
  if (!raw) return null;

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!isRecord(data) || data.version !== SESSION_VERSION) return null;
  if (typeof data.savedAt !== "number" || now - data.savedAt > SESSION_TTL_MS) return null;
  if (data.savedAt > now + 60_000) return null; // clock moved backwards: do not trust it

  const names = coerceNames(data.names);
  const template =
    isRecord(data.template) &&
    typeof data.template.name === "string" &&
    typeof data.template.type === "string" &&
    typeof data.template.width === "number" &&
    typeof data.template.height === "number"
      ? {
          name: data.template.name,
          type: data.template.type,
          width: data.template.width,
          height: data.template.height,
        }
      : null;

  const step = data.currentStep === 2 || data.currentStep === 3 ? data.currentStep : 1;

  return {
    version: SESSION_VERSION,
    savedAt: data.savedAt,
    // Later steps are only valid when their data is there.
    currentStep: names.length > 0 && template ? step : 1,
    names,
    textSettings: coerceSettings(data.textSettings),
    template,
    fonts: Array.isArray(data.fonts)
      ? data.fonts.filter((font): font is string => typeof font === "string")
      : [],
  };
};

/** "3 days", "2 days", "about 5 hours" ... until the saved data is deleted. */
export const formatRemaining = (savedAt: number, now: number): string => {
  const remaining = Math.max(0, savedAt + SESSION_TTL_MS - now);
  const hours = Math.ceil(remaining / (60 * 60 * 1000));

  if (hours <= 1) return "less than an hour";
  if (hours < 24) return `about ${hours} hours`;

  const days = Math.ceil(hours / 24);
  return `${days} ${days === 1 ? "day" : "days"}`;
};
