<script lang="ts">
const modalStack: (() => void)[] = [];

function globalKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && modalStack.length > 0) {
    modalStack[modalStack.length - 1]();
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', globalKeydown);
}
</script>

<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue';

const props = defineProps<{
  title: string;
  maxWidth?: string;
  maxHeight?: string;
  zIndex?: number;
}>();

const emit = defineEmits<{
  close: [];
}>();

const closeHandler = () => emit('close');

onMounted(() => modalStack.push(closeHandler));
onUnmounted(() => {
  const idx = modalStack.indexOf(closeHandler);
  if (idx !== -1) modalStack.splice(idx, 1);
});

const panelStyle = computed(() => ({
  width: '95vw',
  maxWidth: props.maxWidth ?? '480px',
  height: props.maxHeight ? `min(${props.maxHeight}, 90vh)` : undefined,
  maxHeight: props.maxHeight ? undefined : '90vh',
}));
</script>

<template>
  <div
    class="fixed inset-0 flex items-center justify-center"
    :style="{ zIndex: zIndex ?? 9999, background: 'rgba(0,0,0,0.6)' }"
    @click.self="emit('close')"
  >
    <div
      :style="panelStyle"
      style="background: #15202b; border-radius: 16px; border: 1px solid #38444d; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5)"
    >
      <!-- Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-bottom: 1px solid #38444d; flex-shrink: 0">
        <h2 style="font-size: 18px; font-weight: 700; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin: 0">{{ title }}</h2>
        <div style="display: flex; align-items: center; gap: 12px; flex-shrink: 0">
          <slot name="header-controls" />
          <button class="xd-btn-icon" @click="emit('close')">×</button>
        </div>
      </div>

      <!-- Content -->
      <div style="flex: 1; min-height: 0; display: flex; flex-direction: column">
        <slot />
      </div>

      <!-- Footer -->
      <div v-if="$slots.footer" style="border-top: 1px solid #38444d; flex-shrink: 0">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
