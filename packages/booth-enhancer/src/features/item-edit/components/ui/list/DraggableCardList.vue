<script setup lang="ts" generic="T">
import { ref } from 'vue';
import { icons, withSize } from '../icons';

// 泛型约束：支持任意类型的列表项
interface Props {
  items: T[];
  showRemoveButton?: boolean;
  // 用于获取唯一key的函数，默认使用索引
  keyExtractor?: (item: T, index: number) => string | number;
}

const props = withDefaults(defineProps<Props>(), {
  showRemoveButton: true,
  keyExtractor: (item: any, index: number) => {
    // 优先使用 id，否则使用索引
    return item?.id !== undefined ? item.id : index;
  }
});

const emit = defineEmits<{
  remove: [index: number];
  reorder: [fromIndex: number, toIndex: number];
}>();

// 拖拽状态
const draggedIndex = ref<number | null>(null);

// 拖拽事件处理
function onDragStart(index: number): void {
  draggedIndex.value = index;
}

function onDragOver(event: DragEvent): void {
  event.preventDefault();
}

function onDrop(event: DragEvent, targetIndex: number): void {
  event.preventDefault();
  if (draggedIndex.value === null || draggedIndex.value === targetIndex) {
    draggedIndex.value = null;
    return;
  }
  
  emit('reorder', draggedIndex.value, targetIndex);
  draggedIndex.value = null;
}

// 删除项
function handleRemove(index: number): void {
  emit('remove', index);
}
</script>

<template>
  <div class="draggable-card-list">
    <div
      v-for="(item, index) in items"
      :key="keyExtractor(item, index)"
      class="draggable-card"
      draggable="true"
      @dragstart="onDragStart(index)"
      @dragover="onDragOver"
      @drop="onDrop($event, index)"
    >
      <!-- 卡片头部 -->
      <div class="card-header">
        <span class="drag-handle" v-html="withSize(icons.moreVertical, 14)"></span>
        <span class="card-number">#{{ index + 1 }}</span>
        
        <!-- 自定义头部内容插槽 -->
        <div class="header-content">
          <slot name="header" :item="item" :index="index"></slot>
        </div>
        
        <!-- 删除按钮 -->
        <button 
          v-if="showRemoveButton"
          class="booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm" 
          @click="handleRemove(index)"
        >
          <span v-html="withSize(icons.trash, 14)"></span>
        </button>
      </div>

      <!-- 卡片主体内容插槽 -->
      <div class="card-body">
        <slot name="content" :item="item" :index="index"></slot>
      </div>

      <!-- 可选的卡片底部插槽 -->
      <div v-if="$slots.footer" class="card-footer">
        <slot name="footer" :item="item" :index="index"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.draggable-card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.draggable-card {
  padding: 12px;
  background: var(--be-color-bg-secondary);
  border: 1px solid var(--be-color-border);
  border-radius: var(--be-radius);
  cursor: move;
  transition: var(--be-transition-normal);
}

.draggable-card:hover {
  border-color: var(--be-color-border-hover);
  box-shadow: var(--be-shadow-sm);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--be-space-sm);
  margin-bottom: 12px;
}

.drag-handle {
  cursor: grab;
  color: var(--be-color-text-muted);
  flex-shrink: 0;
}

.drag-handle:active {
  cursor: grabbing;
}

.card-number {
  font-size: var(--be-font-size-sm);
  font-weight: 600;
  color: var(--be-color-text-secondary);
  flex-shrink: 0;
}

.header-content {
  flex: 1;
  min-width: 0;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: var(--be-space-md);
}

.card-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--be-color-border);
}
</style>
