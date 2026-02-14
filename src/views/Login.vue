<template>
	<div>
		<div class="header">
			<div class="page-title">{{ t("login.title") }}</div>
		</div>

		<v-card class="micro-card pa-6">
			<div style="font-weight: 900; font-size: 18px; margin-bottom: 10px">
				{{ t("login.login") }}
			</div>

			<v-card-text class="pa-0">
				<v-text-field
					v-model="email"
					:label="t('login.email')"
					type="email"
					prepend-inner-icon="mdi-email-outline"
				/>

				<div
					style="
						color: #334155;
						font-weight: 700;
						font-size: 13px;
						margin-top: -6px;
					"
				>
					{{ t("login.info") }}
				</div>

				<v-btn
					class="btn-primary mt-2"
					block
					:loading="loading"
					@click="sendLink"
				>
					{{ t("login.link") }}
				</v-btn>

				<div v-if="sent" class="mt-3" style="color: #16a34a; font-weight: 800">
					{{ t("login.sent") }}
				</div>

				<div v-if="error" class="mt-3" style="color: #ef4444; font-weight: 800">
					{{ error }}
				</div>
			</v-card-text>
		</v-card>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { supabase } from "../lib/supabase";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const email = ref("");
const loading = ref(false);
const sent = ref(false);
const error = ref("");

const sendLink = async () => {
	loading.value = true;
	sent.value = false;
	error.value = "";

	const { error: e } = await supabase.auth.signInWithOtp({
		email: email.value,
		options: {
			emailRedirectTo: import.meta.env.VITE_SUPABASE_REDIRECT,
		},
	});

	loading.value = false;

	if (e) {
		error.value = e.message;
		return;
	}
	sent.value = true;
};
</script>

<style scoped>
.header {
	margin: 6px 0 18px;
}
.footer-link {
	margin-top: 14px;
	text-align: center;
	color: rgba(255, 255, 255, 0.85);
	font-size: 13px;
}
</style>