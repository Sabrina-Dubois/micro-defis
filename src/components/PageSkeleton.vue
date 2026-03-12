<template>
  <div>
    <div class="page-title mt-4 mb-4 text-h4">{{ displayTitle }}</div>
    <v-card
      v-for="n in cards"
      :key="n"
      class="micro-card pa-4 mb-4 skeleton-card"
    />
  </div>
</template>

<script setup>
import { computed, toRefs } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  cards: {
    type: Number,
    default: 2,
  },
});

const { t } = useI18n();
const { cards } = toRefs(props);
const displayTitle = computed(() => props.title || t("common.loading"));
</script>

<style scoped>
.skeleton-card {
  min-height: 120px;
  opacity: 0.7;
}
</style>
