<template>
	<v-dialog v-model="show" persistent max-width="500">
		<v-card class="pa-6">
			<v-card-title class="text-h5 text-center">
				{{ t("consent.title") }}
			</v-card-title>

			<!-- Section CGU / Privacy -->
			<v-card-text class="mb-4">
				<p class="mb-2">{{ t("consent.intro") }}</p>

				<ul class="mb-4">
					<li>
						<router-link to="/terms" target="_blank">
							{{ t("consent.cgu") }}
						</router-link>
					</li>
					<li>
						<router-link to="/privacy" target="_blank">
							{{ t("consent.privacy") }}
						</router-link>
					</li>
				</ul>

				<v-checkbox v-model="acceptCgu" :label="t('consent.accept_cgu')" color="primary" hide-details />
				<v-checkbox v-model="acceptPrivacy" :label="t('consent.accept_privacy')" color="primary" hide-details />
			</v-card-text>

			<!-- Section pubs -->
			<v-card-text class="mb-4">
				<p class="mb-2">
					{{ t("consent.ads_intro") }}
				</p>

				<v-checkbox v-model="acceptAds" color="primary" hide-details />
			</v-card-text>

			<v-card-actions>
				<v-btn block class="btn-primary variant=flat mt-4" :disabled="!(acceptCgu && acceptPrivacy)" @click="acceptConsent">
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
	const alreadyShown =
		localStorage.getItem("microdefis-consent") === "true";
	show.value = !alreadyShown;
});

function acceptConsent() {
	localStorage.setItem("microdefis-consent", "true");
	localStorage.setItem(
		"microdefis-consent-date",
		new Date().toISOString()
	);

	// Gestion pubs
	if (acceptAds.value) {
		localStorage.setItem("ads-consent", "true");

		if (window.gtag) {
			window.gtag("consent", "update", {
				ad_storage: "granted",
				analytics_storage: "granted",
			});
		}
	} else {
		localStorage.setItem("ads-consent", "false");

		if (window.gtag) {
			window.gtag("consent", "update", {
				ad_storage: "denied",
				analytics_storage: "denied",
			});
		}
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

.v-card-text {
	margin-bottom: 16px;
}
</style>