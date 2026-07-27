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

  it("renders the workspace preview and links to login when unauthenticated", () => {
    auth.useSession.mockReturnValue({ data: null, isPending: false });

    renderPage();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Everything HIMTI needs to keep moving.",
    );
    expect(
      screen.getByText(
        "Access internal tools, manage operational work, and find the resources your team needs. All from one workspace.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open workspace" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.getByText("URL Shortener")).toBeInTheDocument();
    expect(screen.getByText("Email Blaster")).toBeInTheDocument();
    expect(screen.getByText("Event Operations")).toBeInTheDocument();
    expect(screen.getByText("Member & Role Access")).toBeInTheDocument();
    expect(screen.getByText("HIMTI Internal Tools")).toBeInTheDocument();
    expect(
      screen.queryByText("The workspace behind HIMTI"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Role-based access")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Tools shown based on your role."),
    ).not.toBeInTheDocument();
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
