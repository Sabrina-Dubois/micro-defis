<template>
    <div class="pricing-card" :class="{ selected: isSelected, popular: popular }" @click="$emit('select', id)">
        <div v-if="popular" class="popular-badge">⭐ POPULAIRE</div>
        <div class="plan-header">
            <div class="plan-name">{{ name }}</div>
            <div v-if="saveText" class="plan-save">{{ saveText }}</div>
        </div>
        <div class="plan-price">
            <span class="price-amount">{{ priceAmount }}</span>
            <span class="price-period">{{ pricePeriod }}</span>
        </div>
        <div class="plan-desc">{{ desc }}</div>
    </div>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
    id: String,             // identifiant du plan
    name: String,           // nom du plan
    priceAmount: String,    // prix (ex: "0,99€")
    pricePeriod: String,    // période (ex: "/semaine")
    desc: String,           // description courte
    saveText: String,       // "Meilleur prix" ou autre
    popular: Boolean,       // est-ce le plan populaire ?
    isSelected: Boolean,    // est-ce sélectionné ?
});
</script>

<style scoped>

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

.pricing-card.selected {
	border-color: #3bce71;
	background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
	transform: translateY(-2px);
	box-shadow: 0 8px 16px rgba(59, 206, 113, 0.15);
}

.pricing-card.popular {
	border-color: #ff6b35;
	background: linear-gradient(135deg, #fff5f2 0%, #ffffff 100%);
}


.pricing-card.popular.selected {
	border-color: #ff6b35;
	background: linear-gradient(135deg, #fff5f2 0%, #ffffff 100%);
	box-shadow: 0 8px 16px rgba(255, 107, 53, 0.2), 0 0 0 3px rgba(59, 206, 113, 0.4);
}
</style>