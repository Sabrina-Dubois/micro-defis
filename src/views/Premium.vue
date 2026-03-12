<template>
	<div class="premium-page">

		<!-- Hero Section -->
		<div class="hero-section">
			<div class="crown-icon">👑</div>
			<h1 class="hero-title">{{ t("premium.hero.title") }}</h1>
			<p class="hero-subtitle">
				{{ t("premium.hero.subtitle") }}
			</p>
			<div class="hero-stats">
				<div class="hero-stat">
					<span class="stat-val">800+</span>
					<span class="stat-lbl">{{ t("premium.hero.stats.challenges") }}</span>
				</div>
				<div class="hero-divider"></div>
				<div class="hero-stat">
					<span class="stat-val">5</span>
					<span class="stat-lbl">{{ t("premium.hero.stats.levels") }}</span>
				</div>
				<div class="hero-divider"></div>
				<div class="hero-stat">
					<span class="stat-val">∞</span>
					<span class="stat-lbl">{{ t("premium.hero.stats.categories") }}</span>
				</div>
			</div>
		</div>

		<!-- Pricing Cards -->
		<v-card class="micro-card pa-5 mb-4">
			<div class="page-subtitle mb-4 text-center">{{ t("premium.plans.title") }}</div>
			<div class="pricing-cards">
				<div
					v-for="plan in plans"
					:key="plan.id"
					class="pricing-card"
					:class="{ selected: selectedPlan === plan.id, popular: plan.popular }"
					@click="selectPlan(plan.id)"
				>
					<div v-if="plan.popular" class="popular-badge">{{ t("premium.plans.popular") }}</div>
					<div class="plan-header">
						<div class="plan-name">{{ t(plan.nameKey) }}</div>
						<div v-if="plan.saveKey" class="plan-save">{{ t(plan.saveKey) }}</div>
					</div>
					<div class="plan-price">
						<span class="price-amount">{{ t(plan.priceKey) }}</span>
						<span class="price-period">{{ t(plan.periodKey) }}</span>
					</div>
					<div class="plan-desc">{{ t(plan.descKey) }}</div>
				</div>
			</div>
			<div class="trial-notice">
				🎉 <strong>{{ t("premium.trial.highlight") }}</strong> {{ t("premium.trial.suffix") }}
			</div>
		</v-card>

		<!-- CTA Principal -->
		<v-btn class="btn-primary mb-2" block size="large" :loading="isLoading" @click="startTrial">
			🚀 {{ t("premium.cta.start_trial") }}
		</v-btn>
		<div class="guarantee mb-4">🔒 {{ t("premium.cta.guarantee") }}</div>

		<!-- Ce que tu débloque -->
		<v-card class="micro-card pa-5 mb-4">
			<div class="page-subtitle mb-4 text-center">{{ t("premium.benefits.title") }}</div>
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
			<div class="page-subtitle mb-4 text-center">{{ t("premium.comparison.title") }}</div>
			<div class="comparison-table">
				<div class="comparison-row header">
					<div class="feature-name"></div>
					<div class="plan-col">{{ t("premium.comparison.free") }}</div>
					<div class="plan-col premium">{{ t("premium.comparison.premium") }}</div>
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
			<div class="page-subtitle mb-4 text-center">{{ t("premium.testimonials.title") }}</div>
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
			<div class="page-subtitle mb-4 text-center">{{ t("premium.faqs.title") }}</div>
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
			👑 {{ t("premium.cta.subscribe") }}
		</v-btn>
		<div class="guarantee">
			🔒 {{ t("premium.cta.final_guarantee") }}
		</div>
	</div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/stores/userStore";
import { useI18n } from "vue-i18n";

const router = useRouter();
const userStore = useUserStore();
const isLoading = ref(false);
const selectedPlan = ref("monthly");
const { t } = useI18n();

// IDs des prix Stripe (depuis .env)
const priceIds = {
	weekly: import.meta.env.VITE_STRIPE_PRICE_WEEKLY,
	monthly: import.meta.env.VITE_STRIPE_PRICE_MONTHLY,
	yearly: import.meta.env.VITE_STRIPE_PRICE_YEARLY,
};

const plans = computed(() => [
	{
		id: "weekly",
		nameKey: "premium.plans.weekly.name",
		priceKey: "premium.plans.weekly.price",
		periodKey: "premium.plans.weekly.period",
		descKey: "premium.plans.weekly.desc",
		saveKey: null,
		popular: false,
	},
	{
		id: "monthly",
		nameKey: "premium.plans.monthly.name",
		priceKey: "premium.plans.monthly.price",
		periodKey: "premium.plans.monthly.period",
		descKey: "premium.plans.monthly.desc",
		saveKey: "premium.plans.monthly.save",
		popular: true,
	},
	{
		id: "yearly",
		nameKey: "premium.plans.yearly.name",
		priceKey: "premium.plans.yearly.price",
		periodKey: "premium.plans.yearly.period",
		descKey: "premium.plans.yearly.desc",
		saveKey: "premium.plans.yearly.save",
		popular: false,
	},
]);

const benefits = computed(() => [
	{ icon: "🎯", title: t("premium.benefits.items.challenges.title"), desc: t("premium.benefits.items.challenges.desc") },
	{ icon: "⚡", title: t("premium.benefits.items.levels.title"), desc: t("premium.benefits.items.levels.desc") },
	{ icon: "🛡️", title: t("premium.benefits.items.shield.title"), desc: t("premium.benefits.items.shield.desc") },
	{ icon: "📊", title: t("premium.benefits.items.stats.title"), desc: t("premium.benefits.items.stats.desc") },
	{ icon: "🏆", title: t("premium.benefits.items.badges.title"), desc: t("premium.benefits.items.badges.desc") },
]);

const comparisonItems = computed(() => [
	{ feature: t("premium.comparison.items.beginner"), free: true },
	{ feature: t("premium.comparison.items.all_levels"), free: false },
	{ feature: t("premium.comparison.items.all_categories"), free: false },
	{ feature: t("premium.comparison.items.shield"), free: false },
	{ feature: t("premium.comparison.items.badges"), free: false },
	{ feature: t("premium.comparison.items.stats"), free: false },
]);

const testimonials = computed(() => [
	{ text: t("premium.testimonials.items.t1.text"), author: t("premium.testimonials.items.t1.author") },
	{ text: t("premium.testimonials.items.t2.text"), author: t("premium.testimonials.items.t2.author") },
	{ text: t("premium.testimonials.items.t3.text"), author: t("premium.testimonials.items.t3.author") },
]);

const faqs = computed(() => [
	{ q: t("premium.faqs.items.q1.q"), a: t("premium.faqs.items.q1.a") },
	{ q: t("premium.faqs.items.q2.q"), a: t("premium.faqs.items.q2.a") },
	{ q: t("premium.faqs.items.q3.q"), a: t("premium.faqs.items.q3.a") },
	{ q: t("premium.faqs.items.q4.q"), a: t("premium.faqs.items.q4.a") },
]);

function selectPlan(plan) {
	selectedPlan.value = plan;
}

async function startTrial() {
	try {
		if (!userStore.userId) {
			alert(t("premium.errors.login_required"));
			router.push("/login");
			return;
		}

		isLoading.value = true;

		// Récupère le token JWT de l'utilisateur connecté
		const { data: { session } } = await supabase.auth.getSession();
		if (!session) throw new Error(t("premium.errors.session_expired"));

		// Appel direct avec fetch — évite que Supabase écrase le header Authorization
		const response = await fetch(
			"https://odnvnewqvotgddgnlkuj.supabase.co/functions/v1/create-checkout-session",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${session.access_token}`,
					"apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
				},
				body: JSON.stringify({
					priceId: priceIds[selectedPlan.value],
				}),
			}
		);

		const data = await response.json();
		if (!response.ok) throw new Error(data.error || t("premium.errors.server_error"));
		if (!data?.url) throw new Error(t("premium.errors.missing_payment_url"));

		window.location.href = data.url;

	} catch (error) {
		console.error("❌ Erreur création session Stripe:", error);
		alert(t("premium.errors.redirect_failed"));
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
