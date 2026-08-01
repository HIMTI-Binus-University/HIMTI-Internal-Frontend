import type { ClipboardEvent, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";
import { richTextToMarkdown } from "@/utils/rich-text-to-markdown";

type MarkdownTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const MarkdownTextarea = ({
  className,
  onPaste,
  ...props
}: MarkdownTextareaProps) => {
  const paste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    onPaste?.(event);
    if (event.defaultPrevented) return;

    const html = event.clipboardData.getData("text/html");
    if (!html) return;

    const markdown = richTextToMarkdown(html);
    if (!markdown) return;

    event.preventDefault();
    const input = event.currentTarget;
    input.setRangeText(markdown, input.selectionStart, input.selectionEnd, "end");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  };

  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm leading-6 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      onPaste={paste}
    />
  );
};
