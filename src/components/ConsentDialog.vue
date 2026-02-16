<template>
	<v-dialog v-model="show" persistent max-width="500">
		<v-card class="pa-6">
			<v-card-title class="text-h5 text-center">{{ t("consent.title") }}</v-card-title>

			<!-- Section CGU / Privacy -->
			<v-card-text class="mb-4">
				<p>{{ t("consent.intro") }}</p>
				<ul>
					<li><a href="/terms" target="_blank">{{ t("consent.cgu") }}</a></li>
					<li><a href="/privacy" target="_blank">{{ t("consent.privacy") }}</a></li>
				</ul>

				<v-checkbox v-model="acceptCgu" label="J'accepte les Conditions d'utilisation" color="primary"
					hide-details />
				<v-checkbox v-model="acceptPrivacy" label="J'accepte la Politique de confidentialité" color="primary"
					hide-details />
			</v-card-text>

			<!-- Section pubs / cookies -->
			<v-card-text class="mb-4">
				<p>{{ t("consent.ads_intro") }}</p>
				<v-checkbox v-model="acceptAds" label="J'accepte de recevoir des pubs personnalisées" color="primary"
					hide-details />
			</v-card-text>

			<v-card-actions>
				<v-btn block class="btn-primary mt-4" :disabled="!acceptCgu || !acceptPrivacy" @click="acceptConsent">
					{{ t("consent.start") }}
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const show = ref(false);
const acceptCgu = ref(false);
const acceptPrivacy = ref(false);
const acceptAds = ref(false);

onMounted(() => {
	const alreadyShown = localStorage.getItem("microdefis-consent") === "true";
	show.value = !alreadyShown;
});

function acceptConsent() {
	// ✅ Stockage des consentements
	localStorage.setItem("microdefis-consent", "true");
	localStorage.setItem("microdefis-consent-date", new Date().toISOString());

	if (acceptAds.value) {
		localStorage.setItem("ads-consent", "true");
		// ✅ Active Google Ads / Tag Manager
		if (window.gtag) {
			window.gtag('consent', 'update', {
				ad_storage: 'granted',
				analytics_storage: 'granted'
			});
		}
		(window.adsbygoogle = window.adsbygoogle || []).push({});
	}

	show.value = false;
}
</script>

<style scoped>
/* Overlay sombre */
.consent-dialog :deep(.v-overlay__scrim) {
	background: rgba(0, 0, 0, 0.6);
}

/* Liens CGU / Privacy */
a {
	color: #1976d2;
	text-decoration: none;
	font-weight: 600;
}

a:hover {
	text-decoration: underline;
}

ul {
	padding-left: 18px;
}

/* Espacement entre sections */
.v-card-text {
	margin-bottom: 16px;
}
</style>