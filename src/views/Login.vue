<template>
	<div>
		<div class="header">
			<div class="page-title">{{ t("auth.title") }}</div>
		</div>

		<v-card class="micro-card pa-6 text-center">
			<div style="font-weight: 900; font-size: 18px; margin-bottom: 10px">
				{{ isLogin ? t("auth.login.login") : t("auth.signup.create_account") }}
			</div>

			<v-card-text class="pa-0">
				<!-- Username seulement pour signup -->
				<v-text-field v-if="!isLogin" v-model="username" :placeholder="t('auth.signup.username')"
					prepend-inner-icon="mdi-account-outline" class="mb-4" hide-details />

				<!-- Email -->
				<v-text-field v-model="email" :placeholder="t('auth.login.email')" type="email"
					prepend-inner-icon="mdi-email-outline" class="mb-4" hide-details />

				<!-- Password -->
				<v-text-field v-model="password" prepend-inner-icon="mdi-lock-outline"
					:placeholder="t('auth.login.password')" :type="showPassword ? 'text' : 'password'"
					:append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'" @click:append-inner="togglePassword"
					class="mb-4" hide-details />

				<!-- Confirm password seulement pour signup -->
				<v-text-field v-if="!isLogin" v-model="confirmPassword" prepend-inner-icon="mdi-lock-outline"
					:placeholder="t('auth.signup.confirm_password')" :type="showPassword ? 'text' : 'password'"
					:append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'" @click:append-inner="togglePassword"
					class="mb-4" hide-details />

				<!-- Mot de passe oublié -->
				<div v-if="isLogin" class="text-center mb-4" style="
						font-size: 13px;
						font-weight: 600;
						color: #6366f1;
						cursor: pointer;
					" @click="resetPassword">
					{{ t("auth.login.forgot_password") }}
				</div>

				<!-- Bouton principal -->
				<v-btn class="btn-primary mt-2" block :loading="loading" @click="handleAuth">
					{{
						isLogin ? t("auth.login.login") : t("auth.signup.create_account")
					}}
				</v-btn>

				<!-- Toggle login/signup -->
				<div class="text-center mt-4">
					<a @click.prevent="isLogin = !isLogin" style="color: #6366f1; cursor: pointer">
						{{
							isLogin ? t("auth.signup.create_account") : t("auth.login.switch_to_login")
						}}
					</a>
				</div>

				<!-- Erreurs -->
				<div v-if="error" class="mt-3" style="color: #ef4444; font-weight: 800">
					{{ error }}
				</div>
			</v-card-text>
		</v-card>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { supabase } from "@/lib/supabase";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const username = ref("");

const showPassword = ref(false);
const isLogin = ref(true);
const loading = ref(false);
const error = ref("");

const togglePassword = () => {
	showPassword.value = !showPassword.value;
};

const handleAuth = async () => {
	error.value = "";

	if (!isLogin.value && password.value !== confirmPassword.value) {
		error.value = t("auth.signup.password_mismatch");
		return;
	}

	loading.value = true;

	if (isLogin.value) {
		const { error: e } = await supabase.auth.signInWithPassword({
			email: email.value,
			password: password.value,
		});

		loading.value = false;

		if (e) {
			error.value = e.message;
			return;
		}

		window.location.href = "/daily";
	} else {
		const { error: e } = await supabase.auth.signUp({
			email: email.value,
			password: password.value,
			options: { data: { username: username.value } },
		});

		loading.value = false;

		if (e) {
			error.value = e.message;
			return;
		}

		alert("Compte créé 🎉 Vérifie ton email !");
		isLogin.value = true;
	}
};

const resetPassword = async () => {
	if (!email.value) {
		error.value = "Entre ton email d'abord 💌";
		return;
	}

	loading.value = true;

	const { error: e } = await supabase.auth.resetPasswordForEmail(email.value, {
		redirectTo: window.location.origin + "/reset-password",
	});

	loading.value = false;

	if (e) {
		error.value = e.message;
		return;
	}

	alert("Email de réinitialisation envoyé ✉️");
};
</script>

<style scoped>
.header {
	margin: 6px 0 18px;
}

.micro-card {
	width: 360px !important;
	margin: 0 auto;
}

.footer-link {
	margin-top: 14px;
	text-align: center;
	color: rgba(255, 255, 255, 0.85);
	font-size: 13px;
}
</style>