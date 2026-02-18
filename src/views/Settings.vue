<template>
	<div class="settings-page">
		<div class="page-title mt-4 mb-4 text-h4">
			{{ t("settings.title") }}
		</div>

		<!-- Profil -->
		<v-card class="micro-card fixed-card card-profile pa-4 mb-4">
			<div class="page-subtitle mb-4">{{ t("settings.profil.title") }}</div>
			<v-text-field v-model="userName" :label="t('settings.profil.username')" variant="outlined" density="compact"
				hide-details class="mb-3" />
			<v-text-field v-model="userStore.userEmail" :label="t('settings.profil.email')" variant="outlined"
				density="compact" disabled hide-details />
			<v-btn class="btn-primary mt-4" block variant="flat" @click="saveProfile">
				{{ t("settings.profil.save") }}
			</v-btn>
		</v-card>

		<!-- Préférences Défis -->
		<v-card class="micro-card fixed-card card-favorite  pa-4 mb-4">
			<div class="page-subtitle mb-3">{{ t("settings.defis.title") }}</div>

			<div class="mb-4">
				<div class="mb-2 text-subtitle-2 font-weight-bold">{{ t("settings.defis.category") }}</div>
				<v-chip-group v-model="preferredCategory" multiple column>
					<v-chip v-for="cat in categories" :key="cat.id" :value="cat.name"
						:class="cat.premium ? 'chip-premium' : 'chip-free'"
						:disabled="cat.premium && !settingsStore.isPremium">
						{{ cat.name }}
						<template v-if="cat.premium && !settingsStore.isPremium"> 🔒</template>
					</v-chip>
				</v-chip-group>
			</div>

			<div class="mb-4">
				<div class="mb-2 text-subtitle-2 font-weight-bold">{{ t("settings.defis.level") }}</div>
				<v-chip-group v-model="preferredLevel" multiple column>
					<v-chip v-for="level in levels" :key="level.id" :value="level.name"
						:class="level.premium ? 'chip-premium' : 'chip-free'"
						:disabled="level.premium && !settingsStore.isPremium">
						{{ level.name }}
						<template v-if="level.premium && !settingsStore.isPremium"> 🔒</template>
					</v-chip>
				</v-chip-group>
			</div>

			<v-alert v-if="!settingsStore.isPremium" type="info" variant="tonal" density="compact" class="mb-3">
				<template #prepend><v-icon>mdi-crown</v-icon></template>
				{{ t("settings.defis.premium") }}
			</v-alert>

			<v-btn block class="btn-primary" @click="saveDefiPrefs">
				{{ t("settings.defis.save") }}
			</v-btn>
		</v-card>

		<!-- Préférences générales -->
		<v-card class="micro-card pa-4 mb-4">
			<div class="page-subtitle mb-3">{{ t("settings.preferences.title") }}</div>

			<v-list bg-color="transparent">

				<!-- Notifications -->
				<v-list-item>
					<template #prepend><v-icon>mdi-bell</v-icon></template>
					<v-list-item-title>{{ t("settings.preferences.notifications") }}</v-list-item-title>
					<template #append>
						<v-switch :model-value="settingsStore.notificationsEnabled" color="primary" hide-details
							density="compact" @update:model-value="(val) => toggleNotifications(val)" />
					</template>
				</v-list-item>

				<!-- Rappel — slider -->
				<template v-if="settingsStore.notificationsEnabled">
					<v-list-item>
						<template #prepend><v-icon>mdi-clock</v-icon></template>
						<v-list-item-title>
							{{ t("settings.preferences.reminder") }}
							<span class="reminder-time-label">{{ settingsStore.reminderTime }}</span>
						</v-list-item-title>
					</v-list-item>
					<div class="px-4 pb-3">
						<v-slider :model-value="sliderValue" :min="0" :max="23" :step="1" color="#f97922"
							track-color="rgba(109,40,217,0.2)" thumb-color="#f97922" hide-details
							:thumb-label="true"
							@update:model-value="(val) => setReminderTime(String(val).padStart(2, '0') + ':00')">
							<template #thumb-label="{ modelValue }">
								{{ String(modelValue).padStart(2, '0') }}h
							</template>
						</v-slider>
					</div>
				</template>

				<!-- Langue -->
				<v-list-item style="cursor: pointer" @click="changeLanguage">
					<template #prepend><v-icon>mdi-web</v-icon></template>
					<v-list-item-title>{{ t("settings.preferences.language") }}</v-list-item-title>
					<template #append>
						<span class="setting-value">{{ settingsStore.languageLabel }}</span>
					</template>
				</v-list-item>

				<!-- Thème -->
				<v-list-item style="cursor: pointer" @click="changeTheme">
					<template #prepend><v-icon>mdi-palette</v-icon></template>
					<v-list-item-title>{{ t("settings.preferences.theme") }}</v-list-item-title>
					<template #append>
						<span class="setting-value">{{ settingsStore.themeLabel }}</span>
					</template>
				</v-list-item>

			</v-list>
		</v-card>

		<!-- À propos -->
		<v-card class="micro-card pa-4 mb-4">
			<div class="page-subtitle mb-2">{{ t("settings.about.title") }}</div>
			<v-list bg-color="transparent">
				<v-list-item to="/help">
					<template #prepend><v-icon>mdi-help-circle</v-icon></template>
					<v-list-item-title>{{ t("settings.about.help_center") }}</v-list-item-title>
				</v-list-item>
				<v-list-item to="/terms">
					<template #prepend><v-icon>mdi-file-document</v-icon></template>
					<v-list-item-title>{{ t("settings.about.terms") }}</v-list-item-title>
				</v-list-item>
				<v-list-item to="/privacy">
					<template #prepend><v-icon>mdi-shield</v-icon></template>
					<v-list-item-title>{{ t("settings.about.privacy_policy") }}</v-list-item-title>
				</v-list-item>
				<v-list-item>
					<v-list-item-title>{{ t("settings.about.version") }}</v-list-item-title>
					<template #append>
						<span class="setting-value">1.0.0</span>
					</template>
				</v-list-item>
			</v-list>
		</v-card>

		<!-- Actions compte -->
		<v-btn class="btn-primary mt-2 mb-2" block @click="logout">
			{{ t("settings.account.logout") }}
		</v-btn>
		<v-btn block variant="text" color="error" size="small" @click="deleteAccount">
			{{ t("settings.account.delete") }}
		</v-btn>

	</div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useTheme } from "vuetify";
import { useI18n } from "vue-i18n";

import { useUserStore } from "@/stores/userStore";
import { useStatsStore } from "@/stores/statsStore";
import { useChallengeStore } from "@/stores/challengeStore";
import { useSettingsStore } from "@/stores/settingsStore";

const router = useRouter();
const { t, locale } = useI18n();
const vuetifyTheme = useTheme();

const userStore = useUserStore();
const statsStore = useStatsStore();
const challengeStore = useChallengeStore();
const settingsStore = useSettingsStore();

const userName = ref("");
const preferredCategory = ref([]);
const preferredLevel = ref([]);

// Valeur du slider (0-23) basée sur l'heure stockée
const sliderValue = computed(() =>
	parseInt(settingsStore.reminderTime?.split(":")[0] || "20")
);

async function loadSettings() {
	try {
		await userStore.loadUser();
		await settingsStore.loadPreferences();
		await settingsStore.loadCategories();
		await settingsStore.loadLevels();
		userName.value = userStore.userName;
		preferredCategory.value = settingsStore.preferredCategories || [];
		preferredLevel.value = settingsStore.preferredLevels || [];
		locale.value = settingsStore.language;
	} catch (error) {
		console.error("❌ Erreur loadSettings:", error);
	}
}

async function saveProfile() {
	try {
		await userStore.updateProfile({ username: userName.value });
		alert("Profil enregistré !");
	} catch (error) {
		alert("Erreur lors de la sauvegarde");
	}
}

async function saveDefiPrefs() {
	try {
		await settingsStore.setChallengePreferences(preferredCategory.value, preferredLevel.value);
		alert("Préférences sauvegardées !");
	} catch (error) {
		alert("Erreur lors de la sauvegarde");
	}
}

async function toggleNotifications(value) {
	await settingsStore.toggleNotifications(!!value);
}

async function setReminderTime(time) {
	await settingsStore.setReminderTime(time);
}

async function changeLanguage() {
	const newLang = settingsStore.language === "fr" ? "en" : "fr";
	await settingsStore.setLanguage(newLang);
	locale.value = newLang;
}

async function changeTheme() {
	const newTheme = await settingsStore.toggleTheme();
	vuetifyTheme.change(newTheme);
}

async function logout() {
	await userStore.logout();
	statsStore.reset();
	challengeStore.reset();
	settingsStore.reset();
	router.push("/login");
}

function deleteAccount() {
	if (confirm("Êtes-vous sûr ?")) alert("À implémenter");
}

onMounted(async () => {
	settingsStore.initThemeFromLocalStorage();
	vuetifyTheme.change(localStorage.getItem("theme") || "light");
	await loadSettings();
});

const categories = computed(() => settingsStore.categories);
const levels = computed(() => settingsStore.levels);
</script>

<style scoped>
<<<<<<< HEAD

.fixed-card {
	height: 260px;
}
.card-profile {
	height: 230px;
}

.card-favorite {
	height: 420px;
=======
.settings-page {
	padding-bottom: 8px;
>>>>>>> dev
}

.chip-free {
	background-color: #3bce71 !important;
	color: white !important;
}

.chip-premium:not(.v-chip--selected) {
	background-color: #e5e7eb !important;
	color: #64748b !important;
}

.setting-value {
	font-weight: 700;
	color: #64748b;
}

.reminder-time-label {
	font-weight: 800;
	color: #f97922;
	margin-left: 8px;
	font-size: 15px;
}
</style>
