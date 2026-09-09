import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { NotificationProvider, useNotification } from "./notification";

function Trigger() {
  const notify = useNotification();
  return (
    <>
      <button onClick={() => notify("Saved.")}>Success</button>
      <button onClick={() => notify("Failed.", "error")}>Error</button>
    </>
  );
}

test("announces variants, replaces messages, dismisses, and expires", () => {
  vi.useFakeTimers();
  render(
    <NotificationProvider>
      <Trigger />
    </NotificationProvider>,
  );
  fireEvent.click(screen.getByText("Success"));
  expect(screen.getByRole("status")).toHaveTextContent("Saved.");
  fireEvent.click(screen.getByText("Error"));
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  expect(screen.getByRole("alert")).toHaveTextContent("Failed.");
  fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  fireEvent.click(screen.getByText("Success"));
  act(() => vi.advanceTimersByTime(5000));
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  vi.useRealTimers();
});
