import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/player": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
      "/suno-api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
      "/users": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
      "/songs": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
    },
    fs: {
      allow: [
        "./", // Allows access to the root project folder
        "../", // Allows access to one directory up (for `node_modules`)
      ],
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    server: {
      deps: {
        inline: [/node_modules/],
      },
    },
  },
});
