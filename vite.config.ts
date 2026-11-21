import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "next/link": fileURLToPath(new URL("./src/hosting/link.tsx", import.meta.url)),
      "next/image": fileURLToPath(new URL("./src/hosting/image.tsx", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    license: { fileName: "assets/dependency-licenses.md" },
  },
});
