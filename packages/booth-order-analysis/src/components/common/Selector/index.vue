<template>
  <div class="selector-container">
    <div class="selector-controls">
             <button v-for="(option, index) in options" :key="option.value" :class="['booth-btn', 'booth-btn-sm', {
         'booth-btn-primary': isSelected(option.value),
         'booth-btn-ghost': !isSelected(option.value),
         'disabled': option.disabled
       }]" :disabled="option.disabled" @click="handleOptionClick(option.value)">
         {{ option.label }}
       </button>
    </div>
  </div>
</template>

<script setup lang="ts">

export interface SelectorOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface Props {
  /** 选项列表 */
  options: SelectorOption[];
  /** 当前选中的值（单选模式）或值数组（多选模式） */
  modelValue: string | number | (string | number)[];
  /** 是否为多选模式 */
  multiple?: boolean;
  /** 是否允许取消选择 */
  allowDeselect?: boolean;
  /** 自定义CSS类名 */
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  allowDeselect: false,
  class: ''
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number | (string | number)[]];
  'change': [value: string | number | (string | number)[]];
}>();

// 检查选项是否被选中
const isSelected = (value: string | number): boolean => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.includes(value);
  } else {
    return props.modelValue === value;
  }
};

// 处理选项点击
const handleOptionClick = (value: string | number) => {
  let newValue: string | number | (string | number)[];

  if (props.multiple) {
    const currentValues = Array.isArray(props.modelValue) ? props.modelValue : [];

    if (currentValues.includes(value)) {
      // 如果已选中且允许取消选择，则移除
      if (props.allowDeselect) {
        newValue = currentValues.filter(v => v !== value);
      } else {
        // 不允许取消选择，保持原值
        return;
      }
    } else {
      // 如果未选中，则添加
      newValue = [...currentValues, value];
    }
  } else {
    // 单选模式
    if (props.modelValue === value) {
      // 如果已选中且允许取消选择，则清空
      if (props.allowDeselect) {
        newValue = '';
      } else {
        // 不允许取消选择，保持原值
        return;
      }
    } else {
      // 如果未选中，则设置为新值
      newValue = value;
    }
  }

  emit('update:modelValue', newValue);
  emit('change', newValue);
};
</script>

<style scoped>
.selector-container {
  display: inline-flex;
}

.selector-controls {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 1px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
  min-height: 28px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .selector-controls {
    gap: 1px;
    padding: 1px;
  }

}
</style>