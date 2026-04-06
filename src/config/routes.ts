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
    key: "router-link-root-on-admin-host",
    title: "Redirect Root",
    description: "Short link root redirect on admin/general host",
    component: RedirectLoadingPage,
    path: "/link",
    isEnabled: true,
    isProtected: false,
  },
  {
    key: "router-link-shortcode-on-admin-host",
    title: "Redirect",
    description: "Short link redirect on admin/general host",
    component: RedirectLoadingPage,
    path: "/link/:shortCode",
    isEnabled: true,
    isProtected: false,
  },
];

export const protectedRoutes: Route[] = [];

export const linkRoutes: Route[] = [
  {
    key: "router-link-host-root",
    title: "Redirect Root",
    description: "Short link root redirect on dedicated link host",
    component: RedirectLoadingPage,
    path: "/",
    isEnabled: true,
    isProtected: false,
  },
  {
    key: "router-link-host-shortcode",
    title: "Redirect",
    description: "Short link redirect on dedicated link host",
    component: RedirectLoadingPage,
    path: "/:shortCode",
    isEnabled: true,
    isProtected: false,
  },
];
