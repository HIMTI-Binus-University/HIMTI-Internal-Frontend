import { API_URL } from "./api-service";

export const Api = {
  // Auth endpoints
  authSignInSocial: `${API_URL}/api/auth/sign-in/social`,
  getMe: `${API_URL}/api/registration/me`,

  // URL Shortener endpoints
  urlCreate: `${API_URL}/api/url/create-url`,
  urlList: `${API_URL}/api/url/get-list`,
  urlUpdate: `${API_URL}/api/url/update-url/:id`,
  urlDelete: `${API_URL}/api/url/delete/:id`,
  urlResolve: `${API_URL}/api/url/:shortCode`,
  urlLink: `${API_URL}/api/url/link/:shortCode`,
};
