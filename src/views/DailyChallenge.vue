<template>
	<div>
		<div class="top">
			<div class="page-title">
				{{ t("daily.title") }}<br /> {{ userStore.userName }}
			</div>
		</div>

		<!-- Catégories -->
		<div class="mb-3">
			<v-chip v-for="cat in categories" :key="cat.id"
				:color="selectedCategories.includes(cat.id) ? 'primary' : 'grey lighten-2'" @click="toggleCategory(cat)"
				:disabled="cat.premium && !userStore.isPremium" class="ma-1">
				{{ cat.name }} <span v-if="cat.premium">🔒</span>
			</v-chip>
		</div>

		<!-- Carte du défi -->
		<v-card class="micro-card pa-5 fixed-card mb-4">
			<div class="page-subtitle text-center" style="font-size: 28px; font-weight: 700; margin-bottom: 12px;">
				{{ t("daily.challenge") }}
			</div>

			<!-- Chips niveau + catégorie -->
			<div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 10px;">
				<v-chip color="primary" variant="flat" size="small">
					{{ t("daily.level") }} {{ challengeStore.challengeLevel }}
				</v-chip>
				<v-chip color="deep-purple" variant="flat" size="small">
					{{ challengeStore.challengeCategory }}
				</v-chip>
			</div>

			<!-- Erreur -->
			<div v-if="challengeStore.error" style="color: #ef4444; font-weight: 700">
				{{ challengeStore.error }}
			</div>

			<!-- Contenu -->
			<div v-else>
				<div style="font-size: 30px; font-weight: 800; color: #0f172a; margin-bottom: 6px; text-align: center">
					{{
						challengeStore.loading
							? t("daily.loading")
							: challengeStore.challengeTitle
					}}
				</div>

				<div v-if="challengeStore.challengeDescription"
					style="font-size: 20px; color: #64748b; font-weight: 500; text-align: center">
					{{ challengeStore.challengeDescription }}
				</div>
			</div>

			<!-- Bouton action -->
			<v-btn block class="mt-4" :class="challengeStore.isDone ? 'btn-success' : 'btn-primary'"
				:disabled="challengeStore.loading" @click="markDone">
				<template v-if="challengeStore.isDone">
					<v-icon size="28">mdi-check-bold</v-icon>
				</template>
				<template v-else>{{ t("daily.todo") }}</template>
			</v-btn>
		</v-card>

		<!-- Carte des flammes / partage -->
		<v-card class="micro-card pa-5 mt-4">
			<div class="share-visual">
				<div class="flames-display" style="text-align: center; font-size: 46px; line-height: 1">
					🔥 {{ statsStore.currentStreak }}
				</div>
			</div>

			<v-btn class="btn-primary mt-4" block @click="$router.push('/share')">
				{{ t("daily.share") }}
			</v-btn>
		</v-card>

		<!-- Bouton PWA -->
		<PWAButton />
	</div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import PWAButton from "@/components/PWAButton.vue";

// ✅ STORES
import { useUserStore } from "@/stores/userStore";
import { useStatsStore } from "@/stores/statsStore";
import { useChallengeStore } from "@/stores/challengeStore";
import { useSettingsStore } from "@/stores/settingsStore";

const { t, locale } = useI18n();
const userStore = useUserStore();
const statsStore = useStatsStore();
const challengeStore = useChallengeStore();
const settingsStore = useSettingsStore();

// ✅ COMPUTED
const categories = computed(() => settingsStore.categories || []);
const preferredCategories = computed(() => settingsStore.preferredCategories || []);

// ⚡️ État local pour le multi-select des catégories
const selectedCategories = ref([]);

// ===== FUNCTIONS =====
function toggleCategory(cat) {
	const idx = selectedCategories.value.indexOf(cat.id);
	if (idx >= 0) selectedCategories.value.splice(idx, 1);
	else selectedCategories.value.push(cat.id);
}

async function markDone() {
	if (challengeStore.isDone) return;
	try {
		await challengeStore.markAsCompleted();
	} catch (e) {
		console.error("❌ Erreur markDone:", e);
	}
}

// ===== LIFECYCLE =====
onMounted(async () => {
	try {
		await userStore.loadUser();
		await statsStore.loadCompletions();
		await settingsStore.loadPreferences();
		await challengeStore.loadTodayChallenge();

		// ⚡️ Initialiser selectedCategories avec les préférences de l'utilisateur
		selectedCategories.value = settingsStore.preferredCategories || [];
	} catch (e) {
		console.error("❌ Erreur chargement:", e);
	}
});

// ✅ WATCH : Rafraîchir le challenge quand la langue change
watch(
	() => settingsStore.language,
	(newLang) => {
		locale.value = newLang; // ← ça met à jour les labels
		challengeStore.refreshLanguage(); // si tu veux recharger les contenus du challenge
	}
);
</script>

<style scoped>
.top {
	margin: 6px 0 14px;
}
</style>