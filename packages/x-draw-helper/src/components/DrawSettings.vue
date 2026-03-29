<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '../composables/useI18n';
import { useDrawData } from '../composables/useDrawData';
import type { DrawUser, FilterKey } from '../types';
import Modal from './Modal.vue';

const emit = defineEmits<{
  close: [];
  draw: [winners: DrawUser[]];
}>();

const { t } = useI18n();
const drawData = useDrawData();

const filterOptions: { key: FilterKey; icon: string }[] = [
  { key: 'retweet', icon: 'retweet' },
  { key: 'like', icon: 'like' },
  { key: 'quote', icon: 'quote' },
  { key: 'followed_by', icon: 'follow' },
];

function getFilterLabel(key: FilterKey): string {
  if (key === 'retweet') return t('hasRetweeted');
  if (key === 'like') return t('hasLiked');
  if (key === 'quote') return t('hasQuoted');
  return t('followingMe');
}

const qualifiedCount = computed(() => drawData.qualifiedUsers.value.length);

function handleDraw() {
  const result = drawData.performDraw();
  if (!result.success) {
    if (result.message === 'notEnoughUsers') {
      alert(t('notEnoughUsers', { count: String(result.count) }));
    } else {
      alert(t(result.message || 'noQualifiedUsers'));
    }
    return;
  }
  emit('draw', result.winners!);
}
</script>

<template>
  <Modal :title="t('startDraw')" width="w-[400px]" :z-index="10001" @close="emit('close')">
    <!-- Filters -->
    <div class="p-5 space-y-3">
      <div class="text-sm text-[#71767b] mb-2">{{ t('selectFilters') }}</div>
      <label
        v-for="opt in filterOptions"
        :key="opt.key"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
        :class="drawData.filters.value[opt.key] ? 'bg-[#273340]' : 'hover:bg-[#273340]/50'"
      >
        <input
          type="checkbox"
          :checked="drawData.filters.value[opt.key]"
          class="xd-checkbox"
          @change="drawData.toggleFilter(opt.key)"
        />
        <!-- Retweet icon -->
        <svg v-if="opt.icon === 'retweet'" viewBox="0 0 24 24" class="w-4 h-4 text-[#00ba7c]" fill="currentColor"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"/></svg>
        <!-- Like icon -->
        <svg v-if="opt.icon === 'like'" viewBox="0 0 24 24" class="w-4 h-4 text-[#f91880]" fill="currentColor"><path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/></svg>
        <!-- Quote icon -->
        <svg v-if="opt.icon === 'quote'" viewBox="0 0 24 24" class="w-4 h-4 text-[#00ba7c]" fill="currentColor"><path d="M14.23 2.854c.98-.977 2.56-.977 3.54 0l3.38 3.378c.97.977.97 2.559 0 3.536L9.91 21H3v-6.914L14.23 2.854zm2.12 1.414c-.19-.195-.51-.195-.7 0L4.41 15.51V19h3.49l11.24-11.242c.2-.195.2-.513 0-.707l-3.38-3.378-.41.595zm-1.42 1.42l3.38 3.378-1.42 1.414-3.38-3.378 1.42-1.414z"/></svg>
        <!-- Follow icon -->
        <svg v-if="opt.icon === 'follow'" viewBox="0 0 24 24" class="w-4 h-4 text-[#1d9bf0]" fill="currentColor"><path d="M12 11.816c1.355 0 2.872-.15 3.84-1.256.814-.93 1.078-2.368.806-4.392-.38-2.825-2.117-4.512-4.646-4.512S7.734 3.343 7.354 6.168c-.272 2.024-.008 3.462.806 4.392.968 1.107 2.485 1.256 3.84 1.256zm-3.16-5.448c.162-1.2.787-3.212 3.16-3.212s2.998 2.013 3.16 3.212c.207 1.55.057 2.627-.45 3.205-.455.52-1.266.743-2.71.743s-2.255-.223-2.71-.743c-.507-.578-.657-1.656-.45-3.205zm11.44 12.868c-.877-3.526-4.282-5.99-8.28-5.99s-7.403 2.464-8.28 5.99c-.172.692-.028 1.4.395 1.94.408.52 1.04.82 1.733.82h12.304c.693 0 1.325-.3 1.733-.82.424-.54.567-1.247.394-1.94zm-1.576 1.016c-.126.16-.316.246-.552.246H5.848c-.235 0-.426-.086-.552-.246-.137-.174-.18-.412-.12-.654.71-2.855 3.517-4.85 6.824-4.85s6.114 1.994 6.824 4.85c.06.242.017.48-.12.654z"/></svg>
        <span class="text-[#e7e9ea] text-sm">{{ getFilterLabel(opt.key) }}</span>
      </label>
    </div>

    <!-- Draw Count + Qualified Info -->
    <div class="px-5 pb-4 flex items-center justify-between">
      <div class="text-sm text-[#71767b]">
        {{ t('qualifiedUsers') }}：<span class="text-white font-bold">{{ qualifiedCount }}</span> {{ t('people') }}
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-[#71767b]">{{ t('draw') }}</span>
        <input
          type="number"
          v-model.number="drawData.drawCount.value"
          min="1"
          class="xd-input w-16 text-center"
        />
        <span class="text-sm text-[#71767b]">{{ t('people') }}</span>
      </div>
    </div>

    <template #footer>
      <div class="px-5 py-4 flex justify-end">
        <button
          class="xd-btn xd-btn-primary text-sm"
          :style="{ opacity: qualifiedCount === 0 ? 0.5 : 1 }"
          @click="handleDraw"
        >{{ t('startDraw') }}</button>
      </div>
    </template>
  </Modal>
</template>
