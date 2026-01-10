<script setup lang="ts" generic="T">
import { ref } from 'vue';
import { icons, withSize } from '../icons';

interface Props {
  items: T[];
  keyExtractor?: (item: T, index: number) => string | number;
}

const props = withDefaults(defineProps<Props>(), {
  keyExtractor: (item: any, index: number) => {
    return item?.id !== undefined ? item.id : index;
  }
});

const emit = defineEmits<{
  remove: [index: number];
  reorder: [fromIndex: number, toIndex: number];
}>();

const draggedIndex = ref<number | null>(null);

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
      <div class="card-actions">
        <span class="drag-handle" v-html="withSize(icons.moreVertical, 14)"></span>
        <span class="card-number">#{{ index + 1 }}</span>
        <div class="actions-content">
          <slot name="actions" :item="item" :index="index"></slot>
        </div>
        <button 
          class="booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm" 
          @click="handleRemove(index)"
          title="删除"
        >
          <span v-html="withSize(icons.trash, 14)"></span>
        </button>
      </div>

      <div class="card-content">
        <slot name="content" :item="item" :index="index"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.draggable-card-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.draggable-card {
  padding: 4px;
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

.card-actions {
  display: flex;
  align-items: center;
  gap: var(--be-space-xs);
  padding: 4px 0;
  border-bottom: 1px solid var(--be-color-border);
  margin-bottom: 4px;
  min-height: 28px;
  flex-wrap: nowrap;
  overflow: hidden;
}

.drag-handle {
  cursor: grab;
  color: var(--be-color-text-muted);
  flex-shrink: 0;
  display: flex;
  align-items: center;
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

.actions-content {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: var(--be-space-xs);
  overflow: hidden;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: var(--be-space-sm);
}
</style>
