<script setup lang="ts">
import { ref } from 'vue';
import { toPng } from 'html-to-image';
import type { DrawUser } from '../types';
import { useI18n } from '../composables/useI18n';
import { getTweetIdFromUrl } from '../api/twitter';
import Modal from './Modal.vue';

defineProps<{
  winners: DrawUser[];
}>();

const emit = defineEmits<{
  close: [];
}>();

const { t } = useI18n();
const captureRef = ref<HTMLElement | null>(null);

function notifyWinners(winners: DrawUser[]) {
  const tweetId = getTweetIdFromUrl();
  if (!tweetId) return;

  const winnersText = winners.map((u) => `@${u.handle}`).join(' ');
  const notifyText = t('winnerNotice') + winnersText;
  const intentUrl = `https://x.com/intent/post?in_reply_to=${tweetId}&text=${encodeURIComponent(notifyText)}`;
  window.open(intentUrl, '_blank');
}

function openAllChats(winners: DrawUser[]) {
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
    alert(t('popupBlocked'));
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
  <Modal :title="t('drawResult')" width="w-[700px]" :z-index="10001" @close="emit('close')">
    <!-- Scrollable content with capturable area inside -->
    <div class="flex-1 overflow-auto min-h-0">
      <div ref="captureRef">
        <div class="p-4 text-center text-[#e7e9ea] text-sm">{{ t('congratulations') }}</div>
        <div class="px-4 pb-4">
          <div class="grid grid-cols-4 gap-3">
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
              </div>
              <div class="flex gap-1">
                <span v-if="user.hasRetweet" class="xd-badge xd-badge-green"><svg viewBox="0 0 24 24" class="w-3 h-3" fill="currentColor"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"/></svg></span>
                <span v-if="user.hasLike" class="xd-badge xd-badge-pink"><svg viewBox="0 0 24 24" class="w-3 h-3" fill="currentColor"><path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/></svg></span>
                <span v-if="user.hasQuote" class="xd-badge xd-badge-orange"><svg viewBox="0 0 24 24" class="w-3 h-3" fill="currentColor"><path d="M14.23 2.854c.98-.977 2.56-.977 3.54 0l3.38 3.378c.97.977.97 2.559 0 3.536L9.91 21H3v-6.914L14.23 2.854zm2.12 1.414c-.19-.195-.51-.195-.7 0L4.41 15.51V19h3.49l11.24-11.242c.2-.195.2-.513 0-.707l-3.38-3.378-.41.595zm-1.42 1.42l3.38 3.378-1.42 1.414-3.38-3.378 1.42-1.414z"/></svg></span>
                <span v-if="user.followed_by" class="xd-badge xd-badge-blue"><svg viewBox="0 0 24 24" class="w-3 h-3" fill="currentColor"><path d="M12 11.816c1.355 0 2.872-.15 3.84-1.256.814-.93 1.078-2.368.806-4.392-.38-2.825-2.117-4.512-4.646-4.512S7.734 3.343 7.354 6.168c-.272 2.024-.008 3.462.806 4.392.968 1.107 2.485 1.256 3.84 1.256zm-3.16-5.448c.162-1.2.787-3.212 3.16-3.212s2.998 2.013 3.16 3.212c.207 1.55.057 2.627-.45 3.205-.455.52-1.266.743-2.71.743s-2.255-.223-2.71-.743c-.507-.578-.657-1.656-.45-3.205zm11.44 12.868c-.877-3.526-4.282-5.99-8.28-5.99s-7.403 2.464-8.28 5.99c-.172.692-.028 1.4.395 1.94.408.52 1.04.82 1.733.82h12.304c.693 0 1.325-.3 1.733-.82.424-.54.567-1.247.394-1.94zm-1.576 1.016c-.126.16-.316.246-.552.246H5.848c-.235 0-.426-.086-.552-.246-.137-.174-.18-.412-.12-.654.71-2.855 3.517-4.85 6.824-4.85s6.114 1.994 6.824 4.85c.06.242.017.48-.12.654z"/></svg></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="p-4 flex justify-center gap-4">
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
