<script setup lang="ts">
import { ref } from 'vue';
import { toPng } from 'html-to-image';
import type { DrawUser } from '../types';
import { useI18n } from '../composables/useI18n';
import { useToast } from '../composables/useToast';
import { getTweetIdFromUrl } from '../api/twitter';
import { STORAGE_KEYS } from '../constants';
import { gmStorage } from '../utils/storage';
import InteractionBadge from './InteractionBadge.vue';
import Modal from './Modal.vue';

const props = defineProps<{
  winners: DrawUser[];
}>();

const emit = defineEmits<{
  close: [];
}>();

const { t } = useI18n();
const { show: showToast } = useToast();
const captureRef = ref<HTMLElement | null>(null);
const showDmTemplate = ref(false);
const dmTemplate = ref(gmStorage.get(STORAGE_KEYS.DM_TEMPLATE, t('dmPlaceholder')));

function saveDmTemplate() {
  gmStorage.set(STORAGE_KEYS.DM_TEMPLATE, dmTemplate.value);
}

function notifyWinners(winners: DrawUser[]) {
  const tweetId = getTweetIdFromUrl();
  if (!tweetId) return;

  const winnersText = winners.map((u) => `@${u.handle}`).join(' ');
  const notifyText = t('winnerNotice') + winnersText;
  const intentUrl = `https://x.com/intent/post?in_reply_to=${tweetId}&text=${encodeURIComponent(notifyText)}`;
  window.open(intentUrl, '_blank');
}

async function openAllChats(winners: DrawUser[]) {
  if (dmTemplate.value.trim()) {
    const firstWinner = winners[0]?.handle ?? '';
    const text = dmTemplate.value.replace(/\{winner\}/g, firstWinner);
    try {
      await navigator.clipboard.writeText(text);
      showToast(t('dmCopied'), 'success');
    } catch { /* clipboard unavailable */ }
  }

  const urls = winners
    .filter((user) => !!user.id)
    .map((user) => `https://x.com/messages/compose?recipient_id=${user.id}`);

  if (typeof GM_openInTab === 'function') {
    urls.forEach((url) => {
      (GM_openInTab as any)(url, false);
    });
    return;
  }

  let opened = 0;
  urls.forEach((url) => {
    const tab = window.open(url, '_blank');
    if (tab) opened++;
  });

  if (opened < urls.length) {
    showToast(t('popupBlocked'), 'error', 5000);
  }
}

async function copyHandles() {
  const text = props.winners.map((u) => `@${u.handle}`).join(' ');
  try {
    await navigator.clipboard.writeText(text);
    showToast(t('copied'), 'success');
  } catch {
    showToast(text, 'info', 5000);
  }
}

async function takeScreenshot() {
  if (!captureRef.value) return;
  try {
    const dataUrl = await toPng(captureRef.value, { backgroundColor: '#15202b', pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `draw-result-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  } catch {
    // silent fail
  }
}
</script>

<template>
  <Modal :title="t('drawResult')" max-width="700px" :z-index="10001" @close="emit('close')">
    <!-- Scrollable content with capturable area inside -->
    <div class="flex-1 overflow-auto min-h-0">
      <div ref="captureRef">
        <div class="p-4 text-center text-[#e7e9ea] text-sm">{{ t('congratulations') }}</div>
        <div class="px-4 pb-4">
          <div :style="{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }">
            <div
              v-for="user in winners"
              :key="user.handle"
              class="flex flex-col items-center gap-2 p-3 bg-[#273340] rounded-xl"
            >
              <img :src="user.avatarUrl" :alt="user.username" class="w-12 h-12 rounded-full shrink-0" />
              <div class="text-center min-w-0 w-full">
                <div class="text-white font-medium text-sm truncate">{{ user.username }}</div>
                <a
                  :href="user.id ? `https://x.com/messages/compose?recipient_id=${user.id}` : `https://x.com/${user.handle}`"
                  target="_blank"
                  class="text-[#71767b] text-xs truncate hover:underline"
                >@{{ user.handle }}</a>
                <div class="text-[#71767b] text-xs mt-0.5">
                  <span class="text-[#e7e9ea] font-medium">{{ user.followersCount.toLocaleString() }}</span> {{ t('followers') }}
                </div>
              </div>
              <div class="flex gap-1">
                <InteractionBadge v-if="user.hasRetweet" type="retweet" icon-size="w-3 h-3" />
                <InteractionBadge v-if="user.hasLike" type="like" icon-size="w-3 h-3" />
                <InteractionBadge v-if="user.hasQuote" type="quote" icon-size="w-3 h-3" />
                <InteractionBadge v-if="user.followed_by" type="follow" icon-size="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- DM Template -->
    <div class="px-4 pb-3 shrink-0">
      <button class="text-xs text-[#71767b] hover:text-[#1d9bf0] transition-colors" @click="showDmTemplate = !showDmTemplate">
        {{ t('dmTemplate') }} {{ showDmTemplate ? '▲' : '▼' }}
      </button>
      <div v-if="showDmTemplate" class="mt-2">
        <textarea
          v-model="dmTemplate"
          class="xd-input w-full text-sm resize-none"
          rows="3"
          :placeholder="t('dmPlaceholder')"
          @blur="saveDmTemplate"
        />
        <div class="text-[10px] text-[#71767b] mt-1">{winner} → @handle</div>
      </div>
    </div>

    <template #footer>
      <div class="p-4 flex justify-center gap-4">
        <button class="xd-btn xd-btn-secondary" @click="copyHandles">
          <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          {{ t('copyHandles') }}
        </button>
        <button class="xd-btn xd-btn-secondary" @click="takeScreenshot">
          <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          {{ t('screenshot') }}
        </button>
        <button class="xd-btn xd-btn-primary" @click="openAllChats(winners)">
          <svg viewBox="0 0 24 24" class="w-4 h-4" fill="currentColor"><path d="M1.998 5.5a2.5 2.5 0 0 1 2.5-2.5h15a2.5 2.5 0 0 1 2.5 2.5v9a2.5 2.5 0 0 1-2.5 2.5h-6l-3 3-3-3h-3a2.5 2.5 0 0 1-2.5-2.5v-9z"/></svg>
          {{ t('openChats') }}
        </button>
        <button class="xd-btn xd-btn-success" @click="notifyWinners(winners)">
          {{ t('notify') }}
        </button>
      </div>
    </template>
  </Modal>
</template>
