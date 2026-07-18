import { render, screen } from "@testing-library/react";
import { Copy } from "lucide-react";
import { describe, expect, it } from "vitest";

import { IconButton } from "./icon-button";

describe("IconButton", () => {
  it("provides an accessible label and predictable default dimensions", () => {
    render(
      <IconButton label="Copy link">
        <Copy />
      </IconButton>,
    );

    const button = screen.getByRole("button", { name: "Copy link" });
    expect(button).toHaveAttribute("title", "Copy link");
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("h-9", "w-9", "rounded-lg");
  });

  it("applies semantic danger styling without changing its accessible name", () => {
    render(
      <IconButton label="Delete role" tone="danger">
        <Copy />
      </IconButton>,
    );

    expect(screen.getByRole("button", { name: "Delete role" })).toHaveClass(
      "text-danger",
    );
  });
});
