<template>
	<div class="help-page">
		<div class="top">
			<div class="page-title">{{ t("help.title") }}</div>
		</div>

		<v-card class="micro-card mb-6">
			<h2>{{ t("help.search.title") }}</h2>
			<v-text-field
				v-model="searchQuery"
				placeholder="t('help.search.placeholder')"
				prepend-inner-icon="mdi-magnify"
				variant="outlined"
				density="comfortable"
				clearable
				hide-details
				class="search-field"
			/>
		</v-card>

		<v-card class="micro-card mb-6 ">
			<h2>{{ t("help.fad_title") }} </h2>
			<v-expansion-panels v-model="activePanels" multiple flat>
				<v-expansion-panel
					v-for="(faq, index) in filteredFaqs"
					:key="index"
					class="faq-panel"
				>
					<v-expansion-panel-title ripple>
						<span class="faq-question">{{ faq.question }}</span>
					</v-expansion-panel-title>
					<v-expansion-panel-text class="faq-answer">
						{{ faq.answer }}
					</v-expansion-panel-text>
				</v-expansion-panel>
			</v-expansion-panels>
		</v-card>

		<v-card class="micro-card">
			<h2>{{ t("help.support.title") }}</h2>
			<v-list density="comfortable">
				<v-list-item
					title="t('help.search.email')"
					subtitle="t('help.search.subtitle')"
					three-line
					@click="copyEmail"
					prepend-icon="mdi-email-fast"
				/>
			</v-list>
		</v-card>
	</div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const searchQuery = ref("");
const activePanels = ref([]);

// FAQ
const faqs = computed(() => t("help.faqs", {}, { returnObjects: true }));

const filteredFaqs = computed(() => {
	if (!searchQuery.value?.trim()) return faqs.slice(0, 30);
	const q = searchQuery.value.toLowerCase();
	return faqs.filter(
		(f) =>
			f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
	);
});

const copyEmail = () => {
	navigator.clipboard.writeText("support@microdefis.com");
};
</script>

<style scoped>
.top {
	margin: 12px 0 20px;
}

.micro-card {
	padding: 24px;
	margin-bottom: 24px;
	border-radius: 12px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

h2 {
	font-size: 20px;
	font-weight: 900;
	color: #1f2937;
	margin: 0 0 10px;
	display: flex;
	align-items: center;
	gap: 8px;
}

.search-field {
	max-width: 100%;
}

.faq-panel {
	margin-bottom: 4px !important;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
}

.faq-question {
	font-weight: 500;
	font-size: 16px;
}

.faq-answer {
	font-size: 15px;
	line-height: 1.6;
	color: #6b7280;
}

@media (max-width: 600px) {
	.micro-card {
		padding: 20px;
	}
	h2 {
		font-size: 18px;
	}
}
</style>
