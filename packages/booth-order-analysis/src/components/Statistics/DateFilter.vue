<script setup lang="ts">
import { ref, watch } from 'vue';
import type { UserSettings } from '../../types/settings';
import type { CustomDateRange, TimePeriod } from '../../utils/analysis/data-analyzer';
import { DataAnalyzer } from '../../utils/analysis/data-analyzer';
import Modal from '../common/Modal/index.vue';
import type { SelectorOption } from '../common/Selector/index.vue';
import Selector from '../common/Selector/index.vue';

interface Props {
  modelValue?: TimePeriod;
  customRange?: CustomDateRange;
  userSettings?: UserSettings;
}

interface Emits {
  (e: 'update:modelValue', value: TimePeriod): void;
  (e: 'update:customRange', value: CustomDateRange): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const selectedPeriod = ref<TimePeriod>(props.modelValue || 'thisWeek');
const showCustomRange = ref(false);
const showDatePicker = ref(false);
const customStartDate = ref('');
const customEndDate = ref('');

// 获取可用的时间周期选项
const availablePeriods = DataAnalyzer.getAvailablePeriods();

// 转换为 Selector 选项格式
const periodOptions: SelectorOption[] = availablePeriods.map(period => ({
  value: period.value,
  label: period.label
}));

// 处理时间筛选变化
const handlePeriodChange = (value: string | number | (string | number)[]) => {
  if (typeof value === 'string' || typeof value === 'number') {
    const period = value as TimePeriod;
    selectedPeriod.value = period;
  }
};

// 监听选择变化
watch(selectedPeriod, (newValue) => {
  emit('update:modelValue', newValue);

  if (newValue === 'custom') {
    showCustomRange.value = true;
    showDatePicker.value = true;
  } else {
    showCustomRange.value = false;
    showDatePicker.value = false;
  }
});

// 监听用户设置的默认时间筛选变化
watch(() => props.userSettings?.defaultTimeFilter, (newDefaultFilter) => {
  if (newDefaultFilter && newDefaultFilter !== selectedPeriod.value) {
    // 如果设置了新的默认时间筛选，且与当前选择不同，则自动切换
    selectedPeriod.value = newDefaultFilter as TimePeriod;
  }
}, { immediate: true });

// 关闭日期选择器
const closeDatePicker = () => {
  showDatePicker.value = false;
  if (!customStartDate.value || !customEndDate.value) {
    selectedPeriod.value = 'all';
    showCustomRange.value = false;
  }
};

// 应用自定义日期范围
const applyCustomRange = () => {
  if (customStartDate.value && customEndDate.value) {
    const customRange: CustomDateRange = {
      startDate: customStartDate.value,
      endDate: customEndDate.value
    };
    emit('update:customRange', customRange);
    showDatePicker.value = false;
  }
};

// 获取当前选择的显示名称
const getCurrentDisplayName = () => {
  if (selectedPeriod.value === 'custom' && props.customRange) {
    return DataAnalyzer.formatDateRange('custom', props.customRange, props.userSettings);
  }
  return DataAnalyzer.getPeriodDisplayName(selectedPeriod.value);
};
</script>

<template>
  <div class="date-filter">
    <div class="filter-header">
      <h4>时间筛选</h4>
      <span class="current-period">{{ getCurrentDisplayName() }}</span>
    </div>

    <div class="filter-controls">
      <Selector :options="periodOptions" :model-value="selectedPeriod" @update:model-value="handlePeriodChange"
        class="period-selector" />

      <!-- 日期选择器弹窗 -->
      <Modal :visible="showDatePicker" title="选择日期范围" size="small" @close="closeDatePicker"
        @update:visible="showDatePicker = $event">
        <div class="date-picker-content">
          <div class="date-input-group">
            <label>开始日期：</label>
            <input v-model="customStartDate" type="date" class="date-input" />
          </div>
          <div class="date-input-group">
            <label>结束日期：</label>
            <input v-model="customEndDate" type="date" class="date-input" />
          </div>
        </div>

        <template #footer>
          <button @click="closeDatePicker" class="booth-btn booth-btn-secondary booth-btn-md">取消</button>
          <button @click="applyCustomRange" class="booth-btn booth-btn-success booth-btn-md"
            :disabled="!customStartDate || !customEndDate">
            应用
          </button>
        </template>
      </Modal>
    </div>
  </div>
</template>

<style scoped>
.date-filter {
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.filter-header h4 {
  margin: 0;
  color: #374151;
  font-size: 13px;
  font-weight: 600;
}

.current-period {
  font-size: 11px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 3px 6px;
  border-radius: 3px;
}

.filter-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.period-selector {
  font-size: 11px;
}

/* 日期选择器内容 */
.date-picker-content {
  padding: 0;
}

.date-input-group {
  margin-bottom: 16px;
}

.date-input-group label {
  display: block;
  font-size: 14px;
  color: #374151;
  font-weight: 500;
  margin-bottom: 6px;
}

.date-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  color: #374151;
}

.date-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .period-selector {
    font-size: 10px;
  }
}
</style>