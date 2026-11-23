import { describe, expect, it } from "vitest";

import { DEFAULT_TEXT_SETTINGS } from "../constants";
import {
  SESSION_TTL_MS,
  SESSION_VERSION,
  buildSnapshot,
  coerceSettings,
  formatRemaining,
  parseSnapshot,
} from "./sessionSnapshot";

const NOW = 1_700_000_000_000;

const snapshotJson = (overrides: Record<string, unknown> = {}) =>
  JSON.stringify({
    version: SESSION_VERSION,
    savedAt: NOW - 1000,
    currentStep: 3,
    names: [{ id: "a", name: "Ada Wong", order: 1 }],
    textSettings: DEFAULT_TEXT_SETTINGS,
    template: { name: "t.png", type: "image/png", width: 1600, height: 1131 },
    fonts: [],
    ...overrides,
  });

describe("parseSnapshot", () => {
  it("restores a valid recent snapshot", () => {
    const result = parseSnapshot(snapshotJson(), NOW);

    expect(result?.names).toEqual([{ id: "a", name: "Ada Wong", order: 1 }]);
    expect(result?.currentStep).toBe(3);
    expect(result?.template?.width).toBe(1600);
  });

  it("ignores data older than 3 days", () => {
    expect(parseSnapshot(snapshotJson({ savedAt: NOW - SESSION_TTL_MS - 1 }), NOW)).toBeNull();
    expect(parseSnapshot(snapshotJson({ savedAt: NOW - SESSION_TTL_MS + 1000 }), NOW)).not.toBeNull();
  });

  it("ignores broken, missing or other-version data", () => {
    expect(parseSnapshot(null, NOW)).toBeNull();
    expect(parseSnapshot("not json", NOW)).toBeNull();
    expect(parseSnapshot(snapshotJson({ version: 99 }), NOW)).toBeNull();
  });

  it("falls back to step 1 when the later steps would have no data", () => {
    const result = parseSnapshot(snapshotJson({ template: null }), NOW);

    expect(result?.currentStep).toBe(1);
  });

  it("drops invalid name entries", () => {
    const result = parseSnapshot(
      snapshotJson({ names: [{ name: "  " }, { id: "x", name: "Bob" }, 5] }),
      NOW,
    );

    expect(result?.names.map((entry) => entry.name)).toEqual(["Bob"]);
  });
});

describe("coerceSettings", () => {
  it("drops settings that no longer exist and fills in new ones", () => {
    const result = coerceSettings({ x: 10, height: 20, fontSize: "big" }) as unknown as Record<
      string,
      unknown
    >;

    expect(result.x).toBe(10);
    expect("height" in result).toBe(false);
    expect(result.fontSize).toBe(DEFAULT_TEXT_SETTINGS.fontSize); // wrong type -> default
    expect(result.autoFit).toBe(true); // missing -> default
  });

  it("restores nested settings and keeps the defaults for missing parts", () => {
    const result = coerceSettings({ shadow: { enabled: true } });

    expect(result.shadow).toEqual({ ...DEFAULT_TEXT_SETTINGS.shadow, enabled: true });
  });
});

describe("buildSnapshot", () => {
  it("keeps only what is needed to rebuild the template", () => {
    const snapshot = buildSnapshot(
      {
        currentStep: 2,
        names: [],
        textSettings: DEFAULT_TEXT_SETTINGS,
        template: { file: { name: "t.png", type: "image/png" }, width: 10, height: 5 },
        fonts: ["Brush"],
      },
      NOW,
    );

    expect(snapshot.template).toEqual({ name: "t.png", type: "image/png", width: 10, height: 5 });
    expect(snapshot.fonts).toEqual(["Brush"]);
    expect(snapshot.savedAt).toBe(NOW);
  });
});

describe("formatRemaining", () => {
  const hour = 60 * 60 * 1000;

  it("says how long is left in plain words", () => {
    expect(formatRemaining(NOW, NOW)).toBe("3 days");
    expect(formatRemaining(NOW - 2 * 24 * hour, NOW)).toBe("1 day");
    expect(formatRemaining(NOW - 3 * 24 * hour + 5 * hour, NOW)).toBe("about 5 hours");
    expect(formatRemaining(NOW - 3 * 24 * hour + 10 * 60 * 1000, NOW)).toBe("less than an hour");
  });
});
