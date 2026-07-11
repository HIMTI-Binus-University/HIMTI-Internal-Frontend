import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import PaymentPage from ".";

vi.mock("@/components/Utils/Sidebar", () => ({
  default: () => <div data-testid="sidebar" />,
}));

const renderPaymentPage = (
  initialEntry = "/events/evt-techno-2026/subevents/sub-techno-jakarta/payment",
) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/events/:eventId/subevents/:subeventId/payment" element={<PaymentPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe("PaymentPage", () => {
  afterEach(cleanup);

  it("prefills sub-event payment details and shows the reconciliation total", () => {
    renderPaymentPage();

    expect(screen.getByLabelText("Payment required")).toBeChecked();
    expect(screen.getByLabelText("Base price")).toHaveValue(25000);
    expect(screen.getByLabelText("Bank reconciliation modifier")).toHaveValue(1);
    expect(screen.getByText(/Rp\s?25\.001/)).toBeInTheDocument();
  });

  it("updates the transfer total from the modifier and saves locally", () => {
    renderPaymentPage();

    fireEvent.change(screen.getByLabelText("Bank reconciliation modifier"), { target: { value: "2" } });
    expect(screen.getByText(/Rp\s?25\.002/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Save payment settings" }));
    expect(screen.getByRole("status")).toHaveTextContent("Payment settings saved locally");
  });

  it("keeps payment details disabled until a free sub-event requires payment", () => {
    renderPaymentPage("/events/evt-hackathon-2026/subevents/sub-hackathon-final/payment");

    expect(screen.getByLabelText("Payment required")).not.toBeChecked();
    expect(screen.getByLabelText("Account holder name")).toBeDisabled();

    fireEvent.click(screen.getByLabelText("Payment required"));
    expect(screen.getByLabelText("Account holder name")).toBeEnabled();
  });
});
