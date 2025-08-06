<script setup lang="ts">
import { computed } from 'vue';
import type { Order, OrderStats } from '../../types/order';
import type { Currency, UserSettings } from '../../types/settings';
import { DataAnalyzer, type CustomDateRange, type TimePeriod } from '../../utils/analysis/data-analyzer';
import { CurrencyManager } from '../../utils/currency/currency-manager';

import MaskedText from '../common/MaskedText/index.vue';
import DateFilter from './DateFilter.vue';
import ItemRanking from './ItemRanking.vue';
import PaymentMethodChart from './PaymentMethodChart.vue';
import RevenueTrendChart from './RevenueTrendChart.vue';

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
  if (props.modelValue === 'today' || props.modelValue === 'yesterday') {
    return [];
  }

  // 检查自定义日期范围是否只有一天
  if (props.modelValue === 'custom' && props.customRange) {
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
    <DateFilter
      :model-value="modelValue"
      :custom-range="customRange"
      :user-settings="userSettings"
      @update:model-value="(value) => emit('update:modelValue', value)"
      @update:custom-range="(value) => emit('update:customRange', value)"
    />

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

  .period-selector {
    font-size: 10px;
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