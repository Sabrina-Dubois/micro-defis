<!-- components/ConsentDialog.vue -->
<template>
	<v-dialog v-model="show" persistent max-width="500">
		<v-card class="pa-6">
			<v-card-title class="text-h5">{{ t("consent.title") }}</v-card-title>
			<v-card-text>
				<p>{{ t("consent.intro") }}</p>
				<ul class="mt-2">
					<li><a href="/terms" target="_blank">{{ t("consent.cgu") }}</a></li>
					<li>
						<a href="/privacy" target="_blank"
							>{{ t("consent.privacy") }}</a
						>
					</li>
				</ul>
			</v-card-text>
			<v-card-actions class="pb-4 d-flex flex-column gap-2">
				<v-checkbox
					v-model="acceptCgu"
					label="J'accepte les Conditions d'utilisation"
					color="primary"
					hide-details
				/>
				<v-checkbox
					v-model="acceptPrivacy"
					label="J'accepte la Politique de confidentialité"
					color="primary"
					hide-details
				/>
				<v-btn
					block
					class="btn-primary mt-4"
					:disabled="!acceptCgu || !acceptPrivacy" 
					@click="acceptConsent" >
					{{ t("consent.start") }}
			</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script setup>
import { ref, onMounted } from "vue";

const show = ref(false);
const acceptCgu = ref(false);
const acceptPrivacy = ref(false);

onMounted(() => {
	if (!localStorage.getItem("microdefis-consent")) show.value = true;
});

function acceptConsent() {
	localStorage.setItem("microdefis-consent", "true");
	localStorage.setItem("microdefis-consent-date", new Date().toISOString());
	show.value = false;
}
</script>

<style>
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
</style>