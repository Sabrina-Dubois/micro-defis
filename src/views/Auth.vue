<template>
  <v-container class="fill-height d-flex justify-center align-center page">
    <v-card class="micro-card pa-8 mx-auto text-center" max-width="360">
      <!-- TITRE -->
      <div class="page-title mb-4">{{ t("auth.login_title") }}</div>
      <div class="text-h6 mb-6 text-medium-emphasis">{{ t("auth.subtitle") }}</div>

      <!-- EMAIL -->
      <v-text-field
        v-model="email"
        variant="outlined"
        :placeholder="t('auth.email_placeholder')"
        class="mb-4 rounded-2xl"
        hide-details
        density="comfortable"
      />

      <!-- MOT DE PASSE -->
      <v-text-field
        v-model="password"
        variant="outlined"
        :placeholder="t('auth.password_placeholder')"
        type="password"
        class="mb-6 rounded-2xl"
        hide-details
        density="comfortable"
      />

      <!-- BOUTON LOGIN -->
      <v-btn class="btn-primary mb-6" block @click="signInEmail">
        {{ t("auth.continue") }}
      </v-btn>

      <v-divider class="my-6 mx-auto" style="width: 200px" />

      <!-- GOOGLE / APPLE -->
      <div class="d-flex flex-column gap-4">
        <v-btn
          variant="outlined"
          size="large"
          height="56"
          rounded="rounded-xl"
          @click="signInGoogle"
        >
          {{ t("auth.login_google") }}
        </v-btn>
        <v-btn
          variant="outlined"
          size="large"
          height="56"
          rounded="rounded-xl"
          @click="signInApple"
        >
          {{ t("auth.login_apple") }}
        </v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { supabase } from "@/lib/supabase";

const { t } = useI18n();

const email = ref("");
const password = ref("");

// LOGIN EMAIL
async function signInEmail() {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });
  if (error) alert(error.message);
}

// LOGIN GOOGLE
async function signInGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin },
  });
  if (error) alert(error.message);
}

// LOGIN APPLE
async function signInApple() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "apple",
    options: { redirectTo: window.location.origin },
  });
  if (error) alert(error.message);
}
</script>