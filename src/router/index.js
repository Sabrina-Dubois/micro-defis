import { createRouter, createWebHistory } from "vue-router";

import Login from "../views/Login.vue";
import AuthCallback from "../views/AuthCallback.vue";


// DÉFINITION DES ROUTES
// meta.requiresAuth = true  → l'utilisateur DOIT être connecté
// meta.requiresAdmin = true → l'utilisateur DOIT être admin

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Pages publiques (pas besoin d'être connecté) 
    {
      path: "/",
      name: "home",
      component: () => import("../views/Landing.vue"),
    },
    {
      path: "/landing",
      name: "landing",
      component: () => import("../views/Landing.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: Login,
    },
    {
      path: "/auth/callback",
      component: AuthCallback,
    },
    {
      path: "/premium",
      name: "premium",
      component: () => import("../views/Premium.vue"),
    },
    {
      path: "/premium/success",
      component: () => import("@/views/PremiumSuccess.vue"),
    },
    {
      path: "/share",
      name: "ShareStats",
      component: () => import("@/views/Share.vue"),
    },
    {
      path: "/help",
      name: "help",
      component: () => import("@/views/Help.vue"),
    },
    {
      path: "/terms",
      name: "terms",
      component: () => import("@/views/Terms.vue"),
    },
    {
      path: "/privacy",
      name: "privacy",
      component: () => import("@/views/Privacy.vue"),
    },
    {
      // requiresAuth: false = explicitement public (pas d'interception)
      path: "/reset-password",
      name: "resetPassword",
      component: () => import("@/views/ResetPassword.vue"),
      meta: { requiresAuth: false },
    },

    // Pages privées (connecté requis)
    {
      path: "/daily",
      name: "daily",
      component: () => import("../views/DailyChallenge.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/calendar",
      name: "calendar",
      component: () => import("../views/Calendar.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/leaderboard",
      name: "leaderboard",
      component: () => import("../views/Leaderboard.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("../views/Profile.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("../views/Settings.vue"),
      meta: { requiresAuth: true },
    },

    // Page admin (connecté + is_admin = true requis)
    {
      path: "/admin",
      name: "admin",
      component: () => import("@/views/AdminDashboard.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/NotFound.vue"),
    },
  ],
});

// GUARD DE NAVIGATION
// S'exécute AVANT chaque changement de page.
// Vérifie si l'utilisateur a le droit d'accéder à la route demandée.
import { supabase } from "../lib/supabase";

router.beforeEach(async (to) => {
  // 1. Récupère la session Supabase (utilisateur est connecté ?)
  const { data } = await supabase.auth.getSession();
  const isAuthed = !!data.session;

  // Cas spécial : l'utilisateur vient de se déconnecter (paramètre ?logged_out=1)
  // Dans ce cas on ne redirige pas automatiquement même s'il est encore en session
  const fromLogout = to.query?.logged_out === "1";

  // 2. Si déjà connecté et essaie d'aller sur /login → redirige vers l'app
  if (to.path === "/login" && isAuthed && !fromLogout) return "/daily";

  // 3. Si déjà connecté et essaie d'aller sur "/" → redirige vers l'app
  if (to.path === "/" && isAuthed) return "/daily";

  // 4. Si la page demande d'être connecté (requiresAuth) mais que l'utilisateur ne l'est pas
  //    → redirige vers /login en mémorisant la page demandée (pour y revenir après)
  if (to.meta.requiresAuth && !isAuthed) {
    return { path: "/login", query: { redirect: to.fullPath } };
  }

  // 5. Si la page demande d'être admin (requiresAdmin)
  //    → vérifie dans Supabase si l'utilisateur a is_admin = true
  if (to.meta.requiresAdmin && isAuthed) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("is_admin")
      .eq("user_id", data.session.user.id)
      .single();

    // Si pas admin → redirige vers la page principale
    if (!profile?.is_admin) return "/daily";
  }

  // 6. Tout est OK → laisse passer
  return true;
});

export default router;
