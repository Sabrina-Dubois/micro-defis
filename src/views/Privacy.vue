<template>
	<div class="privacy-page">
		<div class="top">
			<div class="page-title">{{ t("privacy.title") }}</div>
		</div>

		<v-card class="micro-card">
			<div class="section">
				<h2 class="page-subtitle">{{ t("privacy.intro_title") }}</h2>
				{{ t("privacy.intro_text1") }}
				<br />
				{{ t("privacy.intro_text2") }}

				<h2 class="page-subtitle">{{ t("privacy.data_title") }}</h2>
				{{ t("privacy.data_intro") }}
				<ul>
					<li>
						{{ t("privacy.data_identity") }}
					</li>
					<li>
						{{ t("privacy.data_technical") }}
					</li>
					<li>{{ t("privacy.data_usage") }}</li>
				</ul>
				{{ t("privacy.data_sensitive") }}

				<h2 class="page-subtitle">{{ t("privacy.legal_title") }}</h2>
				{{ t("privacy.legal_intro") }}
				<ul>
					<li>{{ t("privacy.legal_consent") }}</li>
					<li>{{ t("privacy.legal_contract") }}</li>
					<li>{{ t("privacy.legal_interest") }}</li>
				</ul>
				{{ t("privacy.legal_usage") }}

				<h2 class="page-subtitle">{{ t("privacy.share_title") }}</h2>
				{{ t("privacy.share_intro") }}
				<ul>
					<li>{{ t("privacy.share_host") }}</li>
					<li>{{ t("privacy.share_analytics") }}</li>
					<li>{{ t("privacy.share_legal") }}</li>
				</ul>

				<h2 class="page-subtitle">{{ t("privacy.retention_title") }}</h2>
				<p>
					{{ t("privacy.retention_text") }}
				</p>

				<h2 class="page-subtitle">{{ t("privacy.security_title") }}</h2>
				<p>
					M{{ t("privacy.security_text") }}
				</p>

				<h2 class="page-subtitle">{{ t("privacy.cookies_title") }}</h2>
				<p>
					{{ t("privacy.cookies_text") }}
				</p>

				<h2 class="page-subtitle">{{ t("privacy.rights_title") }}</h2>
				<p>
					{{ t("privacy.rights_text") }}
				</p>

				<h2 class="page-subtitle">9{{ t("privacy.transfer_title") }}</h2>
				<p>
					{{ t("privacy.transfer_text") }}
				</p>

				<h2 class="page-subtitle">{{ t("privacy.changes_title") }}</h2>
				<p>{{ t("privacy.changes_text") }}</p>

				<h2 class="page-subtitle">{{ t("privacy.contact_title") }}</h2>
				<p>
					{{ t("privacy.contact_text") }}
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

.micro-title {
	font-size: 24px;
	font-weight: 700;
	color: #059669;
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

ul {
	margin: 12px 0;
	padding-left: 24px;
}

li {
	font-size: 16px;
	line-height: 1.6;
	color: #4b5563;
	margin-bottom: 8px;
}

@media (max-width: 600px) {
	.micro-card {
		padding: 20px;
	}

	h2 {
		font-size: 18px;
	}

	p,
	li {
		font-size: 15px;
	}
}
</style>
