// main.js
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
  legacy: false, // API Composition
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

// --- Détecter et charger la langue de l'utilisateur ---
const userLang = localStorage.getItem("lang") || navigator.language.slice(0, 2) || "fr";

i18n.global.locale.value = userLang;

// --- Monter l'app ---
app.mount("#app");

// --- PWA / Service Worker ---
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  import("./pwa.js").then(({ registerServiceWorker }) => {
    // Ici tu passes ta VAPID key si besoin pour les notifications push
    registerServiceWorker("<TON_VAPID_PUBLIC_KEY>");
  });
}

// --- Installation PWA (pour bouton "Ajouter à l'écran d'accueil") ---
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
