const readEnv = (key: keyof ImportMetaEnv) => {
  const value = import.meta.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const ensureLeadingSlash = (value: string) => {
  if (!value) return "/";
  return value.startsWith("/") ? value : `/${value}`;
};

const normalizeBasePath = (value: string) => {
  const normalized = ensureLeadingSlash(trimTrailingSlash(value));
  return normalized === "" ? "/" : normalized;
};

const normalizeHost = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "")
    .replace(/\/.*$/, "");

const isLocalHost = (hostname: string) =>
  hostname === "localhost" || hostname === "127.0.0.1";

export const runtimeConfig = {
  apiBaseUrl: trimTrailingSlash(readEnv("VITE_API_BASE_URL")),
  adminAppUrl: trimTrailingSlash(readEnv("VITE_ADMIN_APP_URL")),
  linkAppUrl: trimTrailingSlash(readEnv("VITE_LINK_APP_URL")),
  ofogUrl: trimTrailingSlash(readEnv("VITE_OFOG_URL")),
  localLinkBasePath: normalizeBasePath(readEnv("VITE_LOCAL_LINK_BASE_PATH")),
};

export const routeMode = {
  isLinkHost(hostname: string) {
    const currentHost = hostname.toLowerCase();
    const configuredLinkHost = normalizeHost(runtimeConfig.linkAppUrl);

    return currentHost === configuredLinkHost;
  },
};

const getLocalShortLinkBaseUrl = () => {
  if (typeof window !== "undefined" && isLocalHost(window.location.hostname)) {
    return `${window.location.origin}${runtimeConfig.localLinkBasePath}`;
  }

  return `${runtimeConfig.adminAppUrl}${runtimeConfig.localLinkBasePath}`;
};

const getShortLinkBaseUrl = () => {
  if (typeof window !== "undefined" && isLocalHost(window.location.hostname)) {
    return getLocalShortLinkBaseUrl();
  }

  return runtimeConfig.linkAppUrl;
};

export const shortLinkConfig = {
  get displayPrefix() {
    return `${getShortLinkBaseUrl()}/`;
  },
  buildShortUrl(shortCode: string) {
    return `${getShortLinkBaseUrl()}/${shortCode}`;
  },
  toEditableShortCode(input: string) {
    const trimmed = input.trim();

    if (!trimmed) return "";

    const knownPrefixes = [
      `${runtimeConfig.linkAppUrl}/`,
      `${getLocalShortLinkBaseUrl()}/`,
      `${runtimeConfig.adminAppUrl}${runtimeConfig.localLinkBasePath}/`,
    ];

    for (const prefix of knownPrefixes) {
      if (trimmed.startsWith(prefix)) {
        return trimmed.slice(prefix.length);
      }
    }

    const localPrefix = `${runtimeConfig.localLinkBasePath}/`;
    if (trimmed.startsWith(localPrefix)) {
      return trimmed.slice(localPrefix.length);
    }

    return trimmed
      .replace(/^https?:\/\/[^/]+\//, "")
      .replace(new RegExp(`^${runtimeConfig.localLinkBasePath.slice(1)}/`), "");
  },
};
