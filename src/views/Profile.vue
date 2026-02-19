<template>
	<div class="profile-page">
		<template v-if="isPageReady">
		<!-- Header Profil -->
		<div class="center">
			<div class="avatar" @click="changeAvatar">{{ userStore.userAvatar }}</div>
			<div class="page-title">
				{{ userStore.userName }}
			</div>
			<div style="
					color: rgba(255, 255, 255, 0.85);
					font-weight: 700;
					font-size: 13px;
				">
				{{ userStore.userEmail }}
			</div>
			<div style="
					color: rgba(255, 255, 255, 0.7);
					font-weight: 600;
					font-size: 12px;
					margin-top: 4px;
					margin-bottom: 12px;
				">
				{{ t("profil.member_since") }} {{ userStore.memberSince }}
			</div>
		</div>

		<!-- Stats Rapides -->
		<StatsCards :stats="[
				{ icon: '🔥', value: statsStore.currentStreak, label: t('profil.stats.streak') },
				{
					icon: '✅',
					value: statsStore.totalCompleted,
					label: t('profil.stats.completed'),
				},
				{ icon: '🏆', value: statsStore.bestStreak, label: t('profil.stats.best') },
			]" />

		<!-- Niveau & Progression -->
		<v-card class="micro-card fixed-card card-level pa-4 mt-4">
			<div class="d-flex justify-space-between align-center mb-2">
				<div class="page-subtitle">
					{{ t("profil.level.title") }} {{ statsStore.userLevel }}
				</div>
				<div style="font-weight: 700; font-size: 13px; color: #ff6b35">
					{{ statsStore.xpCurrentDisplay }} / {{ statsStore.xpNext }} XP
				</div>
			</div>
			<v-progress-linear :model-value="statsStore.xpProgress" color="deep-orange" height="12"
				rounded></v-progress-linear>
			<div style="
					font-size: 12px;
					color: #64748b;
					margin-top: 6px;
					font-weight: 600;
				">
				{{ statsStore.xpRemaining }} {{ t("profil.level.xp_next") }}
				{{ statsStore.userLevel + 1 }}
			</div>
		</v-card>

		<!-- Badges -->
		<v-card class="micro-card pa-4 mt-4">
			<div class="page-subtitle">
				{{ t("profil.badges.title") }} ({{ unlockedBadges }}/{{ totalBadges }})
			</div>
			<div class="badges-grid">
				<div v-for="badge in badges" :key="badge.id" class="badge-item" :class="{ locked: !badge.unlocked }">
					<div class="badge-icon">{{ badge.icon }}</div>
					<div class="badge-name">{{ t(badge.key) }}</div>
				</div>
			</div>
		</v-card>

		//<GoogleAd adSlot="2127045122" />

		<!-- Graphique Activité -->
		<v-card class="micro-card pa-4 mt-4">
			<div class="page-subtitle">{{ t("profil.activity.title") }}</div>
			<div class="activity-chart">
				<div v-for="(day, index) in last7Days" :key="index" class="activity-bar">
					<div class="bar" :style="{
				height: day.completed ? '80px' : '8px',
				background: day.completed ? '#ff6b35' : '#e2e8f0',
			}"></div>
					<div class="day-label">{{ day.label }}</div>
				</div>
			</div>
		</v-card>

		<!-- Bouton Premium -->
		<v-btn class="btn-primary mt-4" block to="/premium">
			{{ t("profil.premium.title") }}
		</v-btn>
		</template>

		<template v-else>
			<PageSkeleton :title="t('daily.loading')" :cards="2" />
		</template>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import StatsCards from "@/components/StatsCards.vue";
//import GoogleAd from "@/components/GoogleAd.vue";
import PageSkeleton from "@/components/PageSkeleton.vue";

// ✅ IMPORTS DES STORES
import { useUserStore } from "@/stores/userStore";
import { useStatsStore } from "@/stores/statsStore";

const { t } = useI18n();

// ✅ INITIALISATION DES STORES
const userStore = useUserStore();
const statsStore = useStatsStore();
const isPageReady = ref(false);

// ===== BADGES (logique locale) =====
const badges = ref([
	{ id: 1, key: "profil.badges.badges_first", icon: "⭐️", unlocked: false },
	{ id: 2, key: "profil.badges.badges_3days", icon: "🥉", unlocked: false },
	{ id: 3, key: "profil.badges.badges_7days", icon: "🔥", unlocked: false },
	{ id: 4, key: "profil.badges.badges_30days", icon: "⚡", unlocked: false },
	{ id: 5, key: "profil.badges.badges_100", icon: "💯", unlocked: false },
	{ id: 6, key: "profil.badges.badges_regular", icon: "📅", unlocked: false },
	{ id: 7, key: "profil.badges.badges_champion", icon: "🏆", unlocked: false },
]);

const unlockedBadges = computed(
	() => badges.value.filter((b) => b.unlocked).length
);

const totalBadges = computed(() => badges.value.length);

// ===== ACTIVITÉ (utilise le store) =====
const last7Days = computed(() => statsStore.getLast7Days());

// ===== MISE À JOUR DES BADGES =====
function updateBadges() {
	// ✅ Utilise les données du store
	badges.value[0].unlocked = statsStore.totalCompleted >= 1;
	badges.value[1].unlocked = statsStore.currentStreak >= 3;
	badges.value[2].unlocked = statsStore.currentStreak >= 7;
	badges.value[3].unlocked = statsStore.currentStreak >= 30;
	badges.value[4].unlocked = statsStore.totalCompleted >= 100;
	badges.value[5].unlocked = statsStore.bestStreak >= 14;
	badges.value[6].unlocked = statsStore.bestStreak >= 50;
}

// ===== CHANGER AVATAR =====
async function changeAvatar() {
	try {
		// ✅ Le store gère tout
		await userStore.changeAvatar();
	} catch (error) {
		console.error("❌ Erreur changeAvatar:", error);
	}
}

// ===== EVENT HANDLER =====
async function handleChallengeCompleted() {
	// ✅ Recharger les stats quand un challenge est complété
	await statsStore.loadCompletions();
	updateBadges();
}

// ===== LIFECYCLE =====
onMounted(async () => {
	try {
		// ✅ Charger les données depuis les stores
		await userStore.loadUser();
		await statsStore.loadCompletions();

		// Mettre à jour les badges
		updateBadges();

		// Écouter les événements
		window.addEventListener("challenge-completed", handleChallengeCompleted);
	} catch (error) {
		console.error("❌ Erreur chargement profil:", error);
	} finally {
		isPageReady.value = true;
	}
});

onUnmounted(() => {
	window.removeEventListener("challenge-completed", handleChallengeCompleted);
});
</script>

<style scoped>
.card-level {
	min-height: 120px;
	height: auto;
}

.center {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-top: 6px;
}

.avatar {
	width: 112px;
	height: 112px;
	border-radius: 999px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 44px;
	background: rgba(255, 255, 255, 0.22);
	border: 3px solid rgba(255, 255, 255, 0.45);
	backdrop-filter: blur(10px);
	cursor: pointer;
	transition: transform 0.2s;
}

.avatar:hover {
	transform: scale(1.05);
}

.badges-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 12px;
	margin-top: 12px;
}

.badge-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 12px;
	border-radius: 12px;
	background: rgba(255, 107, 53, 0.1);
	transition: all 0.2s;
}

.badge-item.locked {
	opacity: 0.3;
	filter: grayscale(1);
}

.badge-icon {
	font-size: 32px;
	margin-bottom: 6px;
}

.badge-name {
	font-size: 11px;
	font-weight: 700;
	text-align: center;
	color: #334155;
}

.activity-chart {
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
	height: 120px;
	gap: 8px;
	margin-top: 12px;
	padding-top: 12px;
}

.activity-bar {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-end;
	height: 100%;
	gap: 6px;
}

.bar {
	width: 100%;
	border-radius: 6px 6px 0 0;
	transition: all 0.3s;
}

.day-label {
	font-size: 11px;
	font-weight: 700;
	color: #64748b;
	flex-shrink: 0;
}

.mt-4 {
	margin-top: 16px;
}

.mt-3 {
	margin-top: 12px;
}

.profile-page {
	width: 100%;
}

@media (max-width: 600px) {
	.badges-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.badge-name {
		font-size: 10px;
	}
}

</style>
