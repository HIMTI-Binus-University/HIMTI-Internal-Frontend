import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ResourceMarkdown } from "./resource-markdown";

describe("ResourceMarkdown", () => {
  it("renders formatting, lists, inline code, and line breaks", () => {
    const { container } = render(
      <ResourceMarkdown>{`**Contact Person**
First line
Second line

- Alya
- \`alya-putri\``}</ResourceMarkdown>,
    );

    expect(screen.getByText("Contact Person").tagName).toBe("STRONG");
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getByText("alya-putri").tagName).toBe("CODE");
    expect(container.querySelector("br")).toBeInTheDocument();
  });

  it("opens safe links externally", () => {
    render(
      <ResourceMarkdown>
        {"[Open WhatsApp](https://wa.me/628123456789)"}
      </ResourceMarkdown>,
    );

    expect(screen.getByRole("link", { name: "Open WhatsApp" })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
  });

  it("does not make unsafe links clickable or render raw HTML", () => {
    const { container } = render(
      <ResourceMarkdown>
        {'[Unsafe](javascript:alert(1))\n\n<script>alert("xss")</script>'}
      </ResourceMarkdown>,
    );

    expect(
      screen.queryByRole("link", { name: "Unsafe" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Unsafe")).toBeInTheDocument();
    expect(container.querySelector("script")).not.toBeInTheDocument();
  });

  it("keeps plain text readable without duplicating line breaks", () => {
    const { container } = render(
      <ResourceMarkdown>{`Contact Alya for membership help.
Second line.

3. Third
4. Fourth`}</ResourceMarkdown>,
    );
    expect(container.querySelector("p")).toHaveTextContent(
      "Contact Alya for membership help. Second line.",
    );
    expect(container.querySelectorAll("br")).toHaveLength(1);
    expect(container.querySelector("p")).not.toHaveClass("whitespace-pre-wrap");
    expect(container.querySelector("ol")).toHaveAttribute("start", "3");
  });
});
