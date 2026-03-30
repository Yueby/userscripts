<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from '../composables/useI18n';
import { useDrawData } from '../composables/useDrawData';
import { useDrawHistory } from '../composables/useDrawHistory';
import { useToast } from '../composables/useToast';
import type { DrawUser, FilterKey } from '../types';
import type { InteractionType } from './InteractionIcon.vue';
import InteractionIcon from './InteractionIcon.vue';
import DrawResult from './DrawResult.vue';
import Modal from './Modal.vue';

const emit = defineEmits<{
  close: [];
  draw: [winners: DrawUser[]];
}>();

const { t } = useI18n();
const drawData = useDrawData();
const { history, winCountMap } = useDrawHistory();
const { show: showToast } = useToast();

const excludePastWinners = ref(false);

const showLastResult = ref(false);
const lastEntry = computed(() => {
  const tweetId = drawData.lastTweetId.value;
  if (!tweetId) return null;
  return history.value.find((e) => e.tweetId === tweetId) ?? null;
});
const lastWinners = computed(() => lastEntry.value?.winners ?? []);

const filterOptions: { key: FilterKey; icon: InteractionType }[] = [
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
  const exclude = excludePastWinners.value
    ? new Set(winCountMap.value.keys())
    : undefined;
  const result = drawData.performDraw({ excludeHandles: exclude });
  if (!result.success) {
    if (result.message === 'notEnoughUsers') {
      showToast(t('notEnoughUsers', { count: String(result.count) }), 'error');
    } else {
      showToast(t(result.message || 'noQualifiedUsers'), 'error');
    }
    return;
  }
  emit('draw', result.winners!);
}
</script>

<template>
  <Modal :title="t('startDraw')" max-width="400px" :z-index="10001" @close="emit('close')">
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
        <InteractionIcon :type="opt.icon" />
        <span class="text-[#e7e9ea] text-sm">{{ getFilterLabel(opt.key) }}</span>
      </label>
    </div>

    <!-- Exclude past winners -->
    <div class="px-5 pb-2">
      <label class="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors" :class="excludePastWinners ? 'bg-[#3d1f00]' : 'hover:bg-[#273340]/50'">
        <input type="checkbox" v-model="excludePastWinners" class="xd-checkbox" />
        <svg viewBox="0 0 24 24" class="w-4 h-4 text-[#ffd700]" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        <span class="text-[#e7e9ea] text-sm">{{ t('excludePastWinners') }}</span>
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
      <div class="px-5 py-4 flex justify-between">
        <button
          v-if="lastWinners.length"
          class="xd-btn xd-btn-secondary text-sm"
          @click="showLastResult = true"
        >{{ t('lastResult') }}</button>
        <div v-else />
        <button
          class="xd-btn xd-btn-primary text-sm"
          :style="{ opacity: qualifiedCount === 0 ? 0.5 : 1 }"
          @click="handleDraw"
        >{{ t('startDraw') }}</button>
      </div>
    </template>
  </Modal>

  <DrawResult v-if="showLastResult" :winners="lastWinners" @close="showLastResult = false" />
</template>
