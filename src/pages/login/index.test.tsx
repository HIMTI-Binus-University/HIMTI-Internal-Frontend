import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import LoginPage from ".";

const auth = vi.hoisted(() => ({
  signIn: { social: vi.fn() },
  useSession: vi.fn(),
}));
const queries = vi.hoisted(() => ({ useGetMe: vi.fn() }));

vi.mock("@/utils/auth-client", () => ({ authClient: auth }));
vi.mock("@/api/auth/queries", () => ({ useGetMe: queries.useGetMe }));

const renderPage = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );

describe("LoginPage content", () => {
  afterEach(cleanup);

  beforeEach(() => {
    auth.signIn.social.mockReset();
    auth.useSession.mockReset();
    queries.useGetMe.mockReset();
    auth.useSession.mockReturnValue({ data: null });
    queries.useGetMe.mockReturnValue({ data: undefined, isLoading: false });
  });

  it("renders the workspace sign-in content and navigation", () => {
    renderPage();

    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Welcome back. Let’s get to work.",
    );
    expect(
      screen.getByText(
        "Sign in with your authorized HIMTI Google account to access the tools and resources available to your role.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Sign in to your workspace" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Use your authorized HIMTI Google account to continue."),
    ).toBeInTheDocument();
    expect(screen.getByText("HIMTI BINUS")).toBeInTheDocument();
    expect(screen.getByText("Having trouble?")).toBeInTheDocument();
    expect(screen.queryByText(/trouble signing in/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Continue with Google" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Contact the administrator." }),
    ).toHaveAttribute("href", "https://wa.me/6285716303865");
  });
});
