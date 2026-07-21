import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import HomePage from ".";

const auth = vi.hoisted(() => ({
  signOut: vi.fn(),
  useSession: vi.fn(),
}));

vi.mock("@/utils/auth-client", () => ({ authClient: auth }));

const renderPage = () =>
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );

describe("HomePage authentication action", () => {
  afterEach(cleanup);

  beforeEach(() => {
    auth.signOut.mockReset();
    auth.useSession.mockReset();
  });

  it("links to login when unauthenticated", () => {
    auth.useSession.mockReturnValue({ data: null, isPending: false });

    renderPage();

    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("signs out an authenticated user", async () => {
    auth.useSession.mockReturnValue({
      data: { user: { id: "user-1" } },
      isPending: false,
    });
    auth.signOut.mockResolvedValue(undefined);

    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => expect(auth.signOut).toHaveBeenCalledOnce());
  });

  it("does not show an auth action while checking the session", () => {
    auth.useSession.mockReturnValue({ data: null, isPending: true });

    renderPage();

    expect(
      screen.getByRole("button", { name: "Checking session..." }),
    ).toBeDisabled();
    expect(screen.queryByRole("link", { name: "Log in" })).not.toBeInTheDocument();
  });
});
