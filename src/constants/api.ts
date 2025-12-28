import { ApiService } from "./api-service";

export const Api = {
  // Auth endpoints
  authSignInSocial: `${ApiService.baseURL}/api/auth/sign-in/social`,

  // URL Shortener endpoints
  urlCreate: `${ApiService.baseURL}/api/url/create-url`,
  urlList: `${ApiService.baseURL}/api/url/get-list`,
  urlUpdate: `${ApiService.baseURL}/api/url/update-url/:id`,
};
