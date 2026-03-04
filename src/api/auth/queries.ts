import { useQuery } from "@tanstack/react-query";
import apiClient from "@/config/api-client";
import { Api } from "@/constants/api";
import type { UserMeResponse } from "@/types/auth";

export const useGetMe = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () =>
      apiClient.get<UserMeResponse>(Api.getMe).then((res) => res.data),
    staleTime: 5 * 60 * 1000,
    enabled: enabled,
  });
};
