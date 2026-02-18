<template>
	<div>
		<template v-if="isPageReady">
		<!-- Top -->
		<div class="top">
			<div class="page-title">
				{{ t("daily.title") }}<br /> {{ userStore.userName }}
			</div>
		</div>

		<!-- Carte du défi -->
		<v-card class="micro-card card-challenge pa-5 fixed-card mb-4">
			<div class="page-subtitle text-center"
				style="font-size: 30px !important;font-weight: 600; margin-bottom: 12px;">
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
					{{ challengeStore.loading ? t("daily.loading") : challengeStore.challengeTitle }}
				</div>

				<div v-if="challengeStore.challengeDescription"
					style="font-size: 20px; color: #64748b; font-weight: 500; text-align: center">
					{{ challengeStore.challengeDescription }}
				</div>
			</div>

			<!-- Bouton action -->
			<v-btn block class="mt-2" :class="challengeStore.isDone ? 'btn-success' : 'btn-primary'"
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
		</template>

		<template v-else>
			<PageSkeleton :title="t('daily.loading')" :cards="2" />
		</template>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import PWAButton from "@/components/PWAButton.vue";
import PageSkeleton from "@/components/PageSkeleton.vue";

// ✅ STORES
import { useUserStore } from "@/stores/userStore";
import { useStatsStore } from "@/stores/statsStore";
import { useChallengeStore } from "@/stores/challengeStore";
import { useSettingsStore } from "@/stores/settingsStore";

const { t } = useI18n();

const userStore = useUserStore();
const statsStore = useStatsStore();
const challengeStore = useChallengeStore();
const settingsStore = useSettingsStore();

// ✅ COMPUTED
const categories = computed(() => settingsStore.categories || []);
const isPageReady = ref(false);

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

// ===== WATCH PREFERENCES =====
// On initialise selectedCategories uniquement après que les préférences soient chargées
watch(
	() => settingsStore.preferredCategories,
	(newPref) => {
		if (newPref && newPref.length > 0) {
			selectedCategories.value = [...newPref];
		}
	},
	{ immediate: true }
);

// ===== LIFECYCLE =====
onMounted(async () => {
	try {
		await userStore.loadUser();
		await statsStore.loadCompletions();
		await settingsStore.loadPreferences();
		await challengeStore.loadTodayChallenge();
	} catch (e) {
		console.error("❌ Erreur chargement:", e);
	} finally {
		isPageReady.value = true;
	}
});
</script>

<style scoped>
.top {
	margin: 6px 0 14px;
}

.card-challenge {
	height: 260px;
}

.micro-card {
	border-radius: 24px;
	overflow: visible;
	z-index: 0;
	position: relative;
	/* ✅ ajouter */
	z-index: 100;

}

</style>
