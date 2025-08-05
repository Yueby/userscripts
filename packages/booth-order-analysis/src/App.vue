<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ExchangeRateStatus, ItemTable, OrderTable, Settings, Statistics } from './components';
import type { UserSettings as SettingsType } from './types/settings';
import { DataAnalyzer, type CustomDateRange, type TimePeriod } from './utils/analysis/data-analyzer';
import { DataLoader } from './utils/core/data-loader';
import { logger } from './utils/core/logger';
import { SettingsManager } from './utils/settings/settings-manager';

const dataLoader = DataLoader.getInstance();
const isLoading = ref(false);

// 设置状态
const showSettings = ref(false);
const userSettings = ref<SettingsType>({
  timezone: 'Asia/Shanghai',
  displayName: '中国标准时间',
  targetCurrency: 'CNY',
  privacyMode: false
});

// 过滤器状态
const selectedPeriod = ref<TimePeriod>('all');
const customRange = ref<CustomDateRange | undefined>();

// 标签页状态
const activeTab = ref<'orders' | 'items'>('orders');

// 获取订单数据（统一使用原始数据）
const orders = computed(() => {
  return dataLoader.getOrders();
});

// 根据过滤器获取过滤后的订单
const filteredOrders = computed(() => {
  if (orders.value.length === 0) return [];

  const result = DataAnalyzer.filterOrdersByPeriod(orders.value, {
    period: selectedPeriod.value,
    customRange: customRange.value
  });

  return result;
});

// 计算统计数据（基于过滤后的数据）
const statistics = computed(() => {
  if (filteredOrders.value.length === 0) {
    return {
      totalOrders: 0,
      totalRevenue: 0,
      totalNetRevenue: 0
    };
  }

  return DataAnalyzer.calculateStats(filteredOrders.value);
});

// 刷新数据
const refreshData = async () => {
  if (isLoading.value) return;

  isLoading.value = true;
  const result = await dataLoader.loadOrdersFromCSV();

  if (result.success) {
    // 数据刷新成功
  } else {
    logger.error('数据刷新失败:', result.error);
  }

  isLoading.value = false;
};

// 打开设置
const openSettings = () => {
  showSettings.value = true;
};

// 关闭设置
const closeSettings = () => {
  showSettings.value = false;
};

// 处理设置变化
const handleSettingsChanged = (newSettings: SettingsType) => {
  userSettings.value = newSettings;
};

// 处理时间筛选变化
const handlePeriodChange = (period: TimePeriod) => {
  selectedPeriod.value = period;
};

// 处理自定义日期范围变化
const handleCustomRangeChange = (range: CustomDateRange) => {
  customRange.value = range;
};

// 切换标签页
const switchTab = (tab: 'orders' | 'items') => {
  activeTab.value = tab;
};

// 关闭面板
const closePanel = () => {
  const panel = document.getElementById('booth-analysis-panel');
  if (panel) {
    panel.style.opacity = '0';
    setTimeout(() => {
      panel.remove();
      document.body.style.overflow = '';
    }, 300);
  }
};

onMounted(() => {
  // 加载用户设置
  userSettings.value = SettingsManager.getSettings();
});
</script>

<template>
  <div class="analysis-content">
    <!-- 顶栏 -->
    <div class="header">
      <div class="header-left">
        <h1 class="title">Booth 订单分析</h1>
      </div>
      <div class="header-right">
        <ExchangeRateStatus :target-currency="userSettings.targetCurrency" />
        <button @click="openSettings" class="booth-btn booth-btn-secondary booth-btn-icon booth-btn-sm" title="设置">
          <svg class="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/>
          </svg>
        </button>
        <button @click="refreshData" :disabled="isLoading" class="booth-btn booth-btn-success booth-btn-icon booth-btn-sm" title="刷新数据">
          <svg v-if="!isLoading" class="refresh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M3 21v-5h5"/>
          </svg>
          <svg v-else class="refresh-icon loading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M3 21v-5h5"/>
          </svg>
        </button>
        <button @click="closePanel" class="booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm" title="关闭">
          ×
        </button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content">
      <Statistics :statistics="statistics" :orders="filteredOrders" :model-value="selectedPeriod" :custom-range="customRange"
        :target-currency="userSettings.targetCurrency" :user-settings="userSettings" @update:model-value="handlePeriodChange"
        @update:custom-range="handleCustomRangeChange" />

      <!-- 标签页导航 -->
      <div class="tab-navigation">
        <button 
          :class="['booth-btn', 'booth-btn-ghost', 'booth-btn-md', { 'booth-btn-primary': activeTab === 'orders' }]" 
          @click="switchTab('orders')"
        >
          订单列表
        </button>
        <button 
          :class="['booth-btn', 'booth-btn-ghost', 'booth-btn-md', { 'booth-btn-primary': activeTab === 'items' }]" 
          @click="switchTab('items')"
        >
          商品列表
        </button>
      </div>

      <!-- 标签页内容 -->
      <div class="tab-content">
        <OrderTable 
          v-if="activeTab === 'orders'"
          :orders="filteredOrders" 
          :target-currency="userSettings.targetCurrency" 
          :user-settings="userSettings" 
        />
        
        <ItemTable 
          v-if="activeTab === 'items'"
          :user-settings="userSettings"
          :selected-period="selectedPeriod"
          :custom-range="customRange"
          :target-currency="userSettings.targetCurrency"
        />
      </div>

      <Settings :visible="showSettings" @close="closeSettings" @settings-changed="handleSettingsChanged" />
    </div>
  </div>
</template>

<style scoped>
.analysis-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 顶栏 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
}

.title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

.header-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.settings-icon {
  width: 18px;
  height: 18px;
}

.refresh-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.refresh-icon.loading {
  animation: spin 1s linear infinite;
  transform-origin: center;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 内容区域 */
.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 标签页导航 */
.tab-navigation {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

/* 标签页按钮特殊样式 */
.tab-navigation .booth-btn {
  border-radius: 6px 6px 0 0;
  border-bottom: 2px solid transparent;
  background: none;
  color: #6b7280;
}

.tab-navigation .booth-btn:hover {
  color: #374151;
  background: #f9fafb;
  border-bottom-color: #d1d5db;
}

.tab-navigation .booth-btn.booth-btn-primary {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background: #eff6ff;
}

/* 标签页内容 */
.tab-content {
  flex: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    padding: 12px 16px;
  }

  .title {
    font-size: 16px;
  }

  .header-right {
    gap: 6px;
  }

  .settings-icon,
  .refresh-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 10px 12px;
  }

  .title {
    font-size: 14px;
  }

  .header-right {
    gap: 4px;
  }

  .settings-icon,
  .refresh-icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
}
</style>
