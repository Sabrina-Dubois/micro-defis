<template>
	<div class="terms-page">

		<!-- Header -->
		<div class="page-header">
			<div class="page-title">{{ t("terms.title") }}</div>
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

					<div :id="'section-0'" class="section-block">
						<div class="section-header">
							<span class="section-number">01</span>
							<h2 class="section-title">{{ t("terms.intro.title") }}</h2>
						</div>
						<p class="section-text">{{ t("terms.intro.content") }}</p>
					</div>

					<div class="divider"></div>

					<div :id="'section-1'" class="section-block">
						<div class="section-header">
							<span class="section-number">02</span>
							<h2 class="section-title">{{ t("terms.account.title") }}</h2>
						</div>
						<p class="section-text">{{ t("terms.account.content") }}</p>
					</div>

					<div class="divider"></div>

					<div :id="'section-2'" class="section-block">
						<div class="section-header">
							<span class="section-number">03</span>
							<h2 class="section-title">{{ t("terms.usage.title") }}</h2>
						</div>
						<p class="section-text">{{ t("terms.usage.content") }}</p>
					</div>

					<div class="divider"></div>

					<div :id="'section-3'" class="section-block">
						<div class="section-header">
							<span class="section-number">04</span>
							<h2 class="section-title">{{ t("terms.forbidden.title") }}</h2>
						</div>
						<p class="section-text">{{ t("terms.forbidden.content") }}</p>
					</div>

					<div class="divider"></div>

					<div :id="'section-4'" class="section-block">
						<div class="section-header">
							<span class="section-number">05</span>
							<h2 class="section-title">{{ t("terms.ip.title") }}</h2>
						</div>
						<p class="section-text">{{ t("terms.ip.content") }}</p>
					</div>

					<div class="divider"></div>

					<!-- Section RGPD -->
					<div :id="'section-5'" class="section-block highlight-block">
						<div class="section-header">
							<span class="section-number">06</span>
							<h2 class="section-title">{{ t("terms.data.title") }}</h2>
						</div>
						<p class="section-text">{{ t("terms.data.content", { contact_email: 'contact@microdefis.fr' })
							}}</p>
						<div class="info-box">
							<v-icon color="purple" size="18">mdi-shield-lock</v-icon>
							<span>
								{{ t("terms.data.content1") }}
								<router-link to="/privacy" class="link-inline">{{ t("terms.data.content2")
									}}</router-link>
								{{ t("terms.data.content3") }}
							</span>
						</div>
						<p class="section-text">{{ t("terms.data.content4") }}</p>
						<a href="mailto:contact@microdefis.fr" class="email-link">
							<v-icon size="14">mdi-email</v-icon>
							contact@microdefis.fr
						</a>
					</div>

					<div class="divider"></div>

					<div :id="'section-6'" class="section-block">
						<div class="section-header">
							<span class="section-number">07</span>
							<h2 class="section-title">{{ t("terms.liability.title") }}</h2>
						</div>
						<p class="section-text">{{ t("terms.liability.content") }}</p>
					</div>

					<div class="divider"></div>

					<div :id="'section-7'" class="section-block">
						<div class="section-header">
							<span class="section-number">08</span>
							<h2 class="section-title">{{ t("terms.termination.title") }}</h2>
						</div>
						<p class="section-text">{{ t("terms.termination.content") }}</p>
					</div>

					<div class="divider"></div>

					<div :id="'section-8'" class="section-block">
						<div class="section-header">
							<span class="section-number">09</span>
							<h2 class="section-title">{{ t("terms.changes.title") }}</h2>
						</div>
						<p class="section-text">{{ t("terms.changes.content") }}</p>
					</div>

					<div class="divider"></div>

					<div :id="'section-9'" class="section-block">
						<div class="section-header">
							<span class="section-number">10</span>
							<h2 class="section-title">{{ t("terms.law.title") }}</h2>
						</div>
						<p class="section-text">{{ t("terms.law.content") }}</p>
					</div>

					<div class="divider"></div>

					<!-- Contact -->
					<div :id="'section-10'" class="section-block contact-block">
						<div class="section-header">
							<span class="section-number">11</span>
							<h2 class="section-title">{{ t("terms.contact.title") }}</h2>
						</div>
						<p class="section-text">{{ t("terms.contact.content", {
							contact_email: 'contact@microdefis.fr'
							}) }}</p>
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
	{ short: "Compte" },
	{ short: "Utilisation" },
	{ short: "Interdictions" },
	{ short: "Propriété" },
	{ short: "RGPD" },
	{ short: "Responsabilité" },
	{ short: "Résiliation" },
	{ short: "Modifications" },
	{ short: "Loi" },
	{ short: "Contact" },
];
</script>

<style scoped>
.terms-page {
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

.info-box {
	display: flex;
	align-items: flex-start;
	gap: 10px;
	background: #f0e6ff;
	padding: 12px 14px;
	border-radius: 10px;
	font-size: 13px;
	color: #6d28d9;
	margin: 10px 0;
	line-height: 1.5;
}

.link-inline {
	color: #7c3aed;
	font-weight: 600;
	text-decoration: underline;
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