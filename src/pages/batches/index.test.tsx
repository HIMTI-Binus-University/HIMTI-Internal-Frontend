import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as UtilsModule from "@/components/Utils";

import BatchesPage from "./index";

const fixtures = vi.hoisted(() => ({
  periods: [] as Array<{
    id: string;
    label: string;
    isActive: boolean;
    registrationOpen: boolean;
    _count: { memberships: number; resources: number };
  }>,
  resources: [] as Array<{
    id: string;
    periodId: string;
    title: string;
    description: string;
    url: string | null;
    position: number;
    region: { id: string; name: string; shortName: string | null } | null;
  }>,
}));

vi.mock("@/api/batches/queries", () => {
  const mutation = () => ({ mutate: vi.fn(), isPending: false });
  return {
    useGetPeriods: () => ({
      data: fixtures.periods,
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    }),
    useGetResources: () => ({
      data: fixtures.resources,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    }),
    useActivatePeriod: mutation,
    useCreatePeriod: mutation,
    useCreateResource: mutation,
    useDeletePeriod: mutation,
    useDeleteResource: mutation,
    useOrderResources: mutation,
    useSetReregistration: mutation,
    useUpdatePeriod: mutation,
    useUpdateResource: mutation,
  };
});

vi.mock("@/api/rbac/queries", () => ({
  useGetRegistrationOptions: () => ({
    data: {
      binusRegions: [{ id: "kemanggisan", name: "Kemanggisan", shortName: "KMG" }],
    },
  }),
}));

vi.mock("@/components/Utils", async (importOriginal) => {
  const actual = await importOriginal<typeof UtilsModule>();
  return {
    ...actual,
    PageLayout: ({ actions, children }: { actions?: React.ReactNode; children: React.ReactNode }) => (
      <main>{actions}{children}</main>
    ),
  };
});

const inactivePeriod = {
  id: "2026-2027",
  label: "Pengurus 2026/2027",
  isActive: false,
  registrationOpen: true,
  _count: { memberships: 12, resources: 2 },
};

const resource = {
  id: "resource-1",
  periodId: inactivePeriod.id,
  title: "Member handbook",
  description: "Read the **handbook** before onboarding.",
  url: "https://example.com/handbook",
  position: 1,
  region: { id: "kemanggisan", name: "Kemanggisan", shortName: "KMG" },
};

const renderPage = () => render(
  <MemoryRouter initialEntries={[`/batches?period=${inactivePeriod.id}`]}>
    <BatchesPage />
  </MemoryRouter>,
);

describe("BatchesPage", () => {
  beforeEach(() => {
    fixtures.periods = [inactivePeriod];
    fixtures.resources = [resource];
  });

  afterEach(cleanup);
  it("renders combined batch details and resources", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Batch details" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Batch resources" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Academic period" })).toBeInTheDocument();
    expect(screen.getByText("Inactive")).toBeInTheDocument();
    expect(screen.getByText("Reregistration open")).toBeInTheDocument();
    expect(screen.getByText("Period ID")).toBeInTheDocument();
    expect(screen.getByText("Memberships")).toBeInTheDocument();
    expect(screen.getByText("Resources", { selector: "dt" })).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByRole("switch")).toBeChecked();
    expect(screen.getByRole("button", { name: "Activate period" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Edit" })).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Add resource" })).toBeInTheDocument();
    expect(screen.getByText("Member handbook")).toBeInTheDocument();
    expect(screen.getByText("KMG")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Move Member handbook up" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Move Member handbook down" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit Member handbook" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete Member handbook" })).toBeInTheDocument();
  });

  it("does not offer activation for the active period", () => {
    fixtures.periods = [{ ...inactivePeriod, isActive: true }];
    renderPage();

    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Activate period" })).not.toBeInTheDocument();
  });

  it("shows one details card and the resources empty state when no period exists", () => {
    fixtures.periods = [];
    fixtures.resources = [];
    renderPage();

    expect(screen.getByRole("heading", { name: "Batch details" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Batch resources" })).toBeInTheDocument();
    expect(screen.getByText("Create an academic period to get started.")).toBeInTheDocument();
    expect(screen.getByText("No batch selected")).toBeInTheDocument();
    expect(screen.getByText("Choose a batch above to manage its resources.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add resource" })).not.toBeInTheDocument();
  });
});
