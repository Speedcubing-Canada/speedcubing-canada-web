/// <reference types="vitest/globals" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// @svg-maps/canada ships no type declarations; CanadaRegionMap casts the import.
declare module "@svg-maps/canada";
