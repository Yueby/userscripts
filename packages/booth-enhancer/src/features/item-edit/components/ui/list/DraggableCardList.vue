<script setup lang="ts" generic="T">
import { computed, ref } from 'vue';
import { icons, withSize } from '../icons';

interface Props {
  items: T[];
  keyExtractor?: (item: T, index: number) => string | number;
  isItemLocked?: (item: T, index: number) => boolean;
}

const props = withDefaults(defineProps<Props>(), {
  keyExtractor: (item: any, index: number) => item?.id ?? index,
  isItemLocked: () => false
});

const emit = defineEmits<{
  remove: [index: number];
  reorder: [fromIndex: number, toIndex: number];
}>();

// 容器引用（用于限制查询作用域）
const containerRef = ref<HTMLElement | null>(null);

// 拖拽状态
const draggedIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);
const isDragging = ref<boolean>(false);
const canDrag = ref<boolean>(false);
const isTransitioning = ref<boolean>(false);

// 触摸状态（移动端）
const touchStartY = ref<number>(0);
const touchCurrentY = ref<number>(0);

// 常量配置
const DRAG_THRESHOLD = 10; // 触摸移动多少像素后认为是拖拽
const DEAD_ZONE = 5; // 中线死区，避免频繁切换

// 计算拖拽预览后的显示顺序
const displayItems = computed((): T[] => {
  const dragged = draggedIndex.value;
  const dragOver = dragOverIndex.value;
  
  if (dragged === null || dragOver === null || dragged === dragOver) {
    return props.items;
  }
  
  const items = [...props.items];
  const draggedItem = items[dragged];
  
  items.splice(dragged, 1);
  
  const insertIndex = dragOver > dragged ? dragOver - 1 : dragOver;
  items.splice(insertIndex, 0, draggedItem);
  
  return items;
});

// 获取原始索引
function getOriginalIndex(item: T): number {
  return props.items.indexOf(item);
}

// 重置拖拽状态
function resetDragState(): void {
  draggedIndex.value = null;
  dragOverIndex.value = null;
  isDragging.value = false;
  canDrag.value = false;
  touchStartY.value = 0;
  touchCurrentY.value = 0;
  // 注意：不重置 isTransitioning，因为它需要独立控制过渡动画
}

// 计算插入位置
function calculateInsertPosition(
  relativeY: number,
  height: number,
  targetOriginalIndex: number
): number | null {
  const midY = height / 2;
  
  if (relativeY < midY - DEAD_ZONE) {
    return targetOriginalIndex;
  }
  
  if (relativeY > midY + DEAD_ZONE) {
    return targetOriginalIndex + 1;
  }
  
  return null;
}

// 尝试更新拖拽悬停索引
function tryUpdateDragOverIndex(newIndex: number | null): void {
  if (newIndex === null || dragOverIndex.value === newIndex) {
    return;
  }
  
  // 检查新位置的项是否被锁定
  if (newIndex < props.items.length) {
    const itemAtNewIndex = props.items[newIndex];
    if (props.isItemLocked?.(itemAtNewIndex, newIndex)) {
      return;
    }
  }
  
  dragOverIndex.value = newIndex;
}

// 桌面端拖拽
function onHandleMouseDown(item: T, index: number): void {
  // 检查是否被禁用
  if (props.isItemLocked?.(item, index)) {
    return;
  }
  canDrag.value = true;
}

function onHandleMouseUp(): void {
  canDrag.value = false;
}

function onDragStart(event: DragEvent, item: T, index: number): void {
  // 检查是否被禁用
  if (!canDrag.value || props.isItemLocked?.(item, index)) {
    event.preventDefault();
    return;
  }
  draggedIndex.value = index;
  dragOverIndex.value = index;
}

function onDragEnd(): void {
  resetDragState();
}

function onDragOver(event: DragEvent, targetIndex: number): void {
  event.preventDefault();
  
  if (draggedIndex.value === null) return;
  
  const targetItem = displayItems.value[targetIndex];
  const targetOriginalIndex = getOriginalIndex(targetItem);
  
  if (draggedIndex.value === targetOriginalIndex) return;
  
  // 检查目标项是否被锁定
  if (props.isItemLocked?.(targetItem, targetOriginalIndex)) {
    return;
  }
  
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const relativeY = event.clientY - rect.top;
  
  const newIndex = calculateInsertPosition(relativeY, rect.height, targetOriginalIndex);
  tryUpdateDragOverIndex(newIndex);
}

// 处理拖拽结束的通用逻辑
function handleDragComplete(): void {
  const dragged = draggedIndex.value;
  const dragOver = dragOverIndex.value;
  
  if (dragged === null || dragOver === null) {
    resetDragState();
    return;
  }
  
  const finalIndex = dragOver > dragged ? dragOver - 1 : dragOver;
  
  // 检查最终位置的项是否被锁定
  if (finalIndex < props.items.length && finalIndex !== dragged) {
    const itemAtFinalIndex = props.items[finalIndex];
    if (props.isItemLocked?.(itemAtFinalIndex, finalIndex)) {
      resetDragState();
      return;
    }
  }
  
  if (dragged !== finalIndex) {
    // 先重置状态，让 displayItems 恢复到实际顺序
    resetDragState();
    // 禁用过渡动画，避免二次移动
    isTransitioning.value = true;
    // emit reorder，此时 displayItems 已经是最终状态
    emit('reorder', dragged, finalIndex);
    // 等待下一帧后重新启用过渡
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        isTransitioning.value = false;
      });
    });
  } else {
    resetDragState();
  }
}

function onDrop(event: DragEvent): void {
  event.preventDefault();
  handleDragComplete();
}

// 移动端触摸拖拽
function onTouchStart(event: TouchEvent, item: T, index: number): void {
  // 检查是否被禁用
  if (props.isItemLocked?.(item, index)) {
    return;
  }
  const touch = event.touches[0];
  touchStartY.value = touch.clientY;
  touchCurrentY.value = touch.clientY;
  draggedIndex.value = index;
  dragOverIndex.value = index;
  isDragging.value = false;
}

function onTouchMove(event: TouchEvent): void {
  if (draggedIndex.value === null || !containerRef.value) return;
  
  const touch = event.touches[0];
  touchCurrentY.value = touch.clientY;
  
  const dragDistance = Math.abs(touchCurrentY.value - touchStartY.value);
  
  if (dragDistance > DRAG_THRESHOLD) {
    isDragging.value = true;
    event.preventDefault();
    
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
    const cardElement = elements.find(el => el.classList.contains('draggable-card'));
    
    if (!cardElement) return;
    
    const rect = cardElement.getBoundingClientRect();
    const relativeY = touch.clientY - rect.top;
    
    // 只在当前容器内查找卡片，避免多个 DraggableCardList 实例冲突
    const allCards = Array.from(containerRef.value.querySelectorAll('.draggable-card'));
    const targetIndex = allCards.indexOf(cardElement as Element);
    
    if (targetIndex === -1 || targetIndex >= displayItems.value.length) return;
    
    const targetItem = displayItems.value[targetIndex];
    const targetOriginalIndex = getOriginalIndex(targetItem);
    
    if (draggedIndex.value === targetOriginalIndex) return;
    
    // 检查目标项是否被锁定
    if (props.isItemLocked?.(targetItem, targetOriginalIndex)) {
      return;
    }
    
    const newIndex = calculateInsertPosition(relativeY, rect.height, targetOriginalIndex);
    tryUpdateDragOverIndex(newIndex);
  }
}

function onTouchEnd(): void {
  if (draggedIndex.value === null || !isDragging.value) {
    resetDragState();
    return;
  }
  
  handleDragComplete();
}

function handleRemove(index: number): void {
  emit('remove', index);
}
</script>

<template>
  <div ref="containerRef" class="draggable-card-list">
    <TransitionGroup :name="isTransitioning ? '' : 'drag-transition'">
      <div
        v-for="(item, index) in displayItems"
        :key="keyExtractor(item, getOriginalIndex(item))"
        class="draggable-card"
        :class="{ 
          'is-dragging': getOriginalIndex(item) === draggedIndex,
          'is-drag-over': draggedIndex !== null && getOriginalIndex(item) !== draggedIndex
        }"
        draggable="true"
        @dragstart="onDragStart($event, item, getOriginalIndex(item))"
        @dragend="onDragEnd"
        @dragover="onDragOver($event, index)"
        @drop="onDrop"
      >
        <div class="card-actions">
          <span 
            class="drag-handle" 
            :class="{ 'is-locked': props.isItemLocked?.(item, getOriginalIndex(item)) }"
            v-html="props.isItemLocked?.(item, getOriginalIndex(item)) ? withSize(icons.lock, 14) : withSize(icons.moreVertical, 14)"
            @mousedown="onHandleMouseDown(item, getOriginalIndex(item))"
            @mouseup="onHandleMouseUp"
            @touchstart="onTouchStart($event, item, getOriginalIndex(item))"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
          ></span>
          <span class="card-number">#{{ index + 1 }}</span>
          <div class="actions-content">
            <slot name="actions" :item="item" :index="getOriginalIndex(item)"></slot>
          </div>
          <button 
            v-if="!isItemLocked?.(item, getOriginalIndex(item))"
            class="booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm" 
            @click.stop="handleRemove(getOriginalIndex(item))"
            title="删除"
          >
            <span v-html="withSize(icons.trash, 14)"></span>
          </button>
        </div>

        <div class="card-content">
          <slot name="content" :item="item" :index="getOriginalIndex(item)"></slot>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.draggable-card-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: var(--be-space-sm);
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid var(--be-color-border);
  border-radius: var(--be-radius);
}

/* 拖拽过渡动画 */
.drag-transition-move {
  transition: transform 0.3s ease;
}

/* 元素进入/离开动画 */
.drag-transition-enter-active,
.drag-transition-leave-active {
  transition: all 0.3s ease;
}

.drag-transition-leave-active {
  position: absolute;
}

.drag-transition-enter-from,
.drag-transition-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 嵌套的 DraggableCardList 不显示背景 */
.draggable-card-list .draggable-card-list {
  background: transparent;
  border: none;
  padding: 0;
}

.draggable-card {
  padding: 4px;
  background: var(--be-color-bg-secondary);
  border: 1px solid var(--be-color-border);
  border-radius: var(--be-radius);
  cursor: default;
  transition: var(--be-transition-normal);
}

.draggable-card:hover {
  border-color: var(--be-color-border-hover);
  box-shadow: var(--be-shadow-sm);
}

/* 拖拽状态 */
.draggable-card.is-dragging {
  opacity: 0.5;
  transform: scale(0.95);
  box-shadow: var(--be-shadow-lg);
  border-color: var(--be-color-primary);
}

.draggable-card.is-drag-over {
  opacity: 0.7;
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
  padding: 4px;
  margin: -4px;
  touch-action: none;
  -webkit-touch-callout: none;
  user-select: none;
  -webkit-user-select: none;
}

.drag-handle:active {
  cursor: grabbing;
}

/* 锁定状态样式（只影响拖拽句柄） */
.drag-handle.is-locked {
  cursor: not-allowed !important;
  pointer-events: none;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .drag-handle {
    padding: 8px;
    margin: -8px;
  }
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
