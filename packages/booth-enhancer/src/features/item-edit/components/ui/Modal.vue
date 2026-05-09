<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { icons } from './icons';

export interface ModalButton {
  text: string;
  variant?: 'default' | 'primary' | 'danger';
  action: string;
}

export type ModalSize = 'sm' | 'md' | 'lg' | 'full';

const props = withDefaults(defineProps<{
  show: boolean;
  title?: string;
  buttons?: ModalButton[];
  closeOnClickOutside?: boolean;
  closeOnEsc?: boolean;
  teleportTo?: string;
  size?: ModalSize;
}>(), {
  teleportTo: 'body',
  closeOnClickOutside: true,
  closeOnEsc: true,
  size: 'md'
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
        :class="[
          `size-${size}`,
          { 'modal-in-sidebar': teleportTo !== 'body' }
        ]"
        @click="handleOverlayClick"
      >
        <div class="modal-container">
          <!-- Header -->
          <div class="modal-header">
            <div class="modal-title">{{ title || '提示' }}</div>
            <div class="modal-header-actions">
              <slot name="header-actions"></slot>
              <button class="modal-close-btn" @click="handleClose" type="button" title="关闭" aria-label="关闭">
                <span v-html="icons.close"></span>
              </button>
            </div>
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
/* ====== Overlay ====== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 16px;
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}

.modal-overlay.modal-in-sidebar {
  position: absolute;
  z-index: 2000;
  padding: 12px;
}

/* ====== Size variants ====== */
.modal-overlay.size-sm .modal-container {
  max-width: 320px;
  max-height: 70%;
}

.modal-overlay.size-md .modal-container {
  max-width: 100%;
  max-height: 75%;
}

.modal-overlay.size-lg .modal-container {
  max-width: 100%;
  max-height: 85%;
}

.modal-overlay.size-full .modal-container {
  max-width: 100%;
  max-height: calc(100% - 24px);
  width: 100%;
}

.modal-overlay:not(.modal-in-sidebar).size-sm .modal-container {
  max-width: 420px;
}

.modal-overlay:not(.modal-in-sidebar).size-md .modal-container {
  max-width: 560px;
}

.modal-overlay:not(.modal-in-sidebar).size-lg .modal-container {
  max-width: 720px;
}

.modal-overlay:not(.modal-in-sidebar).size-full .modal-container {
  max-width: calc(100vw - 48px);
  max-height: calc(100vh - 48px);
}

/* ====== Container ====== */
.modal-container {
  background: white;
  border-radius: var(--be-radius-lg);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.18),
              0 4px 10px rgba(15, 23, 42, 0.08);
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--be-color-border-light);
}

/* ====== Header ====== */
.modal-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--be-color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  background: linear-gradient(
    180deg,
    var(--be-color-bg) 0%,
    var(--be-color-bg-secondary) 100%
  );
  gap: 8px;
}

.modal-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--be-color-text);
  letter-spacing: -0.01em;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-header-actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

/* 头部按钮体系内的按钮继续用 booth-btn，但 SVG 统一尺寸 */
.modal-header .booth-btn :deep(svg) {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

/* 专用关闭按钮：不用 booth-btn，避免被全局覆盖 */
.modal-close-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  color: var(--be-color-text-secondary);
  border-radius: var(--be-radius);
  cursor: pointer;
  transition: background var(--be-transition-normal),
              color var(--be-transition-normal),
              border-color var(--be-transition-normal);
}

.modal-close-btn :deep(svg) {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

.modal-close-btn:hover {
  background: var(--be-color-bg-tertiary);
  color: var(--be-color-text);
  border-color: var(--be-color-border);
}

.modal-close-btn:focus {
  outline: none;
}

.modal-close-btn:focus-visible {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

/* ====== Body ====== */
.modal-body {
  padding: 16px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  color: var(--be-color-text);
}

/* 滚动条与 sidebar 一致 */
.modal-body::-webkit-scrollbar {
  width: 6px;
}
.modal-body::-webkit-scrollbar-track {
  background: transparent;
}
.modal-body::-webkit-scrollbar-thumb {
  background: var(--be-color-border);
  border-radius: 3px;
}
.modal-body::-webkit-scrollbar-thumb:hover {
  background: var(--be-color-border-hover);
}

/* ====== Footer ====== */
.modal-footer {
  padding: 10px 16px;
  border-top: 1px solid var(--be-color-border);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-shrink: 0;
  background: var(--be-color-bg-secondary);
}

/* Modal 内部的 SectionHeader 去掉左右 padding */
.modal-body :deep(.section-header-container) {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

/* Footer 按钮：自然宽度而不是等宽拉伸 */
.modal-footer .booth-btn {
  min-width: 72px;
}

.modal-footer .booth-btn.booth-btn-icon {
  min-width: 32px;
}

/* ====== 动画 ====== */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1),
              opacity 0.22s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.96) translateY(10px);
  opacity: 0;
}
</style>
