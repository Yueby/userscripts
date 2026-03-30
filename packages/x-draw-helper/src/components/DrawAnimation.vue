<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from '../composables/useI18n';
import { TIMING } from '../constants';
import type { DrawUser } from '../types';
import Modal from './Modal.vue';

const props = defineProps<{
  pool: DrawUser[];
  winners: DrawUser[];
}>();

const emit = defineEmits<{
  done: [];
}>();

const { t } = useI18n();

const slots = ref<DrawUser[]>(props.winners.map(() => randomUser()));
let intervalId: ReturnType<typeof setInterval> | null = null;
let timeoutId: ReturnType<typeof setTimeout> | null = null;

function randomUser(): DrawUser {
  if (props.pool.length === 0) return props.winners[0];
  return props.pool[Math.floor(Math.random() * props.pool.length)];
}

onMounted(() => {
  const { DRAW_ANIMATION_SPEED: speed, DRAW_ANIMATION_DURATION: duration, DRAW_ANIMATION_REVEAL_DELAY: revealDelay } = TIMING;
  let elapsed = 0;

  function tick() {
    elapsed += speed;
    if (elapsed >= duration) {
      slots.value = [...props.winners];
      if (intervalId) clearInterval(intervalId);
      timeoutId = setTimeout(() => emit('done'), revealDelay);
      return;
    }
    slots.value = props.winners.map((w, i) => {
      const remaining = duration - elapsed;
      if (remaining < 400 * (props.winners.length - i)) return w;
      return randomUser();
    });
  }

  intervalId = setInterval(tick, speed);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
  if (timeoutId) clearTimeout(timeoutId);
});
</script>

<template>
  <Modal :title="t('drawing')" max-width="500px" :z-index="10002" @close="emit('done')">
    <div class="p-8 flex flex-col items-center gap-6">
      <div class="flex gap-4 justify-center flex-wrap">
        <div
          v-for="(slot, i) in slots"
          :key="i"
          class="flex flex-col items-center gap-2 p-3 bg-[#273340] rounded-xl w-24 transition-all duration-150"
        >
          <img :src="slot.avatarUrl" :alt="slot.username" class="w-14 h-14 rounded-full" />
          <div class="text-xs text-white truncate w-full text-center font-medium">{{ slot.username }}</div>
          <div class="text-[10px] text-[#71767b] truncate w-full text-center">@{{ slot.handle }}</div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <svg class="animate-spin h-5 w-5 text-[#1d9bf0]" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
        <span class="text-[#71767b] text-sm">{{ t('drawing') }}</span>
      </div>
    </div>
  </Modal>
</template>
