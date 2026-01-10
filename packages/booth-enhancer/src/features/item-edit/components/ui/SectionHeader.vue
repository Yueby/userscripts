<template>
  <section :class="['section-header-container', { 'no-header': !hasHeader, 'no-border': noBorder }]">
    <div v-if="hasHeader" class="section-header">
      <div v-if="title || $slots.title" class="be-text-base be-font-bold">
        <slot name="title">{{ title }}</slot>
      </div>
      <div v-if="$slots.actions" class="actions">
        <slot name="actions"></slot>
      </div>
    </div>
    <div class="section-content">
      <slot></slot>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';

const props = withDefaults(defineProps<{
  title?: string;
  noBorder?: boolean;
}>(), {
  title: '',
  noBorder: false
});

const slots = useSlots();
const hasHeader = computed(() => props.title || slots.title || slots.actions);
</script>

<style scoped>
.section-header-container {
  padding: var(--be-space-sm);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--be-color-border);
}

.section-header-container.no-header {
  padding-bottom: var(--be-space-sm);
}

.section-header-container.no-border {
  border-bottom: none;
  padding-bottom: var(--be-space-sm);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.actions {
  display: flex;
  gap: var(--be-space-sm);
  flex-wrap: nowrap;
  align-items: center;
}
</style>
