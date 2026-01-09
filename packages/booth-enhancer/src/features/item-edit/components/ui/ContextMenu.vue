<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue';

export interface MenuItem {
  label: string;
  icon?: string;
  action: () => void;
  danger?: boolean;
  separator?: boolean; // 在此项后显示分隔线
}

const props = defineProps<{
  show: boolean;
  x: number;
  y: number;
  items: MenuItem[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const menuRef = ref<HTMLElement | null>(null);
const adjustedPosition = ref({ x: 0, y: 0 });
const isRepositioning = ref(false); // 标记是否正在重新定位（避免位置过渡动画）

// 计算调整后的位置，避免超出父容器边界
const calculatePosition = async () => {
  // 立即设置初始位置（没有过渡动画）
  isRepositioning.value = true;
  adjustedPosition.value = { x: props.x, y: props.y };
  
  await nextTick();
  await nextTick(); // 等待两个 tick 确保 DOM 完全更新
  
  if (!menuRef.value) {
    isRepositioning.value = false;
    return;
  }
  
  const menu = menuRef.value;
  const menuRect = menu.getBoundingClientRect();
  
  // 查找父容器（侧边栏）
  const parent = document.querySelector('.booth-enhancer-sidebar');
  
  let containerRect: DOMRect;
  let containerWidth: number;
  let containerHeight: number;
  
  if (parent) {
    // 如果找到父容器，使用父容器的边界
    containerRect = parent.getBoundingClientRect();
    containerWidth = containerRect.width;
    containerHeight = containerRect.height;
  } else {
    // 否则回退到视口尺寸
    containerWidth = document.documentElement.clientWidth;
    containerHeight = document.documentElement.clientHeight;
    containerRect = new DOMRect(0, 0, containerWidth, containerHeight);
  }
  
  let finalX = props.x;
  let finalY = props.y;
  
  const padding = 8; // 边距
  
  // 检查右边界（相对于容器右边）
  const rightBoundary = containerRect.left + containerWidth;
  if (finalX + menuRect.width > rightBoundary - padding) {
    finalX = Math.max(containerRect.left + padding, rightBoundary - menuRect.width - padding);
  }
  
  // 检查左边界（相对于容器左边）
  if (finalX < containerRect.left + padding) {
    finalX = containerRect.left + padding;
  }
  
  // 检查底边界（相对于容器底部）
  const bottomBoundary = containerRect.top + containerHeight;
  if (finalY + menuRect.height > bottomBoundary - padding) {
    finalY = Math.max(containerRect.top + padding, bottomBoundary - menuRect.height - padding);
  }
  
  // 检查顶边界（相对于容器顶部）
  if (finalY < containerRect.top + padding) {
    finalY = containerRect.top + padding;
  }
  
  adjustedPosition.value = { x: finalX, y: finalY };
  
  // 延迟一帧后恢复正常状态（允许过渡动画）
  await nextTick();
  isRepositioning.value = false;
};

// 监听 show 状态和位置变化
watch(() => [props.show, props.x, props.y], ([newShow]) => {
  if (newShow) {
    calculatePosition();
  }
});

// 处理菜单项点击
const handleItemClick = (item: MenuItem) => {
  item.action();
  emit('close');
};

// 点击外部关闭菜单
const handleGlobalClick = (e: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    emit('close');
  }
};

// 监听菜单显示状态，动态注册/注销监听器
watch(() => props.show, (isShow) => {
  if (isShow) {
    // 延迟注册全局点击监听，避免与打开菜单的点击事件冲突
    setTimeout(() => {
      document.addEventListener('click', handleGlobalClick);
    }, 0);
  } else {
    document.removeEventListener('click', handleGlobalClick);
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="menu-fade">
      <div
        v-if="show"
        ref="menuRef"
        :class="['context-menu', { 'no-transition': isRepositioning }]"
        :style="{ left: adjustedPosition.x + 'px', top: adjustedPosition.y + 'px' }"
      >
        <template v-for="(item, index) in items" :key="index">
          <div 
            v-if="item.label"
            :class="['menu-item', { 'menu-item-danger': item.danger }]"
            @click="handleItemClick(item)"
          >
            <span v-if="item.icon" class="menu-icon" v-html="item.icon"></span>
            <span class="menu-label">{{ item.label }}</span>
          </div>
          <div v-if="item.separator" class="menu-separator"></div>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 菜单弹出动画 - 只动画 opacity 和 transform，不动画位置 */
.menu-fade-enter-active {
  transition: opacity 0.15s ease-out, transform 0.15s ease-out;
}

.menu-fade-leave-active {
  transition: opacity 0.1s ease-in, transform 0.1s ease-in;
}

.menu-fade-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}

.menu-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  min-width: 140px;
  overflow: hidden;
  padding: 4px 0;
  transform-origin: top left;
}

/* 禁用位置重新定位时的过渡动画 */
.context-menu.no-transition {
  transition: none !important;
}

.menu-item {
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 12px;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-item:hover {
  background: #f3f4f6;
}

.menu-item-danger {
  color: #ef4444;
}

.menu-item-danger:hover {
  background: #fef2f2;
}

.menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  flex-shrink: 0;
}

.menu-item-danger .menu-icon {
  color: #ef4444;
}

.menu-icon :deep(svg) {
  width: 14px;
  height: 14px;
}

.menu-label {
  flex: 1;
}

.menu-separator {
  height: 1px;
  background: #e5e7eb;
  margin: 4px 0;
}
</style>
