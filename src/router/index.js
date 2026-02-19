import { createRouter, createWebHistory } from "vue-router";

import Login from "../views/Login.vue";
import AuthCallback from "../views/AuthCallback.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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

    { path: "/login", name: "login", component: Login },
    { path: "/auth/callback", component: AuthCallback },

    {
      path: "/daily",
      name: "daily",
      component: () => import("../views/DailyChallenge.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/share",
      name: "ShareStats",
      component: () => import("@/views/Share.vue"),
    },
    {
      path: "/calendar",
      name: "calendar",
      component: () => import("../views/Calendar.vue"),
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
    {
      path: "/premium",
      name: "premium",
      component: () => import("../views/Premium.vue"),
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
      path: "/reset-password",
      name: "resetPassword",
      component: () => import("@/views/ResetPassword.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/NotFound.vue"),
    },
  ],
});

import { supabase } from "../lib/supabase";

router.beforeEach(async (to) => {
  const { data } = await supabase.auth.getSession();
  const isAuthed = !!data.session;

  // Si connecté et va sur login → redirige vers daily
  if (to.path === "/login" && isAuthed) return "/daily";

  // Si connecté et va sur "/" → redirige vers daily
  if (to.path === "/" && isAuthed) return "/daily";

  // Si page protégée et pas connecté → login
  if (to.meta.requiresAuth && !isAuthed) {
    return { path: "/login", query: { redirect: to.fullPath } };
  }

  return true;
});

export default router;
