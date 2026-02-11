import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";
import vueDevTools from "vite-plugin-vue-devtools";

export default defineConfig({
  plugins: [
    vue(),
    vuetify({
      autoImport: true,
    }),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/vuetify")) return "vuetify";
          if (id.includes("node_modules/supabase")) return "supabase";
          if (id.includes("node_modules/lodash")) return "lodash";
          if (id.includes("html-to-image")) return "html-to-image";
        },
      },
    },
    sourcemap: true,
    minify: "terser",
  },
  optimizeDeps: {
    exclude: ["vuetify"],
  },
  assetsInclude: ["**/*.png", "**/*.jpg", "**/*.webp"],
});
