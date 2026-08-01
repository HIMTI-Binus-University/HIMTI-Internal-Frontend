import { describe, expect, it } from "vitest";

import { richTextToMarkdown } from "@/utils/rich-text-to-markdown";

describe("richTextToMarkdown", () => {
  it("converts common rich text formatting", () => {
    expect(
      richTextToMarkdown(
        '<p>Hello <strong>bold</strong> and <em>italic</em>.</p><ul><li>First</li><li>Second</li></ul>',
      ),
    ).toBe("Hello **bold** and *italic*.\n\n- First\n- Second");
  });

  it("preserves line breaks and safe links", () => {
    expect(
      richTextToMarkdown(
        '<div>First<br>Second</div><p><a href="https://example.com/path">Example</a></p>',
      ),
    ).toBe("First\nSecond\n\n[Example](https://example.com/path)");
  });

  it("drops unsafe link destinations", () => {
    expect(
      richTextToMarkdown('<p><a href="javascript:alert(1)">Unsafe</a></p>'),
    ).toBe("Unsafe");
  });
});
