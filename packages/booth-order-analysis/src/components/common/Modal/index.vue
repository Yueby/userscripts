<template>
  <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <div :class="['modal-content', modalSizeClass]" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">{{ title }}</h3>
        <button @click="handleClose" class="booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm" :title="closeButtonTitle">
          ×
        </button>
      </div>
      <div class="modal-body">
        <slot></slot>
      </div>
      <div v-if="$slots.footer" class="modal-footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  visible: boolean;
  title?: string;
  closeButtonTitle?: string;
  closeOnOverlayClick?: boolean;
  size?: 'small' | 'medium' | 'large' | 'full';
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  closeButtonTitle: '关闭',
  closeOnOverlayClick: true,
  size: 'medium'
});

const emit = defineEmits<{
  close: [];
  'update:visible': [value: boolean];
}>();

const handleClose = () => {
  emit('close');
  emit('update:visible', false);
};

const handleOverlayClick = () => {
  if (props.closeOnOverlayClick) {
    handleClose();
  }
};

// 根据size计算样式类
const modalSizeClass = computed(() => {
  return `modal-${props.size}`;
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 尺寸变体 */
.modal-small {
  width: 400px;
  max-width: 90vw;
}

.modal-medium {
  width: 600px;
  max-width: 90vw;
}

.modal-large {
  width: 800px;
  max-width: 95vw;
}

.modal-full {
  width: 95vw;
  height: 95vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}

.modal-title {
  margin: 0;
  color: #374151;
  font-size: 18px;
  font-weight: 600;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 动画效果 */
.modal-overlay {
  animation: fadeIn 0.2s ease-out;
}

.modal-content {
  animation: slideIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-content {
    margin: 20px;
    width: calc(100vw - 40px);
    max-height: calc(100vh - 40px);
  }
  
  .modal-header {
    padding: 16px;
  }
  
  .modal-body {
    padding: 16px;
  }
  
  .modal-footer {
    padding: 12px 16px;
  }
}
</style> 