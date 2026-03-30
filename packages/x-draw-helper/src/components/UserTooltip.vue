<script setup lang="ts">
import type { DrawUser } from '../types';
import { useI18n } from '../composables/useI18n';
import InteractionBadge from './InteractionBadge.vue';

defineProps<{
  user: DrawUser;
  x: number;
  y: number;
}>();

const { t } = useI18n();
</script>

<template>
  <div
    class="fixed z-[10003] w-72 bg-[#1e2d3d] border border-[#38444d] rounded-xl shadow-xl p-4 pointer-events-none"
    :style="{ left: x + 'px', top: (y - 8) + 'px', transform: 'translate(-50%, -100%)' }"
  >
    <div class="flex items-start gap-3 mb-2">
      <img :src="user.avatarUrl" :alt="user.username" class="w-12 h-12 rounded-full shrink-0" />
      <div class="min-w-0">
        <div class="text-white font-bold truncate">{{ user.username }}</div>
        <div class="text-[#71767b] text-sm">@{{ user.handle }}</div>
      </div>
    </div>
    <div class="flex gap-4 text-sm text-[#71767b]">
      <span><span class="text-white font-bold">{{ user.followingCount.toLocaleString() }}</span> {{ t('followingLabel') }}</span>
      <span><span class="text-white font-bold">{{ user.followersCount.toLocaleString() }}</span> {{ t('followers') }}</span>
    </div>
    <p v-if="user.bio" class="text-[#e7e9ea] text-sm leading-relaxed mt-1">{{ user.bio }}</p>
    <p v-else class="text-[#71767b] text-sm italic mt-1">{{ t('noBio') }}</p>
    <div class="flex gap-2 mt-2 flex-wrap">
      <InteractionBadge v-if="user.hasRetweet" type="retweet" :label="t('retweetType')" />
      <InteractionBadge v-if="user.hasLike" type="like" :label="t('likeType')" />
      <InteractionBadge v-if="user.hasQuote" type="quote" :label="t('quoteType')" />
      <InteractionBadge v-if="user.followed_by" type="follow" :label="t('followingYou')" />
    </div>
  </div>
</template>
