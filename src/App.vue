<template>
	<v-app>
		<!-- Consent dialog -->
		<ConsentDialog v-model:show="showConsent" />

		<!-- Contenu principal -->
		<v-main class="page">
			<div class="main-content">
				<!-- On affiche RouterView uniquement quand la session a été vérifiée -->
				<RouterView v-if="authChecked" />
				<div v-else class="loading-container">
					<!-- loader simple pendant que Supabase récupère la session -->
					Loading...
				</div>
			</div>
		</v-main>

		<!-- Bottom Nav -->
		<BottomNav v-if="showNav && authChecked" />
	</v-app>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import BottomNav from "./components/BottomNav.vue";
import ConsentDialog from "./components/ConsentDialog.vue";
import { useTheme } from "vuetify";
import { supabase } from "./lib/supabase";
import { useUserStore } from "@/stores/userStore";
import { useStatsStore } from "@/stores/statsStore";
import { useChallengeStore } from "@/stores/challengeStore";

// ------------------ ROUTE & NAV ------------------
const route = useRoute();
const router = useRouter();
const hiddenRoutes = ["/login", "/auth/callback"];
const swipeRoutes = ["/daily", "/calendar", "/profile", "/settings"];
const session = ref(null);
const showNav = computed(
	() => !hiddenRoutes.includes(route.path) && !!session.value,
);

// ------------------ THEME ------------------
const vuetifyTheme = useTheme();
const showConsent = ref(false);
let authSubscription = null;
let appVisibilityRefreshTimer = null;
let lastAppRefresh = 0;
const APP_REFRESH_INTERVAL = 30 * 1000;
const userStore = useUserStore();
const statsStore = useStatsStore();
const challengeStore = useChallengeStore();

// ------------------ SWIPE NAVIGATION ------------------
const touchStartX = ref(0);
const touchStartY = ref(0);
const ignoreSwipe = ref(false);

function isInteractiveTarget(target) {
	if (!target || !(target instanceof Element)) return false;
	return Boolean(
		target.closest(
			"input, textarea, select, button, a, .v-input, .v-text-field, .v-btn",
		),
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

	// Ignore si c'est plus vertical qu'horizontal
	if (absDy > absDx) {
		resetTouch();
		return;
	}

	// Distance minimale augmentée
	if (absDx < 50) {
		resetTouch();
		return;
	}

	const currentIndex = swipeRoutes.indexOf(currentPath);
	const nextIndex = dx < 0
		? (currentIndex + 1) % swipeRoutes.length
		: (currentIndex - 1 + swipeRoutes.length) % swipeRoutes.length;

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

async function refreshDailyDataOnReturn() {
	if (typeof document === "undefined") return;
	if (document.visibilityState !== "visible") return;
	if (!session.value) return;
	const now = Date.now();
	if (now - lastAppRefresh < APP_REFRESH_INTERVAL) return;
	lastAppRefresh = now;

	try {
		if (!userStore.userId) {
			await userStore.loadUser();
		}
		await statsStore.loadCompletions();
		await challengeStore.loadTodayChallenge();
	} catch (e) {
		console.error("Erreur refresh app visibility:", e);
	}
}

function handleAppVisibilityChange() {
	if (appVisibilityRefreshTimer) {
		clearTimeout(appVisibilityRefreshTimer);
	}
	appVisibilityRefreshTimer = setTimeout(refreshDailyDataOnReturn, 100);
}

onMounted(async () => {
	if (
		!localStorage.getItem("microdefis-consent") &&
		!hiddenRoutes.includes(route.path)
	) {
		showConsent.value = true;
	}
	const savedTheme = localStorage.getItem("theme") || "light";
	vuetifyTheme.change(savedTheme);

	window.addEventListener("touchstart", onTouchStart, { passive: true });
	window.addEventListener("touchend", onTouchEnd, { passive: true });
	window.addEventListener("touchcancel", resetTouch, { passive: true });
	window.addEventListener("focus", handleAppVisibilityChange);
	document.addEventListener("visibilitychange", handleAppVisibilityChange);

	const { data } = await supabase.auth.getSession();
	session.value = data.session;
	authChecked.value = true;

	const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
		if (event === "PASSWORD_RECOVERY") {
			router.push("/reset-password");
		}
		session.value = newSession;
		handleAppVisibilityChange();
		if (!newSession && route.path !== "/login") {
			router.replace("/login");
		}
	});
	authSubscription = authListener.subscription;
	handleAppVisibilityChange();
});

onUnmounted(() => {
	window.removeEventListener("touchstart", onTouchStart);
	window.removeEventListener("touchend", onTouchEnd);
	window.removeEventListener("touchcancel", resetTouch);
	window.removeEventListener("focus", handleAppVisibilityChange);
	document.removeEventListener("visibilitychange", handleAppVisibilityChange);
	if (appVisibilityRefreshTimer) {
		clearTimeout(appVisibilityRefreshTimer);
		appVisibilityRefreshTimer = null;
	}
	authSubscription?.unsubscribe?.();
	authSubscription = null;
});

const toggleTheme = () => {
	const newTheme =
		vuetifyTheme.global.name.value === "light" ? "dark" : "light";
	vuetifyTheme.change(newTheme);
	localStorage.setItem("theme", newTheme);
};

watch(
	() => vuetifyTheme.global.name.value,
	(newTheme) => {
		document.documentElement.setAttribute("data-theme", newTheme);
		localStorage.setItem("theme", newTheme);
	}
);

// ------------------ AUTH ------------------
const authChecked = ref(false);

defineExpose({ toggleTheme, session, authChecked });
</script>

<style scoped>
.loading-container {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100%;
	color: var(--text-primary);
	font-weight: 700;
	font-size: 18px;
}

.page {
	overscroll-behavior-x: none;
}
</style>
