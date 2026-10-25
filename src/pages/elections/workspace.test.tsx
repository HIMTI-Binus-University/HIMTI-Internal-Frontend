import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import apiClient from "@/config/api-client";
import ElectionWorkspacePage from "./workspace";

vi.mock("@/api/auth/queries", () => ({
  useGetMe: () => ({ data: { permissions: ["manage_elections"] } }),
}));
vi.mock("@/components/Utils", async (original) => ({
  ...(await original<object>()),
  PageLayout: ({ children }: { children: React.ReactNode }) => (
    <main>{children}</main>
  ),
}));

const election = {
  id: "election-1",
  title: "HIMTI Election",
  slug: "himti-election",
  description: null,
  status: "CLOSED",
  candidates: [],
  startsAt: "2026-10-01T00:00:00Z",
  endsAt: "2026-10-25T00:00:00Z",
  originalEndsAt: "2026-10-25T00:00:00Z",
  debateAt: null,
  secondDebateAt: null,
  removeCountdownForLiveReveal: false,
};

beforeEach(() => {
  election.removeCountdownForLiveReveal = false;
  vi.spyOn(apiClient, "get").mockImplementation(async (url) => ({
    data: {
      data: String(url).endsWith("/turnout")
        ? {
            participationCount: 0,
            eligibleVoterCount: 0,
            ballotCount: 0,
            valid: true,
          }
        : { ...election },
    },
  }));
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderPage() {
  return render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
          },
        })
      }
    >
      <MemoryRouter initialEntries={["/elections/election-1"]}>
        <Routes>
          <Route
            path="/elections/:electionId"
            element={<ElectionWorkspacePage />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

test("saves the live reveal toggle on and off even after voting closes", async () => {
  vi.spyOn(apiClient, "patch").mockImplementation(async (_url, body) => {
    election.removeCountdownForLiveReveal = (
      body as { removeCountdownForLiveReveal: boolean }
    ).removeCountdownForLiveReveal;
    return { data: { data: { ...election } } };
  });
  renderPage();
  const toggle = await screen.findByRole("switch", {
    name: "Remove Countdown for Live Reveal",
  });
  expect(toggle).not.toBeChecked();
  fireEvent.click(toggle);
  await waitFor(() => expect(toggle).toBeChecked());
  expect(screen.getByRole("status")).toHaveTextContent("Saved");
  fireEvent.click(toggle);
  await waitFor(() => expect(toggle).not.toBeChecked());
});

test("keeps the saved setting and reports a failed save", async () => {
  vi.spyOn(apiClient, "patch").mockRejectedValue(new Error("offline"));
  renderPage();
  const toggle = await screen.findByRole("switch", {
    name: "Remove Countdown for Live Reveal",
  });
  fireEvent.click(toggle);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "The request failed.",
  );
  expect(toggle).not.toBeChecked();
  expect(toggle).toBeEnabled();
});

test("uses the saved response even if refreshing election details stalls", async () => {
  vi.spyOn(apiClient, "patch").mockResolvedValue({
    data: { data: { ...election, removeCountdownForLiveReveal: true } },
  });
  renderPage();
  const toggle = await screen.findByRole("switch", {
    name: "Remove Countdown for Live Reveal",
  });
  vi.mocked(apiClient.get).mockImplementation(() => new Promise(() => {}));
  fireEvent.click(toggle);
  await waitFor(() => expect(toggle).toBeChecked());
  expect(toggle).toBeEnabled();
});

test("disables the switch while saving", async () => {
  let finish!: (result: unknown) => void;
  vi.spyOn(apiClient, "patch").mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  renderPage();
  const toggle = await screen.findByRole("switch", {
    name: "Remove Countdown for Live Reveal",
  });
  fireEvent.click(toggle);
  await waitFor(() => expect(toggle).toBeDisabled());
  finish({ data: { data: { ...election } } });
  await waitFor(() => expect(toggle).toBeEnabled());
});
