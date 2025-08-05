<template>
  <div class="table-header">
    <h3>{{ title }}</h3>
    <div class="table-info">
      <span class="item-count">
        <MaskedText :value="info.totalItems" :masked="privacyMode" /> {{ info.itemLabel }}
      </span>
      <!-- 额外的控制区域槽位 -->
      <slot name="controls" />
    </div>
  </div>
</template>

<script setup lang="ts">
import MaskedText from '../../MaskedText/index.vue';

interface TableInfo {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  itemLabel: string;
}

interface Props {
  title?: string;
  info: TableInfo;
  privacyMode?: boolean;
}

defineProps<Props>();
</script>

<style scoped>
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--table-border-color, #e5e7eb);
}

.table-header h3 {
  margin: 0;
  color: var(--table-text-primary, #1f2937);
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.025em;
}

.table-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.item-count {
  font-size: 13px;
  color: var(--table-text-secondary, #6b7280);
  background: #f3f4f6;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>