// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/client";
import { ApiService } from "@/constants/api-service-dev";

export const authClient = createAuthClient({
  baseURL: ApiService.baseURL,
});
