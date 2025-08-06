<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { Currency } from '../../types/settings';
import { logger } from '../../utils/core/logger';
import { CurrencyManager } from '../../utils/currency/currency-manager';

interface Props {
  targetCurrency?: Currency;
}

const props = defineProps<Props>();

const cacheStatus = ref({
  hasCache: false,
  age: 0,
  isValid: false,
  updateTime: null as string | null
});

const isRefreshing = ref(false);
const isInitializing = ref(true);
let statusInterval: number | null = null;

// 计算当前汇率显示
const currentRate = computed(() => {
  const currency = props.targetCurrency || 'CNY';
  if (currency === 'JPY') {
    return '¥1.0000';
  }

  const rate = CurrencyManager.getExchangeRateSync(currency);
  const symbol = getCurrencySymbol(currency);
  // 显示为 1目标货币 = 多少JPY
  const jpyAmount = rate ? (1 / rate).toFixed(2) : '0.00';
  return `${symbol}1 = ¥${jpyAmount}`;
});

// 获取货币符号
const getCurrencySymbol = (currency: Currency): string => {
  const symbols: Record<Currency, string> = {
    JPY: '¥',
    CNY: '¥',
    USD: '$',
    EUR: '€',
    GBP: '£',
    KRW: '₩',
    HKD: 'HK$',
    TWD: 'NT$'
  };
  return symbols[currency] || currency;
};

// 格式化时间
const formatAge = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  if (seconds < 60) {
    return `${seconds}秒前`;
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}分钟前`;
  } else {
    return `${Math.floor(seconds / 3600)}小时前`;
  }
};

// 更新缓存状态
const updateCacheStatus = () => {
  cacheStatus.value = CurrencyManager.getCacheStatus();
};

// 刷新汇率
const refreshRates = async () => {
  if (isRefreshing.value) return;

  isRefreshing.value = true;
  try {
    await CurrencyManager.initializeRates();
    updateCacheStatus();
    logger.success('汇率手动刷新成功');
  } catch (error) {
    logger.exchange('汇率刷新失败:', error);
  } finally {
    isRefreshing.value = false;
  }
};

// 获取状态颜色
const getStatusColor = () => {
  if (isInitializing.value) return '#6b7280'; // 灰色（初始化中）
  if (!cacheStatus.value.hasCache) return '#ef4444'; // 红色
  if (!cacheStatus.value.isValid) return '#f59e0b'; // 橙色
  return '#10b981'; // 绿色
};

onMounted(() => {
  // 延迟一点时间让汇率初始化完成
  setTimeout(() => {
    updateCacheStatus();
    isInitializing.value = false;
  }, 1000);

  // 每30秒更新一次状态
  statusInterval = window.setInterval(updateCacheStatus, 30000);
});

onUnmounted(() => {
  if (statusInterval) {
    clearInterval(statusInterval);
  }
});
</script>

<template>
  <div class="exchange-rate-status">
    <div class="status-indicator" :style="{ backgroundColor: getStatusColor() }"></div>
    <div class="status-info">
      <span class="rate-info">{{ currentRate }}</span>
      <span v-if="cacheStatus.hasCache" class="update-time">
        {{ cacheStatus.age === 0 ? '刚刚更新' : formatAge(cacheStatus.age) }}
      </span>
    </div>
    <button @click="refreshRates" :disabled="isRefreshing" class="booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm"
      title="刷新汇率">
      <svg v-if="!isRefreshing" class="refresh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2">
        <path d="M1 4v6h6M23 20v-6h-6" />
        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
      </svg>
      <div v-else class="spinner"></div>
    </button>
  </div>
</template>

<style scoped>
.exchange-rate-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 6px;
  background: #f8fafc;
  border-radius: 4px;
  font-size: 11px;
  min-width: 160px;
  border: 1px solid #e5e7eb;
}

.status-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.status-text {
  font-weight: 600;
  color: #374151;
  font-size: 12px;
}

.age-text {
  color: #6b7280;
  font-size: 11px;
  white-space: nowrap;
}

.rate-info {
  color: #059669;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.update-time {
  color: #6b7280;
  font-size: 10px;
  white-space: nowrap;
}

.refresh-icon {
  width: 12px;
  height: 12px;
  color: #6b7280;
  transition: color 0.2s;
}

.refresh-btn:hover:not(:disabled) .refresh-icon {
  color: #374151;
}

.spinner {
  width: 12px;
  height: 12px;
  border: 2px solid #d1d5db;
  border-top: 2px solid #6b7280;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>