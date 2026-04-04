/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ADMIN_APP_URL: string;
  readonly VITE_LINK_APP_URL: string;
  readonly VITE_OFOG_URL: string;
  readonly VITE_LOCAL_LINK_BASE_PATH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
