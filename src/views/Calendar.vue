<template>
	<div>
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
		<GoogleAd adSlot="3324576724" />

		<!-- Calendrier manuel NON CLIQUABLE -->
		<v-card class="micro-card pa-4">
			<!-- Header -->
			<div class="pa-4 bg-yellow-darken-2 rounded mb-4">
				<div class="text-h5 font-weight-black text-white text-center">
					{{ t("calendar.completed_streak") }}
				</div>
			</div>

			<!-- Navigation mois -->
			<div class="d-flex justify-space-between align-center mb-3">
				<v-btn
					icon="mdi-chevron-left"
					size="small"
					variant="text"
					@click="previousMonth"
				></v-btn>

				<div class="text-h7 font-weight-black text-capitalize">
					{{ monthLabel }}
				</div>

				<v-btn
					icon="mdi-chevron-right"
					size="small"
					variant="text"
					@click="nextMonth"
				></v-btn>
			</div>

			<!-- Jours de la semaine -->
			<v-row dense no-gutters class="mb-2">
				<v-col
					v-for="day in tm('calendar.weekdays')"
					:key="day"
					class="text-center"
				>
					<div cxlass="text-h7 font-weight-bold text-grey">{{ day }}</div>
				</v-col>
			</v-row>

			<!-- Grille des jours -->
			<v-row dense no-gutters>
				<v-col
					v-for="(day, dayIndex) in calendarDays"
					:key="dayIndex"
					cols="auto"
					style="width: 14.285%"
					class="d-flex justify-center mb-2"
				>
					<!-- Jour vide -->
					<div v-if="!day.inMonth" style="width: 40px; height: 40px"></div>

					<!-- Jour avec contenu -->
					<v-sheet
						v-else
						:color="getDayColor(day)"
						class="d-flex align-center justify-center position-relative"
						rounded="circle"
						:height="40"
						:width="40"
						:elevation="day.done ? 2 : 0"
					>
						<!-- V VERT pour jour validé -->
						<v-icon v-if="day.done" color="green" size="24"> mdi-check </v-icon>

						<!-- Numéro pour les autres jours -->
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
import { ref, computed, onMounted, watch } from "vue";
import { supabase } from "@/lib/supabase";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import StatsCards from "@/components/StatsCards.vue";
import GoogleAd from "@/components/GoogleAd.vue";

const route = useRoute();
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
	const startDay = (firstDay.getDay() + 6) % 7;
	const daysInMonth = new Date(year, month + 1, 0).getDate();

	const today = new Date().toISOString().slice(0, 10);
	const days = [];

	for (let i = 0; i < startDay; i++) {
		days.push({ inMonth: false });
	}

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

	if (next <= now) {
		currentMonth.value = next;
	}
}

async function calculateStreaks(completions) {
	if (!completions || !completions.length) {
		currentStreak.value = 0;
		bestStreak.value = 0;
		return;
	}

	// Série actuelle
	let streak = 0;
	const today = new Date().toISOString().slice(0, 10);

	let expectedDay = today;

	for (const comp of completions) {
		if (comp.day === expectedDay) {
			streak++;
			const d = new Date(expectedDay);
			d.setDate(d.getDate() - 1);
			expectedDay = d.toISOString().slice(0, 10);
		} else {
			console.log(`❌ Pas de match, arrêt du streak`);
			break;
		}
	}

	currentStreak.value = streak;

	// Meilleure série
	let maxStreak = 0;
	let tempStreak = 1;

	for (let i = 0; i < completions.length - 1; i++) {
		const current = new Date(completions[i].day);
		const next = new Date(completions[i + 1].day);
		const diffDays = Math.floor((current - next) / (1000 * 60 * 60 * 24));

		if (diffDays === 1) {
			tempStreak++;
			maxStreak = Math.max(maxStreak, tempStreak);
		} else {
			console.log(`❌ Pas consécutif, reset tempStreak`);
			tempStreak = 1;
		}
	}

	bestStreak.value = Math.max(maxStreak, streak);
}

async function loadCalendar() {
	try {
		const { data, error } = await supabase.auth.getUser();

		if (error || !data?.user) {
			return;
		}

		const user = data.user;

		const response = await supabase
			.from("daily_completions")
			.select("day")
			.eq("user_id", user.id)
			.order("day", { ascending: false });

		if (response.error) {
			console.error("💥 Erreur chargement calendrier:", response.error);
			return;
		}

		if (response.data) {
			completedDaysSet.value = new Set(response.data.map((c) => c.day));

			await calculateStreaks(response.data);
		}
	} catch (e) {
		console.error("💥 Erreur catch:", e);
	}
}

onMounted(() => {
	loadCalendar();
	window.addEventListener("challenge-completed", loadCalendar);
});

watch(
	() => route.path,
	(newPath) => {
		if (newPath === "/calendar" || newPath.includes("calendar")) {
			loadCalendar();
		}
	}
);

defineExpose({ loadCalendar });
</script>


<style scoped>
.top {
	margin: 6px 0 14px;
}
</style>
