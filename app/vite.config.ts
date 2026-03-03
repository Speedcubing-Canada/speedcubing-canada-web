import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 2003,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-mui": [
            "@mui/material",
            "@mui/icons-material",
            "@emotion/react",
            "@emotion/styled",
          ],
          "vendor-admin": ["react-admin", "ra-language-french"],
        },
      },
    },
  },
});
