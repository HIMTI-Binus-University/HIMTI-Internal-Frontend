import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Copy } from "lucide-react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { gsap } from "@/lib/motion";

import { IconButton } from "./icon-button";

beforeEach(() => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("no-preference"),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

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

  it("preserves consumer handlers and skips disabled press motion", () => {
    const onPointerDown = vi.fn();
    const onKeyDown = vi.fn();
    const tween = vi.spyOn(gsap, "to");
    const { rerender } = render(
      <IconButton label="Move resource" onPointerDown={onPointerDown} onKeyDown={onKeyDown}>
        <Copy />
      </IconButton>,
    );

    const button = screen.getByRole("button", { name: "Move resource" });
    fireEvent.pointerDown(button);
    fireEvent.keyDown(button, { key: " " });
    expect(onPointerDown).toHaveBeenCalledOnce();
    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(tween).toHaveBeenCalled();

    tween.mockClear();
    rerender(
      <IconButton label="Move resource" disabled>
        <Copy />
      </IconButton>,
    );
    fireEvent.pointerDown(screen.getByRole("button", { name: "Move resource" }));
    expect(tween).not.toHaveBeenCalled();
  });
});
