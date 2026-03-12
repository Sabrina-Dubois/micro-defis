<template>
	<div class="leaderboard-page">

		<div class="page-title mt-4 mb-4 title-with-icon">
			<span class="title-emoji">🏆</span>
			<span>{{ t("leaderboard.title") }}</span>
		</div>

		<!-- MODE SWITCH -->
		<div class="leaderboard-tabs mb-4 text-center">
			<v-btn-toggle v-model="mode" mandatory density="comfortable">
				<v-btn value="global">{{ t("leaderboard.tabs.global") }}</v-btn>
				<v-btn value="league">{{ t("leaderboard.tabs.league") }}</v-btn>
			</v-btn-toggle>
		</div>

		<!-- HEADER LIGUE -->
		<div v-if="mode === 'league'" class="league-header mb-3 text-center">
			<div class="league-title">{{ t("leaderboard.league.title", { league: leagueNameLabel }) }}</div>
			<div class="league-sub">
				{{ t("leaderboard.league.reset_in", { time: resetTime }) }} <!--• {{ leagueSubline }} -->
			</div>
		</div>

		<div v-if="mode === 'league'" class="league-switch mb-3">
			<v-btn-toggle v-model="selectedLeagueIndex" mandatory density="comfortable">
				<v-btn
					v-for="(name, idx) in LEAGUES_TOP_TO_BOTTOM"
					:key="name"
					:value="idx"
					:class="`league-chip-${name.toLowerCase()}`"
				>
					{{ t(`leaderboard.leagues.${name}`) }}
					<span v-if="idx === autoLeagueIndex" class="my-league-tag">• {{ t("leaderboard.league.my_league") }}</span>
				</v-btn>
			</v-btn-toggle>
		</div>

		<div v-if="mode === 'league'" class="league-zones mb-3">
			<div class="zone-pill up">{{ t("leaderboard.zones.up") }}</div>
			<div class="zone-pill down">{{ t("leaderboard.zones.down") }}</div>
		</div>

		<!-- PODIUM -->
		<v-card class="micro-card podium-card pa-4 mb-4">

			<div class="podium-grid">
				<div v-for="user in topThree" :key="user.id" class="podium-item" :class="`rank-${user.rank}`">
					<div class="medal">{{ user.medal }}</div>
					<div class="name">{{ user.name }}</div>

					<div class="stats">
						{{ t("leaderboard.stats", { xp: user.xp, flames: user.flames }) }}
					</div>
				</div>
			</div>

		</v-card>

		<!-- LISTE CLASSEMENT -->
		<v-card class="micro-card pa-2">

			<v-list bg-color="transparent">

				<v-list-item v-for="user in rankedUsers" :key="user.id" class="rank-row" :class="{
					me: user.isMe,
					'up-zone': mode === 'league' && getLeagueZone(user) === 'up',
					'down-zone': mode === 'league' && getLeagueZone(user) === 'down'
				}">

					<template #prepend>
						<div class="rank-num">#{{ user.rank }}</div>
					</template>

					<v-list-item-title class="font-weight-bold">
						{{ user.name }}

						<span v-if="user.isMe" class="me-badge">{{ t("leaderboard.badges.me") }}</span>
						<span v-if="mode === 'league' && getLeagueZone(user) === 'up'"
							class="zone-badge up">{{ t("leaderboard.badges.up") }}</span>
						<span v-if="mode === 'league' && getLeagueZone(user) === 'down'"
							class="zone-badge down">{{ t("leaderboard.badges.down") }}</span>

						<div v-if="user.isMe && meProgressMessage" class="progress-helper">
							{{ meProgressMessage }}
						</div>

					</v-list-item-title>

					<template #append>
						<div class="row-stats">
							<span>{{ user.xp }} {{ t("leaderboard.xp") }}</span>
							<span>🔥 {{ user.flames }}</span>
						</div>
					</template>

				</v-list-item>

			</v-list>
			<div v-if="shadowTarget" class="shadow-target">
				{{ t("leaderboard.shadow_target.title", { name: shadowTarget.name }) }}
				<br>
				{{ t("leaderboard.shadow_target.subtitle", { xp: shadowTarget.xpGap }) }}
			</div>
		</v-card>

	</div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed, watch } from "vue";
import { fetchLeaderboard } from "@/services/leaderboardService";
import { useUserStore } from "@/stores/userStore";
import { useI18n } from "vue-i18n";

const MIN_LEADERBOARD_SIZE = 20;
const USERS_PER_LEAGUE = 20;
const LEAGUES_TOP_TO_BOTTOM = ["or", "argent", "bronze"];
const USER_NAMES = [
	"AlexPro", "MilaFit", "TheoX", "Movixx", "Maxxou67",
	"EmmaRise", "Sprinter_22", "ChloeZen", "LucasBoost", "InesFlow",
	"HugoBoss", "Jade", "Evant", "Dash", "Driver44",
	"Sarahcroche", "Nathanael", "Manon", "Tom Sayer", "NinaEdge",
	"RayanMove", "Boss90", "Enzono", "Pika_", "Yanisss",
	"Drakiii", "AdamF", "EvaRise", "Samira", "Zoupette",
	"MathisStep", "Zoey", "IlyesCore", "Maya_Pou", "Saylor Moon",
	"Romane2", "TaoMove", "Ayana", "Kiki42", "Louna Z",
	"KylianSprint", "IrisRise", "NoemieFlow", "Mehdi Boubil", "Elisa",
	"RaphaelDash", "Pinkyy", "YasmineMove", "Sacha_bi", "Amber",
	"Sebast", "Lola", "GabY66", "Sofiapurple", "NaelDrive",
	"InayaSpark", "Theo", "John Doe", "Ruby", "Noah.34"
];

function seedFromString(str) {
	// Hash simple et stable basé sur les caractères du nom
	return str.split("").reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), 0);
}

function getBotXp(botName, baseXp, scope) {
	const seed = seedFromString(botName);

	// Vitesse unique par bot : 1 (lent) à 6 (rapide)
	const speed = (seed % 6) + 1;

	// Certains bots sont "actifs" seulement certaines heures
	// (basé sur leur seed → comportement stable et varié)
	const activeHoursPattern = (seed % 3) + 1; // 1, 2 ou 3 sessions/jour simulées

	// Heure courante arrondie à l'heure
	const hoursSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60));

	// XP gagné par heure active (variable selon scope)
	const xpPerActiveHour = scope === "league"
		? speed * 2        // ligue : gains plus modérés (semaine courte)
		: speed * 3;       // global : gains plus larges

	// Simulation d'activité : le bot ne gagne pas XP toutes les heures
	// mais seulement ~activeHoursPattern fois sur 8h (créneau naturel)
	const activeHours = Math.floor((hoursSinceEpoch * activeHoursPattern) / 8);

	// Plafond naturel pour éviter que les bots explosent le classement
	const cap = scope === "league" ? 196 : 320;
	const bonus = Math.min(cap, activeHours * xpPerActiveHour);

	return baseXp + bonus;
}

function getLeagueBotProfile(botName, index, totalBots) {
	const seed = seedFromString(botName);
	const rankFactor = totalBots <= 1 ? 1 : 1 - index / (totalBots - 1); // top -> 1, bottom -> 0

	// Modélise le scoring SQL hebdo:
	// points = 10 + bonus vitesse (0..6) + bonus niveau (0..6) + bonus flamme (0..6)
	const flames = Math.max(1, Math.round(4 + rankFactor * 44 + (seed % 5)));
	const streakBonus =
		flames >= 45 ? 6
			: flames >= 30 ? 4
			: flames >= 15 ? 2
			: flames >= 7 ? 1
			: 0;

	const completedDays = Math.min(7, Math.max(1, Math.round(2 + rankFactor * 5 + ((seed % 3) - 1))));
	const speedBonus = Math.max(0, Math.min(6, Math.round(1 + rankFactor * 4 + (seed % 3))));
	const difficultyBonus = Math.max(0, Math.min(6, Math.round(rankFactor * 4 + ((seed >> 2) % 3))));
	const dailyPoints = Math.min(28, 10 + speedBonus + difficultyBonus + streakBonus);
	const jitter = ((seed % 5) - 2); // -2..+2

	// max hebdo réaliste = 7 * 28 = 196
	const xp = Math.max(8, Math.min(196, completedDays * dailyPoints + jitter));
	return { xp, flames };
}

function addFictiveUsers(realUsers, scope, minSize = MIN_LEADERBOARD_SIZE) {
	const needed = Math.max(0, minSize - realUsers.length);
	if (needed === 0) return [];

	const usedNames = new Set(realUsers.map((u) => (u.name || "").toLowerCase()));
	const maxXp = Math.max(220, ...realUsers.map((u) => u.xp || 0));
	const step = 16;
	const range = 260;
	const startXp = Math.max(25, maxXp - range);

	const bots = [];
	let botCursor = 0;

	for (let i = 0; i < needed; i += 1) {
		let name = USER_NAMES[botCursor % USER_NAMES.length];
		botCursor += 1;
		let suffix = 2;
		while (usedNames.has(name.toLowerCase())) {
			name = `${USER_NAMES[(botCursor - 1) % USER_NAMES.length]} ${suffix}`;
			suffix += 1;
		}
		usedNames.add(name.toLowerCase());

		const baseXp = Math.max(8, startXp - i * step + ((i * 7) % 11));
		let xp;
		let flames;
		if (scope === "league") {
			const profile = getLeagueBotProfile(name, i, needed);
			xp = profile.xp;
			flames = profile.flames;
		} else {
			xp = getBotXp(name, baseXp, scope);
			flames = Math.max(1, Math.floor(xp / 24));
		}

		bots.push({
			id: `bot-${scope}-${i}-${name}`,
			user_id: null,
			name,
			xp,
			flames,
			isMe: false,
		});
	}

	return bots;
}

async function loadLeaderboard() {
	try {
		loading.value = true;

		const scope = mode.value === "league" ? "league" : "global";
		const limit = scope === "league" ? 200 : 50;
		const rows = await fetchLeaderboard(limit, scope);
		const realUsers = (rows || []).map((row, index) => {
			const rank = Number(row.rank ?? index + 1);
			const userId = row.user_id || row.id || null;
			const username = (row.username || row.name || "").toString().trim();
			return {
				id: userId || `row-${index}`,
				user_id: userId,
				rank,
				name: username || t("leaderboard.default_user"),
				xp: Number(row.xp || 0),
				flames: Number(row.flames || 0),
				isMe: row.isMe === true || (!!userId && userId === userStore.userId),
			};
		});
		const minSize = scope === "league"
			? USERS_PER_LEAGUE * LEAGUES_TOP_TO_BOTTOM.length
			: MIN_LEADERBOARD_SIZE;
		const bots = addFictiveUsers(realUsers, scope, minSize);

		leaderboard.value = [...realUsers, ...bots]
			.sort((a, b) => {
				if (b.xp !== a.xp) return b.xp - a.xp;
				if (b.flames !== a.flames) return b.flames - a.flames;
				return a.name.localeCompare(b.name, "fr");
			})
			.map((user, index) => {
				const rank = index + 1;
				return {
					...user,
					rank,
					medal: rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "",
				};
			});

	} catch (e) {
		console.error(e);
	} finally {
		loading.value = false;
	}
}

/*
|--------------------------------------------------------------------------
| STATE
|--------------------------------------------------------------------------
*/

const mode = ref("global");
const leaderboard = ref([]);
const loading = ref(false);
const userStore = useUserStore();
const { t } = useI18n();
const now = ref(new Date());
const selectedLeagueIndex = ref(1);
let resetTimer = null;

/*
|--------------------------------------------------------------------------
| COMPUTED
|--------------------------------------------------------------------------
*/

const leagueContext = computed(() => {
	if (mode.value !== "league") return null;
	const list = leaderboard.value;
	if (!list.length) return null;

	const meIndex = list.findIndex((u) => u.isMe);
	const safeIndex = meIndex >= 0 ? meIndex : USERS_PER_LEAGUE;
	const computedIndex = Math.min(
		LEAGUES_TOP_TO_BOTTOM.length - 1,
		Math.floor(safeIndex / USERS_PER_LEAGUE),
	);
	const leagueIndex = Math.min(
		LEAGUES_TOP_TO_BOTTOM.length - 1,
		Math.max(0, Number(selectedLeagueIndex.value ?? computedIndex)),
	);
	const start = leagueIndex * USERS_PER_LEAGUE;
	const end = start + USERS_PER_LEAGUE;

	const users = list.slice(start, end).map((user, index) => ({
		...user,
		rank: index + 1,
		medal: index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "",
	}));

	return {
		leagueName: LEAGUES_TOP_TO_BOTTOM[leagueIndex],
		leagueIndex,
		autoLeagueIndex: computedIndex,
		users,
	};
});

const autoLeagueIndex = computed(() => leagueContext.value?.autoLeagueIndex ?? 1);

const rankedUsers = computed(() =>
	mode.value === "league"
		? (leagueContext.value?.users || [])
		: leaderboard.value
);
const promotionSlots = 5;
const relegationSlots = 5;
const relegationStartRank = computed(() =>
	Math.max(1, rankedUsers.value.length - relegationSlots + 1)
);

const topThree = computed(() => rankedUsers.value.slice(0, 3));

const leagueName = computed(() => leagueContext.value?.leagueName || "argent");
const leagueNameLabel = computed(() => t(`leaderboard.leagues.${leagueName.value}`));
//const leagueSubline = computed(() => {
	//if (mode.value !== "league") return "";
	//if (leagueName.value === "Or") {
		//return "Top 5 = Or • Flop 5 ⬇ Argent";
	//}
	//if (leagueName.value === "Bronze") {
		//return "Top 5 ⬆ Argent • Flop 5 = Bronze";
	//}
	//return "Top 5 ⬆ Or • Flop 5 ⬇ Bronze";
//});

const resetTime = computed(() => {
	const current = now.value;
	const jsDay = current.getDay();
	const daysUntilNextMonday = ((8 - jsDay) % 7) || 7;

	const nextMonday = new Date(current);
	nextMonday.setDate(current.getDate() + daysUntilNextMonday);
	nextMonday.setHours(0, 0, 0, 0);

	const diffMs = Math.max(0, nextMonday.getTime() - current.getTime());
	const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
	const days = Math.floor(totalHours / 24);
	const hours = totalHours % 24;

	const daySuffix = t("leaderboard.time.days_short");
	const hourSuffix = t("leaderboard.time.hours_short");
	if (days > 0) return `${days}${daySuffix} ${hours}${hourSuffix}`;
	return `${hours}${hourSuffix}`;
});

const meProgressMessage = computed(() => {
	const list = rankedUsers.value;
	const meIndex = list.findIndex(u => u.isMe);

	if (meIndex <= 0) return "";

	const me = list[meIndex];
	const prev = list[meIndex - 1];

	if (!me || !prev) return "";

	const xpGap = prev.xp - me.xp + 1;
	if (xpGap <= 0) return "";

	return t("leaderboard.progress_helper", { xp: xpGap, rank: me.rank - 1 });
});

const shadowTarget = computed(() => {
	const list = rankedUsers.value;
	const meIndex = list.findIndex(u => u.isMe);

	if (meIndex <= 0) return null;

	const me = list[meIndex];
	const prev = list[meIndex - 1];

	if (!me || !prev) return null;

	return {
		name: prev.name,
		xpGap: prev.xp - me.xp + 1
	};
});

function getLeagueZone(user) {
	if (!user || mode.value !== "league") return "neutral";
	if (user.rank <= promotionSlots) return "up";
	if (user.rank >= relegationStartRank.value) return "down";
	return "neutral";
}

onMounted(() => {
	loadLeaderboard();
	resetTimer = window.setInterval(() => {
		now.value = new Date();
	}, 60 * 1000);
});

onUnmounted(() => {
	if (resetTimer) {
		clearInterval(resetTimer);
		resetTimer = null;
	}
});

watch(mode, () => {
	loadLeaderboard();
	if (mode.value !== "league") return;
	selectedLeagueIndex.value = autoLeagueIndex.value;
});
</script>

<style scoped>
.podium-card {
	background: var(--surface) !important;
	border: 1px solid var(--border) !important;
}

.leaderboard-tabs {
	display: flex;
	justify-content: center;
	padding: 4px 0;
}

.leaderboard-tabs :deep(.v-btn) {
	font-weight: 800;
	text-transform: none;
	border-radius: 999px !important;
	padding: 0 18px;
	margin: 0 6px;
	color: var(--text-primary);
}

.leaderboard-tabs :deep(.v-btn--active) {
	background: var(--primary-soft) !important;
	color: var(--primary) !important;
}

.leaderboard-tabs :deep(.v-btn-toggle) {
	gap: 10px;
	background: transparent !important;
	box-shadow: none !important;
}

.league-header {
	font-weight: 800;
}

.league-title {
	font-size: 18px;
	color: white;
}

.league-sub {
	font-size: 13px;
	color: white;
}

.league-switch {
	display: flex;
	justify-content: center;
}

.league-switch :deep(.v-btn-toggle) {
	background: transparent !important;
	box-shadow: none !important;
	gap: 7px;
}

.league-switch :deep(.v-btn) {
	border-radius: 999px !important;
	text-transform: none;
	font-weight: 800;
	color: var(--text-primary);
}

.league-switch :deep(.v-btn--active) {
	background: var(--primary-soft) !important;
	color: var(--primary) !important;
}

.league-switch :deep(.league-chip-or) {
	color: #d97706 !important;
}

.league-switch :deep(.league-chip-argent) {
	color: #6b7280 !important;
}

.league-switch :deep(.league-chip-bronze) {
	color: #b45309 !important;
}

.my-league-tag {
	margin-left: 6px;
	font-size: 10px;
	font-weight: 700;
	opacity: 0.8;
}

.league-zones {
	display: flex;
	gap: 8px;
	justify-content: center;
	flex-wrap: wrap;
}

.zone-pill {
	font-size: 11px;
	font-weight: 800;
	padding: 5px 10px;
	border-radius: 999px;
}

.zone-pill.up {
	color: #ffffff;
	background: rgba(22, 163, 74, 0.85);

}

.zone-pill.hold {
	color: #ffffff;
	background: #334155;
	border: 1px solid #1e293b;
}

.zone-pill.down {
	color: #ffffff;
	background:#dc2626;
}

.podium-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 10px;
}

.podium-item {
	border-radius: 14px;
	padding: 10px 8px;
	min-height: 112px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 4px;
	text-align: center;
	background: var(--surface);
}

.podium-item.rank-1 {
	background: rgba(245, 158, 11, 0.18);
}

.podium-item.rank-2 {
	background: rgba(148, 163, 184, 0.22);
}

.podium-item.rank-3 {
	background: rgba(180, 83, 9, 0.2);
}

.medal {
	font-size: 28px;
	line-height: 1;
}

.name {
	font-weight: 800;
}

.stats {
	font-size: 12px;
	font-weight: 700;
	color: var(--text-secondary);
}

.rank-row {
	border-radius: 12px;
	margin-bottom: 4px;
}

.rank-row:deep(.v-list-item__content) {
	min-width: 0;
}

.rank-row.up-zone {
	background: rgba(22, 163, 74, 0.18);
}

.rank-row.down-zone {
	background: rgba(220, 38, 38, 0.16);
}

.rank-row.me {
	background: linear-gradient(90deg,
			rgba(109, 40, 217, 0.18),
			rgba(249, 121, 34, 0.18));
	border-radius: 999px !important;
	overflow: hidden;
}

.rank-num {
	min-width: 34px;
	font-weight: 900;
}

.me-badge {
	margin-left: 8px;
	font-size: 12px;
	font-weight: 800;
	color: var(--primary);
}

.zone-badge {
	margin-left: 8px;
	font-size: 10px;
	font-weight: 800;
	padding: 2px 8px;
	border-radius: 999px;
	text-transform: uppercase;
	letter-spacing: 0.4px;
}

.zone-badge.up {
	color: #ffffff;
	background: #16a34a;
}

.zone-badge.down {
	color: #ffffff;
	background: #dc2626;
}

.row-stats {
	display: flex;
	gap: 10px;
	font-weight: 800;
	font-size: 13px;
}

.progress-helper {
	font-size: 12px;
	font-weight: 800;
	color: var(--primary);
	margin-top: 4px;
}

.shadow-target {
	text-align: center;
	font-size: 13px;
	font-weight: 800;
	color: var(--primary);
	padding: 14px;
	line-height: 1.4;
}
</style>
