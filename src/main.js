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

console.log("App démarrée avec la langue :", i18n.global.locale.value);
