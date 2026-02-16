<template>
	<div class="premium-page">
		<!-- Hero Section -->
		<div class="hero-section">
			<div class="crown-icon">👑</div>
			<h1 class="hero-title">Pass Premium</h1>
			<p class="hero-subtitle">
				Débloque tous les défis et accélère ta progression
			</p>
		</div>

		<!-- Comparaison Table -->
		<v-card class="micro-card pa-5 mb-4">
			<div class="page-subtitle mb-4 text-center">
				Gratuit vs Premium
			</div>

			<div class="comparison-table">
				<div class="comparison-row header">
					<div class="feature-name"></div>
					<div class="plan-col">Gratuit</div>
					<div class="plan-col premium">Premium</div>
				</div>

				<div class="comparison-row" v-for="item in comparisonItems" :key="item.feature">
					<div class="feature-name">{{ item.feature }}</div>
					<div class="plan-col">
						<v-icon :color="item.free ? 'green' : 'grey'">
							{{ item.free ? 'mdi-check-circle' : 'mdi-close-circle' }}
						</v-icon>
					</div>
					<div class="plan-col premium">
						<v-icon color="deep-orange">mdi-check-circle</v-icon>
					</div>
				</div>
			</div>
		</v-card>

		<!-- Bénéfices -->
		<v-card class="micro-card pa-5 mb-4">
			<div class="page-subtitle mb-4 text-center">
				Pourquoi passer Premium ?
			</div>

			<div class="benefits-grid">
				<div class="benefit-item" v-for="benefit in benefits" :key="benefit.title">
					<div class="benefit-icon">{{ benefit.icon }}</div>
					<div class="benefit-title">{{ benefit.title }}</div>
					<div class="benefit-desc">{{ benefit.desc }}</div>
				</div>
			</div>
		</v-card>

		<!-- Pricing Cards -->
		<v-card class="micro-card pa-5 mb-4">
			<div class="page-subtitle mb-4 text-center">
				Choisis ton plan
			</div>

			<div class="pricing-cards">
				<!-- Plan Hebdo -->
				<div class="pricing-card" @click="selectPlan('weekly')">
					<div class="plan-header">
						<div class="plan-name">Hebdomadaire</div>
					</div>
					<div class="plan-price">
						<span class="price-amount">0,99€</span>
						<span class="price-period">/semaine</span>
					</div>
					<div class="plan-desc">Annule quand tu veux</div>
				</div>


				<!-- Plan Mensuel (POPULAIRE) -->
				<div class="pricing-card popular" @click="selectPlan('monthly')">
					<div class="popular-badge">⭐ POPULAIRE</div>
					<div class="plan-header">
						<div class="plan-name">Mois</div>
						<div class="plan-save">Économise 20€</div>
					</div>
					<div class="plan-price">
						<span class="price-amount">4,99€</span>
						<span class="price-period">/an</span>
					</div>
					<div class="plan-desc">Soit 3,33€/mois</div>
				</div>

				<!-- Plan Annuel -->
				<div class="pricing-card" @click="selectPlan('yearly')">
					<div class="plan-header">
						<div class="plan-name">Annuel</div>
						<div class="plan-save">Économise 20€</div>
					</div>
					<div class="plan-price">
						<span class="price-amount">39,99€</span>
						<span class="price-period">/an</span>
					</div>
					<div class="plan-desc">Soit 3,33€/mois</div>
				</div>

				<!-- Plan Lifetime 
				<div class="pricing-card" @click="selectPlan('lifetime')">
					<div class="plan-header">
						<div class="plan-name">À vie</div>
					</div>
					<div class="plan-price">
						<span class="price-amount">99,99€</span>
						<span class="price-period">unique</span>
					</div>
					<div class="plan-desc">Accès illimité à vie</div>
				</div>-->
			</div>

			<div class="trial-notice">
				🎉 <strong>7 jours d'essai gratuit</strong> sur tous les plans
			</div>
		</v-card>

		<!-- Social Proof -->
		<v-card class="micro-card pa-5 mb-4">
			<div class="page-subtitle mb-4 text-center">
				Ils sont déjà Premium
			</div>

			<div class="testimonials">
				<div class="testimonial" v-for="(test, i) in testimonials" :key="i">
					<div class="stars">⭐⭐⭐⭐⭐</div>
					<div class="testimonial-text">"{{ test.text }}"</div>
					<div class="testimonial-author">— {{ test.author }}</div>
				</div>
			</div>
		</v-card>

		<!-- FAQ -->
		<v-card class="micro-card pa-5 mb-4">
			<div class="page-subtitle mb-4 text-center">
				Questions fréquentes
			</div>

			<v-expansion-panels variant="accordion">
				<v-expansion-panel v-for="(faq, i) in faqs" :key="i">
					<v-expansion-panel-title>
						<strong>{{ faq.q }}</strong>
					</v-expansion-panel-title>
					<v-expansion-panel-text>
						{{ faq.a }}
					</v-expansion-panel-text>
				</v-expansion-panel>
			</v-expansion-panels>
		</v-card>

		<!-- CTA Final -->
		<v-btn class="btn-primary mb-4" block size="large" @click="startTrial">
			🚀 Commencer l'essai gratuit
		</v-btn>

		<div class="guarantee">
			🔒 Paiement sécurisé · Annulation en 1 clic · Garantie 30 jours
		</div>

		<!-- Dialog Confirmation -->
		<v-dialog v-model="showDialog" max-width="400">
			<v-card class="pa-6 text-center">
				<v-icon color="green" size="64" class="mb-4">mdi-check-circle</v-icon>
				<div class="text-h5 font-weight-bold mb-2">🎉 Bienvenue Premium !</div>
				<p class="mb-4">
					Ton essai gratuit de 7 jours commence maintenant.
					Profite de tous les défis !
				</p>
				<v-btn color="deep-orange" block @click="closeDialog">
					C'est parti !
				</v-btn>
			</v-card>
		</v-dialog>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/stores/userStore";

const router = useRouter();
const userStore = useUserStore();
const showDialog = ref(false);
const selectedPlan = ref("yearly");

// Données de comparaison
const comparisonItems = [
	{ feature: "Défis Débutant 🌱", free: true },
	{ feature: "Tous les niveaux (800+ défis)", free: false },
	{ feature: "Toutes les catégories", free: false },
	//{ feature: "Stats avancées", free: false },
	{ feature: "Sans publicité", free: false },
	{ feature: "Badges exclusifs", free: false },
	{ feature: "Mode sombre", free: true },
];

// Bénéfices
const benefits = [
	{
		icon: "🔥",
		title: "Reste motivé",
		desc: "Accède à 800+ défis variés pour ne jamais t'ennuyer"
	},
	{
		icon: "💪",
		title: "Progresse vraiment",
		desc: "Challenges adaptés à ton niveau, du débutant à l'expert"
	},
	/*{
		icon: "📊",
		title: "Suis tes progrès",
		desc: "Statistiques détaillées et analyse de tes habitudes"
	},*/
	{
		icon: "🎨",
		title: "Personnalise",
		desc: "Choisis exactement les catégories qui t'intéressent"
	}
];

// Témoignages
const testimonials = [
	{
		text: "Meilleure app de défis que j'ai testée. Les défis Expert sont top !",
		author: "Thomas, Premium depuis 1 an"
	},
	{
		text: "J'adore la variété des catégories. Toujours quelque chose de nouveau.",
		author: "Marie, Premium depuis 6 mois"
	},
	{
		text: "Ça m'a vraiment aidé à créer de nouvelles habitudes positives.",
		author: "Lucas, Premium depuis 3 mois"
	}
];

// FAQ
const faqs = [
	{
		q: "❓ Puis-je annuler quand je veux ?",
		a: "Oui, annulation en 1 clic depuis les paramètres. Aucun engagement."
	},
	{
		q: "❓ Que se passe-t-il après l'essai gratuit ?",
		a: "Tu seras débité uniquement si tu ne résilie pas. Tu recevras un rappel par email avant."
	},
	{
		q: "❓ Mes données sont-elles conservées si j'annule ?",
		a: "Oui, toutes tes stats et progrès restent sauvegardés. Tu peux réactiver Premium à tout moment."
	},
	{
		q: "❓ Y a-t-il des frais cachés ?",
		a: "Non, le prix affiché est le prix final. Aucun frais caché."
	}
];

// Actions
function selectPlan(plan) {
	selectedPlan.value = plan;
	console.log("Plan sélectionné:", plan);
}

async function startTrial() {
	try {
		// ✅ TODO: Appeler ton backend/Stripe pour créer la subscription

		// Pour l'instant, on active juste le premium dans la BDD
		if (!userStore.userId) {
			alert("Veuillez vous connecter");
			router.push("/login");
			return;
		}

		// Activer premium dans user_profiles
		const { error } = await supabase
			.from("user_profiles")
			.update({ premium: true })
			.eq("user_id", userStore.userId);

		if (error) throw error;

		// Recharger le user
		await userStore.loadUser();

		showDialog.value = true;

		console.log("✅ Premium activé pour:", selectedPlan.value);
	} catch (error) {
		console.error("❌ Erreur activation premium:", error);
		alert("Erreur lors de l'activation. Réessayez.");
	}
}

function closeDialog() {
	showDialog.value = false;
	router.push("/");
}
</script>

<style scoped>
.premium-page {
	max-width: 600px;
	margin: 0 auto;
	padding: 16px;
}

/* Hero */
.hero-section {
	text-align: center;
	padding: 15px 15px;
	background: linear-gradient(125deg, #ff6b35 0%, #f7931e 100%);
	border-radius: 24px;
	margin-bottom: 24px;
	color: white;
}

.crown-icon {
	font-size: 64px;
	animation: bounce 2s infinite;
}

@keyframes bounce {
	0%,
	100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-10px);
	}
}

.hero-title {
	font-size: 32px;
	font-weight: 800;
	margin-bottom: 8px;
}

.hero-subtitle {
	font-size: 16px;
	opacity: 0.95;
}

/* Comparison Table */
.comparison-table {
	width: 100%;
}

.comparison-row {
	display: grid;
	grid-template-columns: 2fr 1fr 1fr;
	gap: 12px;
	padding: 12px 8px;
	border-bottom: 1px solid #e2e8f0;
	align-items: center;
}

.comparison-row.header {
	font-weight: 700;
	background: #f8fafc;
	border-radius: 8px;
	border: none;
}

.feature-name {
	font-size: 14px;
	color: #334155;
}

.plan-col {
	text-align: center;
	font-weight: 600;
	font-size: 13px;
}

.plan-col.premium {
	color: #ff6b35;
}

/* Benefits Grid */
.benefits-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 16px;
}

.benefit-item {
	text-align: center;
	padding: 5px 5px ;
	background: #f7e9e4;
	border-radius: 20px;
}

.benefit-icon {
	font-size: 40px;
	margin-bottom: 8px;
}

.benefit-title {
	font-size: 16px;
	font-weight: 700;
	color: #0f172a;
	margin-bottom: 4px;
}

.benefit-desc {
	font-size: 12px;
	color: #64748b;
	line-height: 1.4;
}

/* Pricing Cards */
.pricing-cards {
	display: flex;
	flex-direction: column;
	gap: 12px;
	margin-bottom: 16px;
}

.pricing-card {
	position: relative;
	padding: 10px;
	border: 2px solid #e2e8f0;
	border-radius: 16px;
	cursor: pointer;
	transition: all 0.3s;
	background: white;
}

.pricing-card:hover {
	border-color: #ff6b35;
	transform: translateY(-2px);
	box-shadow: 0 8px 16px rgba(255, 107, 53, 0.1);
}

.pricing-card.popular {
	border-color: #ff6b35;
	background: linear-gradient(135deg, #fff5f2 0%, #ffffff 100%);
}

.popular-badge {
	position: absolute;
	top: -12px;
	right: 16px;
	background: #ff6b35;
	color: white;
	padding: 4px 12px;
	border-radius: 12px;
	font-size: 11px;
	font-weight: 700;
}

.plan-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;
}

.plan-name {
	font-size: 18px;
	font-weight: 700;
	color: #0f172a;
}

.plan-save {
	font-size: 12px;
	color: #22c55e;
	font-weight: 600;
	background: #f0fdf4;
	padding: 4px 8px;
	border-radius: 6px;
}

.plan-price {
	margin-bottom: 8px;
}

.price-amount {
	font-size: 32px;
	font-weight: 800;
	color: #ff6b35;
}

.price-period {
	font-size: 16px;
	color: #64748b;
	font-weight: 600;
}

.plan-desc {
	font-size: 14px;
	color: #64748b;
}

.trial-notice {
	text-align: center;
	padding: 12px;
	background: #f7e9e4;
	border-radius: 8px;
	font-size: 14px;
	color: #0f172a;
}

/* Testimonials */
.testimonials {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.testimonial {
	padding: 16px;
	background: #f8fafc;
	border-radius: 12px;
	border-left: 4px solid #ff6b35;
}

.stars {
	font-size: 14px;
	margin-bottom: 8px;
}

.testimonial-text {
	font-size: 14px;
	color: #334155;
	margin-bottom: 8px;
	font-style: italic;
}

.testimonial-author {
	font-size: 12px;
	color: #64748b;
	font-weight: 600;
}

/* Guarantee */
.guarantee {
	text-align: center;
	font-size: 12px;
	color: #64748b;
	margin-top: 16px;
}
.guarantee {
	color: white;
}

/* Responsive */
@media (max-width: 600px) {
	.benefits-grid {
		grid-template-columns: 1fr;
	}

	.comparison-row {
		font-size: 13px;
	}

	.hero-title {
		font-size: 28px;
	}
}
</style>