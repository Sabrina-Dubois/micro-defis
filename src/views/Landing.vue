<template>
    <div class="landing-page">
        <!-- Hero -->
        <div class="hero">
            <div class="hero-emoji">🔥</div>
            <h1 class="hero-title"> MicroDéfis</h1>
            <p class="hero-subtitle">{{ t('landing.hero.subtitle') }}</p>
            <v-btn class="btn-primary mt-4" size="large" block @click="$router.push('/login')">
                {{ t('landing.hero.cta') }}
            </v-btn>
        </div>

        <!-- About -->
        <v-card class="micro-card pa-5 mb-4">
            <h2 class="section-title">{{ t('landing.about.title') }}</h2>
            <p class="section-text">{{ t('landing.about.text1') }}</p>
            <p class="section-text">{{ t('landing.about.text2') }}</p>
        </v-card>

        <!-- How it works -->
        <v-card class="micro-card pa-5 mb-4">
            <h2 class="section-title">{{ t('landing.how.title') }}</h2>

            <div class="step" v-for="n in 4" :key="n">
                <span class="step-number">0{{ n }}</span>
                <div>
                    <div class="step-label">{{ t(`landing.how.step${n}_label`) }}</div>
                    <div class="step-desc">{{ t(`landing.how.step${n}_desc`) }}</div>
                </div>
            </div>
        </v-card>

        <!-- Examples -->
        <v-card class="micro-card card-content pa-5 mb-4">
            <h2 class="section-title">{{ t('landing.examples.title') }}</h2>
            <p class="section-text">{{ t('landing.examples.intro') }}</p>

            <div class="challenge-list">
                <div class="challenge-item" v-for="ex in examples" :key="ex.title">
                    <span class="challenge-emoji">{{ ex.emoji }}</span>
                    <div>
                        <div class="challenge-title">{{ ex.title }}</div>
                        <div class="challenge-cat">{{ ex.cat }}</div>
                    </div>
                </div>
            </div>
        </v-card>

        <!-- Categories -->
        <v-card class="micro-card pa-5 mb-4">
            <h2 class="section-title">{{ t('landing.categories.title') }}</h2>
            <p class="section-text">{{ t('landing.categories.intro') }}</p>
            <div class="categories">
                <div class="cat-chip" v-for="cat in categories" :key="cat">{{ cat }}</div>
            </div>
        </v-card>

        <!-- CTA -->
        <v-card class="micro-card pa-5 mb-4" style="background: #fdf8ff; border-left: 3px solid #7c3aed;">
            <h2 class="section-title"> {{ t('landing.cta.title') }}</h2>
            <p class="section-text">{{ t('landing.cta.text') }}</p>
            <v-btn class="btn-primary mt-2" block @click="$router.push('/login')">
                {{ t('landing.cta.button') }}
            </v-btn>
            <div class="login-link" @click="$router.push('/login')">
                {{ t('landing.cta.login') }}
            </div>
        </v-card>

        <!-- Footer links -->
        <div class="footer-links">
            <router-link to="/terms">{{ t('landing.footer.terms') }}</router-link>
            <span>·</span>
            <router-link to="/privacy">{{ t('landing.footer.privacy') }}</router-link>
            <span>·</span>
            <router-link to="/help">{{ t('landing.footer.help') }}</router-link>
        </div>
    </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const examples = [
    { emoji: '💪', title: 'Marche 20 minutes', cat: 'Sport' },
    { emoji: '🧠', title: 'Lis 5 pages d’un livre', cat: 'Mentale' },
    { emoji: '🧘', title: 'Bois 2 verres d’eau', cat: 'Bien-être' },
    { emoji: '🎨', title: 'Dessine pendant 10 minutes', cat: 'Créativité' },
    { emoji: '👥', title: 'Appelle un(e) ami(e)', cat: 'Social' },
    { emoji: '⚡️', title: 'Nettoie un coin de ta maison', cat: 'Boost' }
];

const categories = [
    '💪 Sport', '🧘 Bien-être', '🤪 Insolite', '⚡️ Boost','💻 Digitale',
    '🎨 Créativité', '🌿 Nature', '🧠 Mentale', '👥 Social'
];
</script>

<style scoped>
.landing-page {
    padding: 12px 0 40px;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow-x: hidden;
    box-sizing: border-box;
}

.landing-page * {
    box-sizing: border-box;
    max-width: 100%;
    min-width: 0;
}

/* Hero */
.hero {
    text-align: center;
    padding: 32px 0 24px;
    width: 100%;
}

.hero-emoji {
    font-size: 56px;
    line-height: 1;
    margin-bottom: 8px;
}

.hero-title {
    font-size: 36px;
    font-weight: 800;
    color: #ffffff;
    margin: 0 0 8px 0;
}

.hero-subtitle {
    font-size: 16px;
    color: #ffffff;
    line-height: 1.5;
    margin: 0 0 8px 0;
}

/* Card */
.micro-card {
    border-radius: 24px !important;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    margin-bottom: 16px;
}

/* Sections */
.section-title {
    font-size: 17px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 12px 0;
}

.section-text {
    font-size: 14px;
    color: #475569;
    line-height: 1.7;
    margin: 0 0 10px 0;
    overflow-wrap: anywhere;
}

/* Steps */
.step {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 16px;
}

.step > div {
    min-width: 0;
}

.step-number {
    font-size: 11px;
    font-weight: 800;
    color: #ff6b35;
    background: #fff5f2;
    padding: 3px 8px;
    border-radius: 6px;
    flex-shrink: 0;
    margin-top: 2px;
}

.step-label {
    font-size: 14px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 2px;
}

.step-desc {
    font-size: 13px;
    color: #64748b;
    line-height: 1.5;
    overflow-wrap: anywhere;
}

/* Exemples de défis */
.challenge-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 4px;
}

.challenge-item {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #f8fafc;
    border-radius: 12px;
    padding: 10px 14px;
    border: 1px solid #e2e8f0;
}

.challenge-item > div {
    min-width: 0;
}

.challenge-emoji {
    font-size: 24px;
    flex-shrink: 0;
}

.challenge-title {
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
    overflow-wrap: anywhere;
}

.challenge-cat {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 2px;
}

/* Catégories */
.categories {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 4px;
}

.cat-chip {
    font-size: 12px;
    font-weight: 600;
    color: #7c3aed;
    background: #f3e8ff;
    padding: 5px 12px;
    border-radius: 20px;
}

/* CTA */
.login-link {
    text-align: center;
    margin-top: 12px;
    font-size: 13px;
    color: #7c3aed;
    font-weight: 600;
    cursor: pointer;
}

/* Footer */
.footer-links {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    font-size: 12px;
    color: #94a3b8;
    margin-top: 8px;
    padding-bottom: 20px;
}

.footer-links a {
    color: #94a3b8;
    text-decoration: none;
}

.footer-links a:hover {
    color: #7c3aed;
}

/* Boutons toujours centrés visuellement */
.landing-page :deep(.btn-primary) {
    margin-left: auto;
    margin-right: auto;
    justify-content: center;
}

.landing-page :deep(.v-btn) {
    text-align: center;
}
</style>
