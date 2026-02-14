<template>
	<div class="calendar-page">
		<div class="top">
			<div class="page-title">{{ t("calendar.title") }}</div>
		</div>

		<!-- Stats -->
		<StatsCards
			class="pa-4 mb-4"
			:stats="[
				{ icon: '🔥', value: currentStreak, label: t('calendar.actual_serie') },
				{ icon: '✅', value: totalDays, label: t('calendar.days_completed') },
				{ icon: '🏆', value: bestStreak, label: t('calendar.best_serie') },
			]"
		/>

		<!-- Pub Google -->
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
				<v-btn icon size="small" variant="text" @click="previousMonth">
					<v-icon>mdi-chevron-left</v-icon>
				</v-btn>

				<div class="text-h7 font-weight-black text-capitalize">
					{{ monthLabel }}
				</div>

				<v-btn icon size="small" variant="text" @click="nextMonth">
					<v-icon>mdi-chevron-right</v-icon>
				</v-btn>
			</div>

			<!-- Jours de la semaine -->
			<v-row dense no-gutters class="weekdays-row mb-2">
				<v-col
					v-for="day in tm('calendar.weekdays')"
					:key="day"
					class="text-center"
				>
					<div class="text-h7 font-weight-bold text-grey">{{ day }}</div>
				</v-col>
			</v-row>

			<!-- Grille des jours -->
			<v-row dense no-gutters class="days-grid">
				<v-col
					v-for="(day, idx) in calendarDays"
					:key="idx"
					class="day-col d-flex justify-center mb-2"
				>
					<div v-if="!day.inMonth" class="empty-day"></div>

					<v-sheet
						v-else
						:color="getDayColor(day)"
						class="day-cell d-flex align-center justify-center"
						rounded="circle"
						:elevation="day.done ? 2 : 0"
					>
						<v-icon v-if="day.done" color="green" size="24">mdi-check</v-icon>
						<span
							v-else
							class="text-body-2 font-weight-medium"
							:class="getDayTextClass(day)"
						>
							{{ day.label }}
						</span>
					</v-sheet>
				</v-col>
			</v-row>
		</v-card>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { supabase } from "@/lib/supabase";
import StatsCards from "@/components/StatsCards.vue";
import GoogleAd from "@/components/GoogleAd.vue";

const { t, tm, locale } = useI18n();

const completedDaysSet = ref(new Set());
const currentStreak = ref(0);
const bestStreak = ref(0);
const currentMonth = ref(new Date());
const totalDays = computed(() => completedDaysSet.value.size);

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
	for (let i = 0; i < startDay; i++) days.push({ inMonth: false });
	for (let d = 1; d <= daysInMonth; d++) {
		const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(
			d
		).padStart(2, "0")}`;
		const isPast = iso < today;
		const isFuture = iso > today;
		const isDone = completedDaysSet.value.has(iso);
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
	if (next <= now) currentMonth.value = next;
}

// ✅ Fix navigation blocking: utiliser onMounted + onUnmounted
let challengeListener;

async function loadCalendar() {
	const { data, error } = await supabase.auth.getUser();
	if (!data?.user || error) return;
	const user = data.user;

	const { data: completions } = await supabase
		.from("daily_completions")
		.select("day")
		.eq("user_id", user.id)
		.order("day", { ascending: false });

	if (!completions) return;
	completedDaysSet.value = new Set(completions.map((c) => c.day));

	// Calcul des streaks
	let streak = 0,
		maxStreak = 0,
		temp = 1;
	const today = new Date().toISOString().slice(0, 10);
	let expected = today;

	completions.forEach((c, i) => {
		if (c.day === expected) {
			streak++;
			const d = new Date(expected);
			d.setDate(d.getDate() - 1);
			expected = d.toISOString().slice(0, 10);
		}
		if (i < completions.length - 1) {
			const diff =
				(new Date(c.day) - new Date(completions[i + 1].day)) / 86400000;
			temp = diff === 1 ? temp + 1 : 1;
			maxStreak = Math.max(maxStreak, temp);
		}
	});

	currentStreak.value = streak;
	bestStreak.value = Math.max(maxStreak, streak);
}

onMounted(() => {
	loadCalendar();

	// Listener pour mise à jour automatique
	challengeListener = () => loadCalendar();
	window.addEventListener("challenge-completed", challengeListener);
});

onUnmounted(() => {
	// On retire le listener pour libérer la navigation
	if (challengeListener)
		window.removeEventListener("challenge-completed", challengeListener);
});
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