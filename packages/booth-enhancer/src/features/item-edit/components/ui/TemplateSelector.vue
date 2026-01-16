<script setup lang="ts" generic="T extends { id: string; name: string }">
import { computed, watch } from 'vue';

interface Props {
  modelValue?: string;
  templates?: T[];
  label?: string;
  placeholder?: string;
  emptyHint?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  templates: () => [],
  label: '选择模板',
  placeholder: '请选择模板',
  emptyHint: '暂无可用模板'
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

// 当前选中的值
const selectedValue = computed({
  get() {
    return props.modelValue || '';
  },
  set(value: string) {
    emit('update:modelValue', value);
  }
});

// 检查并自动选择有效模板
function ensureValidSelection(templates?: T[]): void {
  if (!templates || templates.length === 0) {
    emit('update:modelValue', '');
    return;
  }
  
  // 如果当前选中的模板不存在或为空，自动选择第一个
  const currentValue = props.modelValue || '';
  const currentExists = templates.some(t => t.id === currentValue);
  if (!currentExists) {
    emit('update:modelValue', templates[0].id);
  }
}

// 监听模板列表变化，确保选择有效
watch(() => props.templates, ensureValidSelection, { immediate: true });
</script>

<template>
  <div class="template-selector">
    <label v-if="label" class="template-selector-label">{{ label }}</label>
    <select 
      v-if="templates && templates.length > 0"
      v-model="selectedValue"
      class="template-selector-select"
    >
      <option v-for="template in templates" :key="template.id" :value="template.id">
        {{ template.name }}
      </option>
    </select>
    <div v-else class="empty-hint">
      {{ emptyHint }}
    </div>
  </div>
</template>

<style scoped>
.template-selector {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.template-selector-label {
  font-size: var(--be-font-size-sm);
  font-weight: 500;
  color: var(--be-color-text-primary);
}

.template-selector-select {
  width: 100%;
}
</style>
