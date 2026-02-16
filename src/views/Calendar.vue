<template>
	<div class="calendar-page">
		<div class="top">
			<div class="page-title">{{ t("calendar.title") }}</div>
		</div>

		<!-- Stats -->
		<StatsCards class="pa-4 mb-4" :stats="[
				{ icon: '🔥', value: statsStore.currentStreak, label: t('calendar.actual_serie') },
				{ icon: '✅', value: statsStore.totalCompleted, label: t('calendar.days_completed') },
				{ icon: '🏆', value: statsStore.bestStreak, label: t('calendar.best_serie') },
			]" />
		<GoogleAd adSlot="3324576724" />

		<!-- Calendrier -->
		<v-card class="calendar-card pa-4">
			<!-- Header -->
			<div class="calendar-header mb-4">
				<div class="text-h5 font-weight-black text-center">
					{{ t("calendar.completed_streak") }}
				</div>
			</div>

			<!-- Navigation mois -->
			<div class="d-flex justify-space-between align-center mb-3">
				<v-btn icon="mdi-chevron-left" size="small" variant="text" @click="previousMonth"></v-btn>

				<div class="text-h7 font-weight-black text-capitalize">
					{{ monthLabel }}
				</div>

				<v-btn icon="mdi-chevron-right" size="small" variant="text" @click="nextMonth"></v-btn>
			</div>

			<!-- Jours de la semaine -->
			<v-row dense no-gutters class="mb-2">
				<v-col v-for="day in tm('calendar.weekdays')" :key="day" class="text-center">
					<div class="text-h7 font-weight-bold text-grey">{{ day }}</div>
				</v-col>
			</v-row>

			<!-- Grille des jours -->
			<v-row dense no-gutters>
				<v-col v-for="(day, dayIndex) in calendarDays" :key="dayIndex" cols="auto" style="width: 14.285%"
					class="d-flex justify-center mb-2">
					<!-- Jour vide -->
					<div v-if="!day.inMonth" style="width: 40px; height: 40px"></div>

					<!-- Jour avec contenu -->
					<v-sheet v-else :color="getDayColor(day)"
						class="d-flex align-center justify-center position-relative" rounded="circle" :height="40"
						:width="40" :elevation="day.done ? 2 : 0">
						<!-- V VERT pour jour validé -->
						<v-icon v-if="day.done" color="green" size="24"> mdi-check </v-icon>

						<!-- Numéro pour les autres jours -->
						<span v-else class="text-body-2 font-weight-medium" :class="getDayTextClass(day)">
							{{ day.label }}
						</span>
					</v-sheet>
				</v-col>
			</v-row>
		</v-card>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import StatsCards from "@/components/StatsCards.vue";
import GoogleAd from "@/components/GoogleAd.vue";

// ✅ IMPORT DU STORE
import { useStatsStore } from "@/stores/statsStore";

const route = useRoute();
const { t, tm, locale } = useI18n();

// ✅ INITIALISATION DU STORE
const statsStore = useStatsStore();

// ===== ÉTAT LOCAL (logique UI seulement) =====
const currentMonth = ref(new Date());

// ===== COMPUTED =====
const monthLabel = computed(() => {
	return currentMonth.value.toLocaleDateString(locale.value, {
		month: "long",
		year: "numeric",
	});
});

const calendarDays = computed(() => {
	const year = currentMonth.value.getFullYear();
	const month = currentMonth.value.getMonth();
	const firstDay = new Date(year, month, 1);
	const startDay = (firstDay.getDay() + 6) % 7; // Lundi = 0
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const today = new Date().toISOString().slice(0, 10);

	const days = [];

	// Jours vides au début
	for (let i = 0; i < startDay; i++) {
		days.push({ inMonth: false });
	}

	// Jours du mois
	for (let d = 1; d <= daysInMonth; d++) {
		const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(
			d
		).padStart(2, "0")}`;
		const isPast = iso < today;
		const isFuture = iso > today;

		// ✅ Utilise le store pour savoir si le jour est complété
		const isDone = statsStore.isCompletedDay(iso);

		days.push({
			label: d,
			date: iso,
			inMonth: true,
			done: isDone,
			missed: isPast && !isDone,
			isToday: iso === today,
			isFuture,
		});
	}
	return days;
});

// ===== FONCTIONS UI =====
function getDayColor(day) {
	if (day.done) return "green-lighten-3";
	if (day.missed) return "grey";
	return "grey-lighten-3";
}

function getDayTextClass(day) {
	if (day.missed) return "text-white";
	if (day.isFuture) return "text-grey-lighten-1";
	return "text-grey-darken-2";
}

function previousMonth() {
	currentMonth.value = new Date(
		currentMonth.value.getFullYear(),
		currentMonth.value.getMonth() - 1,
		1
	);
}

function nextMonth() {
	const now = new Date();
	const next = new Date(
		currentMonth.value.getFullYear(),
		currentMonth.value.getMonth() + 1,
		1
	);

	if (next <= now) {
		currentMonth.value = next;
	}
}

// ===== CHARGEMENT =====
async function loadCalendar() {
	try {
		// ✅ Le store gère tout le chargement
		await statsStore.loadCompletions();
	} catch (error) {
		console.error("💥 Erreur loadCalendar:", error);
	}
}

// ===== EVENT HANDLER =====
function handleChallengeCompleted() {
	// ✅ Recharger les stats quand un challenge est complété
	loadCalendar();
}

// ===== LIFECYCLE =====
onMounted(async () => {
	await loadCalendar();
	window.addEventListener("challenge-completed", handleChallengeCompleted);
});

onUnmounted(() => {
	window.removeEventListener("challenge-completed", handleChallengeCompleted);
});

// ===== WATCH ROUTE =====
watch(
	() => route.path,
	(newPath) => {
		if (newPath === "/calendar" || newPath.includes("calendar")) {
			loadCalendar();
		}
	}
);

// ===== EXPOSE (pour usage externe) =====
defineExpose({ loadCalendar });
</script>

<style scoped>
.calendar-page {
	padding: 12px;
	max-width: 520px;
	margin: 0 auto;
	position: relative;
	overflow-x: hidden; /* évite blocage horizontal */
}

.top {
	margin: 6px 0 14px;
}

.calendar-card {
	border-radius: 24px;
	overflow: visible;
	position: relative;
	z-index: 1;
}

.calendar-header {
	background-color: #f59e0b;
	color: white;
	padding: 12px;
	border-radius: 16px;
	text-align: center;
}

.weekdays-row .v-col {
	padding: 0 2px;
}

.days-grid .day-col {
	padding: 2px;
}

.day-cell {
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.empty-day {
	width: 40px;
	height: 40px;
}
</style>