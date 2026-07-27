import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as UtilsModule from "@/components/Utils";

import UsersPage from "./index";

const fixtures = vi.hoisted(() => ({
  users: [] as Array<{
    id: string;
    name: string;
    email: string;
    image: string | null;
    roles: Array<{ id: string; roleName: string; status: string }>;
    emailVerified: boolean;
    outlookEmail: string | null;
    outlookEmailVerified: boolean;
    memberType: "STUDENT" | "LECTURER" | "OTHER" | null;
    institutionType: "BINUS" | "NON_BINUS" | null;
    regionId: string | null;
    region: { id: string; name: string; shortName: string | null } | null;
    universityName: string | null;
    studyProgramName: string | null;
    department: string | null;
    affiliation: string | null;
    registrationCompletedAt: string | null;
    nim: string | null;
    universityId: string | null;
    studyProgramId: string | null;
    university: null;
    studyProgram: null;
    graduateBatch: string | null;
    phoneNumber: string | null;
    lineId: string | null;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    createdAt: string;
    createdBy: string | null;
    updatedAt: string | null;
    updatedBy: string | null;
  }>,
}));

vi.mock("@/api/rbac/queries", () => ({
  exportUsers: vi.fn(),
  useGetRegistrationOptions: () => ({
    data: {
      binusRegions: [{ id: "kemanggisan", name: "Kemanggisan", shortName: "KMG" }],
    },
  }),
  useGetUsers: () => ({
    data: {
      data: fixtures.users,
      meta: { page: 1, limit: 20, totalRecords: fixtures.users.length, totalPages: 1 },
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
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

const user = {
  id: "user-1",
  name: "Ayu Pratama",
  email: "ayu@example.com",
  image: null,
  roles: [
    { id: "admin", roleName: "Administrator", status: "ACTIVE" },
    { id: "reviewer", roleName: "Reviewer", status: "ACTIVE" },
  ],
  emailVerified: true,
  outlookEmail: "ayu@binus.ac.id",
  outlookEmailVerified: false,
  memberType: "STUDENT" as const,
  institutionType: "BINUS" as const,
  regionId: "kemanggisan",
  region: { id: "kemanggisan", name: "Kemanggisan", shortName: "KMG" },
  universityName: null,
  studyProgramName: null,
  department: null,
  affiliation: null,
  registrationCompletedAt: "2026-07-01T00:00:00.000Z",
  nim: "2800000000",
  universityId: "binus",
  studyProgramId: "computer-science",
  university: null,
  studyProgram: null,
  graduateBatch: "2028",
  phoneNumber: "08123456789",
  lineId: "ayu-line",
  status: "ACTIVE" as const,
  createdAt: "2026-06-01T00:00:00.000Z",
  createdBy: null,
  updatedAt: null,
  updatedBy: null,
};

const renderPage = () => render(
  <MemoryRouter initialEntries={["/rbac/users"]}>
    <UsersPage />
  </MemoryRouter>,
);

describe("UsersPage", () => {
  beforeEach(() => {
    fixtures.users = [user];
  });

  afterEach(cleanup);

  it("renders a compact, state-focused user directory", () => {
    renderPage();

    expect(screen.queryByText("Registered today")).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Personal email" })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Phone / LINE" })).not.toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Account state" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Sort" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Status" })).toBeInTheDocument();
    expect(screen.getByText("Ayu Pratama")).toBeInTheDocument();
    expect(screen.getByText("ayu@example.com")).toBeInTheDocument();
    expect(screen.getByText("Student")).toBeInTheDocument();
    expect(screen.getByText("BINUS · KMG")).toBeInTheDocument();
    expect(screen.getByText("Registered")).toBeInTheDocument();
    expect(screen.getByText("Outlook unverified")).toBeInTheDocument();
    expect(screen.getByText("Administrator")).toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View details for Ayu Pratama" }))
      .toHaveAttribute("href", "/rbac/users/user-1");
    expect(screen.getByRole("button", { name: "Export CSV" })).toHaveClass("bg-primary");
    expect(screen.getByPlaceholderText("Search by name, email, NIM, or phone"))
      .toHaveClass("placeholder:text-muted-foreground/55");
  });

  it("keeps secondary filters behind progressive disclosure", () => {
    renderPage();

    expect(screen.queryByText("Outlook verification")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Filters" }));
    expect(screen.getByText("Member type")).toBeInTheDocument();
    expect(screen.getByText("Outlook verification")).toBeInTheDocument();
    expect(screen.getByText("Registration")).toBeInTheDocument();
  });

  it("uses the shared empty state when no users match", () => {
    fixtures.users = [];
    renderPage();

    expect(screen.getByRole("heading", { name: "No users found" })).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
