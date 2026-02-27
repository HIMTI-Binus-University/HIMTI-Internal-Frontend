import { API_URL } from "./api-service";

export const Api = {
  // Auth endpoints
  authSignInSocial: `${API_URL}/api/auth/sign-in/social`,

  // URL Shortener endpoints
  urlCreate: `${API_URL}/api/url/create-url`,
  urlList: `${API_URL}/api/url/get-list`,
  urlUpdate: `${API_URL}/api/url/update-url/:id`,
};
