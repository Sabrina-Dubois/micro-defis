import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";
import vueDevTools from "vite-plugin-vue-devtools";

export default defineConfig({
  plugins: [
    vue(),
    vuetify({
      // Importe automatiquement les composants Vuetify utilisés dans le code
      autoImport: true,
    }),
    vueDevTools(),
  ],

  resolve: {
    alias: {
      // "@" = raccourci pour le dossier src/
      // ex: @/components/MonCompo.vue au lieu de ../../components/MonCompo.vue
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  build: {
    // Taille max d'un fichier JS avant que Vite affiche un avertissement (en kb)
    // Augmentée à 1600 car Vuetify est une grosse librairie
    chunkSizeWarningLimit: 1600,

    rollupOptions: {
      output: {
        // Découpe le bundle en fichiers séparés par librairie
        // Avantage : si tu modifies ton code, le navigateur re-télécharge
        // uniquement ton code — pas Vuetify/Supabase qui n'ont pas changé
        manualChunks(id) {
          if (id.includes("node_modules/vuetify")) return "vuetify";
          if (id.includes("node_modules/supabase")) return "supabase";
          if (id.includes("node_modules/lodash")) return "lodash";
          if (id.includes("html-to-image")) return "html-to-image";
        },
      },
    },

    // ✅ MODIFIÉ — était "true" avant
    // true  = Vite génère des fichiers .map qui contiennent ton code source lisible
    //         → n'importe qui dans le navigateur pouvait lire tout ton code
    // false = ces fichiers ne sont plus générés en prod
    //         → le code compilé reste illisible pour les visiteurs
    sourcemap: false,

    // Compresse et réduit la taille du bundle avec Terser
    minify: "terser",
  },

  optimizeDeps: {
    // Vuetify gère lui-même ses imports, on l'exclut du pré-bundling Vite
    exclude: ["vuetify"],
  },

  // Types de fichiers images reconnus comme assets statiques par Vite
  assetsInclude: ["**/*.png", "**/*.jpg", "**/*.webp"],
});
