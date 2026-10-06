import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, test, vi } from "vitest";
import apiClient from "@/config/api-client";
import { EventPackages } from "./EventPackages";
import { Api } from "@/constants/api";

vi.mock("@/config/api-client", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

test.each(["ACTIVE", "INACTIVE"])(
  "%s package changes only after confirmation",
  async (status) => {
    vi.mocked(apiClient.post)
      .mockClear()
      .mockResolvedValue({ data: { data: {} } });
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        data: [
          {
            id: "ticket-1",
            name: "Workshop ticket",
            code: "WORKSHOP",
            status,
            priceMinor: "0",
            seatCount: 1,
          },
        ],
      },
    });
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={client}>
        <EventPackages eventId="event-1" canEdit />
      </QueryClientProvider>,
    );
    const label = status === "ACTIVE" ? "Deactivate" : "Activate";
    fireEvent.click(await screen.findByRole("button", { name: label }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "Workshop ticket",
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(apiClient.post).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: label }));
    fireEvent.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: `${label} package`,
      }),
    );
    await waitFor(() => expect(apiClient.post).toHaveBeenCalledTimes(1));
    expect(apiClient.post).toHaveBeenCalledWith(
      (status === "ACTIVE"
        ? Api.eventPackageDeactivate
        : Api.eventPackageActivate
      )
        .replace(":id", "event-1")
        .replace(":packageId", "ticket-1"),
    );
    await waitFor(() =>
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
    client.clear();
  },
);
