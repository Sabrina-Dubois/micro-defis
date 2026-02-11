<template>
	<div>
		<div class="top">
			<div class="page-title text-h4 text-align:center">
				{{ t("settings.title") }}
			</div>
		</div>

		<!-- Profil -->
		<v-card class="micro-card pa-4 mb-4">
			<div class="page-subtitle"> {{ t("settings.profil.title") }}</div>

			<v-text-field
				v-model="userName"
				:label="t('settings.profil.username')"
				variant="outlined"
				density="compact"
				hide-details
				class="mb-3"
			></v-text-field>

			<v-text-field
				v-model="userEmail"
				:label="t('settings.profil.email')"
				variant="outlined"
				density="compact"
				disabled
				hide-details
			></v-text-field>

			<v-btn class="btn-primary mt-4" block variant="flat" @click="saveProfile">
				{{ t("settings.profil.save") }}
			</v-btn>
		</v-card>

		<!-- Préférences -->
		<v-card class="micro-card pa-4 mb-4">
			<div class="page-subtitle"> {{ t("settings.preferences.title") }}</div>

			<v-list bg-color="transparent">
				<!-- Notifications -->
				<v-list-item>
					<template #prepend>
						<v-icon>mdi-bell</v-icon>
					</template>
					<v-list-item-title>{{ t("settings.preferences.notifications") }}</v-list-item-title>
					<template #append>
						<v-switch
							v-model="notificationsEnabled"
							color="primary"
							hide-details
							density="compact"
							@update:model-value="saveNotificationSetting"
						></v-switch>
					</template>
				</v-list-item>

				<!-- Rappel -->
				<v-list-item>
					<template #prepend>
						<v-icon>mdi-clock</v-icon>
					</template>
					<v-list-item-title>{{ t("settings.preferences.reminder") }}</v-list-item-title>
					<template #append>
						<v-menu>
							<template #activator="{ props }">
								<v-chip
									v-bind="props"
									size="small"
									variant="outlined"
									color="deep-orange"
								>
									{{ reminderTime }}
								</v-chip>
							</template>
							<v-list>
								<v-list-item
									v-for="time in timeOptions"
									:key="time"
									@click="setReminderTime(time)"
								>
									{{ time }}
								</v-list-item>
							</v-list>
						</v-menu>
					</template>
				</v-list-item>

				<!-- Langue -->
				<v-list-item @click="changeLanguage">
					<template #prepend>
						<v-icon>mdi-web</v-icon>
					</template>
					<v-list-item-title>{{ t("settings.preferences.language") }}</v-list-item-title>
					<template #append>
						<span style="font-weight: 700; color: #64748b">
							{{ currentLanguage }}
						</span>
					</template>
				</v-list-item>

				<!-- Thème -->
				<v-list-item @click="changeTheme">
					<template #prepend>
						<v-icon>mdi-palette</v-icon>
					</template>
					<v-list-item-title>{{ t("settings.preferences.theme") }}</v-list-item-title>
					<template #append>
						<span style="font-weight: 700; color: #64748b">
							{{ vuetifyTheme.value }}
						</span>
					</template>
				</v-list-item>
			</v-list>
		</v-card>

		<!-- À propos -->
		<v-card class="micro-card pa-4 mb-4">
			<div class="page-subtitle"> {{ t("settings.about.title") }}</div>
			<v-list bg-color="transparent">
				<v-list-item to="/help">
					<template #prepend>
						<v-icon>mdi-help-circle</v-icon>
					</template>
					<v-list-item-title>{{ t("settings.about.help_center") }}</v-list-item-title>
				</v-list-item>
				<v-list-item to="/terms">
					<template #prepend>
						<v-icon>mdi-file-document</v-icon>
					</template>
					<v-list-item-title>{{ t("settings.about.terms") }}</v-list-item-title>
				</v-list-item>
				<v-list-item to="/privacy">
					<template #prepend>
						<v-icon>mdi-shield</v-icon>
					</template>
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
		<v-btn
			class="btn-primary mt-4"
			block
			@click="logout"
		>
			{{ t("settings.account.logout") }}
		</v-btn>
		<v-btn
			block
			variant="text"
			color="error"
			size="small"
			@click="deleteAccount"
		>
			{{ t("settings.account.delete") }}
		</v-btn>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "@/lib/supabase";
import { useRouter } from "vue-router";
import { useTheme } from "vuetify";
import { useI18n } from "vue-i18n";

const router = useRouter();
const { t, locale } = useI18n();

const userName = ref("");
const userEmail = ref("");
const notificationsEnabled = ref(true);
const reminderTime = ref("20:00");
const currentLanguage = ref(locale.value === "fr" ? "Français" : "English");
const vuetifyTheme = useTheme();
const profilePublic = ref(false);

const timeOptions = ["18:00", "19:00", "20:00", "21:00", "22:00"];

async function loadSettings() {
	const { user } = await supabase.auth.getUser();
	if (user) {
		userEmail.value = user.email || "";

		const { data: preferences } = await supabase
			.from("user_preferences")
			.select("*")
			.eq("user_id", user.id)
			.single();

		if (preferences) {
			notificationsEnabled.value = preferences.notifications_enabled ?? true;
			reminderTime.value = preferences.reminder_time ?? "20:00";
			locale.value = preferences.language ?? "fr";
			currentLanguage.value = locale.value === "fr" ? "Français" : "English";
			vuetifyTheme.value = preferences.theme === "dark" ? "Sombre" : "Clair";
		}
	}
}

async function saveProfile() {
	const { user } = await supabase.auth.getUser();
	if (user) {
		await supabase
			.from("user_profiles")
			.upsert({ user_id: user.id, username: userName.value });
		alert("Profil enregistré !");
	}
}

async function saveNotificationSetting(value) {
	const { user } = await supabase.auth.getUser();
	if (user) {
		await supabase.from("user_preferences").upsert({
			user_id: user.id,
			notifications_enabled: value,
			updated_at: new Date().toISOString(),
		});
	}
}

function setReminderTime(time) {
	reminderTime.value = time;
	saveReminderTime();
}

async function saveReminderTime() {
	const { user } = await supabase.auth.getUser();
	if (user) {
		await supabase.from("user_preferences").upsert({
			user_id: user.id,
			reminder_time: reminderTime.value,
			updated_at: new Date().toISOString(),
		});
	}
}

async function changeLanguage() {
	if (locale.value === "fr") {
		locale.value = "en";
		currentLanguage.value = "English";
	} else {
		locale.value = "fr";
		currentLanguage.value = "Français";
	}

	const { user } = await supabase.auth.getUser();
	if (user) {
		await supabase.from("user_preferences").upsert({
			user_id: user.id,
			language: locale.value,
			updated_at: new Date().toISOString(),
		});
	}
}

async function changeTheme() {
	const newTheme =
		vuetifyTheme.global.name.value === "light" ? "dark" : "light";
	vuetifyTheme.global.name.value = newTheme;
	vuetifyTheme.value = newTheme === "dark" ? "Sombre" : "Clair";
	document.documentElement.setAttribute("data-theme", newTheme);
	localStorage.setItem("theme", newTheme);

	const { user } = await supabase.auth.getUser();
	if (user) {
		await supabase.from("user_preferences").upsert({
			user_id: user.id,
			theme: newTheme,
			updated_at: new Date().toISOString(),
		});
	}
}

function changePassword() {
	alert("Fonctionnalité à implémenter");
}

async function logout() {
	await supabase.auth.signOut();
	router.push("/login");
}

function deleteAccount() {
	if (confirm("Êtes-vous sûr ?")) {
		alert("À implémenter");
	}
}

onMounted(() => {
	loadSettings();
	const savedTheme = localStorage.getItem("theme");
	if (savedTheme) {
		vuetifyTheme.value = savedTheme === "dark" ? "Sombre" : "Clair";
		vuetifyTheme.global.name.value = savedTheme;
		document.documentElement.setAttribute("data-theme", savedTheme);
	}
});
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
.page-subtitle {
	font-size: 1.1rem;
	font-weight: 600;
	margin-bottom: 1rem;
}
</style>s