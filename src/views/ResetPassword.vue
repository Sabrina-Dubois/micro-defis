<template>
	<div class="pa-6">
		<h2>Choisis ton mot de passe</h2>
		<v-text-field
			v-model="newPassword"
			label="Nouveau mot de passe (8+ chars)"
			type="password"
			:rules="[(v) => v.length >= 8 || 'Min 8 chars']"
		/>
		<v-btn @click="updatePassword" color="primary" :loading="loading">
			Confirmer
		</v-btn>
		<div v-if="error" class="error">{{ error }}</div>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/lib/supabase"; // Ton import

const newPassword = ref("");
const error = ref("");
const loading = ref(false);
const router = useRouter();

const updatePassword = async () => {
	loading.value = true;
	error.value = "";

	const { error: updateError } = await supabase.auth.updateUser({
		password: newPassword.value,
	});

	loading.value = false;

	if (updateError) {
		error.value = updateError.message;
	} else {
		alert("✅ Mot de passe changé ! Déconnexion...");
		await supabase.auth.signOut();
		router.push("/login");
	}
};
</script>
