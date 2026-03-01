<template>
	<div class="premium-page">

		<!-- Hero Section -->
		<div class="hero-section">
			<div class="crown-icon">👑</div>
			<h1 class="hero-title">Pass Premium</h1>
			<p class="hero-subtitle">
				Débloque tous les défis et accélère ta progression
			</p>
			<div class="hero-stats">
				<div class="hero-stat">
					<span class="stat-val">800+</span>
					<span class="stat-lbl">Défis</span>
				</div>
				<div class="hero-divider"></div>
				<div class="hero-stat">
					<span class="stat-val">5</span>
					<span class="stat-lbl">Niveaux</span>
				</div>
				<div class="hero-divider"></div>
				<div class="hero-stat">
					<span class="stat-val">∞</span>
					<span class="stat-lbl">Catégories</span>
				</div>
			</div>
		</div>

		<!-- Pricing Cards -->
		<v-card class="micro-card pa-5 mb-4">
			<div class="page-subtitle mb-4 text-center">Choisis ton plan</div>
			<div class="pricing-cards">
				<div class="pricing-card" :class="{ selected: selectedPlan === 'weekly' }"
					@click="selectPlan('weekly')">
					<div class="plan-header">
						<div class="plan-name">Hebdomadaire</div>
					</div>
					<div class="plan-price">
						<span class="price-amount">0,99€</span>
						<span class="price-period">/semaine</span>
					</div>
					<div class="plan-desc">Annule quand tu veux</div>
				</div>

				<div class="pricing-card popular" :class="{ selected: selectedPlan === 'monthly' }"
					@click="selectPlan('monthly')">
					<div class="popular-badge">⭐ POPULAIRE</div>
					<div class="plan-header">
						<div class="plan-name">Mensuel</div>
						<div class="plan-save">Le plus flexible</div>
					</div>
					<div class="plan-price">
						<span class="price-amount">2,99€</span>
						<span class="price-period">/mois</span>
					</div>
					<div class="plan-desc">Soit 0,10€/jour</div>
				</div>

				<div class="pricing-card" :class="{ selected: selectedPlan === 'yearly' }"
					@click="selectPlan('yearly')">
					<div class="plan-header">
						<div class="plan-name">Annuel</div>
						<div class="plan-save">Meilleur prix</div>
					</div>
					<div class="plan-price">
						<span class="price-amount">19,99€</span>
						<span class="price-period">/an</span>
					</div>
					<div class="plan-desc">Soit 1,67€/mois</div>
				</div>
			</div>
			<div class="trial-notice">
				🎉 <strong>7 jours d'essai gratuit</strong> sur tous les plans
			</div>
		</v-card>

		<!-- CTA Principal -->
		<v-btn class="btn-primary mb-2" block size="large" :loading="isLoading" @click="startTrial">
			🚀 Commencer l'essai gratuit
		</v-btn>
		<div class="guarantee mb-4">🔒 Sans engagement · Annulation en 1 clic</div>

		<!-- Ce que tu débloque -->
		<v-card class="micro-card pa-5 mb-4">
			<div class="page-subtitle mb-4 text-center">Ce que tu débloque</div>
			<div class="benefits-grid">
				<div class="benefit-item" v-for="benefit in benefits" :key="benefit.title">
					<div class="benefit-icon">{{ benefit.icon }}</div>
					<div class="benefit-title">{{ benefit.title }}</div>
					<div class="benefit-desc">{{ benefit.desc }}</div>
				</div>
			</div>
		</v-card>

		<!-- Comparaison Table -->
		<v-card class="micro-card pa-5 mb-4">
			<div class="page-subtitle mb-4 text-center">Gratuit vs Premium</div>
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

		<!-- Social Proof -->
		<v-card class="micro-card pa-5 mb-4">
			<div class="page-subtitle mb-4 text-center">Ils sont déjà Premium</div>
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
			<div class="page-subtitle mb-4 text-center">Questions fréquentes</div>
			<v-expansion-panels variant="accordion">
				<v-expansion-panel v-for="(faq, i) in faqs" :key="i">
					<v-expansion-panel-title>
						<strong>{{ faq.q }}</strong>
					</v-expansion-panel-title>
					<v-expansion-panel-text>{{ faq.a }}</v-expansion-panel-text>
				</v-expansion-panel>
			</v-expansion-panels>
		</v-card>

		<!-- CTA Final -->
		<v-btn class="btn-primary mb-4" block size="large" :loading="isLoading" @click="startTrial">
			👑 Souscrire maintenant
		</v-btn>
		<div class="guarantee">
			🔒 Paiement sécurisé · Annulation en 1 clic · Garantie 30 jours
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/stores/userStore";

const router = useRouter();
const userStore = useUserStore();
const isLoading = ref(false);
const selectedPlan = ref("monthly");

// IDs des prix Stripe (depuis .env)
const priceIds = {
	weekly: import.meta.env.VITE_STRIPE_PRICE_WEEKLY,
	monthly: import.meta.env.VITE_STRIPE_PRICE_MONTHLY,
	yearly: import.meta.env.VITE_STRIPE_PRICE_YEARLY,
};

const benefits = [
	{ icon: "🎯", title: "800+ défis", desc: "Tous niveaux, toutes catégories" },
	{ icon: "⚡", title: "Niveaux Expert", desc: "Intermédiaire, Avancé, Expert" },
	{ icon: "🛡️", title: "Streak Shield", desc: "Protège ta série en cas d'oubli" },
	{ icon: "📊", title: "Stats avancées", desc: "Suis ta progression en détail" },
	{ icon: "🎨", title: "Sans pub", desc: "Expérience 100% propre" },
	{ icon: "🏆", title: "Badges exclusifs", desc: "Montre ton statut Premium" },
];

const comparisonItems = [
	{ feature: "Défis Débutant 🌱", free: true },
	{ feature: "Tous les niveaux (800+ défis)", free: false },
	{ feature: "Toutes les catégories", free: false },
	{ feature: "Streak Shield 🛡️", free: false },
	{ feature: "Sans publicité", free: false },
	{ feature: "Badges exclusifs", free: false },
	{ feature: "Stats avancées", free: false },
];

const testimonials = [
	{ text: "Les défis Expert ont complètement changé ma routine. Je ne m'ennuie plus jamais !", author: "Thomas, Premium depuis 1 an" },
	{ text: "Le Streak Shield m'a sauvé plusieurs fois. Valait largement l'abonnement.", author: "Marie, Premium depuis 6 mois" },
	{ text: "J'ai créé de vraies nouvelles habitudes grâce à la variété des catégories.", author: "Lucas, Premium depuis 3 mois" },
];

const faqs = [
	{ q: "Puis-je annuler quand je veux ?", a: "Oui, annulation en 1 clic depuis les paramètres. Aucun engagement, aucune condition." },
	{ q: "Que se passe-t-il après l'essai gratuit ?", a: "Tu seras débité uniquement si tu ne résignes pas. Tu recevras un rappel par email 3 jours avant." },
	{ q: "Mes données sont-elles conservées si j'annule ?", a: "Oui, toutes tes stats et progrès restent sauvegardés. Tu peux réactiver Premium à tout moment." },
	{ q: "Y a-t-il des frais cachés ?", a: "Non, le prix affiché est le prix final. Aucun frais caché." },
];

function selectPlan(plan) {
	selectedPlan.value = plan;
}

async function startTrial() {
	try {
		if (!userStore.userId) {
			alert("Veuillez vous connecter");
			router.push("/login");
			return;
		}

		isLoading.value = true;

		// Appelle l'Edge Function Supabase pour créer la session Stripe
		const { data, error } = await supabase.functions.invoke("create-checkout-session", {
			body: {
				priceId: priceIds[selectedPlan.value],
				userId: userStore.userId,
				email: userStore.userEmail,
			},
		});

		if (error) throw error;
		if (!data?.url) throw new Error("URL de paiement manquante");

		// Redirige vers la page de paiement Stripe
		window.location.href = data.url;

	} catch (error) {
		console.error("❌ Erreur création session Stripe:", error);
		alert("Erreur lors de la redirection vers le paiement. Réessayez.");
	} finally {
		isLoading.value = false;
	}
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
	padding: 32px 20px;
	background: linear-gradient(125deg, #ff6b35 0%, #f7931e 100%);
	border-radius: 24px;
	margin-bottom: 24px;
	color: white;
}

.crown-icon {
	font-size: 64px;
	animation: bounce 2s infinite;
	display: block;
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
	margin-bottom: 20px;
}

.hero-stats {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 20px;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 16px;
	padding: 14px 20px;
	border: 1px solid rgba(255, 255, 255, 0.3);
}

.hero-stat {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 2px;
}

.stat-val {
	font-size: 22px;
	font-weight: 800;
}

.stat-lbl {
	font-size: 11px;
	opacity: 0.8;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.hero-divider {
	width: 1px;
	height: 32px;
	background: rgba(255, 255, 255, 0.35);
}

/* Pricing */
.pricing-cards {
	display: flex;
	flex-direction: column;
	gap: 12px;
	margin-bottom: 16px;
}

.pricing-card {
	position: relative;
	padding: 16px;
	border: 2px solid #e2e8f0;
	border-radius: 16px;
	cursor: pointer;
	transition: all 0.3s;
	background: white;
}

.pricing-card:hover {
	border-color: #e2e8f0;
	transform: translateY(-2px);
	box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

/* Card sélectionnée → verte */
.pricing-card.selected {
	border-color: #3bce71;
	background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
	transform: translateY(-2px);
	box-shadow: 0 8px 16px rgba(59, 206, 113, 0.15);
}

/* Card populaire → toujours orange, même si sélectionnée */
.pricing-card.popular {
	border-color: #ff6b35;
	background: linear-gradient(135deg, #fff5f2 0%, #ffffff 100%);
}

/* Card populaire ET sélectionnée → garde le style populaire avec un contour vert en plus */
.pricing-card.popular.selected {
	border-color: #ff6b35;
	background: linear-gradient(135deg, #fff5f2 0%, #ffffff 100%);
	box-shadow: 0 8px 16px rgba(255, 107, 53, 0.2), 0 0 0 3px rgba(59, 206, 113, 0.4);
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

/* Benefits */
.benefits-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 12px;
}

.benefit-item {
	text-align: center;
	padding: 16px 10px;
	background: #f7e9e4;
	border-radius: 16px;
}

.benefit-icon {
	font-size: 32px;
	margin-bottom: 6px;
}

.benefit-title {
	font-size: 13px;
	font-weight: 700;
	color: #0f172a;
	margin-bottom: 4px;
}

.benefit-desc {
	font-size: 11px;
	color: #64748b;
	line-height: 1.4;
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
	color: #ffffff;
	margin-top: 8px;
}
</style>