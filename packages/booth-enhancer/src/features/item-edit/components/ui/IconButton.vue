<script setup lang="ts">
defineProps<{
  icon: string;
  title?: string;
  variant?: 'default' | 'danger';
}>();

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

const handleClick = (e: MouseEvent) => {
  emit('click', e);
};
</script>

<template>
  <button 
    class="icon-btn" 
    :class="{ [`variant-${variant}`]: variant }"
    :title="title"
    @click="handleClick"
  >
    <span v-html="icon"></span>
  </button>
</template>

<style scoped>
.icon-btn {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  background: transparent;
  color: var(--be-color-text-secondary);
  border-radius: var(--be-radius);
  cursor: pointer;
  transition: background var(--be-transition-normal),
              color var(--be-transition-normal),
              border-color var(--be-transition-normal),
              transform var(--be-transition-fast);
  padding: 0;
}

.icon-btn :deep(svg) {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

.icon-btn:hover {
  background: var(--be-color-bg-tertiary);
  color: var(--be-color-text);
  border-color: var(--be-color-border);
  transform: translateY(-1px);
}

.icon-btn:active {
  transform: translateY(0);
}

.icon-btn:focus {
  outline: none;
}

.icon-btn:focus-visible {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.icon-btn.variant-danger:hover {
  background: #fef2f2;
  color: var(--be-color-danger);
  border-color: #fee2e2;
}
</style>
