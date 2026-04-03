// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { API_URL } from "@/constants/api-service";

export const authClient = createAuthClient({
  baseURL: API_URL,
});
