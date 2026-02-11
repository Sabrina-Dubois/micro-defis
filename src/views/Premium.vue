<template>
	<v-card class="micro-card pa-4 mb-4">
		<div class="page-subtitle">⭐ Premium</div>
		<div v-if="!isPremium" class="text-center pa-4">
			<v-icon size="64" color="deep-orange">mdi-crown</v-icon>
			<div class="text-h6 mt-2">Premium 1,99€/mois</div>
			<div class="text-body2 text-grey mb-4">Graphiques + partage + IA</div>
			<v-btn block color="deep-orange" @click="goPremium">Souscrire</v-btn>
		</div>
		<div v-else class="text-center pa-4 text-green">
			<v-icon size="64">mdi-check-circle</v-icon>
			<div class="text-h6">Premium actif !</div>
		</div>
	</v-card>
</template>

<script setup>
import { ref } from "vue"; // ✅ IMPORT

const isPremium = ref(false); // ✅ DANS setup

const goPremium = () => {
	// ✅ FONCTION setup
	window.open("https://sumup.com/ton-lien", "_blank");
};
</script>

<style></style>
