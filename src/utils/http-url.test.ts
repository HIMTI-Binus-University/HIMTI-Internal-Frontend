import { describe, expect, it } from "vitest";

import { getSafeHttpUrl, normalizeHttpUrlInput } from "./http-url";

describe("normalizeHttpUrlInput", () => {
  it("defaults schemeless links to HTTPS", () => {
    expect(normalizeHttpUrlInput("youtube.com")).toBe("https://youtube.com/");
    expect(normalizeHttpUrlInput(" chat.whatsapp.com/group ")).toBe(
      "https://chat.whatsapp.com/group",
    );
  });

  it("preserves explicit HTTP and HTTPS links", () => {
    expect(normalizeHttpUrlInput("http://example.com/resource")).toBe(
      "http://example.com/resource",
    );
    expect(normalizeHttpUrlInput("HTTPS://EXAMPLE.COM")).toBe("https://example.com/");
    expect(normalizeHttpUrlInput("https://example.com/member handbook")).toBe(
      "https://example.com/member%20handbook",
    );
  });

  it.each([
    "javascript:alert(1)",
    "data:text/html,test",
    "file:///tmp/member.txt",
    "ftp://example.com",
    "https:/example.com",
    "https//example.com",
    "example .com",
    "example.com@evil.com",
    "http://user:password@example.com",
    "https\\evil.com",
  ])("rejects %s", (value) => {
    expect(() => normalizeHttpUrlInput(value)).toThrow();
  });
});

describe("getSafeHttpUrl", () => {
  it("returns only absolute HTTP(S) response links", () => {
    expect(getSafeHttpUrl("https://example.com/resource")).toBe(
      "https://example.com/resource",
    );
    expect(getSafeHttpUrl("youtube.com")).toBeNull();
    expect(getSafeHttpUrl("javascript:alert(1)")).toBeNull();
    expect(getSafeHttpUrl("https://user:password@example.com")).toBeNull();
    expect(getSafeHttpUrl(null)).toBeNull();
  });
});
