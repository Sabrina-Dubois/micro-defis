<template>
	<div class="help-page">
		<div class="top">
			<div class="page-title">💡 Centre d'aide </div>
		</div>

		<v-card class="micro-card mb-6">
			<h2>🔍 Recherche rapide</h2>
			<v-text-field
				v-model="searchQuery"
				placeholder="streak, valider, progression..."
				prepend-inner-icon="mdi-magnify"
				variant="outlined"
				density="comfortable"
				clearable
				hide-details
				class="search-field"
			/>
		</v-card>

		<v-card class="micro-card mb-6 ">
			<h2>❓ FAQ MicroDéfis</h2>
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
			<h2>🆘 Support</h2>
			<v-list density="comfortable">
				<v-list-item
					title="support@microdefis.com"
					subtitle="Réponse < 24h (dites version app + bug)"
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

const searchQuery = ref("");
const activePanels = ref([]);

// FAQ
const faqs = [
	{
		question: "Comment commencer les défis ?",
		answer:
			'Ouvrez le défi → Complétez → "Valider" (option : photo preuve). Streak mis à jour instant !',
	},
	{
		question: "Comment valider un défi ?",
		answer:
			'Défi ouvert → Faites-le → Bouton "✓ Validé" en bas. Progression + streak mis à jour instantanément.',
	},
	{
		question: "C'est quoi mon streak ?",
		answer:
			"Série défis validés consécutivement. Ex: 7j = streak 7. Perdu si 1 jour manqué.",
	},
	{
		question: "Où voir ma progression ?",
		answer:
			"Menu bas → Profil/Stats : liste défis faits, streak actuel, total validés, graph simple.",
	},
	{
		question: "J'ai pas reçu le lien signup ?",
		answer:
			'Vérifiez spam/promos. Demandez nouveau via bouton "Recommencer" ou support@microdefis.com.',
	},
	{
		question: "Changer email/compte ?",
		answer:
			"Pour l'instant fixe (lien unique). Nouveau streak = nouveau lien. Support pour merge.",
	},
	{
		question: "Défis offline ?",
		answer:
			"Validation nécessite internet (sync streak). Liste défis OK offline.",
	},
	{
		question: "Partager mes stats ?",
		answer:
			'Profil → Bouton "Partager" → Image streak prête (copie/Whatsapp). Anonyme.',
	},
	{
		question: "Notifications/rappels ?",
		answer:
			"Activez push notifications (premier lancement). Rappels quotidiens streak.",
	},
	{
		question: "Changer langue ?",
		answer:
			'Paramètres → "Langue" → Choix Français/English. Reboot app pour appliquer.',
	},
	{
		question: "Problème technique ?",
		answer:
			"1. Refresh page. 2. Videz cache (Paramètres navigateur). 3. Support support@microdefis.com + : App version ? Navigateur ? Screenshot ? Étape exacte ?",
	},
	{
		question: "Données personnelles ?",
		answer:
			"Email + progression stockés (RGPD). Voir /privacy. Demandez suppression.",
	},
	{
		question: "Notifications ne marchent pas ?",
		answer:
			'Paramètres → "Notifications" → Activez push. Vérifiez permissions app (iOS/Android).',
	},
	{
		question: "Supprimer mon compte ?",
		answer:
			'Paramètres → "Supprimer compte" → Confirmez email. Données effacées 30j (RGPD).',
	},
	{
		question: "Partager mon streak ?",
		answer:
			'Profil → "Partager" → Image prête (Twitter/Insta/WhatsApp). Anonyme par défaut.',
	},
	{
		question: "Âge minimum pour s'inscrire ?",
		answer: "13 ans minimum (accord parental requis). Lisez CGU complètes.",
	},
	{
		question: "Activer mode sombre ?",
		answer: 'Paramètres → Apparence → "Mode sombre" (auto/système/manuel).',
	},
	{
		question: "Sync sur plusieurs téléphones ?",
		answer: "Même email = sync auto. Logout → Login sur autre appareil.",
	},
];

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
