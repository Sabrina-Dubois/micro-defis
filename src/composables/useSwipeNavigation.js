// composables/useSwipeNavigation.js
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";

export function useSwipeNavigation() {
  const route = useRoute();
  const router = useRouter();

  // 🔥 Ordre des pages (correspond à ta bottom nav)
  const swipeRoutes = ["/daily", "/calendar", "/profile", "/settings"];

  const touchStartX = ref(0);
  const touchStartY = ref(0);
  const ignoreSwipe = ref(false);

  function isInteractiveTarget(target) {
    if (!target || !(target instanceof Element)) return false;
    return Boolean(
      target.closest("input, textarea, select, button, a, .v-input, .v-text-field, .v-btn, .swiper, .scrollable"),
    );
  }

  function normalizePath(path) {
    return (path || "").replace(/\/+$/, "") || "/";
  }

  function beginSwipe(target, x, y) {
    ignoreSwipe.value = isInteractiveTarget(target);
    if (ignoreSwipe.value) return;
    touchStartX.value = x;
    touchStartY.value = y;
  }

  function finishSwipe(x, y) {
    if (ignoreSwipe.value) {
      resetTouch();
      return;
    }

    const currentPath = normalizePath(route.path);
    if (!swipeRoutes.includes(currentPath)) {
      resetTouch();
      return;
    }

    const dx = x - touchStartX.value;
    const dy = y - touchStartY.value;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // ✅ Ignore si c'est plus un scroll vertical
    if (absDy > absDx) {
      resetTouch();
      return;
    }

    // ✅ Distance minimale de swipe
    if (absDx < 50) {
      resetTouch();
      return;
    }

    const currentIndex = swipeRoutes.indexOf(currentPath);

    // ✅ Boucle complète : daily → calendar → profile → settings → daily
    const nextIndex =
      dx < 0
        ? (currentIndex + 1) % swipeRoutes.length // 👈 gauche = suivant
        : (currentIndex - 1 + swipeRoutes.length) % swipeRoutes.length; // 👉 droite = précédent

    router.push(swipeRoutes[nextIndex]);
    resetTouch();
  }

  function onTouchStart(event) {
    if (event.touches.length !== 1) {
      ignoreSwipe.value = true;
      return;
    }
    beginSwipe(event.target, event.touches[0].clientX, event.touches[0].clientY);
  }

  function resetTouch() {
    ignoreSwipe.value = false;
    touchStartX.value = 0;
    touchStartY.value = 0;
  }

  function onTouchEnd(event) {
    if (!event.changedTouches?.length) return;
    finishSwipe(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
  }

  // 🎯 Initialisation automatique
  onMounted(() => {
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", resetTouch, { passive: true });
  });

  onUnmounted(() => {
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchend", onTouchEnd);
    window.removeEventListener("touchcancel", resetTouch);
  });

  return {
    swipeRoutes,
  };
}
