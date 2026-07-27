import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type * as UtilsModule from "@/components/Utils";

import DetailPage from "./detail";

const fixture = vi.hoisted(() => ({
  user: {
    id: "user-1",
    name: "Ayu Pratama",
    email: "ayu@example.com",
    image: null,
    roles: [{ id: "admin", roleName: "Administrator", status: "ACTIVE" }],
    permissions: [{ id: "manage-users", name: "manage_users", status: "ACTIVE" }],
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
    university: { id: "binus", name: "BINUS University", shortName: "BINUS" },
    studyProgram: { id: "computer-science", name: "Computer Science", shortName: "CS" },
    graduateBatch: "2028",
    phoneNumber: "08123456789",
    lineId: "ayu-line",
    status: "ACTIVE" as const,
    createdAt: "2026-06-01T00:00:00.000Z",
    createdBy: "system",
    updatedAt: null,
    updatedBy: null,
  },
}));

vi.mock("@/api/rbac/queries", () => ({
  useGetUser: () => ({
    data: fixture.user,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useGetRoles: () => ({
    data: [{ id: "admin", roleName: "Administrator", status: "ACTIVE" }],
  }),
}));

vi.mock("@/api/auth/queries", () => ({
  useGetMe: () => ({
    data: { id: "admin-1", permissions: ["manage_roles"] },
  }),
}));

vi.mock("@/hooks/rbac/users", () => ({
  useAssignUserRole: () => ({ mutate: vi.fn() }),
  useRemoveUserRole: () => ({ mutate: vi.fn() }),
}));

vi.mock("@/components/Utils", async (importOriginal) => {
  const actual = await importOriginal<typeof UtilsModule>();
  return {
    ...actual,
    PageLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
  };
});

describe("User detail", () => {
  afterEach(cleanup);

  it("shows the complete profile without editing controls", () => {
    render(
      <MemoryRouter initialEntries={["/rbac/users/user-1"]}>
        <Routes>
          <Route path="/rbac/users/:userId" element={<DetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getAllByText("Ayu Pratama")).toHaveLength(2);
    expect(screen.getByText("Computer Science")).toBeInTheDocument();
    expect(screen.getByText("KMG")).toBeInTheDocument();
    expect(screen.getByText("Administrator")).toBeInTheDocument();
    expect(screen.getByText("manage_users")).toBeInTheDocument();
    expect(screen.getByText("2800000000")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Administrator" })).toBeChecked();
    expect(screen.queryByRole("button", { name: "Save changes" })).not.toBeInTheDocument();
  });
});
