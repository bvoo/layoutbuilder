import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("vue") ||
              id.includes("pinia") ||
              id.includes("@vueuse")
            ) {
              return "vendor";
            }
            if (id.includes("reka-ui") || id.includes("lucide-vue-next")) {
              return "ui";
            }
            if (id.includes("pdf-lib")) {
              return "pdf";
            }
          }
        },
      },
    },
  },
});
