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

			<!-- Section pubs 
			<v-card-text class="mb-4">
				<p class="mb-2">
					{{ t("consent.ads_intro") }}
				</p>

				<v-checkbox v-model="acceptAds" color="primary" hide-details />
			</v-card-text>-->

			<v-card-actions>
				<v-btn block class="consent-start-btn mt-2 mb-2" :disabled="!(acceptCgu && acceptPrivacy)" @click="acceptConsent">
					{{ t("consent.start") }}
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { supabase } from "@/lib/supabase";

const { t } = useI18n();

const show = ref(false);
const acceptCgu = ref(false);
const acceptPrivacy = ref(false);
// const acceptAds = ref(false); // Pub désactivée temporairement
const consentKey = ref("microdefis-consent");
let authSubscription = null;

async function refreshConsentVisibility() {
	const { data } = await supabase.auth.getSession();
	const userId = data?.session?.user?.id || "anonymous";
	consentKey.value = `microdefis-consent:${userId}`;
	const alreadyShown = localStorage.getItem(consentKey.value) === "true";
	show.value = !alreadyShown;
}

onMounted(() => {
	refreshConsentVisibility();
	const { data } = supabase.auth.onAuthStateChange(() => {
		refreshConsentVisibility();
	});
	authSubscription = data.subscription;
});

onUnmounted(() => {
	authSubscription?.unsubscribe?.();
	authSubscription = null;
});

function acceptConsent() {
	localStorage.setItem(consentKey.value, "true");
	localStorage.setItem(
		`${consentKey.value}-date`,
		new Date().toISOString()
	);

	// Gestion pubs désactivée temporairement
	// if (acceptAds.value) {
	// 	localStorage.setItem("ads-consent", "true");
	// 	if (window.gtag) {
	// 		window.gtag("consent", "update", {
	// 			ad_storage: "granted",
	// 			analytics_storage: "granted",
	// 		});
	// 	}
	// } else {
	// 	localStorage.setItem("ads-consent", "false");
	// 	if (window.gtag) {
	// 		window.gtag("consent", "update", {
	// 			ad_storage: "denied",
	// 			analytics_storage: "denied",
	// 		});
	// 	}
	// }

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

.consent-start-btn {
	background: #f97316 !important;
	color: #ffffff !important;
	font-weight: 800 !important;
}

.consent-start-btn:deep(.v-btn__content) {
	color: #ffffff !important;
}
</style>
