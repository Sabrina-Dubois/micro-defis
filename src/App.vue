<template>
	<v-app>
		<ConsentDialog v-model:show="showConsent" />
		<v-main class="page">
			<RouterView />
			<BottomNav v-if="showNav" />
		</v-main>
	</v-app>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import BottomNav from "./components/BottomNav.vue";
import ConsentDialog from "./components/ConsentDialog.vue";
import { useTheme } from "vuetify";
import { supabase } from "@/lib/supabase"; 

const route = useRoute();
const hiddenRoutes = ["/login", "/auth/callback"];
const showNav = computed(() => !hiddenRoutes.includes(route.path));

const vuetifyTheme = useTheme();
const showConsent = ref(false);

supabase.auth.onAuthStateChange((event, session) => {
	if (event === "PASSWORD_RECOVERY") {
		console.log("🔑 Reset password détecté → /reset-password");
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
	vuetifyTheme.change = savedTheme;
});

const toggleTheme = () => {
	const newTheme =
		vuetifyTheme.change === "light" ? "dark" : "light";
	vuetifyTheme.change = newTheme;
	localStorage.setItem("theme", newTheme);
};

watch(
	() => vuetifyTheme.change,
	(newTheme) => {
		document.documentElement.setAttribute("data-theme", newTheme);
		localStorage.setItem("theme", newTheme);
	}
);

defineExpose({ toggleTheme });
</script>
