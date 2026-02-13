<template>
	<div class="share-page">
		<!-- Aperçu image -->
		<div class="preview-container">
			<canvas
				ref="canvas"
				width="1080"
				height="1350"
				class="preview-canvas"
			></canvas>
		</div>

		<!-- Boutons -->
		<div class="share-buttons">
			<v-btn block color="primary" @click="downloadImage">
				{{ t("share.download") }}
			</v-btn>

			<v-btn block color="secondary" @click="shareNow">
				{{ t("share.share") }}</v-btn
			>
		</div>

		<div v-if="infoMsg" class="info-msg">
			{{ infoMsg }}
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { supabase } from "@/lib/supabase";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();
const canvas = ref(null);
const infoMsg = ref("");

// Stats
const userName = ref(t("share.default_user"));
const todayChallenge = ref(t("share.default_challenge"));
const currentStreak = ref(0);
const bestStreak = ref(0);
const totalCompleted = ref(0);

onMounted(async () => {
	document.body.classList.add("share-mode");
	await loadStats();
	generateImage();
});

onUnmounted(() => {
	document.body.classList.remove("share-mode");
});

async function loadStats() {
	const { data: userData } = await supabase.auth.getUser();
	if (!userData?.user) {
		infoMsg.value = t("share.login_required");
		return;
	}

	const user = userData.user;

	const { data: profile } = await supabase
		.from("user_profiles")
		.select("username")
		.eq("user_id", user.id)
		.single();

	userName.value = profile?.username || t("share.default_user");

	// Completions
	const { data: completions } = await supabase
		.from("daily_completions")
		.select("day")
		.eq("user_id", user.id)
		.order("day", { ascending: false });

	if (completions) {
		totalCompleted.value = completions.length;

		let streak = 0;
		let expectedDay = new Date().toISOString().slice(0, 10);

		for (const c of completions) {
			if (c.day === expectedDay) {
				streak++;
				const d = new Date(expectedDay);
				d.setDate(d.getDate() - 1);
				expectedDay = d.toISOString().slice(0, 10);
			} else break;
		}

		currentStreak.value = streak;
		bestStreak.value = streak;
	}

	// Défi du jour (via daily_assignments → challenges)
	const today = new Date().toISOString().slice(0, 10);

	const { data: assignment } = await supabase
		.from("daily_assignments")
		.select(
			`
			challenges (
				title_fr,
				title_en
			)
		`
		)
		.eq("user_id", user.id)
		.eq("day", today)
		.single();

	todayChallenge.value =
		assignment?.challenges?.[`title_${locale.value}`] ||
		t("share.default_challenge");
}

/* ================= IMAGE ================= */

function generateImage() {
	if (!canvas.value) return;

	const ctx = canvas.value.getContext("2d");
	const w = 1080;
	const h = 1350;

	ctx.textAlign = "center";

	/* ========== FOND VIOLET ========== */
	const gradient = ctx.createLinearGradient(0, 0, 0, h);
	gradient.addColorStop(0, "#7c3aed");
	gradient.addColorStop(1, "#5b21b6");

	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, w, h);

	/* ========== PSEUDO ========== */
	ctx.fillStyle = "#ffffff";
	ctx.font = "bold 56px Arial";
	ctx.fillText("@" + userName.value, w / 2, 120);

	/* ========== CARTE DÉFI ========== */
	const challengeX = 80;
	const challengeY = 170;
	const challengeW = w - 160;
	const challengeH = 220;

	ctx.fillStyle = "#ffffff";
	ctx.beginPath();
	ctx.roundRect(challengeX, challengeY, challengeW, challengeH, 40);
	ctx.fill();

	ctx.fillStyle = "#6d28d9";
	ctx.font = "bold 60px Arial";
	ctx.fillText(t("share.day_challenge"), w / 2, challengeY + 60);

	ctx.fillStyle = "#64748b";
	ctx.font = "bold 70px Arial";
	wrapText(
		ctx,
		todayChallenge.value,
		w / 2,
		challengeY + 160,
		challengeW - 120,
		60
	);

	/* ========== GROSSE CARTE STREAK (PRINCIPALE) ========== */
	const streakX = 80;
	const streakY = 430;
	const streakW = w - 160;
	const streakH = 340;

	ctx.fillStyle = "#ffffff";
	ctx.beginPath();
	ctx.roundRect(streakX, streakY, streakW, streakH, 50);
	ctx.fill();

	ctx.fillStyle = "#6d28d9";
	ctx.font = "bold 180px Arial";
	ctx.fillText(currentStreak.value, w / 2, streakY + 210);

	ctx.fillStyle = "#64748b";
	ctx.font = "bold 46px Arial";
	ctx.fillText(t("share.streak_label"), w / 2, streakY + 280);

	/* ========== PETITES CARTES ========== */
	const smallW = (w - 200) / 2;
	const smallH = 200;
	const smallY = 810;

	// record
	ctx.fillStyle = "#ffffff";
	ctx.beginPath();
	ctx.roundRect(80, smallY, smallW, smallH, 40);
	ctx.fill();

	ctx.fillStyle = "#6d28d9";
	ctx.font = "bold 80px Arial";
	ctx.fillText(bestStreak.value, 80 + smallW / 2, smallY + 110);

	ctx.fillStyle = "#64748b";
	ctx.font = "bold 40px Arial";
	ctx.fillText(t("share.record"), 80 + smallW / 2, smallY + 160);

	// total validés
	ctx.fillStyle = "#ffffff";
	ctx.beginPath();
	ctx.roundRect(120 + smallW, smallY, smallW, smallH, 40);
	ctx.fill();

	ctx.fillStyle = "#6d28d9";
	ctx.font = "bold 80px Arial";
	ctx.fillText(totalCompleted.value, 120 + smallW + smallW / 2, smallY + 110);

	ctx.fillStyle = "#64748b";
	ctx.font = "bold 40px Arial";
	ctx.fillText(t("share.completed"), 120 + smallW + smallW / 2, smallY + 160);

	/* ========== BOUTON ========== */
	const btnX = w / 2 - 260;
	const btnY = 1060;
	const btnW = 520;
	const btnH = 100;

	ctx.fillStyle = "#ffffff";
	ctx.beginPath();
	ctx.roundRect(btnX, btnY, btnW, btnH, 50);
	ctx.fill();

	ctx.fillStyle = "#6d28d9";
	ctx.font = "bold 42px Arial";
	ctx.fillText(t("share.cta"), w / 2, btnY + 65);

	/* ========== URL ========== */
	ctx.fillStyle = "#e9d5ff";
	ctx.font = "bold 30px Arial";
	ctx.fillText(t("share.microdefis"), w / 2, 1240);
}

/* ================= HELPERS ================= */

function drawCard(ctx, x, y, width, height) {
	ctx.fillStyle = "rgba(255,255,255,0.95)";
	ctx.beginPath();
	ctx.roundRect(x, y, width, height, 30);
	ctx.fill();
}

function drawStat(ctx, emoji, value, label, x, y) {
	ctx.font = "50px Arial";
	ctx.fillStyle = "#ffffff";
	ctx.fillText(emoji, x, y);

	ctx.font = "bold 70px Arial";
	ctx.fillText(value, x, y + 90);

	ctx.font = "bold 26px Arial";
	ctx.fillText(label, x, y + 130);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
	const words = text.split(" ");
	let line = "";
	let currentY = y;

	for (let n = 0; n < words.length; n++) {
		const testLine = line + words[n] + " ";
		const metrics = ctx.measureText(testLine);
		if (metrics.width > maxWidth && n > 0) {
			ctx.fillText(line, x, currentY);
			line = words[n] + " ";
			currentY += lineHeight;
		} else {
			line = testLine;
		}
	}
	ctx.fillText(line, x, currentY);
}

/* ================= SHARE ================= */

function downloadImage() {
	if (!canvas.value) return;

	canvas.value.toBlob((blob) => {
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "microdefis-stats.png";
		a.click();
		URL.revokeObjectURL(url);
		infoMsg.value = t("share.image_downloaded");
	});
}

async function shareNow() {
	if (!canvas.value) return;

	canvas.value.toBlob(async (blob) => {
		const file = new File([blob], "mes-stats.png", {
			type: "image/png",
		});

		if (navigator.share && navigator.canShare({ files: [file] })) {
			try {
				await navigator.share({
					files: [file],
					title: t("share.share_title"),
				});
				infoMsg.value = t("share.shared");
				return;
			} catch {}
		}

		downloadImage();
	});
}
</script>

<style scoped>
.share-page {
	background: white;
	min-height: 100vh;
	padding: 20px;
}

.preview-container {
	border-radius: 20px;
	overflow: hidden;
	margin-bottom: 20px;
}

.preview-canvas {
	width: 100%;
	height: auto;
	display: block;
}

.share-buttons {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.info-msg {
	margin-top: 30%;
	text-align: center;
	font-weight: 600;
}
</style>