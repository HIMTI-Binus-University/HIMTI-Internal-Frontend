import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { Switch } from "./switch";

const ControlledSwitch = () => {
  const [checked, setChecked] = useState(false);
  return <Switch aria-label="Payment required" checked={checked} onCheckedChange={setChecked} />;
};

describe("Switch", () => {
  it("uses accessible state and the primary blue checked style", () => {
    render(<ControlledSwitch />);
    const control = screen.getByRole("switch", { name: "Payment required" });
    const thumb = control.querySelector("span");

    expect(control).toHaveAttribute("aria-checked", "false");
    expect(control).toHaveClass("h-6", "w-11", "data-[state=checked]:bg-brand-primary-2");
    expect(thumb).toHaveClass("h-5", "w-5", "data-[state=checked]:translate-x-5");

    fireEvent.click(control);
    expect(control).toHaveAttribute("aria-checked", "true");
  });
});
