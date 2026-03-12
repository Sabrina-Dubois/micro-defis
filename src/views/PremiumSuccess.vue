<template>
    <div class="success-page">
        <div class="success-card">
            <div class="crown-anim">👑</div>
            <h1 class="success-title">{{ t("premium_success.title") }}</h1>
            <p class="success-subtitle">
                {{ t("premium_success.subtitle_line1") }}<br />
                {{ t("premium_success.subtitle_line2") }}
            </p>

            <div class="benefits-recap">
                <div class="benefit-line" v-for="b in benefits" :key="b">
                    <v-icon color="green">mdi-check-circle</v-icon>
                    <span>{{ b }}</span>
                </div>
            </div>

            <v-btn class="btn-primary mt-6" block size="large" @click="goHome">
                🚀 {{ t("premium_success.cta") }}
            </v-btn>
        </div>
    </div>
</template>

<script setup>
import { onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/userStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useI18n } from "vue-i18n";

const router = useRouter();
const userStore = useUserStore();
const settingsStore = useSettingsStore();
const { t, tm } = useI18n();

const benefits = computed(() => {
    const items = tm("premium_success.benefits");
    return Array.isArray(items) ? items : [];
});

onMounted(async () => {
    // Recharge le profil pour mettre à jour le statut premium
    await userStore.loadUser();
    await settingsStore.loadPreferences();
});

function goHome() {
    router.push("/");
}
</script>

<style scoped>
.success-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
}

.success-card {
    max-width: 400px;
    width: 100%;
    text-align: center;
    background: white;
    border-radius: 24px;
    padding: 40px 24px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.crown-anim {
    font-size: 80px;
    animation: bounce 1s ease infinite;
    display: block;
    margin-bottom: 16px;
}

@keyframes bounce {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-12px);
    }
}

.success-title {
    font-size: 28px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 12px;
}

.success-subtitle {
    font-size: 15px;
    color: #64748b;
    line-height: 1.6;
    margin-bottom: 24px;
}

.benefits-recap {
    display: flex;
    flex-direction: column;
    gap: 12px;
    text-align: left;
    background: #f8fafc;
    border-radius: 16px;
    padding: 20px;
}

.benefit-line {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    font-weight: 600;
    color: #0f172a;
}
</style>
