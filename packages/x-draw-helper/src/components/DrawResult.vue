<script setup lang="ts">
import { ref, computed } from 'vue';
import { toPng } from 'html-to-image';
import type { DrawUser } from '../types';
import { useI18n } from '../composables/useI18n';
import { useToast } from '../composables/useToast';
import { useTemplates } from '../composables/useTemplates';
import { getTweetIdFromUrl } from '../api/twitter';
import InteractionBadge from './InteractionBadge.vue';
import Modal from './Modal.vue';
import UserTooltip from './UserTooltip.vue';

const props = defineProps<{ winners: DrawUser[] }>();
const emit = defineEmits<{ close: [] }>();

const { t } = useI18n();
const { show: showToast } = useToast();
const tpl = useTemplates();

const captureRef = ref<HTMLElement | null>(null);
const showTemplateEditor = ref(false);
const editingName = ref(false);
const nameInput = ref('');
const hoveredUser = ref<DrawUser | null>(null);
const tooltipPos = ref({ x: 0, y: 0 });

function getTweetUrl(): string {
  const tweetId = getTweetIdFromUrl();
  return tweetId ? window.location.href.split('?')[0] : '';
}

function render(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replace(new RegExp(`\\{${k}\\}`, 'g'), v),
    template,
  );
}

function renderDm(handle: string): string {
  return render(tpl.active.value.dm, { winner: `@${handle}`, tweet: getTweetUrl() });
}

const dmPreview = computed(() => renderDm(props.winners[0]?.handle ?? 'user'));

const notifyPreview = computed(() => {
  const handles = props.winners.map((u) => `@${u.handle}`).join(' ');
  return render(tpl.active.value.notify, { winners: handles, tweet: getTweetUrl() });
});

async function onAvatarClick(user: DrawUser) {
  const text = renderDm(user.handle);
  try {
    await navigator.clipboard.writeText(text);
    showToast(t('copied'), 'success');
  } catch { /* ignore */ }

  const url = user.id
    ? `https://x.com/messages/compose?recipient_id=${user.id}`
    : `https://x.com/${user.handle}`;
  if (typeof GM_openInTab === 'function') {
    (GM_openInTab as (url: string, open: boolean) => void)(url, false);
  } else {
    window.open(url, '_blank');
  }
}

function notifyWinners() {
  const tweetId = getTweetIdFromUrl();
  if (!tweetId) return;
  const handles = props.winners.map((u) => `@${u.handle}`).join(' ');
  const text = render(tpl.active.value.notify, { winners: handles, tweet: getTweetUrl() });
  const intentUrl = `https://x.com/intent/post?in_reply_to=${tweetId}&text=${encodeURIComponent(text)}`;
  window.open(intentUrl, '_blank');
}

async function takeScreenshot() {
  if (!captureRef.value) return;
  try {
    const dataUrl = await toPng(captureRef.value, { backgroundColor: '#15202b', pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `draw-result-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  } catch { /* silent */ }
}

function handleAdd() {
  const newTpl = tpl.add(t('newTemplate'));
  nameInput.value = newTpl.name;
  editingName.value = true;
}

function handleDelete() {
  if (tpl.templates.value.length <= 1) return;
  tpl.remove(tpl.activeId.value);
}

function startRename() {
  nameInput.value = tpl.active.value.name;
  editingName.value = true;
}

function finishRename() {
  if (nameInput.value.trim()) {
    tpl.update(tpl.activeId.value, { name: nameInput.value.trim() });
  }
  editingName.value = false;
}

function onAvatarEnter(user: DrawUser, e: MouseEvent) {
  const el = e.currentTarget as HTMLElement;
  const rect = el.getBoundingClientRect();
  tooltipPos.value = { x: rect.left + rect.width / 2, y: rect.top };
  hoveredUser.value = user;
}
</script>

<template>
  <Modal :title="t('drawResult')" max-width="700px" :z-index="10001" @close="emit('close')">
    <div class="flex-1 overflow-auto min-h-0">
      <!-- Screenshot area -->
      <div ref="captureRef">
        <div class="px-4 py-4">
          <div :style="{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }">
            <div
              v-for="user in winners"
              :key="user.handle"
              class="flex flex-col items-center gap-2 p-3 bg-[#273340] rounded-xl"
            >
              <img
                :src="user.avatarUrl"
                :alt="user.username"
                class="w-12 h-12 rounded-full shrink-0 cursor-pointer hover:ring-2 hover:ring-[#1d9bf0] transition-shadow"
                @mouseenter="onAvatarEnter(user, $event)"
                @mouseleave="hoveredUser = null"
                @click="onAvatarClick(user)"
              />
              <div class="text-center min-w-0 w-full">
                <div class="text-white font-medium text-sm truncate">{{ user.username }}</div>
                <div class="text-[#71767b] text-xs truncate">@{{ user.handle }}</div>
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

    <template #footer>
      <div class="px-4 py-3 flex items-center justify-between border-t border-[#38444d]">
        <div class="flex items-center gap-2">
          <select
            class="xd-select text-xs"
            :value="tpl.activeId.value"
            @change="tpl.setActive(($event.target as HTMLSelectElement).value)"
          >
            <option v-for="item in tpl.templates.value" :key="item.id" :value="item.id">{{ item.name }}</option>
          </select>
          <button
            class="xd-btn-icon text-[#71767b] hover:text-[#1d9bf0]"
            :title="t('editTemplate')"
            @click="showTemplateEditor = true"
          >
            <svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </div>
        <div class="flex gap-2">
          <button class="xd-btn xd-btn-secondary text-sm" @click="takeScreenshot">
            <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            {{ t('screenshot') }}
          </button>
          <button class="xd-btn xd-btn-success text-sm" @click="notifyWinners">
            {{ t('notify') }}
          </button>
        </div>
      </div>
    </template>
  </Modal>

  <!-- Template Editor Modal -->
  <Modal
    v-if="showTemplateEditor"
    :title="t('editTemplate')"
    max-width="520px"
    :z-index="10002"
    @close="showTemplateEditor = false"
  >
    <div class="flex-1 overflow-auto min-h-0 p-4 space-y-4">
      <div class="flex items-center gap-2">
        <select
          class="xd-select text-sm flex-1"
          :value="tpl.activeId.value"
          @change="tpl.setActive(($event.target as HTMLSelectElement).value)"
        >
          <option v-for="item in tpl.templates.value" :key="item.id" :value="item.id">{{ item.name }}</option>
        </select>
        <template v-if="editingName">
          <input
            v-model="nameInput"
            class="xd-input text-sm"
            :style="{ width: '120px' }"
            @keydown.enter="finishRename"
            @blur="finishRename"
          />
        </template>
        <template v-else>
          <button class="xd-btn-icon text-[#71767b] hover:text-[#1d9bf0]" :title="t('rename')" @click="startRename">
            <svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </template>
        <button class="xd-btn-icon text-[#71767b] hover:text-[#00ba7c]" :title="t('addTemplate')" @click="handleAdd">
          <svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <button
          class="xd-btn-icon text-[#71767b] hover:text-[#f4212e]"
          :title="t('deleteTemplate')"
          :style="{ opacity: tpl.templates.value.length <= 1 ? 0.3 : 1 }"
          @click="handleDelete"
        >
          <svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>

      <div class="bg-[#273340] rounded-xl p-3">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs text-[#71767b] font-medium">{{ t('dmTemplate') }}</span>
          <span class="text-[10px] text-[#71767b] opacity-60 flex gap-2">
            <code class="bg-[#15202b] px-1 py-0.5 rounded">{winner}</code>
            <code class="bg-[#15202b] px-1 py-0.5 rounded">{tweet}</code>
          </span>
        </div>
        <textarea
          :value="tpl.active.value.dm"
          class="xd-input w-full text-sm resize-none"
          rows="3"
          @input="tpl.update(tpl.activeId.value, { dm: ($event.target as HTMLTextAreaElement).value })"
        />
        <div class="mt-2 text-xs text-[#71767b] bg-[#15202b] rounded-lg p-2 break-words whitespace-pre-wrap">
          <span class="opacity-60">{{ t('preview') }}:</span>
          <span class="text-[#e7e9ea] ml-1">{{ dmPreview }}</span>
        </div>
      </div>

      <div class="bg-[#273340] rounded-xl p-3">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs text-[#71767b] font-medium">{{ t('notifyTemplate') }}</span>
          <span class="text-[10px] text-[#71767b] opacity-60 flex gap-2">
            <code class="bg-[#15202b] px-1 py-0.5 rounded">{winners}</code>
            <code class="bg-[#15202b] px-1 py-0.5 rounded">{tweet}</code>
          </span>
        </div>
        <textarea
          :value="tpl.active.value.notify"
          class="xd-input w-full text-sm resize-none"
          rows="3"
          @input="tpl.update(tpl.activeId.value, { notify: ($event.target as HTMLTextAreaElement).value })"
        />
        <div class="mt-2 text-xs text-[#71767b] bg-[#15202b] rounded-lg p-2 break-words whitespace-pre-wrap">
          <span class="opacity-60">{{ t('preview') }}:</span>
          <span class="text-[#e7e9ea] ml-1">{{ notifyPreview }}</span>
        </div>
      </div>
    </div>
  </Modal>

  <UserTooltip v-if="hoveredUser" :user="hoveredUser" :x="tooltipPos.x" :y="tooltipPos.y" />
</template>
