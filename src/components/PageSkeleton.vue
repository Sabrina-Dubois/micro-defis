<template>
  <div>
    <div class="page-title mt-4 mb-4 text-h4">{{ title }}</div>
    <v-card
      v-for="n in cards"
      :key="n"
      class="micro-card pa-4 mb-4 skeleton-card"
    />
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: "Chargement...",
  },
  cards: {
    type: Number,
    default: 2,
  },
});
</script>

<style scoped>
.skeleton-card {
  min-height: 120px;
  opacity: 0.7;
}
</style>
