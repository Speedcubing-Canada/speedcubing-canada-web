interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly MODE: string;
  readonly VITE_REALM: string;
  readonly VITE_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
