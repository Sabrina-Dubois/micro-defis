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
  locale: "fr", // valeur par défaut
  fallbackLocale: "en", // si traduction manquante
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
const userLang =
  localStorage.getItem("lang") || // si sauvegardé
  navigator.language.slice(0, 2) || // sinon navigateur
  "fr"; // sinon français par défaut

i18n.global.locale.value = userLang;

// --- Monter l'app ---
app.mount("#app");


// 🔥 PWA SERVICE WORKER + DETECT
if ("serviceWorker" in navigator) {
  // En dev, /sw.js n'est pas toujours servi de la même façon selon la config PWA.
  // On évite donc les erreurs "Failed to fetch" liées aux workers obsolètes.
  if (import.meta.env.PROD) {
    navigator.serviceWorker
      .register("/sw.js")
      .then(async () => {
        const legacyRegistration =
          await navigator.serviceWorker.getRegistration("/serviceWorker.js");
        if (legacyRegistration) {
          await legacyRegistration.unregister();
        }
      })
      .catch((err) => {
        console.error("Service worker registration failed:", err);
      });
  }
}

let deferredPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Auto-trigger bouton "App mobile" ou popup
});

// Expose pour composant (ton bouton "App mobile")
window.installPWA = () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => (deferredPrompt = null));
  }
};
