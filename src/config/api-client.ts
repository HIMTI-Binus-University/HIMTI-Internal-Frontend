import axios from "axios";
import { runtimeConfig } from "./runtime";

const apiClient = axios.create({
  baseURL: runtimeConfig.apiBaseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default apiClient;
