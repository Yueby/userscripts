<template>
  <span v-if="column.render">
    <component :is="column.render" :item="item" :column="column" :privacy-mode="privacyMode" />
  </span>
  <span v-else>
    {{ getCellValue() }}
  </span>
</template>

<script setup lang="ts">
import type { TableColumn } from '../index.vue';

interface Props {
  item: any;
  column: TableColumn;
  privacyMode?: boolean;
}

const props = defineProps<Props>();

// 获取单元格值
const getCellValue = () => {
  const value = props.item[props.column.key];
  
  if (props.privacyMode) {
    return typeof value === 'string' ? '****' : '****';
  }
  
  return value;
};
</script> 