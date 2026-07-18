import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { Switch } from "./switch";

const ControlledSwitch = () => {
  const [checked, setChecked] = useState(false);
  return <Switch label="Payment required" checked={checked} onCheckedChange={setChecked} />;
};

describe("Switch", () => {
  it("exposes and updates its accessible checked state", () => {
    render(<ControlledSwitch />);
    const control = screen.getByRole("switch", { name: "Payment required" });
    expect(control).toHaveAttribute("aria-checked", "false");
    fireEvent.click(control);
    expect(control).toHaveAttribute("aria-checked", "true");
  });
});
