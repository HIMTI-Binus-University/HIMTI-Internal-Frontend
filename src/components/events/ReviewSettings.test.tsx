import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { ReviewSettings } from "./ReviewSettings";
import type { EventItem } from "@/types/events";

const data = vi.hoisted(() => ({
  settings: {
    isRegistrationOpen: true,
    registrationOpensAt: null as string | null,
    registrationClosesAt: null as string | null,
    paymentProofTypes: [],
    paymentBankName: "",
    paymentAccountNumber: "",
    paymentAccountHolder: "",
  },
  form: { name: "RSVP", status: "PUBLISHED", version: 1 },
  packages: [
    {
      status: "ACTIVE",
      seatCount: 1,
      priceMinor: "0",
      name: "Individual Ticket",
      currency: "IDR",
      salesStartAt: null as string | null,
      salesEndAt: null as string | null,
    },
  ],
  error: false,
}));
vi.mock("@/api/event-registration/queries", () => ({
  useRegistrationSettings: () => ({ data: data.settings, isError: data.error }),
  useRegistrationForm: () => ({ data: data.form }),
  useEventPackages: () => ({ data: data.packages }),
}));

test("readiness separates publishing, date boundaries, paid tickets and unknown form/permission data", () => {
  vi.spyOn(Date, "now").mockReturnValue(Date.parse("2026-09-07T12:00:00Z"));
  const event = {
    id: "event",
    name: "Workshop",
    locationName: "Auditorium",
    status: "DRAFT",
  } as EventItem;
  const props = {
    event,
    canManageRegistration: true,
    canManagePackages: true,
    canManageForm: true,
    organizerCount: 2,
    onSectionChange: vi.fn(),
  };
  const { rerender } = render(<ReviewSettings {...props} />);
  const score = (value: number) =>
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "value",
      String(value),
    );
  score(80);
  expect(screen.getByRole("status")).toHaveTextContent("Unavailable");
  expect(screen.getByText("Auditorium")).toBeInTheDocument();
  expect(
    screen.getByText("Individual Ticket: Free (1 seat)"),
  ).toBeInTheDocument();
  expect(screen.getByText("2")).toBeInTheDocument();
  for (const [label, section] of [
    ["Overview", "overview"],
    ["Registration setup", "setup"],
    ["Registration form", "form"],
    ["Packages", "packages"],
    ["Payment", "payment"],
  ]) {
    fireEvent.click(screen.getAllByRole("button", { name: label })[0]);
    expect(props.onSectionChange).toHaveBeenLastCalledWith(section);
  }
  expect(
    screen.getByText(/These checks do not block publishing/),
  ).toBeInTheDocument();
  event.status = "PUBLISHED";
  rerender(<ReviewSettings {...props} />);
  score(100);
  expect(screen.getByRole("status")).toHaveTextContent("Configuration ready");
  data.settings.registrationOpensAt = "2026-09-08T12:00:00Z";
  rerender(<ReviewSettings {...props} />);
  expect(screen.getByRole("status")).toHaveTextContent("Scheduled");
  data.settings.registrationOpensAt = null;
  data.settings.isRegistrationOpen = false;
  rerender(<ReviewSettings {...props} />);
  score(80);
  expect(screen.getByRole("status")).toHaveTextContent("Closed");
  data.settings.isRegistrationOpen = true;
  data.settings.registrationClosesAt = new Date(Date.now()).toISOString();
  rerender(<ReviewSettings {...props} />);
  score(80);
  data.settings.registrationClosesAt = null;
  data.packages[0].priceMinor = "10000";
  rerender(<ReviewSettings {...props} />);
  score(80);
  Object.assign(data.settings, {
    paymentBankName: "Bank",
    paymentAccountNumber: "123",
    paymentAccountHolder: "HIMTI",
  });
  rerender(<ReviewSettings {...props} />);
  score(100);
  data.packages[0].salesEndAt = new Date(Date.now()).toISOString();
  rerender(<ReviewSettings {...props} />);
  score(80);
  data.packages[0].salesEndAt = null;
  data.form.status = "DRAFT";
  data.form.version = 2;
  rerender(<ReviewSettings {...props} />);
  score(80);
  expect(
    screen.getByText(/Registration availability cannot be confirmed/),
  ).toBeInTheDocument();
  data.error = true;
  rerender(<ReviewSettings {...props} />);
  score(20);
  expect(screen.getByRole("status")).toHaveTextContent("Unknown");
  expect(
    screen.getByText(/Could not load registration settings/),
  ).toBeInTheDocument();
  rerender(
    <ReviewSettings
      {...props}
      canManageRegistration={false}
      canManageForm={false}
      canManagePackages={false}
    />,
  );
  score(20);
  expect(screen.getByText(/4 unknown/)).toBeInTheDocument();
  expect(screen.queryByText("RSVP (version 2)")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Packages" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Registration setup" }),
  ).not.toBeInTheDocument();
  vi.restoreAllMocks();
});
