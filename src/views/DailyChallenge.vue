<template>
	<div>
		<div class="top">
			<div class="page-title">{{ t("daily.title") }} {{ userName }}</div>
		</div>

		<v-card class="micro-card pa-5">
			<div class="page-subtitle">{{ t("daily.challenge") }}</div>

			<div v-if="errorMsg" style="color: #ef4444; font-weight: 700">
				{{ errorMsg }}
			</div>

			<div v-else style="font-size: 14px; color: #334155; font-weight: 700">
				{{ loading ? t("daily.loading") : challengeText }}
			</div>

			<v-btn
				block
				class="mt-4"
				:class="isDone ? 'btn-success' : 'btn-primary'"
				:color="undefined"
				:disabled="loading"
				@click="markDone"
			>
				<template v-if="isDone">
					<v-icon size="28">mdi-check-bold</v-icon>
				</template>
				<template v-else>{{ t("daily.todo") }}</template>
			</v-btn>
		</v-card>

		<v-card class="micro-card pa-5 mt-4">
			<div class="share-visual">
				<div
					class="flames-display"
					style="text-align: center; font-size: 46px; line-height: 1"
				>
					🔥 {{ flamesCount }}
				</div>
			</div>

			<v-btn class="btn-primary mt-4" block @click="$router.push('/share')">
				{{ t("daily.share") }}
			</v-btn>
		</v-card>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "@/lib/supabase";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const loading = ref(true);
const errorMsg = ref("");
const userName = ref("");

const assignment = ref(null);
const challengeText = ref("");
const isDone = ref(false);
const flamesCount = ref(0);

const shareRef = ref(null);
const baseUrl = "";

function todayISO() {
	return new Date().toISOString().slice(0, 10);
}

/* =========================
   A) SUPABASE HELPERS
   ========================= */
async function getUserOrThrow() {
	const { data, error } = await supabase.auth.getUser();
	if (error) throw error;
	if (!data?.user) throw new Error("Pas connecté");
	return data.user;
}

async function getOrCreateDailyAssignment(userId, day) {
	// 1) déjà assigné ?
	const { data: existing, error: exErr } = await supabase
		.from("daily_assignments")
		.select("day, challenge_id")
		.eq("user_id", userId)
		.eq("day", day)
		.maybeSingle();

	if (exErr) throw exErr;
	if (existing) return existing;

	// 2) pick random challenge actif
	const { data: list, error: listErr } = await supabase
		.from("challenges")
		.select("id, title_fr, description_fr")
		.eq("active", true);

	if (listErr) throw listErr;
	if (!list?.length) throw new Error("Aucun défi disponible");

	const pick = list[Math.floor(Math.random() * list.length)];

	// 3) insert assignation + retour de la ligne
	// Supabase ne renvoie des lignes après insert que si tu ajoutes `.select()` [page:2]
	const { data: created, error: insErr } = await supabase
		.from("daily_assignments")
		.insert({ user_id: userId, day, challenge_id: pick.id })
		.select("day, challenge_id")
		.single();

	if (insErr) throw insErr;

	// On garde le défi “pick” en mémoire pour éviter une requête de plus
	return { ...created, _picked: pick };
}

async function getChallengeText(challengeId) {
	const { data, error } = await supabase
		.from("challenges")
		.select("title_fr, description_fr")
		.eq("id", challengeId)
		.single();

	if (error) throw error;
	return data.description_fr || data.title_fr;
}

async function calculateCurrentStreak(userId) {
	// Récupère toutes les dates de completion, triées décroissant
	const { data: completions, error } = await supabase
		.from("daily_completions")
		.select("day")
		.eq("user_id", userId)
		.order("day", { ascending: false });

	if (error) throw error;
	if (!completions?.length) return 0;

	let streak = 0;
	const today = todayISO();
	let expectedDay = today;

	for (const comp of completions) {
		if (comp.day === expectedDay) {
			streak++;
			// Jour précédent attendu
			const d = new Date(expectedDay);
			d.setDate(d.getDate() - 1);
			expectedDay = d.toISOString().slice(0, 10);
		} else {
			// Trou détecté → arrêt
			break;
		}
	}

	return streak;
}

/* =========================
   B) LOAD SCREEN
   ========================= */
async function loadScreen() {
	loading.value = true;
	errorMsg.value = "";

	try {
		const user = await getUserOrThrow();

		const { data: profile, error: profileErr } = await supabase
			.from("user_profiles")
			.select("username")
			.eq("user_id", user.id)
			.maybeSingle();

		if (profileErr) throw profileErr;

		userName.value = profile.username;

		const day = todayISO();

		const a = await getOrCreateDailyAssignment(user.id, day);
		assignment.value = a;

		// Texte du défi
		if (a._picked) {
			challengeText.value = a._picked.description_fr || a._picked.title_fr;
		} else {
			challengeText.value = await getChallengeText(a.challenge_id);
		}

		// isDone aujourd’hui ?
		const { data: done, error: doneErr } = await supabase
			.from("daily_completions")
			.select("day")
			.eq("user_id", user.id)
			.eq("day", day)
			.maybeSingle(); // 0 ou 1 ligne [page:1]

		if (doneErr) throw doneErr;
		isDone.value = !!done;

		// flamesCount = nombre total de validations (V1 simple)
		flamesCount.value = await calculateCurrentStreak(user.id);
	} catch (e) {
		errorMsg.value = e?.message ?? String(e);
	} finally {
		loading.value = false;
	}
}

onMounted(loadScreen);

/* =========================
   C) ACTIONS
   ========================= */
async function markDone() {
	if (isDone.value) return;
	errorMsg.value = "";
	try {
		const user = await getUserOrThrow();
		if (!assignment.value) throw new Error("Défi pas chargé");

		const { error } = await supabase.from("daily_completions").insert({
			user_id: user.id,
			day: assignment.value.day,
			challenge_id: assignment.value.challenge_id,
		});

		if (error) throw error;

		isDone.value = true;
		flamesCount.value = await calculateCurrentStreak(user.id);
		window.dispatchEvent(new CustomEvent("challenge-completed"));
	} catch (e) {
		errorMsg.value = e?.message ?? String(e);
	}
}

async function onShareStory() {
	await shareRef.value?.shareImage();
}
</script>


<style scoped>
.top {
	margin: 6px 0 14px;
}
</style>