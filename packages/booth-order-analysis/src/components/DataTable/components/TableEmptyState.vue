<template>
  <div class="empty-state">
    <div class="empty-icon">{{ config.icon }}</div>
    <div class="empty-text">{{ config.text }}</div>
    <div class="empty-hint">{{ config.hint }}</div>
  </div>
</template>

<script setup lang="ts">
interface EmptyStateConfig {
  icon: string;
  text: string;
  hint: string;
}

interface Props {
  config: EmptyStateConfig;
}

defineProps<Props>();
</script>

<style scoped>
.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: var(--table-text-muted, #9ca3af);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--table-text-secondary, #6b7280);
}

.empty-hint {
  font-size: 14px;
  color: var(--table-text-muted, #9ca3af);
}
</style> 