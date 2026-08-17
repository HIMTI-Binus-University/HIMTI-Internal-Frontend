import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { WorkspaceTabs } from "./components";

describe("WorkspaceTabs", () => {
  it("exposes registration configuration from the subevent workspace", () => {
    render(
      <MemoryRouter>
        <WorkspaceTabs
          basePath="/events/event-1/subevents/subevent-1"
          active="overview"
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Registration" })).toHaveAttribute(
      "href",
      "/events/event-1/subevents/subevent-1/registration-setup",
    );
    expect(screen.getByRole("link", { name: "Registrations" })).toHaveAttribute(
      "href",
      "/events/event-1/subevents/subevent-1/registrations",
    );
  });
});
