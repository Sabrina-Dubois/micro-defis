<template>
  <v-container class="pa-8 fill-height d-flex align-center">
    <v-card class="pa-12 mx-auto text-center" max-width="360" elevation="0">
      <div class="text-h2 font-weight-black mb-4 pastel-gradient">
        Connexion
      </div>
      <div class="text-h6 mb-12 text-medium-emphasis">
        Garde tes flammes synchronisées partout
      </div>
      
      <v-text-field 
        variant="outlined" 
        placeholder="Email"
        class="mb-6 rounded-2xl"
        hide-details
        density="comfortable"
      />
      
      <v-text-field 
        variant="outlined" 
        placeholder="Mot de passe" 
        type="password"
        class="mb-8 rounded-2xl"
        hide-details
        density="comfortable"
      />
      
      <v-btn size="x-large" height="64" class="text-h6 mb-8">
        Continuer
      </v-btn>

      <v-divider class="my-8 mx-auto" style="width: 200px;" />
      
      <div class="d-flex flex-column gap-4">
        <v-btn variant="outlined" size="large" height="56" rounded="rounded-xl">
          Google
        </v-btn>
        <v-btn variant="outlined" size="large" height="56" rounded="rounded-xl">
          Apple
        </v-btn>
      </div>
    </v-card>
  </v-container>
</template>
