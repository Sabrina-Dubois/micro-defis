<template>
	<div>
		<div class="header">
			<div class="page-title">{{ t("reset_password.title") }}</div>
		</div>

		<v-card class="micro-card pa-6 text-center">
			<v-text-field
				v-model="newPassword"
				prepend-inner-icon="mdi-lock-outline"
				:placeholder="t('reset_password.new_password')"
				:type="showPassword ? 'text' : 'password'"
				:append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
				@click:append-inner="togglePassword"
				:rules="[
					(v) => !!v || t('reset_password.required'),
					(v) => v.length >= 8 || t('reset_password.min_chars'),
				]"
				required
			/>

			<v-btn
				class="btn-primary mt-4"
				block
				color="primary"
				:loading="loading"
				@click="updatePassword"
			>
				{{ t("reset_password.confirm") }}
			</v-btn>

			<div v-if="error" class="error mt-2">{{ error }}</div>
		</v-card>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/lib/supabase";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const router = useRouter();

const newPassword = ref("");
const showPassword = ref(false);
const error = ref("");
const loading = ref(false);

const togglePassword = () => {
	showPassword.value = !showPassword.value;
};

const updatePassword = async () => {
	if (newPassword.value.length < 8) {
		error.value = t("reset_password.min_chars");
		return;
	}

	loading.value = true;
	error.value = "";

	const { error: updateError } = await supabase.auth.updateUser({
		password: newPassword.value,
	});

	loading.value = false;

	if (updateError) {
		error.value = updateError.message;
	} else {
		alert(t("reset_password.success_alert"));
		await supabase.auth.signOut();
		router.push("/login");
	}
};
</script>

<style scoped>
.header {
	margin: 6px 0 18px;
}
.error {
	color: #f44336;
	font-size: 14px;
}
</style>