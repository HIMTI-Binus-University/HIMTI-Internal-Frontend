import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { ConfirmAction } from "./ConfirmAction";
import { Button } from "@/components/ui/button";
import { NotificationProvider } from "@/components/notification";

test("cancel sends no request; confirm sends one and guards pending dismissal", async () => {
  let finish!: () => void;
  const request = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  render(
    <NotificationProvider>
      <ConfirmAction
        label="Publish event"
        description={'Publish "Workshop".'}
        onConfirm={request}
      >
        <Button>Publish</Button>
      </ConfirmAction>
    </NotificationProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Publish" }));
  expect(screen.getByRole("alertdialog")).toHaveTextContent("Workshop");
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(request).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Publish" }));
  fireEvent.click(screen.getByRole("button", { name: "Publish event" }));
  fireEvent.click(screen.getByRole("button", { name: "Working..." }));
  expect(request).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  fireEvent.keyDown(screen.getByRole("alertdialog"), { key: "Escape" });
  expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  finish();
  await waitFor(() =>
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
  );
  expect(screen.getByRole("status")).toHaveTextContent(
    "Publish event succeeded.",
  );
});

test("failure remains in the dialog and permits retry", async () => {
  const request = vi
    .fn()
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValueOnce(undefined);
  render(
    <NotificationProvider>
      <ConfirmAction
        label="Close form"
        description={'Close "RSVP".'}
        onConfirm={request}
      >
        <Button>Close form</Button>
      </ConfirmAction>
    </NotificationProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Close form" }));
  fireEvent.click(
    within(screen.getByRole("alertdialog")).getByRole("button", {
      name: "Close form",
    }),
  );
  expect(
    await within(screen.getByRole("alertdialog")).findByRole("alert"),
  ).toHaveTextContent("Action failed");
  fireEvent.click(
    within(screen.getByRole("alertdialog")).getByRole("button", {
      name: "Close form",
    }),
  );
  await waitFor(() =>
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
  );
  expect(request).toHaveBeenCalledTimes(2);
});
