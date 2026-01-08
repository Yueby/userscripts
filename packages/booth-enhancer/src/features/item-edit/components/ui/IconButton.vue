<script setup lang="ts">
const props = defineProps<{
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
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  background: transparent;
  color: #64748b;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 0;
}

.icon-btn :deep(svg) {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.icon-btn:hover {
  background: #f1f5f9;
  color: #475569;
  border-color: #e2e8f0;
  transform: translateY(-1px);
}

.icon-btn:active {
  transform: translateY(1px);
}

.icon-btn.variant-danger {
  color: #64748b;
}

.icon-btn.variant-danger:hover {
  background: #fef2f2;
  color: #ef4444;
  border-color: #fee2e2;
}
</style>
