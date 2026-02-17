<template>
	<div class="privacy-page">

		<!-- Header -->
		<div class="page-header">
			<div class="page-title">{{ t("privacy.title") }}</div>
			<div class="last-updated">Mis à jour le 1er février 2026</div>
		</div>

		<!-- Navigation rapide -->
		<div class="quick-nav">
			<div class="nav-pills">
				<a v-for="(section, i) in sections" :key="i" :href="'#section-' + i" class="nav-pill">
					{{ section.short }}
				</a>
			</div>
		</div>

		<!-- Contenu -->
		<div class="card-wrapper">
			<v-card class="micro-card content-card">
				<div class="card-content">

					<!-- 1. Introduction -->
					<div :id="'section-0'" class="section-block">
						<div class="section-header">
							<span class="section-number">01</span>
							<h2 class="section-title">{{ t("privacy.intro_title") }}</h2>
						</div>
						<p class="section-text">{{ t("privacy.intro_text1") }}</p>
						<p class="section-text">{{ t("privacy.intro_text2") }}</p>
					</div>

					<div class="divider"></div>

					<!-- 2. Données collectées -->
					<div :id="'section-1'" class="section-block">
						<div class="section-header">
							<span class="section-number">02</span>
							<h2 class="section-title">{{ t("privacy.data_title") }}</h2>
						</div>
						<p class="section-text">{{ t("privacy.data_intro") }}</p>
						<ul class="section-list">
							<li>{{ t("privacy.data_identity") }}</li>
							<li>{{ t("privacy.data_technical") }}</li>
							<li>{{ t("privacy.data_usage") }}</li>
						</ul>
						<p class="section-text">{{ t("privacy.data_sensitive") }}</p>
					</div>

					<div class="divider"></div>

					<!-- 3. Bases légales -->
					<div :id="'section-2'" class="section-block">
						<div class="section-header">
							<span class="section-number">03</span>
							<h2 class="section-title">{{ t("privacy.legal_title") }}</h2>
						</div>
						<p class="section-text">{{ t("privacy.legal_intro") }}</p>
						<ul class="section-list">
							<li>{{ t("privacy.legal_consent") }}</li>
							<li>{{ t("privacy.legal_contract") }}</li>
							<li>{{ t("privacy.legal_interest") }}</li>
						</ul>
						<p class="section-text">{{ t("privacy.legal_usage") }}</p>
					</div>

					<div class="divider"></div>

					<!-- 4. Partage -->
					<div :id="'section-3'" class="section-block">
						<div class="section-header">
							<span class="section-number">04</span>
							<h2 class="section-title">{{ t("privacy.share_title") }}</h2>
						</div>
						<p class="section-text">{{ t("privacy.share_intro") }}</p>
						<ul class="section-list">
							<li>{{ t("privacy.share_host") }}</li>
							<li>{{ t("privacy.share_analytics") }}</li>
							<li>{{ t("privacy.share_legal") }}</li>
						</ul>
					</div>

					<div class="divider"></div>

					<!-- 5. Conservation -->
					<div :id="'section-4'" class="section-block">
						<div class="section-header">
							<span class="section-number">05</span>
							<h2 class="section-title">{{ t("privacy.retention_title") }}</h2>
						</div>
						<p class="section-text">{{ t("privacy.retention_text") }}</p>
					</div>

					<div class="divider"></div>

					<!-- 6. Sécurité -->
					<div :id="'section-5'" class="section-block highlight-block">
						<div class="section-header">
							<span class="section-number">06</span>
							<h2 class="section-title">{{ t("privacy.security_title") }}</h2>
						</div>
						<div class="info-box">
							<v-icon color="purple" size="18">mdi-shield-lock</v-icon>
							<span>{{ t("privacy.security_text") }}</span>
						</div>
					</div>

					<div class="divider"></div>

					<!-- 7. Cookies -->
					<div :id="'section-6'" class="section-block">
						<div class="section-header">
							<span class="section-number">07</span>
							<h2 class="section-title">{{ t("privacy.cookies_title") }}</h2>
						</div>
						<p class="section-text">{{ t("privacy.cookies_text") }}</p>
					</div>

					<div class="divider"></div>

					<!-- 8. Droits RGPD -->
					<div :id="'section-7'" class="section-block">
						<div class="section-header">
							<span class="section-number">08</span>
							<h2 class="section-title">{{ t("privacy.rights_title") }}</h2>
						</div>
						<p class="section-text">
							{{ t("privacy.rights_text") }}
						</p>
						<a href="mailto:contact@microdefis.fr" class="email-link">
							<v-icon size="14">mdi-email</v-icon>
							contact@microdefis.fr
						</a>
					</div>

					<div class="divider"></div>

					<!-- 9. Transferts -->
					<div :id="'section-8'" class="section-block">
						<div class="section-header">
							<span class="section-number">09</span>
							<h2 class="section-title">{{ t("privacy.transfer_title") }}</h2>
						</div>
						<p class="section-text">{{ t("privacy.transfer_text") }}</p>
					</div>

					<div class="divider"></div>

					<!-- 10. Modifications -->
					<div :id="'section-9'" class="section-block">
						<div class="section-header">
							<span class="section-number">10</span>
							<h2 class="section-title">{{ t("privacy.changes_title") }}</h2>
						</div>
						<p class="section-text">{{ t("privacy.changes_text") }}</p>
					</div>

					<div class="divider"></div>

					<!-- 11. Contact -->
					<div :id="'section-10'" class="section-block contact-block">
						<div class="section-header">
							<span class="section-number">11</span>
							<h2 class="section-title">{{ t("privacy.contact_title") }}</h2>
						</div>
						<p class="section-text">{{ t("privacy.contact_text") }}</p>
						<a href="mailto:contact@microdefis.fr" class="email-link">
							<v-icon size="14">mdi-email</v-icon>
							contact@microdefis.fr
						</a>
					</div>

				</div>
			</v-card>
		</div>

	</div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const sections = [
	{ short: "Introduction" },
	{ short: "Données" },
	{ short: "Bases légales" },
	{ short: "Partage" },
	{ short: "Conservation" },
	{ short: "Sécurité" },
	{ short: "Cookies" },
	{ short: "Droits" },
	{ short: "Transferts" },
	{ short: "Modifications" },
	{ short: "Contact" },
];
</script>

<style scoped>
.privacy-page {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 12px;
	min-height: 100vh;
	padding-bottom: 80px;
}

.page-header {
	text-align: center;
	padding: 16px 0 8px;
	width: 100%;
	max-width: 520px;
}

.last-updated {
	font-size: 12px;
	color: #94a3b8;
	margin-top: 4px;
}

.quick-nav {
	width: 100%;
	max-width: 520px;
	margin-bottom: 16px;
}

.nav-pills {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}

.nav-pill {
	font-size: 11px;
	font-weight: 600;
	color: #7c3aed;
	background: #f3e8ff;
	padding: 4px 10px;
	border-radius: 20px;
	text-decoration: none;
	transition: all 0.2s;
	white-space: nowrap;
}

.nav-pill:hover {
	background: #7c3aed;
	color: white;
}

.card-wrapper {
	width: 100%;
	max-width: 520px;
}

.content-card {
	border-radius: 20px !important;
	overflow: hidden;
}

.card-content {
	padding: 8px 4px;
}

.section-block {
	padding: 20px;
	scroll-margin-top: 80px;
	transition: background 0.2s;
}

.section-block:hover {
	background: #fafafa;
	border-radius: 12px;
}

.highlight-block {
	background: #fdf8ff;
	border-radius: 12px;
	border-left: 3px solid #7c3aed;
}

.highlight-block:hover {
	background: #f9f0ff;
}

.contact-block {
	background: #fdf8ff;
	border-radius: 12px;
}

.section-header {
	display: flex;
	align-items: center;
	gap: 12px;
	margin-bottom: 12px;
}

.section-number {
	font-size: 11px;
	font-weight: 800;
	color: #ff6b35;
	background: #fff5f2;
	padding: 3px 8px;
	border-radius: 6px;
	flex-shrink: 0;
	letter-spacing: 0.5px;
}

.section-title {
	font-size: 15px;
	font-weight: 700;
	color: #1e293b;
	margin: 0;
	line-height: 1.3;
}

.section-text {
	font-size: 13.5px;
	color: #475569;
	line-height: 1.7;
	margin: 0 0 10px 0;
}

.section-list {
	margin: 6px 0 10px 0;
	padding-left: 18px;
}

.section-list li {
	font-size: 13.5px;
	color: #475569;
	line-height: 1.7;
	margin-bottom: 4px;
}

.info-box {
	display: flex;
	align-items: flex-start;
	gap: 10px;
	background: #f0e6ff;
	padding: 12px 14px;
	border-radius: 10px;
	font-size: 13px;
	color: #6d28d9;
	margin: 4px 0;
	line-height: 1.5;
}

.email-link {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	color: #ff6b35;
	font-weight: 600;
	font-size: 13px;
	text-decoration: none;
	background: #fff5f2;
	padding: 8px 14px;
	border-radius: 20px;
	margin-top: 6px;
	transition: all 0.2s;
}

.email-link:hover {
	background: #ff6b35;
	color: white;
}

.divider {
	height: 1px;
	background: linear-gradient(to right, transparent, #e2e8f0, transparent);
	margin: 0 20px;
}
</style>