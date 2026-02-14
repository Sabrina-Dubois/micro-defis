<template>
	<v-container class="fill-height d-flex align-center justify-center">
		<div style="text-align: center; max-width: 320px">
			<v-progress-circular
				indeterminate
				color="primary"
				:size="56"
				:widxth="6"
			/>
			<div class="page-title">
				{{ t("authCallBack.connexion") }}
			</div>
			<div
				style="
					color: rgba(255, 255, 255, 0.85);
					font-weight: 700;
					font-size: 13px;
					margin-top: 6px;
				"
			>
				{{ t("authCallBack.access") }}
			</div>
		</div>
	</v-container>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { supabase } from "../lib/supabase";

const router = useRouter();
const route = useRoute();

onMounted(async () => {
	// MAGIC LINK = token_hash dans #hash
	const hash = window.location.hash.slice(1);
	const urlParams = new URLSearchParams(hash);
	const token_hash = urlParams.get("token_hash");

	if (token_hash) {
		const { error } = await supabase.auth.verifyOtp({
			token_hash,
			type: "magiclink",
		});
		if (!error) {
			router.replace("/");
			return;
		}
	}

	// Fallback OAuth/normal
	const redirect = route.query.redirect?.toString() || "/daily";

	for (let i = 0; i < 3; i++) {
		const { data } = await supabase.auth.getSession();
		if (data.session) {
			router.replace(redirect);
			return;
		}
		await new Promise((r) => setTimeout(r, 250));
	}

	router.replace("/login");
});
</script>
