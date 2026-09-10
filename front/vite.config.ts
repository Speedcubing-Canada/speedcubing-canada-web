/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const CSP_NONCE_PLACEHOLDER = "__CSP_NONCE__";

export default defineConfig({
  plugins: [react()],
  html: {
    cspNonce: CSP_NONCE_PLACEHOLDER,
  },
  resolve: {
    alias: [
      {
        find: /^@mui\/icons-material\/(.*)$/,
        replacement: "@mui/icons-material/esm/$1",
      },
    ],
  },
  server: {
    port: 2003,
  },
  build: {
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 0, // Disable inlining for stricter CSP
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    css: false,
    // react-admin's dist does `import "@mui/material/styles"`, a directory import
    // Node's ESM resolver rejects. Inlining lets Vite resolve it as the bundler does.
    server: { deps: { inline: [/ra-ui-materialui/, /react-admin/] } },
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**"],
      exclude: ["src/test/**", "src/setupTests.ts", "src/**/*.test.{ts,tsx}"],
      // A ratchet: raise these as tests land, never lower them.
      thresholds: { lines: 13, functions: 12, branches: 14, statements: 12 },
    },
  },
});
