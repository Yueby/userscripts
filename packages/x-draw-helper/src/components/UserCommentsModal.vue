<script setup lang="ts">
import type { DrawUser } from '../types';
import { useI18n } from '../composables/useI18n';
import { formatDateTime } from '../utils/format';
import Modal from './Modal.vue';

defineProps<{
  user: DrawUser | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { t } = useI18n();

function formatCommentDate(dateStr: string): string {
  if (!dateStr) return '';
  const parsed = new Date(dateStr).getTime();
  if (isNaN(parsed)) return dateStr;
  return formatDateTime(parsed);
}
</script>

<template>
  <Modal
    v-if="user"
    :title="t('userReplies', { user: `@${user.handle}` })"
    max-width="560px"
    max-height="620px"
    :z-index="10002"
    @close="emit('close')"
  >
    <!-- User Info Header -->
    <div class="px-5 py-3 border-b border-[#38444d] flex items-center justify-between bg-[#192734]/50 shrink-0">
      <div class="flex items-center gap-3 min-w-0">
        <img :src="user.avatarUrl" :alt="user.username" class="w-10 h-10 rounded-full shrink-0" />
        <div class="min-w-0">
          <div class="text-white font-bold text-sm truncate">{{ user.username }}</div>
          <div class="text-[#71767b] text-xs truncate">@{{ user.handle }}</div>
        </div>
      </div>
      <span class="text-xs text-[#1d9bf0] font-medium bg-[#1d9bf0]/10 px-2.5 py-1 rounded-full shrink-0">
        {{ (user.replyComments?.length ?? 0) }} {{ t('comments') }}
      </span>
    </div>

    <!-- Comments List -->
    <div class="flex-1 overflow-auto min-h-0 p-5 space-y-3">
      <template v-if="user.replyComments && user.replyComments.length > 0">
        <div
          v-for="(comment, index) in user.replyComments"
          :key="comment.id || index"
          class="p-4 bg-[#273340] rounded-xl border border-[#38444d]/60 space-y-2 hover:border-[#38444d] transition-colors"
        >
          <div class="text-sm text-[#e7e9ea] leading-relaxed break-words whitespace-pre-wrap select-text">
            {{ comment.text?.trim() ? comment.text : t('emptyCommentText') }}
          </div>
          <div class="flex items-center justify-between text-xs text-[#71767b] pt-2 border-t border-[#38444d]/40">
            <span>{{ formatCommentDate(comment.createdAt) }}</span>
            <a
              v-if="comment.url"
              :href="comment.url"
              target="_blank"
              class="text-[#1d9bf0] hover:underline flex items-center gap-1 font-medium"
            >
              {{ t('viewOnX') }}
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>
      </template>

      <div v-else class="text-center py-10 text-sm text-[#71767b]">
        {{ t('noCommentText') }}
      </div>
    </div>
  </Modal>
</template>
