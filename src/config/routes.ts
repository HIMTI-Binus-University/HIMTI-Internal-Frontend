import { Route } from "@/types/route";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import UrlShortenerPage from "@/pages/url-shortener";
import RedirectLoadingPage from "@/pages/loading";

export const publicRoutes: Route[] = [
  {
    key: "router-home",
    title: "Home",
    description: "Home Page",
    component: HomePage,
    path: "/",
    isEnabled: true,
    isProtected: false,
  },
  {
    key: "router-login",
    title: "Login",
    description: "Login Page",
    component: LoginPage,
    path: "/login",
    isEnabled: true,
    isProtected: false,
  },
  {
    key: "router-url-shortener",
    title: "URL Shortener",
    description: "URL Shortener Page",
    component: UrlShortenerPage,
    path: "/url-shortener",
    isEnabled: true,
    isProtected: true,
    requiredPermission: "manage_urls",
  },
  {
    key: "router-redirect-dev",
    title: "Redirect",
    description: "Short link redirect (dev)",
    component: RedirectLoadingPage,
    path: "/link/:shortCode",
    isEnabled: true,
    isProtected: false,
  },
];

export const protectedRoutes: Route[] = [];

export const linkRoutes: Route[] = [
  {
    key: "router-redirect",
    title: "Redirect",
    description: "Short link redirect",
    component: RedirectLoadingPage,
    path: "/:shortCode",
    isEnabled: true,
    isProtected: false,
  },
];
