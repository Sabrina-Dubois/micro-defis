<template>
	<div class="profile-page">
		<template v-if="isPageReady">
			<!-- Header Profil -->
			<div class="center">
				<button
					type="button"
					class="avatar avatar-btn"
					aria-label="Changer l'avatar"
					title="Changer l'avatar"
					@click="changeAvatar"
				>
					{{ userStore.userAvatar }}
				</button>
				<div class="page-title">
					{{ userStore.userName }}
				</div>
				<div class="header-badges-row">
					<span class="rank-label">Rang</span>
					<div class="rank-pill">
						{{ statsStore.userTitle.icon }} {{ statsStore.userTitle.title }}
					</div>
					<div v-if="userStore.isPremium" class="premium-badge">
						👑 Premium
					</div>
				</div>

				<!--<div style="
					color: rgba(255, 255, 255, 0.85);
					font-weight: 700;
					font-size: 13px;
					margin-top: 6px;
				">
					{{ userStore.userEmail }}
				</div>-->
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

			<!-- Niveau & Progression — Option C intégrée ici -->
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
				<div class="badges-scroll">
					<div class="badges-grid">
						<div v-for="badge in badges" :key="badge.id" class="badge-item"
							:class="{ locked: !badge.unlocked, premium: badge.premiumOnly }">
							<span v-if="badge.premiumOnly" class="badge-crown">👑</span>
							<div class="badge-icon">{{ badge.icon }}</div>
							<div class="badge-name">{{ badge.label || t(badge.key) }}</div>
							<div class="badge-desc">{{ badge.description }}</div>
							<div v-if="badge.premiumOnly && !userStore.isPremium" class="badge-premium-lock">🔒 Premium
							</div>
						</div>
					</div>
				</div>
			</v-card>

			<!--<GoogleAd adSlot="2127045122" />-->

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
			<v-btn v-if="!userStore.isPremium" class="btn-primary mt-4" block to="/premium">
				{{ t("profil.premium.title") }}
			</v-btn>

			<div v-else class="premium-active">
				👑 Abonnement Premium actif
			</div>
		</template>

		<template v-else>
			<FlameLoader />
		</template>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import StatsCards from "@/components/StatsCards.vue";
//import GoogleAd from "@/components/GoogleAd.vue";
import FlameLoader from "@/components/FlameLoader.vue";

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
	{ id: 1, key: "profil.badges.badges_first", icon: "⭐️", description: "Valider ton 1er défi", unlocked: false, premiumOnly: false },
	{ id: 2, key: "profil.badges.badges_3days", icon: "🥉", description: "Série de 3 jours", unlocked: false, premiumOnly: false },
	{ id: 3, key: "profil.badges.badges_7days", icon: "⓻", description: "Série de 7 jours", unlocked: false, premiumOnly: false },
	{ id: 4, key: "profil.badges.badges_30days", icon: "⚡", description: "Série de 30 jours", unlocked: false, premiumOnly: false },
	{ id: 5, key: "profil.badges.badges_100", icon: "💯", description: "Atteindre 100 défis validés", unlocked: false, premiumOnly: false },
	{ id: 6, key: "profil.badges.badges_regular", icon: "📅", description: "Meilleure série de 14 jours", unlocked: false, premiumOnly: false },
	{ id: 7, key: "profil.badges.badges_champion", icon: "🏆", description: "Meilleure série de 50 jours", unlocked: false, premiumOnly: false },
	{ id: 8, key: "", label: "Inarrêtable", icon: "🔥", description: "Série de 100 jours", unlocked: false, premiumOnly: false },
	{ id: 9, key: "", label: "Marathon", icon: "🧱", description: "200 défis validés", unlocked: false, premiumOnly: false },
	{ id: 10, key: "", label: "Retour", icon: "🚀", description: "Revenir après 7 jours d’inactivité.", unlocked: false, premiumOnly: false },
	{ id: 11, key: "", label: "Noctambule", icon: "🌙", description: "Valider un défi tard le soir", unlocked: false, premiumOnly: false },
	{ id: 12, key: "", label: "Lève-tôt", icon: "⏰", description: "Valider un défi tôt le matin", unlocked: false, premiumOnly: false },
	{ id: 13, key: "", label: "Sauvé", icon: "🛟", description: "1 jour protégé par torche", unlocked: false, premiumOnly: true },
	{ id: 14, key: "", label: "Fidèle", icon: "👑", description: "Premium depuis 30 jours", unlocked: false, premiumOnly: true },
	{ id: 15, key: "", label: "Elite", icon: "🧠", description: "Premium depuis 60 jours", unlocked: false, premiumOnly: true },
	{ id: 16, key: "", label: "Gardien", icon: "🛡️", description: "Premium depuis 100 jours", unlocked: false, premiumOnly: true },
	{ id: 17, key: "", label: "Légende", icon: "🌟", description: "Premium depuis 200 jours", unlocked: false, premiumOnly: true },
]);

const unlockedBadges = computed(
	() => badges.value.filter((b) => b.unlocked).length
);

const premiumDays = computed(() => {
	if (!userStore.premiumSince) return 0

	const start = new Date(userStore.premiumSince)
	const now = new Date()

	return Math.floor((now - start) / (1000 * 60 * 60 * 24))
})

const totalBadges = computed(() => badges.value.length);

// ===== ACTIVITÉ (utilise le store) =====
const last7Days = computed(() => statsStore.getLast7Days());

// ===== MISE À JOUR DES BADGES =====
function updateBadges() {
	const byId = (id) => badges.value.find((b) => b.id === id);
	byId(1).unlocked = statsStore.totalCompleted >= 1;
	byId(2).unlocked = statsStore.currentStreak >= 3;
	byId(3).unlocked = statsStore.currentStreak >= 7;
	byId(4).unlocked = statsStore.currentStreak >= 30;
	byId(5).unlocked = statsStore.totalCompleted >= 100;
	byId(6).unlocked = statsStore.bestStreak >= 14;
	byId(7).unlocked = statsStore.bestStreak >= 50;
	byId(8).unlocked = statsStore.bestStreak >= 100;
	byId(9).unlocked = statsStore.totalCompleted >= 200;
	byId(10).unlocked = statsStore.totalCompleted >= 25 && statsStore.currentStreak <= 2;
	byId(11).unlocked = statsStore.totalCompleted >= 10;
	byId(12).unlocked = statsStore.totalCompleted >= 10;
	byId(13).unlocked = userStore.isPremium && statsStore.shieldProtectedDaysSet.size > 0;
	byId(14).unlocked = userStore.isPremium && premiumDays.value >= 30
	byId(15).unlocked = userStore.isPremium && premiumDays.value >= 60
	byId(16).unlocked = userStore.isPremium && premiumDays.value >= 100
	byId(17).unlocked = userStore.isPremium && premiumDays.value >= 200
}

// ===== CHANGER AVATAR =====
async function changeAvatar() {
	try {
		await userStore.changeAvatar();
	} catch (error) {
		console.error("❌ Erreur changeAvatar:", error);
	}
}

// ===== EVENT HANDLER =====
async function handleChallengeCompleted() {
	await statsStore.loadCompletions();
	updateBadges();
}

// ===== LIFECYCLE =====
onMounted(async () => {
	try {
		await userStore.loadUser();
		await statsStore.loadCompletions();
		updateBadges();
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

.avatar-btn {
	padding: 0;
}

.avatar:hover {
	transform: scale(1.05);
}

.badges-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 12px;
	margin-top: 8px;
}

.badges-scroll {
	max-height: 360px;
	overflow-y: auto;
	padding-right: 4px;
}

.badge-item {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 12px;
	border-radius: 12px;
	background: linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(147, 51, 234, 0.16));
	border: 1px solid rgba(245, 158, 11, 0.25);
	transition: all 0.2s;
}

.badge-item.premium {
	border: 1px solid rgba(245, 158, 11, 0.35);
}

.badge-crown {
	position: absolute;
	top: 4px;
	left: 6px;
	font-size: 12px;
	line-height: 1;
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

.badge-desc {
	margin-top: 4px;
	font-size: 10px;
	font-weight: 600;
	text-align: center;
	color: #64748b;
	line-height: 1.25;
}

.badge-premium-lock {
	margin-top: 4px;
	font-size: 10px;
	font-weight: 700;
	color: #f59e0b;
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

.premium-active {
	margin-top: 16px;
	text-align: center;
	font-weight: 700;
	color: #ff6b35;
}

.header-badges-row {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-top: 6px;
	flex-wrap: wrap;
	justify-content: center;
}

.rank-label {
	font-size: 11px;
	color: rgba(255, 255, 255, 0.55);
	font-weight: 600;
}

.rank-pill {
	background: rgba(255, 107, 53, 0.15);
	border: 1px solid rgba(255, 107, 53, 0.5);
	border-radius: 999px;
	padding: 3px 12px;
	font-size: 12px;
	font-weight: 700;
	color: #ff6b35;
}

.premium-badge {
	padding: 3px 10px;
	border-radius: 999px;
	background: rgba(255, 215, 0, 0.15);
	border: 1px solid rgba(255, 215, 0, 0.4);
	font-size: 12px;
	font-weight: 700;
	color: #ffd700;
}
</style>
