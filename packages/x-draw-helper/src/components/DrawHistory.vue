<script setup lang="ts">
import { toRef, computed } from 'vue';
import { useI18n } from '../composables/useI18n';
import { useDrawHistory } from '../composables/useDrawHistory';
import { formatDateTime } from '../utils/format';
import Modal from './Modal.vue';

const emit = defineEmits<{
  close: [];
}>();
const props = defineProps<{ tweetId: string | null }>();

const { t } = useI18n();
const { history, removeEntry, toggleConfirm, clearHistory } = useDrawHistory(toRef(props, 'tweetId'));

const uniquePostCount = computed(() => new Set(history.value.map((e) => e.tweetId)).size);
const confirmedCount = computed(() => history.value.filter((e) => e.confirmed).length);

function handleClear() {
  if (confirm(t('confirmClear'))) clearHistory();
}
</script>

<template>
  <Modal :title="t('drawHistory')" max-width="700px" max-height="600px" :z-index="10001" @close="emit('close')">
    <template #header-controls>
      <button v-if="history.length" class="xd-btn xd-btn-ghost text-sm text-[#f4212e]" @click="handleClear">
        {{ t('clearHistory') }}
      </button>
    </template>

    <div class="flex-1 overflow-auto min-h-0 p-4">
      <div v-if="history.length === 0" class="flex items-center justify-center h-full text-[#71767b]">
        {{ t('noHistory') }}
      </div>

      <div v-else class="flex flex-col gap-3">
        <!-- Global History Summary -->
        <div class="bg-[#1e2d3d] border border-[#38444d] rounded-xl p-3 flex items-center justify-around text-center">
          <div>
            <span class="text-xs text-[#71767b] block">{{ t('totalDraws') }}</span>
            <span class="text-lg font-bold text-white">{{ history.length }}</span>
          </div>
          <div class="border-r border-[#38444d] h-7" />
          <div>
            <span class="text-xs text-[#71767b] block">{{ t('totalPosts') }}</span>
            <span class="text-lg font-bold text-[#1d9bf0]">{{ uniquePostCount }}</span>
          </div>
          <div class="border-r border-[#38444d] h-7" />
          <div>
            <span class="text-xs text-[#71767b] block">{{ t('confirmed') }}</span>
            <span class="text-lg font-bold text-[#00ba7c]">{{ confirmedCount }}</span>
          </div>
        </div>

        <div
          v-for="entry in history"
          :key="`${entry.tweetId}:${entry.id}`"
          class="rounded-xl border p-4"
          :class="entry.confirmed ? 'bg-[#1e2d3d] border-[#38444d]' : 'bg-[#1e2d3d]/50 border-[#38444d]/50 opacity-70'"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2.5 text-sm flex-wrap">
              <button
                class="xd-btn text-xs px-2 py-0.5"
                :class="entry.confirmed ? 'xd-btn-success' : 'xd-btn-secondary'"
                @click="toggleConfirm(entry.id, entry.tweetId)"
              >{{ entry.confirmed ? t('confirmed') : t('testDraw') }}</button>
              <span class="text-[#71767b]">{{ formatDateTime(entry.timestamp) }}</span>
              <span class="text-[#71767b]">·</span>
              <span class="text-[#71767b]">{{ t('participants') }}: {{ entry.totalParticipants }}</span>
              <span v-if="entry.tweetId" class="text-xs text-[#71767b] bg-[#15202b] px-2 py-0.5 rounded font-mono border border-[#38444d]/50">
                {{ t('post') }}: {{ entry.tweetId }}
              </span>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <a
                :href="entry.tweetUrl"
                target="_blank"
                class="text-[#1d9bf0] text-sm hover:underline"
              >{{ t('viewTweet') }}</a>
              <button class="xd-btn-icon text-sm" @click="removeEntry(entry.id, entry.tweetId)">×</button>
            </div>
          </div>

          <!-- Filters used -->
          <div class="flex gap-1.5 mb-3 flex-wrap">
            <span v-if="entry.filters?.retweet" class="xd-badge xd-badge-green">{{ t('hasRetweeted') }}</span>
            <span v-if="entry.filters?.like" class="xd-badge xd-badge-pink">{{ t('hasLiked') }}</span>
            <span v-if="entry.filters?.quote" class="xd-badge xd-badge-orange">{{ t('hasQuoted') }}</span>
            <span v-if="entry.filters?.reply" class="xd-badge xd-badge-blue">{{ t('hasReplied') }}</span>
            <span v-if="entry.filters?.followed_by" class="xd-badge xd-badge-blue">{{ t('followingMe') }}</span>
          </div>

          <!-- Winners -->
          <div class="text-xs text-[#71767b] mb-2">{{ t('winnersLabel') }} ({{ entry.winners.length }})</div>
          <div class="flex flex-wrap gap-2">
            <a
              v-for="winner in entry.winners"
              :key="winner.handle"
              :href="`https://x.com/${winner.handle}`"
              target="_blank"
              class="flex items-center gap-2 bg-[#273340] rounded-lg px-3 py-1.5 hover:bg-[#38444d] transition-colors"
            >
              <img :src="winner.avatarUrl" :alt="winner.username" class="w-6 h-6 rounded-full" />
              <span class="text-sm text-[#e7e9ea]">@{{ winner.handle }}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>
