import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { Checkbox } from "./checkbox";

const ControlledCheckbox = () => {
  const [checked, setChecked] = useState(false);
  return (
    <Checkbox
      aria-label="Assign permission"
      checked={checked}
      onCheckedChange={(value) => setChecked(value === true)}
    />
  );
};

describe("Checkbox", () => {
  it("uses accessible state and the primary checked style", () => {
    render(<ControlledCheckbox />);
    const checkbox = screen.getByRole("checkbox", { name: "Assign permission" });

    expect(checkbox).not.toBeChecked();
    expect(checkbox).toHaveClass(
      "data-[state=checked]:border-primary",
      "data-[state=checked]:bg-primary",
    );

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });
});
