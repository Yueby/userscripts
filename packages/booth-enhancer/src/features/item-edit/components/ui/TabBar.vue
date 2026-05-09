<script setup lang="ts">
export interface Tab {
  id: string;
  label: string;
  icon?: string;
}

defineProps<{
  tabs: Tab[];
  activeTab: string;
}>();

const emit = defineEmits<{
  (e: 'update:activeTab', value: string): void;
}>();

const handleTabClick = (tabId: string) => {
  emit('update:activeTab', tabId);
};
</script>

<template>
  <div class="tab-bar">
    <div class="tab-list">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-btn" 
        :class="{ active: activeTab === tab.id }"
        @click="handleTabClick(tab.id)"
      >
        <span v-if="tab.icon" class="tab-icon" v-html="tab.icon"></span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>
    
    <!-- 右侧操作按钮区域 -->
    <div v-if="$slots.actions" class="tab-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.tab-bar {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: var(--be-space-sm);
  padding: var(--be-space-xs) var(--be-space-md);
  background: linear-gradient(
    180deg,
    var(--be-color-bg) 0%,
    var(--be-color-bg-secondary) 100%
  );
  border-bottom: 1px solid var(--be-color-border);
  flex-shrink: 0;
}

.tab-list {
  display: flex;
  gap: var(--be-space-xs);
  align-items: stretch;
  min-width: 0;
  flex: 1;
}

.tab-btn {
  position: relative;
  padding: var(--be-space-sm) var(--be-space-md);
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: var(--be-font-size-base);
  color: var(--be-color-text-secondary);
  border-radius: var(--be-radius-sm) var(--be-radius-sm) 0 0;
  transition: color var(--be-transition-normal),
              background var(--be-transition-normal);
  display: inline-flex;
  align-items: center;
  gap: var(--be-space-xs);
  font-weight: 500;
  line-height: 1.2;
  font-family: inherit;
  white-space: nowrap;
}

/* 激活指示器：底部主色条，默认缩起，active 时展开 */
.tab-btn::after {
  content: '';
  position: absolute;
  left: 50%;
  right: 50%;
  bottom: -1px; /* 与 .tab-bar 的 border-bottom 对齐覆盖 */
  height: 2px;
  background: var(--be-color-primary);
  border-radius: 2px 2px 0 0;
  transition: left var(--be-transition-normal),
              right var(--be-transition-normal),
              opacity var(--be-transition-normal);
  opacity: 0;
}

.tab-btn:hover:not(.active) {
  color: var(--be-color-text);
  background: var(--be-color-bg-hover);
}

.tab-btn:hover:not(.active)::after {
  left: 30%;
  right: 30%;
  opacity: 0.3;
}

.tab-btn.active {
  color: var(--be-color-primary);
  font-weight: 600;
}

.tab-btn.active::after {
  left: var(--be-space-sm);
  right: var(--be-space-sm);
  opacity: 1;
}

/* Focus 状态 - 与项目其它按钮一致的蓝色光晕 */
.tab-btn:focus {
  outline: none;
}

.tab-btn:focus-visible {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  border-radius: var(--be-radius-sm);
}

.tab-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
}

.tab-icon :deep(svg) {
  width: 14px;
  height: 14px;
}

.tab-label {
  white-space: nowrap;
}

.tab-actions {
  display: inline-flex;
  align-items: center;
  gap: var(--be-space-xs);
  flex-shrink: 0;
  padding-left: var(--be-space-sm);
  border-left: 1px solid var(--be-color-border-light);
}

/* 紧凑模式：窄屏 */
@media (max-width: 480px) {
  .tab-bar {
    padding: var(--be-space-xs) var(--be-space-sm);
  }
  
  .tab-btn {
    padding: var(--be-space-sm);
  }
  
  .tab-actions {
    padding-left: var(--be-space-xs);
  }
}
</style>
