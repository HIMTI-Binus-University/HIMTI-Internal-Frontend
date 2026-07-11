import { describe, expect, it } from "vitest";

import { buttonVariants } from "./button-variants";

describe("buttonVariants", () => {
  it("keeps the action hierarchy semantic and centralized", () => {
    expect(buttonVariants({ variant: "primary" })).toContain("bg-primary");
    expect(buttonVariants({ variant: "secondary" })).toContain("border-primary");
    expect(buttonVariants({ variant: "secondary" })).toContain("hover:bg-primary/10");
    expect(buttonVariants({ variant: "edit" })).toContain("border-semantic-warning");
    expect(buttonVariants({ variant: "edit" })).toContain(
      "hover:bg-semantic-warning-background",
    );
    expect(buttonVariants({ variant: "delete" })).toContain("border-semantic-danger");
    expect(buttonVariants({ variant: "delete" })).toContain(
      "hover:bg-semantic-danger-background",
    );
  });
});
