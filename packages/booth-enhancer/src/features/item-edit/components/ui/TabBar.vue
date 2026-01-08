<script setup lang="ts">
export interface Tab {
  id: string;
  label: string;
  icon?: string;
}

const props = defineProps<{
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
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.tab-list {
  display: flex;
  gap: 2px;
}

.tab-btn {
  padding: 6px 12px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  color: #6b7280;
  border-radius: 6px;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.tab-btn:hover:not(.active) {
  background: #f3f4f6;
  color: #374151;
}

.tab-btn.active {
  background: white;
  color: #3b82f6;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-icon :deep(svg) {
  width: 13px;
  height: 13px;
}

.tab-label {
  white-space: nowrap;
}

.tab-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
