<template>
	<nav class="bottom-nav">
		<RouterLink class="item" to="/daily" active-class="active">
			<v-icon size="40">mdi-home-outline</v-icon>
		</RouterLink>

		<RouterLink class="item" to="/calendar" active-class="active">
			<v-icon size="40">mdi-calendar-month-outline</v-icon>
		</RouterLink>

		<RouterLink class="item" to="/leaderboard" active-class="active">
			<v-icon size="40">mdi-trophy-outline</v-icon>
		</RouterLink>

		<RouterLink class="item" to="/profile" active-class="active">
			<v-icon size="40">mdi-account-outline</v-icon>
		</RouterLink>

		<RouterLink v-if="isAdmin" class="item" to="/admin" active-class="active">
			<v-icon size="40">mdi-shield-crown-outline</v-icon>
		</RouterLink>
		
		<RouterLink class="item" to="/settings" active-class="active">
			<v-icon size="40">mdi-cog-outline</v-icon>
		</RouterLink>

	</nav>
</template>

<script setup>
import { computed } from "vue";
import { useSettingsStore } from "@/stores/settingsStore";

const settingsStore = useSettingsStore();
const isAdmin = computed(() => settingsStore.isAdmin);
</script>

<style>
.bottom-nav {
	position: fixed;
	left: 12px;
	right: 12px;
	bottom: 12px;
	height: 64px;
	display: flex;
	
	align-items: center;

	padding: 10px 12px;
	background: var(--surface);
	color: var(--text-primary);
	border: 1px solid var(--border);
	border-radius: 18px;
	backdrop-filter: blur(10px);
		z-index: 1000; /* toujours au-dessus */
}
.item {
	flex: 1;
	text-align: center;
	text-decoration: none;
	color: var(--text-secondary);
	font-weight: 600;
	font-size: 12px;
	padding: 10px 8px;
	border-radius: 14px;
}
.active {
	color: var(--primary);
	background: var(--primary-soft);
}
</style>
