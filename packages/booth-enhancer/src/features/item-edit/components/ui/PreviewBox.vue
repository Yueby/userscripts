<script setup lang="ts">
defineProps<{
  label?: string;
  type?: 'text' | 'pre'; // text 用于单行/富文本，pre 用于保持换行的文本
  isEmpty?: boolean;
  emptyText?: string;
}>();
</script>

<template>
  <div class="preview-box be-flex be-flex-column be-gap-xs">
    <div v-if="label" class="be-text-xs be-text-secondary">{{ label }}</div>
    
    <div v-if="isEmpty" class="be-text-secondary">
      {{ emptyText || '暂无内容' }}
    </div>
    
    <pre 
      v-else-if="type === 'pre'" 
      class="be-whitespace-pre-wrap be-break-words be-m-0"
    >
      <slot></slot>
    </pre>
    
    <div v-else>
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.preview-box {
  padding: var(--be-space-sm);
  background: var(--be-color-bg-secondary);
  border: 1px solid var(--be-color-border);
  border-radius: var(--be-radius-sm);
}

.preview-box pre {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
}
</style>
