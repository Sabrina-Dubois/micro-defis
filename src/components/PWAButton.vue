<template>
	<div class="pwa-hint">
		<v-btn
			fab
			color="#FF6B35"
			size="56"
			elevation="12"
			@click="showDialog = true"
		>
			<v-icon color="white" size="28">mdi-cellphone</v-icon>
		</v-btn>
		<div class="hint-text">App mobile</div>

		<!-- ✅ POPUP INSTRUCTIONS DÉTAILLÉES -->
		<v-dialog v-model="showDialog" max-width="420" persistent>
			<v-card class="pa-6 install-card">
				<v-card-title class="text-h5 orange--text text-center mb-4">
					📱 Installer l'app
				</v-card-title>

				<!-- Chrome Android -->
				<v-card-text class="text-body-1 mb-6">
					<strong>📱 Android (Chrome)</strong><br />
					1. Cliquez ⋮ (3 points)<br />
					2. "Ajouter à l'écran d'accueil"<br />
					3. Ouvrez comme app !
				</v-card-text>

				<!-- iOS Safari -->
				<v-card-text class="text-body-1 mb-6">
					<strong>🍎 iPhone (Safari)</strong><br />
					1. **Haut écran** → icône ⏵️ (carré + flèche)⏵️<br />
					2. "Ajouter à l'écran d'accueil"<br />
					3. Nom app → "Ajouter"<br />
					4. ✅ Icône sur écran d'accueil !
				</v-card-text>


				<v-card-actions>
					<v-spacer />
					<v-btn
						color="primary"
						rounded
						@click="
							showDialog = false;
							trackInstall();
						"
						block
					>
						J'installe 👍
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script setup>
import { ref } from "vue";
const showDialog = ref(false);

const trackInstall = () => {
	// Track Analytics (optionnel)
	console.log("User clicked install");
	localStorage.setItem("pwa-shown", "true");
};
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
