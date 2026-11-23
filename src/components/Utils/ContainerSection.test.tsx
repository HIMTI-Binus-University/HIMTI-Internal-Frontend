import { render, screen } from "@testing-library/react";
import { Award } from "lucide-react";
import { describe, expect, it } from "vitest";

import ContainerSection from "./ContainerSection";

describe("ContainerSection", () => {
  it("labels the region with its title and renders the description", () => {
    render(
      <ContainerSection title="Name List" description="Paste one name per line">
        Body
      </ContainerSection>,
    );

    const region = screen.getByRole("region", { name: "Name List" });
    expect(region).toHaveClass("rounded-xl", "border", "bg-card", "p-0");
    expect(screen.getByText("Paste one name per line")).toBeInTheDocument();
  });

  it("keeps the header and footer outside the scrolling body", () => {
    render(
      <ContainerSection
        title="Output"
        actions={<button type="button">Reset</button>}
        footer={<button type="button">Generate</button>}
      >
        Scrolling content
      </ContainerSection>,
    );

    const body = screen.getByText("Scrolling content");
    expect(body).toHaveClass("lg:overflow-y-auto", "lg:flex-1");

    // Header and footer are siblings of the body, not children of it.
    expect(body).not.toContainElement(screen.getByRole("button", { name: "Reset" }));
    expect(body).not.toContainElement(screen.getByRole("button", { name: "Generate" }));
  });

  it("does not scroll internally below the lg breakpoint", () => {
    render(<ContainerSection title="Preview">Content</ContainerSection>);

    // Overflow utilities only exist behind the `lg:` prefix.
    expect(screen.getByText("Content").className).not.toMatch(/(^|\s)overflow-y-auto/);
  });

  it("uses tighter spacing when compact", () => {
    render(
      <ContainerSection title="Result" compact>
        Compact body
      </ContainerSection>,
    );

    expect(screen.getByText("Compact body")).toHaveClass("p-4");
    expect(screen.getByText("Compact body")).not.toHaveClass("p-5");
  });

  it("renders an icon chip when an icon is given", () => {
    const { container } = render(
      <ContainerSection title="Certificate Template" icon={Award}>
        Body
      </ContainerSection>,
    );

    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
