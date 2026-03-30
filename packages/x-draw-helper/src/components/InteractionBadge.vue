<script setup lang="ts">
import InteractionIcon from './InteractionIcon.vue';
import type { InteractionType } from './InteractionIcon.vue';

defineProps<{
  type: InteractionType;
  label?: string;
  iconSize?: string;
}>();

const BADGE_VARIANTS: Record<InteractionType, string> = {
  retweet: 'xd-badge-green',
  like: 'xd-badge-pink',
  quote: 'xd-badge-orange',
  follow: 'xd-badge-blue',
};
</script>

<template>
  <span class="xd-badge" :class="BADGE_VARIANTS[type]">
    <InteractionIcon :type="type" :size="iconSize ?? 'w-3.5 h-3.5'" />
    <template v-if="label">{{ label }}</template>
  </span>
</template>
