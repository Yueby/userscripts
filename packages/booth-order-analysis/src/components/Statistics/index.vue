<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { DataAnalyzer, type TimePeriod, type CustomDateRange } from '../../utils/analysis/data-analyzer';
import { CurrencyManager } from '../../utils/currency/currency-manager';
import type { OrderStats } from '../../types/order';
import type { Order } from '../../types/order';
import type { Currency, UserSettings } from '../../types/settings';

import MaskedText from '../common/MaskedText/index.vue';
import ItemRanking from './ItemRanking.vue';
import RevenueTrendChart from './RevenueTrendChart.vue';
import PaymentMethodChart from './PaymentMethodChart.vue';


interface Props {
  statistics: OrderStats;
  orders: Order[];
  modelValue?: TimePeriod;
  customRange?: CustomDateRange;
  targetCurrency?: Currency;
  userSettings?: UserSettings;
}

interface Emits {
  (e: 'update:modelValue', value: TimePeriod): void;
  (e: 'update:customRange', value: CustomDateRange): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const selectedPeriod = ref<TimePeriod>(props.modelValue || 'all');
const showCustomRange = ref(false);
const showDatePicker = ref(false);
const customStartDate = ref('');
const customEndDate = ref('');

// 获取可用的时间周期选项
const availablePeriods = DataAnalyzer.getAvailablePeriods();

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

// 选择时间周期
const selectPeriod = (period: TimePeriod) => {
  selectedPeriod.value = period;
};

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
    return DataAnalyzer.formatDateRange('custom', props.customRange);
  }
  return DataAnalyzer.getPeriodDisplayName(selectedPeriod.value);
};

// 格式化日元显示（主要显示）
const formatJPY = (amount: number) => {
  return CurrencyManager.formatCurrencyWithCode(amount, 'JPY');
};

// 格式化转换后的货币显示（辅助显示）
const formatConverted = (amount: number) => {
  const targetCurrency = props.targetCurrency || 'CNY';
  if (targetCurrency === 'JPY') {
    return null; // 如果目标货币就是日元，不显示转换金额
  }
  const convertedAmount = CurrencyManager.convertFromJPYSync(amount, targetCurrency);
  return CurrencyManager.formatCurrencyWithCode(convertedAmount, targetCurrency);
};

// 计算图表数据
const revenueTrendData = computed(() => {
  // 在只有一天数据范围的筛选时不显示走势图
  if (selectedPeriod.value === 'today' || selectedPeriod.value === 'yesterday') {
    return [];
  }

  // 检查自定义日期范围是否只有一天
  if (selectedPeriod.value === 'custom' && props.customRange) {
    const startDate = new Date(props.customRange.startDate);
    const endDate = new Date(props.customRange.endDate);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);

    if (daysDiff <= 1) {
      return [];
    }
  }

  return DataAnalyzer.generateRevenueTrendData(props.orders);
});

const paymentMethodData = computed(() => {
  return DataAnalyzer.generatePaymentMethodData(props.orders);
});

// 计算商品销量排行榜数据
const productRankingData = computed(() => {
  return DataAnalyzer.generateProductSalesRanking(props.orders);
});
</script>

<template>
  <div class="statistics-panel">
    <!-- 上部分：统计信息 -->
    <div class="stats-section">
      <h3>统计信息</h3>
      <div class="stats-grid">
        <div class="stat-card orders-card">
          <div class="stat-content">
            <div class="stat-value">
              <MaskedText :value="statistics.totalOrders" :masked="userSettings?.privacyMode || false" />
            </div>
          </div>
          <div class="stat-label">总订单数</div>
        </div>
        <div class="stat-card revenue-card">
          <div class="stat-content">
            <div class="stat-value">
              <MaskedText :value="formatJPY(statistics.totalRevenue)" :masked="userSettings?.privacyMode || false" />
            </div>
            <div v-if="!userSettings?.privacyMode && formatConverted(statistics.totalRevenue)" class="stat-converted">{{
              formatConverted(statistics.totalRevenue) }}</div>
          </div>
          <div class="stat-label">总收入</div>
        </div>
        <div class="stat-card net-revenue-card">
          <div class="stat-content">
            <div class="stat-value">
              <MaskedText :value="formatJPY(statistics.totalNetRevenue)" :masked="userSettings?.privacyMode || false" />
            </div>
            <div v-if="!userSettings?.privacyMode && formatConverted(statistics.totalNetRevenue)"
              class="stat-converted">{{
                formatConverted(statistics.totalNetRevenue) }}</div>
          </div>
          <div class="stat-label">到手收入</div>
        </div>
      </div>
    </div>

    <!-- 下部分：时间筛选 -->
    <div class="filter-section">
      <div class="filter-header">
        <h4>时间筛选</h4>
        <span class="current-period">{{ getCurrentDisplayName() }}</span>
      </div>

      <div class="filter-controls">
        <div class="period-buttons">
          <button v-for="period in availablePeriods" :key="period.value"
            :class="['period-btn', { active: selectedPeriod === period.value }]" @click="selectPeriod(period.value)">
            {{ period.label }}
          </button>
        </div>

        <!-- 日期选择器弹窗 -->
        <div v-if="showDatePicker" class="date-picker-overlay" @click="closeDatePicker">
          <div class="date-picker-modal" @click.stop>
            <div class="date-picker-header">
              <h5>选择日期范围</h5>
              <button class="close-btn" @click="closeDatePicker">×</button>
            </div>
            <div class="date-picker-content">
              <div class="date-input-group">
                <label>开始日期：</label>
                <input v-model="customStartDate" type="date" class="date-input" />
              </div>
              <div class="date-input-group">
                <label>结束日期：</label>
                <input v-model="customEndDate" type="date" class="date-input" />
              </div>
              <div class="date-picker-actions">
                <button @click="closeDatePicker" class="cancel-btn">取消</button>
                <button @click="applyCustomRange" class="apply-btn" :disabled="!customStartDate || !customEndDate">
                  应用
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表和排行榜部分 -->
    <div v-if="revenueTrendData.length > 0 || paymentMethodData.length > 0 || productRankingData.length > 0"
      class="charts-section">
      <div class="charts-grid">
        <RevenueTrendChart v-if="revenueTrendData.length > 0" :data-points="revenueTrendData"
          :target-currency="targetCurrency" :privacy-mode="userSettings?.privacyMode || false" />
        <PaymentMethodChart v-if="paymentMethodData.length > 0" :payment-data="paymentMethodData"
          :privacy-mode="userSettings?.privacyMode || false" />
        <ItemRanking v-if="productRankingData.length > 0" :product-data="productRankingData"
          :target-currency="targetCurrency" :max-items="10" :user-settings="userSettings" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.statistics-panel {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

/* 上部分：统计信息 */
.stats-section {
  margin-bottom: 24px;
}

.stats-section h3 {
  margin: 0 0 20px 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px 16px;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 120px;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #10b981);
}

/* 不同卡片的颜色主题 */
.orders-card::before {
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
}

.revenue-card::before {
  background: linear-gradient(90deg, #10b981, #059669);
}

.net-revenue-card::before {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.pending-card::before {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 4px;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.stat-converted {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 8px;
  background: rgba(107, 114, 128, 0.1);
  padding: 4px 10px;
  border-radius: 16px;
  display: inline-block;
  border: 1px solid rgba(107, 114, 128, 0.2);
  width: fit-content;
  min-width: min-content;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: auto;
}

/* 下部分：时间筛选 */
.filter-section {
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

.period-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.period-btn {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: white;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.period-btn:hover {
  border-color: #9ca3af;
  color: #374151;
  background: #f9fafb;
}

.period-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.period-btn.active:hover {
  background: #2563eb;
  border-color: #2563eb;
}

/* 日期选择器弹窗 */
.date-picker-overlay {
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
}

.date-picker-modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 400px;
  max-width: 90vw;
}

.date-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.date-picker-header h5 {
  margin: 0;
  color: #374151;
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
}

.date-picker-content {
  padding: 20px;
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

.date-picker-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.cancel-btn {
  padding: 8px 16px;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.apply-btn {
  padding: 8px 16px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.apply-btn:hover:not(:disabled) {
  background: #059669;
}

.apply-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

/* 图表部分 */
.charts-section {
  margin-top: 16px;
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  align-items: start;
}

.charts-grid>* {
  height: 300px;
  min-height: 300px;
  max-height: 300px;
}

/* 商品销量排行榜部分 */
.ranking-section {
  margin-top: 16px;
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
}

/* 当只有一个图表时，让它占满整行 */
.charts-grid:has(.chart-container:only-child) {
  grid-template-columns: 1fr;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
  }

  .stat-card {
    padding: 16px 12px;
  }

  .stat-value {
    font-size: 24px;
  }

  .stat-converted {
    font-size: 11px;
    padding: 3px 8px;
  }

  .period-buttons {
    gap: 6px;
  }

  .period-btn {
    padding: 6px 12px;
    font-size: 12px;
  }

  .date-picker-modal {
    width: 90vw;
    margin: 20px;
  }

  .charts-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  /* 在移动端，ItemRanking需要特殊处理 */
  .item-ranking {
    padding: 12px;
  }

  .item-ranking .ranking-header h4 {
    font-size: 13px;
  }

  .item-ranking .ranking-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .item-ranking .product-info {
    width: 100%;
  }

  .item-ranking .sales-data {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>