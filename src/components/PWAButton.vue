<template>
	<div v-if="showButton" class="pwa-hint">
		<v-btn fab color="#FF6B35" size="56" elevation="12" @click="installPWA">
			<v-icon color="white" size="28">mdi-cellphone</v-icon>
		</v-btn>
		<div class="hint-text">{{ t("pwa.button") }}</div>

		<!-- POPUP INSTRUCTIONS -->
		<v-dialog v-model="showDialog" max-width="420" persistent>
			<v-card class="pa-6 install-card">
				<v-card-title class="text-h5 orange--text text-center mb-4">
					{{ t("pwa.dialog.title") }}
				</v-card-title>

				<!-- Chrome Android -->
				<v-card-text class="text-body-1 mb-6">
					<strong>{{ t("pwa.dialog.android.title") }}</strong><br />
					{{ t("pwa.dialog.android.step1") }}<br />
					{{ t("pwa.dialog.android.step2") }}<br />
					{{ t("pwa.dialog.android.step3") }}
				</v-card-text>

				<!-- iOS Safari -->
				<v-card-text class="text-body-1 mb-6">
					<strong>{{ t("pwa.dialog.ios.title") }}</strong><br />
					{{ t("pwa.dialog.ios.step1") }}<br />
					{{ t("pwa.dialog.ios.step2") }}<br />
					{{ t("pwa.dialog.ios.step3") }}<br />
					{{ t("pwa.dialog.ios.step4") }}
				</v-card-text>

				<v-card-actions>
					<v-spacer />
					<v-btn class="btn-primary mt-4" rounded @click="confirmInstall" block>
						{{ t("pwa.dialog.install_button") }}
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const showDialog = ref(false);
const showButton = ref(false);
let deferredPrompt = null;

// 🔹 On stocke l'event beforeinstallprompt
window.addEventListener("beforeinstallprompt", (e) => {
	e.preventDefault(); // empêche le banner auto
	deferredPrompt = e;
	const isStandalone =
		window.matchMedia("(display-mode: standalone)").matches ||
		window.navigator.standalone === true; // iOS
	const pwaAlreadyShown = localStorage.getItem("pwa-shown") === "true";
	showButton.value = !isStandalone && !pwaAlreadyShown;
});

// 🔹 Cliquer sur le bouton montre le prompt Chrome
function installPWA() {
	if (deferredPrompt) {
		deferredPrompt.prompt();
		deferredPrompt.userChoice.then((choice) => {
			if (choice.outcome === "accepted") {
				console.log("✅ PWA installée par l'utilisateur !");
			} else {
				console.log("❌ L'utilisateur a refusé l'installation");
			}
			deferredPrompt = null;
			localStorage.setItem("pwa-shown", "true");
			showButton.value = false;
		});
	} else {
		// iOS ou autres cas → afficher ton popup d'instructions
		showDialog.value = true;
	}
}

// 🔹 Popup instructions → bouton confirme
function confirmInstall() {
	showDialog.value = false;
	localStorage.setItem("pwa-shown", "true");
	showButton.value = false;
}
</script>

<style scoped>
.pwa-hint {
	position: fixed;
	bottom: 130px;
	right: 20px;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
	z-index: 1002;
}

.hint-text {
	font-size: 12px;
	font-weight: 700;
	color: #ff6b35;
	background: rgba(255, 255, 255, 0.95);
	padding: 6px 12px;
	border-radius: 20px;
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.install-card {
	background: linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%);
}
</style>