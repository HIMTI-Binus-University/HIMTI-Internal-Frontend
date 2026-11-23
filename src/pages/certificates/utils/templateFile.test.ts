import { describe, expect, it } from "vitest";

import { MAX_TEMPLATE_BYTES, formatFileSize, validateTemplateFile } from "./templateFile";

describe("validateTemplateFile", () => {
  it("accepts PNG and JPEG within the size limit", () => {
    expect(validateTemplateFile({ type: "image/png", size: 1000 })).toBeNull();
    expect(validateTemplateFile({ type: "image/jpeg", size: MAX_TEMPLATE_BYTES })).toBeNull();
  });

  it("rejects other types", () => {
    expect(validateTemplateFile({ type: "image/gif", size: 10 })).toMatch(/PNG or JPG/);
    expect(validateTemplateFile({ type: "application/pdf", size: 10 })).not.toBeNull();
  });

  it("rejects files over 15 MB", () => {
    expect(
      validateTemplateFile({ type: "image/png", size: MAX_TEMPLATE_BYTES + 1 }),
    ).toMatch(/15 MB/);
  });
});

describe("formatFileSize", () => {
  it("formats bytes into readable units", () => {
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(5 * 1024 * 1024)).toBe("5 MB");
  });
});
