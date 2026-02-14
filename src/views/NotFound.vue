<template>
	<div class="not-found">
		<div class="container">
			<div class="error-code">{{ t("errors.404") }}</div>
			<h2 class="error-title">{{ t("errors.not_found_title") }}</h2>
			<p class="error-message">{{ t("errors.not_found_message") }}</p>
			<v-btn class="btn-primary mt-4" block to="/">
				← {{ t("errors.back_home") }}
			</v-btn>
		</div>
	</div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

<style scoped>
.not-found {
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	text-align: center;
	padding: 20px;
	padding-bottom: 96px;
}

.container {
	max-width: 500px;
	width: 100%;
}

.error-code {
	font-size: 140px;
	font-weight: 900;
	background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	line-height: 1;
	margin-bottom: 20px;
}

.error-title {
	font-size: 28px;
	font-weight: 700;
	color: #ffffff;
	margin: 0 0 12px 0;
	text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}

.error-message {
	font-size: 16px;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.85);
	margin: 0 0 32px 0;
	line-height: 1.5;
}

.mt-4 {
	margin-top: 16px;
}
</style>