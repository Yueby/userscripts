<script setup lang="ts">
import { useToast } from '../composables/useToast';

const { toasts } = useToast();

const COLORS: Record<string, string> = {
  success: 'bg-[#00ba7c] text-white',
  error: 'bg-[#f4212e] text-white',
  info: 'bg-[#1d9bf0] text-white',
};
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-4 left-1/2 -translate-x-1/2 z-[99999] flex flex-col gap-2 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="px-4 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap"
          :class="COLORS[toast.type]"
        >
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
