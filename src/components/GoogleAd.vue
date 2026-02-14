<template>
	<div class="ad-wrapper">
		<div class="ad-label">Sponsorisé</div>
		<div class="ad-container">
			<ins
				class="adsbygoogle"
				style="display: block"
				data-ad-client="ca-pub-4871426633370312"
				:data-ad-slot="adSlot"
				data-ad-format="auto"
				data-full-width-responsive="true"
			></ins>
		</div>
	</div>
</template>

<script setup>
import { onMounted } from "vue"; // ✅ Import obligatoire

defineProps({
	adSlot: {
		type: String,
		required: true
	}
});

onMounted(() => {
	try {
		(window.adsbygoogle = window.adsbygoogle || []).push({});
	} catch (e) {
		console.error("AdSense error:", e);
	}
});
</script>

<style scoped>
.ad-wrapper {
	margin: 20px 0;
	padding: 12px;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 16px;
	border: 1px solid rgba(255, 255, 255, 0.1);
}

.ad-label {
	font-size: 10px;
	font-weight: 700;
	text-transform: uppercase;
	color: rgba(255, 255, 255, 0.4);
	text-align: center;
	margin-bottom: 8px;
	letter-spacing: 1px;
}

.ad-container {
	min-height: 100px;
	background: rgba(255, 255, 255, 0.02);
	border-radius: 12px;
	overflow: hidden;
}
</style>