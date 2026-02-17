<template>
	<div class="terms-page">
		<div class="top">
			<div class="page-title">{{ t("terms.title") }}</div>
		</div>

		<v-card class="micro-card">
			<div class="section">

				<!-- Intro -->
				<h2>{{ t("terms.intro.title") }}</h2>
				<p>{{ t("terms.intro.content") }}</p>

				<!-- Account -->
				<h2>{{ t("terms.account.title") }}</h2>
				<p>{{ t("terms.account.content") }}</p>

				<!-- Usage -->
				<h2>{{ t("terms.usage.title") }}</h2>
				<p>{{ t("terms.usage.content") }}</p>

				<!-- Forbidden -->
				<h2>{{ t("terms.forbidden.title") }}</h2>
				<p>{{ t("terms.forbidden.content") }}</p>

				<!-- Intellectual property -->
				<h2>{{ t("terms.ip.title") }}</h2>
				<p>{{ t("terms.ip.content") }}</p>

				<!-- Data / GDPR -->
				<h2>{{ t("terms.data.title") }}</h2>
				<p>
					{{ t("terms.data.content") }}
					<a :href="'mailto:contact@microdefis.fr'">contact@microdefis.fr</a>.<br />
					{{ t("terms.data.content1") }}
					<a href="/privacy">{{ t("terms.data.content2") }}</a> {{ t("terms.data.content3") }}<br />
					{{ t("terms.data.content4") }}
				</p>

				<!-- Liability -->
				<h2>{{ t("terms.liability.title") }}</h2>
				<p>{{ t("terms.liability.content") }}</p>

				<!-- Termination -->
				<h2>{{ t("terms.termination.title") }}</h2>
				<p>{{ t("terms.termination.content") }}</p>

				<!-- Changes -->
				<h2>{{ t("terms.changes.title") }}</h2>
				<p>{{ t("terms.changes.content") }}</p>

				<!-- Law -->
				<h2>{{ t("terms.law.title") }}</h2>
				<p>{{ t("terms.law.content") }}</p>

				<!-- Contact -->
				<h2>{{ t("terms.contact.title") }}</h2>
				<p>
					{{ t("terms.contact.content") }}
					<a :href="'mailto:contact@microdefis.fr'">contact@microdefis.fr</a>.
				</p>

			</div>
		</v-card>
	</div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

<style scoped>
.top {
	margin: 12px 0 20px;
}

.micro-card {
	padding: 24px;
	margin-bottom: 24px;
	background: white;
	border-radius: 12px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.section {
	max-width: 800px;
}

h2 {
	font-size: 20px;
	font-weight: 600;
	color: #374151;
	margin: 28px 0 16px;
	border-bottom: 2px solid #e5e7eb;
	padding-bottom: 8px;
}

h2:first-child {
	margin-top: 0;
}

p {
	font-size: 16px;
	line-height: 1.6;
	color: #4b5563;
	margin-bottom: 20px;
}

a {
	color: #1e40af;
	text-decoration: none;
}

a:hover {
	text-decoration: underline;
}

@media (max-width: 600px) {
	.micro-card {
		padding: 20px;
	}

	h2 {
		font-size: 18px;
	}

	p {
		font-size: 15px;
	}
}
</style>