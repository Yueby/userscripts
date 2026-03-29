<script setup lang="ts">
defineProps<{
  title: string;
  width?: string;
  height?: string;
  zIndex?: number;
}>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<template>
  <div
    class="fixed inset-0 flex items-center justify-center bg-black/60"
    :style="{ zIndex: zIndex ?? 9999 }"
    @click.self="emit('close')"
  >
    <div
      class="bg-[#15202b] rounded-2xl shadow-2xl border border-[#38444d] flex flex-col overflow-hidden"
      :class="[width ?? 'w-auto', height ?? 'max-h-[80vh]']"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-[#38444d] shrink-0">
        <h2 class="text-lg font-bold text-white truncate">{{ title }}</h2>
        <div class="flex items-center gap-3 shrink-0">
          <slot name="header-controls" />
          <button class="xd-btn-icon" @click="emit('close')">×</button>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 min-h-0 flex flex-col">
        <slot />
      </div>

      <!-- Footer -->
      <div v-if="$slots.footer" class="border-t border-[#38444d] shrink-0">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
