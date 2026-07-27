import { createRef } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { gsap } from "@/lib/motion";
import { Button } from "./button";

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

describe("Button", () => {
  it("preserves forwarded pointer and keyboard handlers", () => {
    const onPointerDown = vi.fn();
    const onKeyDown = vi.fn();
    render(
      <Button onPointerDown={onPointerDown} onKeyDown={onKeyDown}>
        Save
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Save" });
    fireEvent.pointerDown(button);
    fireEvent.keyDown(button, { key: "Enter" });

    expect(onPointerDown).toHaveBeenCalledOnce();
    expect(onKeyDown).toHaveBeenCalledOnce();
  });

  it("does not animate disabled controls", () => {
    const tween = vi.spyOn(gsap, "to");
    render(<Button disabled>Save</Button>);

    fireEvent.pointerDown(screen.getByRole("button", { name: "Save" }));

    expect(tween).not.toHaveBeenCalled();
  });

  it("keeps the slotted child element and forwarded ref", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button asChild ref={ref}>
        <a href="/events">Open events</a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Open events" });
    expect(link).toHaveAttribute("href", "/events");
    expect(ref.current).toBe(link);
  });
});
