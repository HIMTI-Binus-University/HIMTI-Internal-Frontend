import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  createMemoryRouter,
  RouterProvider,
  useBlocker,
  useNavigate,
} from "react-router-dom";
import { describe, expect, it } from "vitest";

const DirtyPage = () => {
  const navigate = useNavigate();
  const blocker = useBlocker(true);
  return (
    <div>
      <button onClick={() => navigate("/other")}>Leave</button>
      <span>{blocker.state}</span>
      {blocker.state === "blocked" && (
        <button onClick={() => blocker.proceed()}>Discard</button>
      )}
    </div>
  );
};

describe("dirty editor navigation", () => {
  it("blocks SPA navigation until explicitly continued", async () => {
    const router = createMemoryRouter(
      [
        { path: "/editor", element: <DirtyPage /> },
        { path: "/other", element: <p>Other page</p> },
      ],
      { initialEntries: ["/editor"] },
    );
    render(<RouterProvider router={router} />);
    fireEvent.click(screen.getByRole("button", { name: "Leave" }));
    expect(screen.getByText("blocked")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/editor");
    fireEvent.click(screen.getByRole("button", { name: "Discard" }));
    await waitFor(() => expect(router.state.location.pathname).toBe("/other"));
  });

  it("blocks browser history back navigation", async () => {
    const router = createMemoryRouter(
      [
        { path: "/editor", element: <DirtyPage /> },
        { path: "/other", element: <p>Other page</p> },
      ],
      { initialEntries: ["/other", "/editor"], initialIndex: 1 },
    );
    render(<RouterProvider router={router} />);
    await router.navigate(-1);
    expect(screen.getByText("blocked")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/editor");
    fireEvent.click(screen.getByRole("button", { name: "Discard" }));
    await waitFor(() => expect(router.state.location.pathname).toBe("/other"));
  });
});
