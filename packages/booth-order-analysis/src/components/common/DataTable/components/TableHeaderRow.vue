<template>
  <div class="table-header-row">
    <div v-for="column in columns" :key="column.key" 
         class="table-header-cell" 
         :style="{ width: column.width, textAlign: column.align || 'left' }">
      {{ column.label }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '../index.vue';

interface Props {
  columns: TableColumn[];
}

defineProps<Props>();
</script>

<style scoped>
.table-header-row {
  display: flex;
  background: var(--table-header-bg, #f8fafc);
  border-bottom: 1px solid var(--table-border-color, #e5e7eb);
}

.table-header-cell {
  padding: 12px;
  font-weight: 600;
  color: var(--table-text-primary, #374151);
  font-size: 14px;
  border-right: 1px solid var(--table-border-color, #e5e7eb);
}

.table-header-cell:last-child {
  border-right: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .table-header-cell {
    padding: 8px;
    font-size: 13px;
  }
}
</style> 