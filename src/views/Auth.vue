<template>
  <v-container class="pa-8 fill-height d-flex align-center">
    <v-card class="pa-12 mx-auto text-center" max-width="360" elevation="0">
      <div class="text-h2 font-weight-black mb-4 pastel-gradient">
        {{ t("auth.login_title") }}
      </div>
      <div class="text-h6 mb-12 text-medium-emphasis">
        {{ t("auth.subtitle") }}
      </div>
      
      <v-text-field 
        variant="outlined" 
        placeholder="t('auth.email_placeholder')"
        class="mb-6 rounded-2xl"
        hide-details
        density="comfortable"
      />
      
      <v-text-field 
        variant="outlined" 
        placeholder="t('auth.password_placeholder')"
        type="password"
        class="mb-8 rounded-2xl"
        hide-details
        density="comfortable"
      />
      
      <v-btn size="x-large" height="64" class="text-h6 mb-8">
        {{ t("auth.coninue") }}
      </v-btn>

      <v-divider class="my-8 mx-auto" style="width: 200px;" />
      
      <div class="d-flex flex-column gap-4">
        <v-btn variant="outlined" size="large" height="56" rounded="rounded-xl">
          {{ t("auth.login_google") }}
        </v-btn>
        <v-btn variant="outlined" size="large" height="56" rounded="rounded-xl">
          {{ t("auth.login_apple") }}
        </v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<script>
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

