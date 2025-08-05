<script setup lang="ts">
import { computed } from 'vue';
import type { Order } from '../../types/order';
import type { Currency, UserSettings } from '../../types/settings';
import { formatBoothFee, formatNetAmount } from '../../utils/booth/booth-fee-calculator';
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
    :data="orders"
    :columns="orderColumns"
    :config="tableConfig"
    :display="displayConfig"
  >
    <!-- 自定义单元格渲染 -->
    <template #cell="{ item, column }">
      <!-- 订单编号 -->
      <template v-if="column.key === 'orderNumber'">
        <span class="order-number">
          <MaskedText :value="item.orderNumber" :masked="props.userSettings?.privacyMode || false" />
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
              :all-orders="orders"
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
          <div v-if="!(props.userSettings?.privacyMode || false) && item.totalPrice && targetCurrency && CurrencyManager.formatConverted(item.totalPrice, targetCurrency as any)" class="price-converted">
            {{ CurrencyManager.formatConverted(item.totalPrice, targetCurrency as any) }}
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
          <div v-if="!(props.userSettings?.privacyMode || false) && item.totalPrice && targetCurrency && CurrencyManager.formatConverted(item.totalPrice, targetCurrency as any)" class="price-converted">
            {{ CurrencyManager.formatConverted(item.totalPrice, targetCurrency as any) }}
          </div>
        </div>
      </template>
    </template>
  </DataTable>
</template>

<style scoped>
/* 继承DataTable的样式，添加订单表格特有的样式 */

/* 订单编号样式 */
.order-number {
    font-weight: 500;
    color: #374151;
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