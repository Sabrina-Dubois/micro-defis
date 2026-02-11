<template>
	<div>
		<!-- Header Profil -->
		<div class="center">
			<div class="avatar" @click="changeAvatar">{{ userAvatar }}</div>
			<div class="page-title">
				{{ userName }}
			</div>
			<div
				style="
					color: rgba(255, 255, 255, 0.85);
					font-weight: 700;
					font-size: 13px;
				"
			>
				{{ userEmail }}
			</div>
			<div
				style="
					color: rgba(255, 255, 255, 0.7);
					font-weight: 600;
					font-size: 12px;
					margin-top: 4px;
				"
			>
				{{ t("profil.member_since") }} {{ memberSince }}
			</div>
		</div>

		<!-- Stats Rapides (grille 3 colonnes) -->
		<StatsCards
			:stats="[
				{ icon: '🔥', value: currentStreak, label: t('profil.stats.streak') },
				{
					icon: '✅',
					value: totalCompleted,
					label: t('profil.stats.completed'),
				},
				{ icon: '🏆', value: bestStreak, label: t('profil.stats.best') },
			]"
		/>

		<!-- Niveau & Progression -->
		<v-card class="micro-card pa-4 mt-4">
			<div class="d-flex justify-space-between align-center mb-2">
				<div class="page-subtitle">
					{{ t("profil.level.title") }} {{ userLevel }}
				</div>
				<div style="font-weight: 700; font-size: 13px; color: #ff6b35">
					{{ xpCurrentDisplay }} / {{ xpNext }} XP
				</div>
			</div>
			<v-progress-linear
				:model-value="xpProgress"
				color="deep-orange"
				height="12"
				rounded
			></v-progress-linear>
			<div
				style="
					font-size: 12px;
					color: #64748b;
					margin-top: 6px;
					font-weight: 600;
				"
			>
				{{ xpRemaining }} {{ t("profil.level.xp_next") }} {{ userLevel + 1 }}
			</div>
		</v-card>

		<!-- Badges -->
		<v-card class="micro-card pa-4 mt-4">
			<div class="page-subtitle">
				{{ t("profil.badges.title") }} ({{ unlockedBadges }}/{{ totalBadges }})
			</div>
			<div class="badges-grid">
				<div
					v-for="badge in badges"
					:key="badge.id"
					class="badge-item"
					:class="{ locked: !badge.unlocked }"
				>
					<div class="badge-icon">{{ badge.icon }}</div>
					<div class="badge-name">{{ t(badge.key) }}</div>
				</div>
			</div>
		</v-card>

		<!-- Graphique Activité -->
		<v-card class="micro-card pa-4 mt-4">
			<div class="page-subtitle">{{ t("profil.activity.title") }}</div>
			<div class="activity-chart">
				<div
					v-for="(day, index) in last7Days"
					:key="index"
					class="activity-bar"
				>
					<div
						class="bar"
						:style="{
							height: day.completed ? '80px' : '8px',
							background: day.completed ? '#ff6b35' : '#e2e8f0',
						}"
					></div>
					<div class="day-label">{{ day.label }}</div>
				</div>
			</div>
		</v-card>

		<!-- Bouton Premium -->
		<v-btn class="btn-primary mt-4" block to="/premium">
			{{ t("profil.premium.title") }}
		</v-btn>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { supabase } from "@/lib/supabase";
import StatsCards from "@/components/StatsCards.vue";

// USER STAT : authe -> Supabase
const authUser = ref(null);
const { t } = useI18n();

// DONNÉES DE PROFIL
const userName = ref("Username");
const userEmail = ref("");
const userAvatar = ref("👤");
const memberSince = ref("...");

// AVATARS
const avatars = ["🙂", "😎", "🦄", "🚀", "⭐", "🔥", "💪", "🌟", "⚡", "🎉"];

//STATS PRINCIPALES
const currentStreak = ref(0);
const totalCompleted = ref(0);
const bestStreak = ref(0);

// XP & NIVEAU
const userLevel = ref(1);
const xpCurrentDisplay = ref(0);
const xpNext = ref(100);

const xpProgress = computed(
	() => (xpCurrentDisplay.value / xpNext.value) * 100
);

const xpRemaining = computed(() => xpNext.value - xpCurrentDisplay.value);

// BADGES
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

// ACTIVITÉ
const last7Days = ref([]);

// LOAD PROFILE
async function loadProfile() {
	/* ----- RÉCUPÉRATION USER AUTH ----- */
	const { data, error } = await supabase.auth.getUser();
	if (error || !data?.user) return;

	authUser.value = data.user;
	userEmail.value = data.user.email;

	const createdAt = new Date(data.user.created_at);
	memberSince.value = createdAt.toLocaleDateString("fr-FR", {
		month: "long",
		year: "numeric",
	});

	/* ----- PROFIL PUBLIC ----- */
	const { data: profile, error: profileError } = await supabase
		.from("user_profiles")
		.select("username, avatar_emoji")
		.eq("user_id", authUser.value.id)
		.single();

	if (profileError) return;

	userName.value = profile.username || "Username";
	userAvatar.value = profile.avatar_emoji || "👤";

	/* ----- COMPLETIONS ----- */
	const { data: completions } = await supabase
		.from("daily_completions")
		.select("day")
		.eq("user_id", authUser.value.id)
		.order("day", { ascending: false });

	if (!completions) return;

	const completionsList = completions || [];
	totalCompleted.value = completions.length;

	/* ----- STREAK ACTUEL ----- */
	let streak = 0;
	let expectedDay = new Date().toISOString().slice(0, 10);

	for (const c of completionsList) {
		if (c.day === expectedDay) {
			streak++;
			const d = new Date(expectedDay);
			d.setDate(d.getDate() - 1);
			expectedDay = d.toISOString().slice(0, 10);
		} else break;
	}

	currentStreak.value = streak;

	/* ----- BEST STREAK ----- */
	let maxStreak = 0;
	let temp = 1;

	for (let i = 0; i < completionsList.length - 1; i++) {
		const a = new Date(completionsList[i].day);
		const b = new Date(completionsList[i + 1].day);
		const diff = (a - b) / 86400000;

		if (diff === 1) {
			temp++;
			maxStreak = Math.max(maxStreak, temp);
		} else temp = 1;
	}

	bestStreak.value = Math.max(maxStreak, streak);

	/* ----- XP & NIVEAU ----- */
	const xpTotal = totalCompleted.value * 15;
	userLevel.value = Math.floor(xpTotal / 100) + 1;
	xpCurrentDisplay.value = xpTotal % 100;

	/* ----- BADGES ----- */
	badges.value[0].unlocked = totalCompleted.value >= 1;
	badges.value[1].unlocked = currentStreak.value >= 3;
	badges.value[2].unlocked = currentStreak.value >= 7;
	badges.value[3].unlocked = currentStreak.value >= 30;
	badges.value[4].unlocked = totalCompleted.value >= 100;
	badges.value[5].unlocked = bestStreak.value >= 14;
	badges.value[6].unlocked = bestStreak.value >= 50;

	/* ----- ACTIVITÉ : 7 DERNIERS JOURS ----- */
	/* ----- ACTIVITÉ : 7 DERNIERS JOURS ----- */
	const completedDates = new Set(completionsList.map((c) => c.day));
	last7Days.value = [];

	// Fonction pour obtenir la date locale au format YYYY-MM-DD
	function getLocalDateString(date) {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	}

	// Les 7 derniers jours glissants (aujourd'hui - 6 jours)
	for (let i = 6; i >= 0; i--) {
		const d = new Date();
		d.setDate(d.getDate() - i);
		const ds = getLocalDateString(d); // ✅ Utilise l'heure locale

		const dayNum = d.getDay();
		const labelMap = ["D", "L", "M", "M", "J", "V", "S"];

		last7Days.value.push({
			label: labelMap[dayNum],
			completed: completedDates.has(ds),
			date: ds,
			dayName: [
				"Dimanche",
				"Lundi",
				"Mardi",
				"Mercredi",
				"Jeudi",
				"Vendredi",
				"Samedi",
			][dayNum], // Pour debug
		});
	}
}

// CHANGE AVATAR
async function changeAvatar() {
	if (!authUser.value) return;

	const idx = avatars.indexOf(userAvatar.value);
	const nextAvatar = avatars[(idx + 1) % avatars.length];

	const { error } = await supabase
		.from("user_profiles")
		.update({
			avatar_emoji: nextAvatar,
			updated_at: new Date().toISOString(),
		})
		.eq("user_id", authUser.value.id);

	if (!error) userAvatar.value = nextAvatar;
}

// EVENTS
function handleChallengeCompleted() {
	loadProfile();
}

onMounted(() => {
	loadProfile();
	window.addEventListener("challenge-completed", handleChallengeCompleted);
});

onUnmounted(() => {
	window.removeEventListener("challenge-completed", handleChallengeCompleted);
});
</script>

<style scoped>
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
</style>