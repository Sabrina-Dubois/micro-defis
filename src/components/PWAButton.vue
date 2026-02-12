<template>
	<div class="pwa-hint">
		<v-btn fab color="#FF6B35" size="56" elevation="12" @click="$emit('click')">
			<v-icon color="white" size="28">mdi-cellphone</v-icon>
		</v-btn>
		<div class="hint-text">App mobile</div>

		<v-dialog v-model="showDialog" max-width="380">
			<v-card class="pa-6">
				<v-card-title class="text-h6 orange--text text-center">
					📱 Installer MicroDéfis
				</v-card-title>
				<v-card-text class="text-body-1">
					<ol>
						<li>Menu ⋮ (Chrome) ou ⏵️ (Safari)</li>
						<li>"Ajouter à l'écran d'accueil"</li>
						<li>App native prête !</li>
					</ol>
				</v-card-text>
				<v-card-actions>
					<v-spacer />
					<v-btn color="primary" @click="showDialog = false">OK 👍</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
	show: { type: Boolean, default: true },
});

const emit = defineEmits(["click"]);
const showDialog = ref(false);

const handleClick = () => {
	emit("click");
	showDialog.value = true;
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
	animation: hint-appear 0.5s ease-out;
}

@keyframes hint-appear {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.hint-text {
	font-size: 12px;
	font-weight: 700;
	color: #ff6b35;
	background: rgba(255, 255, 255, 0.95);
	padding: 6px 12px;
	border-radius: 20px;
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
	backdrop-filter: blur(10px);
}
</style>
