<template>
	<div>
		<div class="top">
			<div class="page-title text-h4">
				{{ t("settings.title") }}
			</div>
		</div>

		<!-- Profil -->
		<v-card class="micro-card pa-4 mb-4">
			<div class="page-subtitle">{{ t("settings.profil.title") }}</div>

			<v-text-field v-model="userName" :label="t('settings.profil.username')" variant="outlined" density="compact"
				hide-details class="mb-3" />
			<v-text-field v-model="userStore.userEmail" :label="t('settings.profil.email')" variant="outlined"
				density="compact" disabled hide-details />
			<v-btn class="btn-primary mt-4" block variant="flat" @click="saveProfile">
				{{ t("settings.profil.save") }}
			</v-btn>
		</v-card>

		<!-- Préférences Défis avec Chips -->
		<v-card class="micro-card pa-4 mb-4">
			<div class="page-subtitle">{{ t("settings.defis.title") }}</div>

			<!-- Catégorie -->
			<div class="mb-3">
				<div class="mb-2" style="font-weight: 600;">{{ t("settings.defis.category") }}</div>
				<v-chip-group v-model="preferredCategory" multiple column>
					<v-chip v-for="cat in categories" :key="cat.id" :value="cat.name"
						:color="preferredCategory.includes(cat.name) ? 'green' : 'grey lighten-2'"
						:variant="flat"
						:disabled="cat.premium && !settingsStore.isPremium">
						{{ cat.name }}
						<template v-if="cat.premium && !settingsStore.isPremium">
							🔒
						</template>
					</v-chip>
				</v-chip-group>
			</div>

			<!-- Niveau -->
			<div class="mb-3">
				<div class="mb-2" style="font-weight: 600;">{{ t("settings.defis.level") }}</div>
				<v-chip-group v-model="preferredLevel" multiple column>
					<v-chip v-for="level in levels" :key="level.id" :value="level.name"
						:color="level.premium
						? settingsStore.isPremium
							? 'deep-orange'
							: 'grey darken-2'
						: 'green'"
						:variant="flat"
						:disabled="level.premium && !settingsStore.isPremium">
						{{ level.name }}
						<template v-if="level.premium && !settingsStore.isPremium">
							🔒
						</template>
					</v-chip>
				</v-chip-group>
			</div>

			<!-- Info Premium -->
			<v-alert v-if="!settingsStore.isPremium" type="info" variant="tonal" density="compact" class="mt-3">
				<template #prepend>
					<v-icon>mdi-crown</v-icon>
				</template>
				Seul le niveau Débutant 🌱 est gratuit. Passe Premium pour débloquer tous les niveaux et catégories !
			</v-alert>

			<v-btn block class="btn-primary mt-4" @click="saveDefiPrefs">
				{{ t("settings.defis.save") }}
			</v-btn>
		</v-card>

		<!-- Préférences générales -->
		<v-card class="micro-card pa-4 mb-4">
			<div class="page-subtitle">{{ t("settings.preferences.title") }}</div>

			<v-list bg-color="transparent">
				<!-- Notifications -->
				<v-list-item>
					<template #prepend><v-icon>mdi-bell</v-icon></template>
					<v-list-item-title>{{ t("settings.preferences.notifications") }}</v-list-item-title>
					<template #append>
						<v-switch :model-value="settingsStore.notificationsEnabled" color="primary" hide-details
							density="compact" @update:model-value="toggleNotifications" />
					</template>
				</v-list-item>

				<!-- Rappel -->
				<v-list-item>
					<template #prepend><v-icon>mdi-clock</v-icon></template>
					<v-list-item-title>{{ t("settings.preferences.reminder") }}</v-list-item-title>
					<template #append>
						<v-menu>
							<template #activator="{ props }">
								<v-chip v-bind="props" size="small" variant="outlined" color="deep-orange">
									{{ settingsStore.reminderTime }}
								</v-chip>
							</template>
							<v-list>
								<v-list-item v-for="time in timeOptions" :key="time" @click="setReminderTime(time)">
									{{ time }}
								</v-list-item>
							</v-list>
						</v-menu>
					</template>
				</v-list-item>

				<!-- Langue -->
				<v-list-item @click="changeLanguage">
					<template #prepend><v-icon>mdi-web</v-icon></template>
					<v-list-item-title>{{ t("settings.preferences.language") }}</v-list-item-title>
					<template #append>
						<span style="font-weight: 700; color: #64748b">{{ settingsStore.languageLabel }}</span>
					</template>
				</v-list-item>

				<!-- Thème -->
				<v-list-item @click="changeTheme">
					<template #prepend><v-icon>mdi-palette</v-icon></template>
					<v-list-item-title>{{ t("settings.preferences.theme") }}</v-list-item-title>
					<template #append>
						<span style="font-weight: 700; color: #64748b">{{ settingsStore.themeLabel }}</span>
					</template>
				</v-list-item>
			</v-list>
		</v-card>

		<!-- À propos -->
		<v-card class="micro-card pa-4 mb-4">
			<div class="page-subtitle">{{ t("settings.about.title") }}</div>
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
						<span style="font-weight: 700; color: #64748b">1.0.0</span>
					</template>
				</v-list-item>
			</v-list>
		</v-card>

		<!-- Actions -->
		<v-btn class="btn-primary mt-4" block @click="logout">
			{{ t("settings.account.logout") }}
		</v-btn>
		<v-btn block variant="text" color="error" size="small" @click="deleteAccount">
			{{ t("settings.account.delete") }}
		</v-btn>
	</div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useTheme } from "vuetify";
import { useI18n } from "vue-i18n";

// ✅ IMPORTS DES STORES
import { useUserStore } from "@/stores/userStore";
import { useStatsStore } from "@/stores/statsStore";
import { useChallengeStore } from "@/stores/challengeStore";
import { useSettingsStore } from "@/stores/settingsStore";

const router = useRouter();
const { t, locale } = useI18n();
const vuetifyTheme = useTheme();

// ✅ INITIALISATION DES STORES
const userStore = useUserStore();
const statsStore = useStatsStore();
const challengeStore = useChallengeStore();
const settingsStore = useSettingsStore();

// ===== ÉTAT LOCAL (pour édition) =====
const userName = ref("");
const preferredCategory = ref([]);
const preferredLevel = ref([]);
const timeOptions = ["18:00", "19:00", "20:00", "21:00", "22:00"];

// ===== CHARGEMENT =====
async function loadSettings() {
	try {
		console.log("LEVELS BDD :", settingsStore.levels);

		await userStore.loadUser();
		await settingsStore.loadPreferences();
		await settingsStore.loadCategories();
		await settingsStore.loadLevels(); 

		// Copier les valeurs pour l'édition locale
		userName.value = userStore.userName;
		preferredCategory.value = settingsStore.preferredCategories || [];
		preferredLevel.value = settingsStore.preferredLevels || [];

		// Appliquer la langue
		locale.value = settingsStore.language;

	} catch (error) {
		console.error("❌ Erreur loadSettings:", error);
	}
}

// ===== PROFIL =====
async function saveProfile() {
	try {
		await userStore.updateProfile({ username: userName.value });
		alert("Profil enregistré !");
	} catch (error) {
		console.error("❌ Erreur saveProfile:", error);
		alert("Erreur lors de la sauvegarde");
	}
}

// ===== PRÉFÉRENCES DÉFIS =====
async function saveDefiPrefs() {
	try {
		console.log("💾 Sauvegarde des préférences:", {
			categories: preferredCategory.value,
			levels: preferredLevel.value
		});

		await settingsStore.setChallengePreferences(
			preferredCategory.value,
			preferredLevel.value
		);

		alert("Préférences sauvegardées !");
	} catch (error) {
		console.error("❌ Erreur saveDefiPrefs:", error);
		alert("Erreur lors de la sauvegarde");
	}
}

// ===== NOTIFICATIONS =====
async function toggleNotifications(value) {
	try {
		await settingsStore.updatePreference("notifications_enabled", value);
	} catch (error) {
		console.error("❌ Erreur toggleNotifications:", error);
	}
}

// ===== RAPPEL =====
async function setReminderTime(time) {
	try {
		await settingsStore.setReminderTime(time);
	} catch (error) {
		console.error("❌ Erreur setReminderTime:", error);
	}
}

// ===== LANGUE =====
async function changeLanguage() {
	try {
		const newLang = settingsStore.language === "fr" ? "en" : "fr";
		await settingsStore.setLanguage(newLang);
		locale.value = newLang;
	} catch (error) {
		console.error("❌ Erreur changeLanguage:", error);
	}
}

// ===== THÈME =====
async function changeTheme() {
	try {
		const newTheme = await settingsStore.toggleTheme();
		vuetifyTheme.change = newTheme;
	} catch (error) {
		console.error("❌ Erreur changeTheme:", error);
	}
}

// ===== DÉCONNEXION =====
async function logout() {
	try {
		await userStore.logout();
		statsStore.reset();
		challengeStore.reset();
		settingsStore.reset();
		router.push("/login");
	} catch (error) {
		console.error("❌ Erreur logout:", error);
	}
}

// ===== SUPPRESSION COMPTE =====
function deleteAccount() {
	if (confirm("Êtes-vous sûr ?")) {
		alert("À implémenter");
	}
}

// ===== LIFECYCLE =====
onMounted(async () => {
	settingsStore.initThemeFromLocalStorage();
	const savedTheme = localStorage.getItem("theme") || "light";
	vuetifyTheme.change = savedTheme;
	await loadSettings();
});

// ===== GETTERS =====
const categories = computed(() => settingsStore.categories);
const levels = computed(() => settingsStore.levels);
</script>

<style scoped>
.top {
	margin: 6px 0 14px;
}

.mb-3 {
	margin-bottom: 12px;
}

.mb-4 {
	margin-bottom: 16px;
}

.mt-3 {
	margin-top: 12px;
}

.mt-4 {
	margin-top: 16px;
}

.page-subtitle {
	font-size: 1.1rem;
	font-weight: 600;
	margin-bottom: 1rem;
	text-align: center;
}
</style>