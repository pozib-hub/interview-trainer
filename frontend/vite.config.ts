import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const src = (p: string) => path.resolve(import.meta.dirname, "src", p);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@components": src("components"),
      "@hooks": src("hooks"),
      "@lib": src("lib"),
      "@shared": src("shared"),
      "@ui": src("ui"),
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:8080",
      "/ws": {
        target: "http://localhost:8080",
        ws: true,
      },
    },
  },
});
