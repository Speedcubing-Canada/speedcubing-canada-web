import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
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
  },
});
