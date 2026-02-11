// plugins/vuetify.js
import "vuetify/styles";
import { createVuetify } from "vuetify";

export default createVuetify({
  theme: {
    defaultTheme: "light", // Par défaut light
    themes: {
      light: {
        dark: false,
        colors: {
          primary: "#F97316",
          secondary: "#6D28D9",
          surface: "#FFFFFF",
          background: "#f8fafc",
          "on-surface": "#0f172a",
          "on-background": "#0f172a",
        },
      },
      dark: {
        // ← THÈME DARK AJOUTÉ
        dark: true,
        colors: {
          primary: "#F97316",
          secondary: "#8b5cf6",
          surface: "rgba(15, 23, 42, 0.95)",
          background: "#0f172a",
          "on-surface": "#f8fafc",
          "on-background": "#f8fafc",
        },
      },
    },
  },
  defaults: {
    VCard: { rounded: "xl", elevation: 0 },
    VBtn: { rounded: "xl", size: "large", color: "primary" },
    VTextField: { variant: "solo", rounded: "xl", density: "comfortable" },
  },
});
