<template>
	<div class="share-page">
		<div class="preview-container" @click="handleImageClick">
			<canvas ref="canvas" width="1080" height="1350" class="preview-canvas"></canvas>

			<div class="clickable-cta" @click.stop="goToApp">
				<span class="cta-hint">👆 Clique pour rejoindre</span>
			</div>
		</div>

		<div class="share-buttons">
			<v-btn block size="x-large" @click="shareNow" class="share-btn-primary">
				<v-icon left>mdi-share-variant</v-icon>
				{{ t("share.share") }}
			</v-btn>

			<v-btn block variant="outlined" class="download-btn-primary" @click="downloadImage">
				<v-icon left>mdi-download</v-icon>
				{{ t("share.download") }}
			</v-btn>
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
import QRCode from "qrcode";

const { t, locale } = useI18n();
const canvas = ref(null);
const infoMsg = ref("");

// Stats
const userName = ref(t("share.default_user"));
const todayChallenge = ref(t("share.default_challenge"));
const currentStreak = ref(0);
const bestStreak = ref(0);
const totalCompleted = ref(0);

const APP_URL = "https://micro-defis.vercel.app";

onMounted(async () => {
	document.body.classList.add("share-mode");
	await loadStats();
	await generateImage();
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

	const today = new Date().toISOString().slice(0, 10);

	const { data: assignment } = await supabase
		.from("daily_assignments")
		.select(`
      challenges (
        title_fr,
        title_en
      )
    `)
		.eq("user_id", user.id)
		.eq("day", today)
		.single();

	todayChallenge.value =
		assignment?.challenges?.[`title_${locale.value}`] ||
		t("share.default_challenge");
}

/* ================= IMAGE ================= */
async function generateImage() {
	if (!canvas.value) return;

	const ctx = canvas.value.getContext("2d");
	const w = 1080;
	const h = 1350;

	ctx.textAlign = "center";

	// ===== Fond dégradé =====
	const gradient = ctx.createLinearGradient(0, 0, w, h);
	gradient.addColorStop(0, "#7c3aed");
	gradient.addColorStop(0.5, "#a78bfa");
	gradient.addColorStop(1, "#7c3aed");
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, w, h);

	// ===== Motif de fond =====
	ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
	for (let i = 0; i < 20; i++) {
		const x = Math.random() * w;
		const y = Math.random() * h;
		const radius = Math.random() * 100 + 50;
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, Math.PI * 2);
		ctx.fill();
	}

	// ===== Logo/Titre =====
	ctx.fillStyle = "#ffffff";
	ctx.font = "bold 80px Arial";
	ctx.fillText("MicroDéfis", w / 2, 100);

	// ===== Pseudo =====
	ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
	ctx.font = "bold 48px Arial";
	ctx.fillText("@" + userName.value, w / 2, 170);

	// ===== Carte Défi du jour =====
	const challengeX = 60;
	const challengeY = 220;
	const challengeW = w - 120;
	const challengeH = 200;

	ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
	ctx.shadowBlur = 20;
	ctx.shadowOffsetY = 10;

	ctx.fillStyle = "#ffffff";
	ctx.beginPath();
	ctx.roundRect(challengeX, challengeY, challengeW, challengeH, 30);
	ctx.fill();

	ctx.shadowColor = "transparent";
	ctx.shadowBlur = 0;
	ctx.shadowOffsetY = 0;

	// Titre "Défi du jour"
	ctx.fillStyle = "#f97922";
	ctx.font = "bold 80px Arial";
	ctx.fillText("🎯 " + t("share.day_challenge"), w / 2, challengeY + 70);

	// Texte du défi avec espace
	ctx.fillStyle = "#334155";
	ctx.font = "600 60px Arial";
	wrapText(ctx, todayChallenge.value, w / 2, challengeY + 150, challengeW - 80, 60);

	// ===== Carte Streak =====
	const streakX = 60;
	const streakY = 450;
	const streakW = w - 120;
	const streakH = 260; // plus compact

	ctx.shadowColor = "rgba(0,0,0,0.2)";
	ctx.shadowBlur = 20;
	ctx.shadowOffsetY = 10;

	ctx.fillStyle = "#ffffff";
	ctx.beginPath();
	ctx.roundRect(streakX, streakY, streakW, streakH, 30);
	ctx.fill();

	ctx.shadowColor = "transparent";
	ctx.shadowBlur = 0;
	ctx.shadowOffsetY = 0;

	ctx.fillStyle = "#f97922";
	ctx.font = "bold 150px Arial";
	ctx.fillText(currentStreak.value, w / 2, streakY + 150);

	ctx.fillStyle = "#64748b";
	ctx.font = "bold 40px Arial";
	ctx.fillText("🔥 jours de streak", w / 2, streakY + 225);

	// ===== Petites cartes =====
	const smallW = (w - 160) / 2;
	const smallH = 170;
	const smallY = 750;

	// Record
	ctx.shadowColor = "rgba(0,0,0,0.15)";
	ctx.shadowBlur = 15;
	ctx.shadowOffsetY = 8;
	ctx.fillStyle = "#ffffff";
	ctx.beginPath();
	ctx.roundRect(60, smallY, smallW, smallH, 25);
	ctx.fill();
	ctx.shadowColor = "transparent";

	ctx.fillStyle = "#f97922";
	ctx.font = "bold 80px Arial";
	ctx.fillText(bestStreak.value, 60 + smallW / 2, smallY + 95);

	ctx.fillStyle = "#64748b";
	ctx.font = "bold 32px Arial";
	ctx.fillText(t("share.record"), 60 + smallW / 2, smallY + 140);

	// Total validés
	ctx.shadowColor = "rgba(0,0,0,0.15)";
	ctx.shadowBlur = 15;
	ctx.shadowOffsetY = 8;
	ctx.fillStyle = "#ffffff";
	ctx.beginPath();
	ctx.roundRect(100 + smallW, smallY, smallW, smallH, 25);
	ctx.fill();
	ctx.shadowColor = "transparent";

	ctx.fillStyle = "#f97922";
	ctx.font = "bold 80px Arial";
	ctx.fillText(totalCompleted.value, 100 + smallW + smallW / 2, smallY + 95);

	ctx.fillStyle = "#64748b";
	ctx.font = "bold 32px Arial";
	ctx.fillText(t("share.completed"), 100 + smallW + smallW / 2, smallY + 140);

	// ===== QR code + CTA =====
	const qrSize = 160;
	const qrX = 80;
	const qrY = 1020;

	try {
		const qrDataUrl = await QRCode.toDataURL(APP_URL, {
			width: qrSize,
			margin: 1,
			color: { dark: "#f97922", light: "#ffffff" },
		});
		const qrImg = await loadImage(qrDataUrl);

		ctx.fillStyle = "#ffffff";
		ctx.beginPath();
		ctx.roundRect(qrX - 15, qrY - 15, qrSize + 30, qrSize + 30, 20);
		ctx.fill();

		ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
	} catch (error) {
		console.error("Erreur QR code:", error);
	}

	ctx.textAlign = "left";
	ctx.fillStyle = "#ffffff";
	ctx.font = "bold 32px Arial";
	ctx.fillText("Scanne-moi", qrX + qrSize + 40, qrY + 50);
	ctx.font = "bold 40px Arial";
	ctx.fillText("micro-defis.vercel.app", qrX + qrSize + 40, qrY + 140);

	// Bouton CTA
	ctx.textAlign = "center";
	const btnX = w / 2 - 300;
	const btnY = 1210;
	const btnW = 600;
	const btnH = 110;

	ctx.shadowColor = "rgba(0,0,0,0.3)";
	ctx.shadowBlur = 20;
	ctx.shadowOffsetY = 10;

	ctx.fillStyle = "#ffffff";
	ctx.beginPath();
	ctx.roundRect(btnX, btnY, btnW, btnH, 55);
	ctx.fill();

	ctx.shadowColor = "transparent";
	ctx.shadowBlur = 0;

	ctx.fillStyle = "#f97922";
	ctx.font = "bold 50px Arial";
	ctx.fillText("🚀 Rejoins-nous !", w / 2, btnY + 70);
}

/* HELPERS */
function loadImage(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src;
	});
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

/* ACTIONS */
function goToApp() {
	window.open(APP_URL, "_blank");
	infoMsg.value = "🚀 Ouverture de l'app...";
}

function handleImageClick(event) {
	const rect = canvas.value.getBoundingClientRect();
	const scaleX = 1080 / rect.width;
	const scaleY = 1350 / rect.height;

	const clickX = (event.clientX - rect.left) * scaleX;
	const clickY = (event.clientY - rect.top) * scaleY;

	if (clickX > 240 && clickX < 840 && clickY > 1210 && clickY < 1320) {
		goToApp();
	}
}

function downloadImage() {
	if (!canvas.value) return;

	canvas.value.toBlob((blob) => {
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "microdefis-stats.png";
		a.click();
		URL.revokeObjectURL(url);
		infoMsg.value = "✅ Image téléchargée !";
	});
}

async function shareNow() {
	if (!canvas.value) return;

	canvas.value.toBlob(async (blob) => {
		const file = new File([blob], "mes-stats-microdefis.png", {
			type: "image/png",
		});

		if (navigator.share && navigator.canShare({ files: [file] })) {
			try {
				await navigator.share({
					files: [file],
					title: "Mes stats MicroDéfis",
					text: "Mes stats MicroDéfis",
				});
				infoMsg.value = "✅ Partagé avec succès !";
				return;
			} catch (error) {
				if (error.name !== "AbortError") console.error("Erreur partage:", error);
			}
		}

		downloadImage();
	});
}
</script>

<style scoped>
.share-page {
	background: linear-gradient(135deg, #f3e8ff 0%, #ffffff 100%);
	min-height: 100vh;
	padding: 20px;
}

.preview-container {
	position: relative;
	border-radius: 24px;
	overflow: hidden;
	margin-bottom: 24px;
	box-shadow: 0 20px 60px rgba(255, 107, 53, 0.3);
	cursor: pointer;
	transition: transform 0.3s ease;
}

.preview-container:hover {
	transform: translateY(-5px);
}

.preview-canvas {
	width: 100%;
	height: auto;
	display: block;
}

.clickable-cta {
	position: absolute;
	bottom: 50px;
	left: 50%;
	transform: translateX(-50%);
	background: rgba(255, 255, 255, 0.95);
	padding: 12px 24px;
	border-radius: 30px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	opacity: 0;
	transition: opacity 0.3s ease;
	pointer-events: none;
}

.preview-container:hover .clickable-cta {
	opacity: 1;
	pointer-events: auto;
}

.cta-hint {
	font-size: 14px;
	font-weight: 600;
	color: #ff6b35;
}

.share-buttons {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.share-btn-primary,
.download-btn-primary {
	font-weight: 700;
	font-size: 16px;
	letter-spacing: 0.5px;
}

.info-msg {
	margin-top: 20px;
	text-align: center;
	font-weight: 600;
	color: #f97922;
	padding: 12px;
	background: white;
	border-radius: 12px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@media (max-width: 600px) {
	.share-page {
		padding: 12px;
	}
}
</style>