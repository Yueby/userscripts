<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue';
import type { Order } from '../../types/order';
import type { Currency, UserSettings } from '../../types/settings';
import { calculateBoothFee, calculateNetAmount, formatBoothFee, formatNetAmount } from '../../utils/booth/booth-fee-calculator';
import { formatConvertedDateTime, formatOriginalDateTime } from '../../utils/core/date-formatter';
import { CurrencyManager } from '../../utils/currency/currency-manager';
import DataTable from '../common/DataTable/index.vue';
import MaskedText from '../common/MaskedText/index.vue';
import ItemEntry from './ItemEntry.vue';

interface Props {
  orders: Order[];
  targetCurrency?: Currency;
  userSettings?: UserSettings;
}

const props = defineProps<Props>();
const searchQuery = ref('');
const filteredOrders = shallowRef<Order[]>(props.orders);
const isSearching = ref(false);

interface SearchIndexEntry {
  order: Order;
  text: string;
}

const SEARCH_DEBOUNCE_MS = 250;
const SEARCH_INDEX_CHUNK_SIZE = 200;
let searchTimer: number | null = null;
let searchRequestId = 0;
let searchIndexVersion = 0;
let searchIndexCache: SearchIndexEntry[] | null = null;
let searchIndexPromise: Promise<SearchIndexEntry[]> | null = null;

// 表格列配置
const orderColumns = [
  { key: 'orderNumber', label: '订单编号', width: '120px' },
  { key: 'createdAt', label: '订单时间', width: '192px' },
  { key: 'items', label: '商品', width: '300px' },
  { key: 'paymentMethod', label: '支付方式', width: '120px' },
  { key: 'totalPrice', label: '金额', width: '120px' },
  { key: 'boothFee', label: '手续费', width: '120px' },
  { key: 'netAmount', label: '净收入', width: '120px' }
];

// 格式化函数
const formatNetAmountForOrder = (order: Order) => {
  return formatNetAmount(order.totalPrice, order.createdAt);
};

const formatBoothFeeForOrder = (order: Order) => {
  return formatBoothFee(order.totalPrice, order.createdAt);
};

const getOrderUrl = (orderNumber: string): string => {
  return `https://manage.booth.pm/orders/${encodeURIComponent(orderNumber)}`;
};

const createSearchText = (order: Order, targetCurrency?: Currency, userSettings?: UserSettings): string => {
  const boothFee = calculateBoothFee(order.totalPrice, order.createdAt);
  const netAmount = calculateNetAmount(order.totalPrice, order.createdAt);
  const convertedDate = userSettings
    ? formatConvertedDateTime(order.createdAt, userSettings)
    : '';

  return [
    order.orderNumber,
    order.createdAt,
    formatOriginalDateTime(order.createdAt),
    convertedDate,
    order.paymentMethod,
    order.totalPrice,
    CurrencyManager.formatJPY(order.totalPrice),
    formatBoothFeeForOrder(order),
    boothFee,
    formatNetAmountForOrder(order),
    netAmount,
    targetCurrency ? CurrencyManager.formatConverted(order.totalPrice, targetCurrency) : '',
    targetCurrency ? CurrencyManager.formatConverted(boothFee, targetCurrency) : '',
    targetCurrency ? CurrencyManager.formatConverted(netAmount, targetCurrency) : '',
    ...(order.items || []).flatMap((item) => [item.itemId, item.name, item.quantity])
  ]
    .filter((value) => value !== null && value !== undefined)
    .join(' ')
    .toLowerCase();
};

// 分批构建搜索索引，避免数千条订单一次性处理时阻塞界面
const getSearchIndex = (): Promise<SearchIndexEntry[]> => {
  if (searchIndexCache) {
    return Promise.resolve(searchIndexCache);
  }

  if (searchIndexPromise) {
    return searchIndexPromise;
  }

  const version = searchIndexVersion;
  const orders = props.orders;
  const targetCurrency = props.targetCurrency;
  const userSettings = props.userSettings;
  const entries: SearchIndexEntry[] = [];

  const indexPromise = new Promise<SearchIndexEntry[]>((resolve) => {
    let start = 0;

    const processChunk = () => {
      if (version !== searchIndexVersion) {
        resolve([]);
        return;
      }

      const end = Math.min(start + SEARCH_INDEX_CHUNK_SIZE, orders.length);
      for (let index = start; index < end; index++) {
        const order = orders[index];
        entries.push({
          order,
          text: createSearchText(order, targetCurrency, userSettings)
        });
      }

      start = end;
      if (start < orders.length) {
        window.setTimeout(processChunk, 0);
      } else {
        searchIndexCache = entries;
        resolve(entries);
      }
    };

    processChunk();
  }).finally(() => {
    if (version === searchIndexVersion) {
      searchIndexPromise = null;
    }
  });

  searchIndexPromise = indexPromise;
  return indexPromise;
};

const scheduleSearch = () => {
  if (searchTimer) {
    window.clearTimeout(searchTimer);
  }

  const requestId = ++searchRequestId;
  const keywords = searchQuery.value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (keywords.length === 0) {
    isSearching.value = false;
    filteredOrders.value = props.orders;
    return;
  }

  isSearching.value = true;
  searchTimer = window.setTimeout(async () => {
    const searchIndex = await getSearchIndex();
    if (requestId !== searchRequestId) return;

    filteredOrders.value = searchIndex
      .filter(({ text }) => keywords.every((keyword) => text.includes(keyword)))
      .map(({ order }) => order);
    isSearching.value = false;
  }, SEARCH_DEBOUNCE_MS);
};

const invalidateSearchIndex = () => {
  searchIndexVersion++;
  searchIndexCache = null;
  searchIndexPromise = null;
  scheduleSearch();
};

// 预计算商品总销量，避免每个可见商品都重复遍历全部订单
const itemTotalSales = computed(() => {
  const totals = new Map<string, number>();

  props.orders.forEach((order) => {
    (order.items || []).forEach((item) => {
      totals.set(item.itemId, (totals.get(item.itemId) || 0) + item.quantity);
    });
  });

  return totals;
});

watch(searchQuery, scheduleSearch);
watch(() => props.orders, invalidateSearchIndex);
watch(() => props.targetCurrency, invalidateSearchIndex);
watch(() => props.userSettings?.timezone, invalidateSearchIndex);
watch(() => props.userSettings?.displayName, invalidateSearchIndex);

onBeforeUnmount(() => {
  searchRequestId++;
  searchIndexVersion++;
  if (searchTimer) {
    window.clearTimeout(searchTimer);
  }
});

// DataTable 配置
const tableConfig = computed(() => ({
  pageSize: 50,
  privacyMode: props.userSettings?.privacyMode || false,
  scrollable: false,
  showPagination: true,
  getItemKey: (item: Order) => item.orderNumber
}));

const displayConfig = {
  title: '订单列表',
  itemLabel: '条订单',
  emptyIcon: '📋',
  emptyText: '暂无订单数据',
  emptyHint: '请先加载数据或调整筛选条件'
};
</script>

<template>
  <DataTable
    :data="filteredOrders"
    :columns="orderColumns"
    :config="tableConfig"
    :display="displayConfig"
  >
    <template #header-controls>
      <div class="order-search">
        <span v-if="isSearching" class="search-spinner" aria-hidden="true"></span>
        <svg v-else class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          v-model="searchQuery"
          type="search"
          class="search-input"
          placeholder="搜索订单号、商品、支付方式、金额…"
          aria-label="搜索订单"
          :aria-busy="isSearching"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="clear-search"
          title="清空搜索"
          aria-label="清空搜索"
          @click="searchQuery = ''"
        >
          ×
        </button>
      </div>
    </template>

    <!-- 自定义单元格渲染 -->
    <template #cell="{ item, column }">
      <!-- 订单编号 -->
      <template v-if="column.key === 'orderNumber'">
        <a
          v-if="!props.userSettings?.privacyMode"
          :href="getOrderUrl(item.orderNumber)"
          target="_blank"
          rel="noopener noreferrer"
          class="order-number order-link"
          title="打开订单详情"
        >
          {{ item.orderNumber }}
          <svg class="external-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h6v6" />
            <path d="M10 14 21 3" />
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          </svg>
        </a>
        <span v-else class="order-number">
          <MaskedText :value="item.orderNumber" masked />
        </span>
      </template>

      <!-- 订单时间 -->
      <template v-else-if="column.key === 'createdAt'">
        <div class="date-cell">
          <div class="date-main">
            <MaskedText 
              :value="formatOriginalDateTime(item.createdAt)" 
              :masked="props.userSettings?.privacyMode || false" 
            />
          </div>
          <div v-if="!(props.userSettings?.privacyMode || false) && userSettings && formatConvertedDateTime(item.createdAt, userSettings)" class="date-converted">
            {{ formatConvertedDateTime(item.createdAt, userSettings) }}
          </div>
        </div>
      </template>

      <!-- 商品列表 -->
      <template v-else-if="column.key === 'items'">
        <div class="items">
          <div v-if="item.items && item.items.length > 0" class="item-list">
            <ItemEntry
              v-for="itemEntry in item.items"
              :key="itemEntry.id"
              :item="itemEntry"
              :total-sales="itemTotalSales.get(itemEntry.itemId) || 0"
              size="20px"
              :privacy-mode="props.userSettings?.privacyMode || false"
            />
          </div>
          <div v-else class="no-items">
            无商品信息
          </div>
        </div>
      </template>

      <!-- 支付方式 -->
      <template v-else-if="column.key === 'paymentMethod'">
        <span class="payment-method">
          <MaskedText :value="item.paymentMethod" :masked="props.userSettings?.privacyMode || false" />
        </span>
      </template>

      <!-- 总金额 -->
      <template v-else-if="column.key === 'totalPrice'">
        <div class="price-cell">
          <div class="price-main">
            <MaskedText 
              :value="CurrencyManager.formatJPY(item.totalPrice || 0)" 
              :masked="props.userSettings?.privacyMode || false" 
            />
          </div>
          <div v-if="!(props.userSettings?.privacyMode || false) && item.totalPrice && targetCurrency && CurrencyManager.formatConverted(item.totalPrice, targetCurrency as any)" class="price-converted">
            {{ CurrencyManager.formatConverted(item.totalPrice, targetCurrency as any) }}
          </div>
        </div>
      </template>

      <!-- 手续费 -->
      <template v-else-if="column.key === 'boothFee'">
        <div class="booth-fee-cell">
          <div class="price-main">
            <MaskedText 
              :value="formatBoothFeeForOrder(item)" 
              :masked="props.userSettings?.privacyMode || false" 
            />
          </div>
          <div v-if="!(props.userSettings?.privacyMode || false) && item.totalPrice && targetCurrency" class="price-converted">
            {{ CurrencyManager.formatConverted(calculateBoothFee(item.totalPrice, item.createdAt), targetCurrency as any) }}
          </div>
        </div>
      </template>

      <!-- 净收入 -->
      <template v-else-if="column.key === 'netAmount'">
        <div class="net-amount-cell">
          <div class="price-main">
            <MaskedText 
              :value="formatNetAmountForOrder(item)" 
              :masked="props.userSettings?.privacyMode || false" 
            />
          </div>
          <div v-if="!(props.userSettings?.privacyMode || false) && item.totalPrice && targetCurrency" class="price-converted">
            {{ CurrencyManager.formatConverted(calculateNetAmount(item.totalPrice, item.createdAt), targetCurrency as any) }}
          </div>
        </div>
      </template>
    </template>
  </DataTable>
</template>

<style scoped>
/* 继承DataTable的样式，添加订单表格特有的样式 */

.order-search {
    position: relative;
    width: min(360px, 40vw);
}

.search-icon,
.search-spinner {
    position: absolute;
    top: 50%;
    left: 10px;
    width: 16px;
    height: 16px;
    pointer-events: none;
    transform: translateY(-50%);
}

.search-icon {
    color: #9ca3af;
}

.search-spinner {
    box-sizing: border-box;
    border: 2px solid #dbeafe;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: search-spin 0.7s linear infinite;
}

@keyframes search-spin {
    to {
        transform: translateY(-50%) rotate(360deg);
    }
}

.search-input {
    width: 100%;
    height: 34px;
    padding: 6px 34px 6px 34px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: white;
    color: #374151;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.search-input::-webkit-search-cancel-button {
    display: none;
}

.clear-search {
    position: absolute;
    top: 50%;
    right: 8px;
    width: 20px;
    height: 20px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: #e5e7eb;
    color: #6b7280;
    line-height: 18px;
    cursor: pointer;
    transform: translateY(-50%);
}

.clear-search:hover {
    background: #d1d5db;
    color: #374151;
}

/* 订单编号样式 */
.order-number {
    font-weight: 500;
    color: #374151;
}

.order-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #2563eb;
    text-decoration: none;
}

.order-link:hover {
    color: #1d4ed8;
    text-decoration: underline;
}

.external-link-icon {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
}

/* 日期单元格样式 */
.date-cell {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
    width: 100%;
}

.date-main {
    font-weight: 600;
    color: #374151;
    font-size: 14px;
    line-height: 1.2;
}

.date-converted {
    font-size: 12px;
    color: #6b7280;
    font-style: italic;
    font-weight: 400;
    line-height: 1.2;
}

/* 商品列表样式 */
.items {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 120px;
    overflow-y: auto;
}

.item-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.no-items {
    color: #9ca3af;
    font-style: italic;
    font-size: 12px;
}

/* 支付方式样式 */
.payment-method {
    font-weight: 500;
    color: #374151;
}

/* 价格单元格样式 */
.price-cell {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding-top: 8px;
    gap: 3px;
    width: 100%;
}

.price-main {
    font-weight: 600;
    color: #374151;
    font-size: 14px;
    line-height: 1.2;
}

.price-converted {
    font-size: 12px;
    color: #6b7280;
    font-weight: 400;
    line-height: 1.2;
}

/* 手续费和净收入单元格样式 */
.booth-fee-cell,
.net-amount-cell {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding-top: 8px;
    gap: 3px;
    width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .order-search {
        width: 100%;
        min-width: 220px;
    }

    .date-cell {
        align-items: center;
    }
    
    .items {
        max-height: 80px;
    }
    
    .price-cell,
    .booth-fee-cell,
    .net-amount-cell {
        padding-top: 4px;
    }
}
</style>