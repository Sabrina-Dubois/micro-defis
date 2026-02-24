import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import pinia from "./plugins/pinia";

import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import "./assets/main.css";

// --- i18n ---
import { createI18n } from "vue-i18n";
import en from "@/i18n/en.json";
import fr from "@/i18n/fr.json";

const i18n = createI18n({
  legacy: false,
  locale: "fr",
  fallbackLocale: "en",
  messages: { en, fr },
});

// --- Création de l'app ---
const app = createApp(App);

// --- Plugins ---
app.use(router);
app.use(vuetify);
app.use(pinia);
app.use(i18n);

// --- Langue utilisateur ---
const userLang = localStorage.getItem("lang") || navigator.language.slice(0, 2) || "fr";
i18n.global.locale.value = userLang;

// --- Monter l'app ---
app.mount("#app");

// --- PWA / Service Worker ---
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  const swUrl = `${import.meta.env.BASE_URL}sw.js`;
  navigator.serviceWorker
    .register(swUrl)
    .then(async () => {
      // Keep only the active app worker to avoid multi-worker conflicts.
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        const scriptUrl = reg.active?.scriptURL || reg.waiting?.scriptURL || reg.installing?.scriptURL || "";
        if (scriptUrl && !scriptUrl.endsWith("/sw.js") && !scriptUrl.endsWith("sw.js")) {
          await reg.unregister();
        }
      }
    })
    .catch((err) => {
      console.error("Service worker registration failed:", err);
    });
}

// --- Install PWA bouton ---
let deferredPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
});
window.installPWA = () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => (deferredPrompt = null));
  }
};
