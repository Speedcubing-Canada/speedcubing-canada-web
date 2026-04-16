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
});
