import { useMutation } from "@tanstack/react-query";
import apiClient from "@/config/api-client";
import { Api } from "@/constants/api";

export interface LoginWithGooglePayload {
  provider: "google";
  callbackURL: string;
}

export interface LoginWithGoogleResponse {
  url: string;
  redirect: boolean;
}


// Login with Google
export const useLoginWithGoogle = () => {
  return useMutation({
    mutationFn: (payload: LoginWithGooglePayload) =>
      apiClient
        .post<LoginWithGoogleResponse>(Api.authSignInSocial, payload, {
          withCredentials: true,
        })
        .then((res) => res.data),
    onSuccess: (data) => {
      if (data.url && data.redirect) {
        window.location.href = data.url;
      }
    },
  });
};
