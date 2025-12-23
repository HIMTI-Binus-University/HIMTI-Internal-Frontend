import { Route } from "@/types/route";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import UrlShortenerPage from "@/pages/url-shortener";

export const publicRoutes: Route[] = [
  {
    key: "router-home",
    title: "Home",
    description: "Home Page",
    component: HomePage,
    path: "/",
    isEnabled: true,
  },
  {
    key: "router-login",
    title: "Login",
    description: "Login Page",
    component: LoginPage,
    path: "/login",
    isEnabled: true,
  },
  {
    key: "router-url-shortener",
    title: "URL Shortener",
    description: "URL Shortener Page",
    component: UrlShortenerPage,
    path: "/url-shortener",
    isEnabled: true,
  },
];

export const protectedRoutes: Route[] = [];
