<template>
  <div class="table-content">
    <div v-for="(item, index) in data" :key="getItemKey(item, index)" class="table-row">
      <div v-for="column in columns" :key="column.key" class="table-cell" :class="getCellClass(column.key)"
        :style="{ width: column.width, textAlign: column.align || 'left' }">
        <slot name="cell" :item="item" :column="column" :index="index">
          <!-- 默认单元格渲染 -->
          <TableCell :item="item" :column="column" :privacy-mode="privacyMode" />
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '../index.vue';
import TableCell from './TableCell.vue';

interface Props {
  data: any[];
  columns: TableColumn[];
  privacyMode?: boolean;
  getItemKey: (item: any, index: number) => string | number;
}

const props = defineProps<Props>();

// 获取单元格CSS类名
const getCellClass = (columnKey: string): string => {
  return `cell-${columnKey}`;
};
</script>

<style scoped>
.table-content {
  max-height: 600px;
  overflow-y: auto;
  overflow-x: auto;
}

.table-row {
  display: flex;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s;
  min-height: 36px;
}

.table-row:hover {
  background: var(--table-row-hover, #f9fafb);
}

.table-cell {
  padding: 8px 12px;
  font-size: 14px;
  color: var(--table-text-secondary, #6b7280);
  border-right: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-height: 36px;
}

.table-cell:last-child {
  border-right: none;
}

/* 确保单元格内容正确对齐 */
.table-cell>* {
  width: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .table-content {
    max-height: 500px;
  }

  .table-cell {
    padding: 8px;
    font-size: 13px;
  }
}
</style>