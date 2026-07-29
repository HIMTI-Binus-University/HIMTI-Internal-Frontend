import { beforeEach, describe, expect, it, vi } from "vitest";

import apiClient from "@/config/api-client";
import { getAllRoles, cleanUserListParams } from "./queries";

vi.mock("@/config/api-client", () => ({
  default: { get: vi.fn() },
}));

const mockedClient = vi.mocked(apiClient);

beforeEach(() => vi.clearAllMocks());

describe("getAllRoles", () => {
  it("fetches and combines every active-role page", async () => {
    mockedClient.get
      .mockResolvedValueOnce({
        data: {
          msg: "success",
          data: [{ id: "role-1" }],
          meta: { page: 1, limit: 100, totalRecords: 201, totalPages: 3 },
        },
      })
      .mockResolvedValueOnce({ data: { data: [{ id: "role-2" }] } })
      .mockResolvedValueOnce({ data: { data: [{ id: "role-3" }] } });

    const roles = await getAllRoles();

    expect(roles.map((role) => role.id)).toEqual(["role-1", "role-2", "role-3"]);
    expect(mockedClient.get).toHaveBeenNthCalledWith(1, expect.any(String), {
      params: { page: 1, limit: 100, status: "ACTIVE" },
    });
    expect(mockedClient.get).toHaveBeenNthCalledWith(2, expect.any(String), {
      params: { page: 2, limit: 100, status: "ACTIVE" },
    });
    expect(mockedClient.get).toHaveBeenNthCalledWith(3, expect.any(String), {
      params: { page: 3, limit: 100, status: "ACTIVE" },
    });
  });
});

describe("cleanUserListParams", () => {
  it("preserves canonical false filters and regionId", () => {
    expect(
      cleanUserListParams({
        page: 1,
        search: "",
        regionId: "region-1",
        verification: false,
        completed: false,
      }),
    ).toEqual({
      page: 1,
      regionId: "region-1",
      verification: false,
      completed: false,
    });
  });
});
