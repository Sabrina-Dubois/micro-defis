<template>
	<div class="terms-page">
		<div class="top">
			<div class="page-title">{{ t("terms.title") }}</div>
		</div>

		<!-- Wrapper centré avec scroll -->
		<div class="card-wrapper">
			<v-card class="micro-card">
				<div class="card-content">
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

						<!-- IP -->
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
				</div>
			</v-card>
		</div>
	</div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

<style scoped>
.terms-page {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 12px;
	min-height: 100vh;
	overflow: hidden;
}

.card-wrapper {
	flex: 1;
	display: flex;
	justify-content: center;
	width: 100%;
	max-width: 520px;
	overflow-y: auto;
	padding-bottom: 24px;
}

/* Carte principale */
.micro-card {
	width: 100%;
	max-width: 100%;
	border-radius: 24px;
	background: var(--surface);
	border: 1px solid var(--border);
	backdrop-filter: var(--backdrop-blur);
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
	display: flex;
	flex-direction: column;
}

/* Scrollable content */
.card-content {
	max-height: 80vh;
	/* garde un peu d'espace au top/bottom */
	overflow-y: auto;
	padding: 24px;
}

/* Scroll custom */
.card-content::-webkit-scrollbar {
	width: 6px;
}

.card-content::-webkit-scrollbar-thumb {
	background-color: rgba(100, 100, 100, 0.3);
	border-radius: 3px;
}

/* Section et titres */
.section {
	max-width: 100%;
}

h2 {
	font-size: 20px;
	font-weight: 600;
	color: #374151;
	margin: 28px 0 16px;
	border-bottom: 2px solid #e5e7eb;
	padding-bottom: 8px;
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

.page-title {
	font-size: 36px;
	text-align: center;
	font-weight: 600;
	color: var(--text-primary);
}

@media (max-width: 600px) {
	h2 {
		font-size: 18px;
	}

	p {
		font-size: 15px;
	}

	.card-content {
		padding: 16px;
	}
}
</style>