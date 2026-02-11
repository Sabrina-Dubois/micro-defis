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

const route = useRoute();
const hiddenRoutes = ["/login", "/auth/callback"];
const showNav = computed(() => !hiddenRoutes.includes(route.path));

const vuetifyTheme = useTheme();
const showConsent = ref(false);

onMounted(() => {
	if (
		!localStorage.getItem("microdefis-consent") &&
		!hiddenRoutes.includes(route.path)
	) {
		showConsent.value = true;
	}
	const savedTheme = localStorage.getItem("theme") || "light";
	vuetifyTheme.global.name.value = savedTheme;
});

const toggleTheme = () => {
	const newTheme =
		vuetifyTheme.global.name.value === "light" ? "dark" : "light";
	vuetifyTheme.global.name.value = newTheme;
	localStorage.setItem("theme", newTheme);
};

watch(
	() => vuetifyTheme.global.name.value,
	(newTheme) => {
		document.documentElement.setAttribute("data-theme", newTheme);
		localStorage.setItem("theme", newTheme);
	}
);

defineExpose({ toggleTheme });
</script>
