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
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import BottomNav from "./components/BottomNav.vue";
import ConsentDialog from "./components/ConsentDialog.vue";
import { useTheme } from "vuetify";
import { supabase } from "./lib/supabase";

// ------------------ ROUTE & NAV ------------------
const route = useRoute();
const hiddenRoutes = ["/login", "/auth/callback"];
const showNav = computed(() => !hiddenRoutes.includes(route.path));

// ------------------ THEME ------------------
const vuetifyTheme = useTheme();
const showConsent = ref(false);

supabase.auth.onAuthStateChange((event, session) => {
	if (event === "PASSWORD_RECOVERY") {
		route.push("/reset-password");
	}
});

onMounted(() => {
	if (
		!localStorage.getItem("microdefis-consent") &&
		!hiddenRoutes.includes(route.path)
	) {
		showConsent.value = true;
	}
	const savedTheme = localStorage.getItem("theme") || "light";
	vuetifyTheme.change(savedTheme);
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
const authChecked = ref(false); //RouterView après avoir vérifié la session
const session = ref(null);

onMounted(async () => {
	// Affiche le consent
	if (
		!localStorage.getItem("microdefis-consent") &&
		!hiddenRoutes.includes(route.path)
	) {
		showConsent.value = true;
	}

	// Récupère la session Supabase
	const { data } = await supabase.auth.getSession();
	session.value = data.session;
	authChecked.value = true;

	// Écoute les changements de session (login/logout)
	supabase.auth.onAuthStateChange((_event, newSession) => {
		session.value = newSession;
	});
});

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
</style>
