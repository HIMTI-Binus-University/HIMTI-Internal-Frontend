import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Container from "./Container";

describe("Container", () => {
  it("uses the standard bordered panel treatment and default padding", () => {
    render(<Container>Panel content</Container>);

    expect(screen.getByText("Panel content")).toHaveClass(
      "rounded-xl",
      "border",
      "border-border",
      "bg-card",
      "p-5",
    );
    expect(screen.getByText("Panel content")).not.toHaveClass("shadow");
  });

  it("supports controlled compact and unpadded variants", () => {
    const { rerender } = render(
      <Container padding="compact">Compact panel</Container>,
    );

    expect(screen.getByText("Compact panel")).toHaveClass("p-4");

    rerender(<Container padding="none">Unpadded panel</Container>);
    expect(screen.getByText("Unpadded panel")).toHaveClass("p-0");
  });
});
