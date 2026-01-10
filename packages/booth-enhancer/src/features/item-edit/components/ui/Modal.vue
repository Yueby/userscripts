<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { icons } from './icons';

export interface ModalButton {
  text: string;
  variant?: 'default' | 'primary' | 'danger';
  action: string;
}

const props = withDefaults(defineProps<{
  show: boolean;
  title?: string;
  width?: string;
  buttons?: ModalButton[];
  closeOnClickOutside?: boolean;
  closeOnEsc?: boolean;
  teleportTo?: string;
}>(), {
  teleportTo: 'body',
  closeOnClickOutside: true,
  closeOnEsc: true
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'action', action: string): void;
}>();

const handleClose = () => {
  emit('close');
};

const handleOverlayClick = (e: MouseEvent) => {
  if (props.closeOnClickOutside && e.target === e.currentTarget) {
    handleClose();
  }
};

const handleButtonClick = (action: string) => {
  emit('action', action);
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (props.closeOnEsc && e.key === 'Escape' && props.show) {
    handleClose();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <Teleport :to="teleportTo" :disabled="teleportTo !== 'body'">
    <Transition name="modal">
      <div 
        v-if="show" 
        class="modal-overlay" 
        :class="{ 'modal-in-sidebar': teleportTo !== 'body' }"
        @click="handleOverlayClick"
      >
        <div class="modal-container" :style="{ width: width || '400px' }">
          <!-- Header -->
          <div class="modal-header">
            <h3 class="modal-title">{{ title || '提示' }}</h3>
            <button class="booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm" @click="handleClose" type="button">
              <span v-html="icons.close"></span>
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <slot></slot>
          </div>

          <!-- Footer -->
          <div class="modal-footer" v-if="$slots.footer || (buttons && buttons.length > 0)">
            <slot name="footer">
              <button
                v-for="btn in buttons"
                :key="btn.action"
                class="booth-btn booth-btn-md"
                :class="[`booth-btn-${btn.variant || 'secondary'}`]"
                @click="handleButtonClick(btn.action)"
                type="button"
              >
                {{ btn.text }}
              </button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 10000;
  padding: 0;
  backdrop-filter: blur(2px);
}

/* Modal 在侧边栏中时使用绝对定位 */
.modal-overlay.modal-in-sidebar {
  position: absolute;
  z-index: 2000;
}

.modal-container {
  background: white;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  background: #f8fafc;
}

.modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

/* Modal 头部关闭按钮使用 booth-btn 体系，这里只定义 SVG 大小 */
.modal-header .booth-btn :deep(svg) {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.modal-body {
  padding: 5px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  font-size: 13px;
  color: #374151;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  flex-shrink: 0;
  background: #f8fafc;
}

/* Modal 内的按钮使用 booth-btn 体系，这里只定义布局 */
.modal-footer .booth-btn {
  flex: 1;
  min-width: 80px;
}

/* 动画 - 从底部滑入 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: translateY(100%);
}

/* 滚动条样式 */
.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>
