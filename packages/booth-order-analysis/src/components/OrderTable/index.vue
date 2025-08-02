<script setup lang="ts">
import { computed, ref } from 'vue';
import { CurrencyConverter } from '../../utils/currency/currency-converter';
import { calculateNetAmount, formatNetAmount, calculateBoothFee, formatBoothFee } from '../../utils/booth/booth-fee-calculator';
import { TimezoneConverter } from '../../utils/timezone-converter';
import ItemEntry from './ItemEntry.vue';
import type { Order } from '../../types/order';
import type { Currency, UserSettings } from '../../types/settings';

interface Props {
  orders: Order[];
  targetCurrency?: Currency;
  userSettings?: UserSettings;
}

const props = defineProps<Props>();

// 分页配置
const pageSize = 50;
const currentPage = ref(1);

// 计算分页数据
const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return props.orders.slice(start, end);
});

// 总页数
const totalPages = computed(() => Math.ceil(props.orders.length / pageSize));

// 表格列配置
const columns = [
  { key: 'orderNumber', label: '订单编号', width: '120px' },
  { key: 'createdAt', label: '订单时间', width: '140px' },
  { key: 'items', label: '商品', width: '300px' },
  { key: 'paymentMethod', label: '支付方式', width: '120px' },
  { key: 'totalPrice', label: '金额', width: '100px' },
  { key: 'boothFee', label: '手续费', width: '100px' },
  { key: 'netAmount', label: '到手金额', width: '100px' }
];

// 格式化原始日期时间（主要显示）
const formatOriginalDateTime = (dateString: string) => {
  if (!dateString) return '';
  
  // 直接解析CSV中的时间格式 (YYYY-MM-DD HH:mm:ss)
  const parts = dateString.split(' ');
  if (parts.length !== 2) return dateString;
  
  const [datePart, timePart] = parts;
  const [year, month, day] = datePart.split('-');
  const [hour, minute] = timePart.split(':');
  
  // 格式化为 MM/DD HH:mm
  return `${month}/${day} ${hour}:${minute}`;
};

// 格式化转换后的日期时间（辅助显示）
const formatConvertedDateTime = (dateString: string) => {
  if (!dateString) return '';
  if (!props.userSettings) return '';
  
  try {
    const convertedTime = TimezoneConverter.convertJSTToTargetTimezone(dateString, props.userSettings.timezone);
    // 显示完整的转换后时间
    const [datePart, timePart] = convertedTime.split(' ');
    const [year, month, day] = datePart.split('-');
    const [hour, minute] = timePart.split(':');
    
    // 格式化为 MM/DD HH:mm (时区名称)
    return `${month}/${day} ${hour}:${minute} (${props.userSettings.displayName})`;
  } catch (error) {
    return ''; // 转换失败时不显示副文本
  }
};

// 格式化日元金额（主要显示）
const formatJPY = (price: number) => {
  return CurrencyConverter.formatCurrencyWithCode(price, 'JPY');
};

// 格式化转换后的金额（辅助显示）
const formatConverted = (price: number) => {
  const targetCurrency = props.targetCurrency || 'CNY';
  if (targetCurrency === 'JPY') {
    return null;
  }
  const convertedAmount = CurrencyConverter.convertFromJPYSync(price, targetCurrency);
  return CurrencyConverter.formatCurrencyWithCode(convertedAmount, targetCurrency);
};

// 格式化到手金额
const formatNetAmountForOrder = (order: Order) => {
  const netAmount = calculateNetAmount(order.totalPrice, order.createdAt);
  return formatNetAmount(order.totalPrice, order.createdAt);
};

// 格式化手续费
const formatBoothFeeForOrder = (order: Order) => {
  return formatBoothFee(order.totalPrice, order.createdAt);
};

// 格式化手续费转换
const formatBoothFeeConverted = (order: Order) => {
  const boothFee = calculateBoothFee(order.totalPrice, order.createdAt);
  const targetCurrency = props.targetCurrency || 'CNY';
  if (targetCurrency === 'JPY') {
    return null;
  }
  const convertedAmount = CurrencyConverter.convertFromJPYSync(boothFee, targetCurrency);
  return CurrencyConverter.formatCurrencyWithCode(convertedAmount, targetCurrency);
};

// 格式化到手金额转换
const formatNetAmountConverted = (order: Order) => {
  const netAmount = calculateNetAmount(order.totalPrice, order.createdAt);
  const targetCurrency = props.targetCurrency || 'CNY';
  if (targetCurrency === 'JPY') {
    return null;
  }
  const convertedAmount = CurrencyConverter.convertFromJPYSync(netAmount, targetCurrency);
  return CurrencyConverter.formatCurrencyWithCode(convertedAmount, targetCurrency);
};

// 分页方法
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const goToPrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

// 获取单元格的CSS类名
const getCellClass = (columnKey: string) => {
  switch (columnKey) {
    case 'createdAt':
      return 'date-cell';
    case 'items':
      return 'items-cell';
    case 'totalPrice':
      return 'price-cell';
    case 'boothFee':
      return 'booth-fee-cell';
    case 'netAmount':
      return 'net-amount-cell';
    default:
      return '';
  }
};

// 获取可见的页码按钮
const getVisiblePages = () => {
  const pages: number[] = [];
  const total = totalPages.value;
  const current = currentPage.value;
  
  if (total <= 7) {
    // 如果总页数少于等于7，显示所有页码
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // 如果总页数大于7，显示当前页附近的页码
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    
    // 添加第一页
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push(-1); // 表示省略号
      }
    }
    
    // 添加当前页附近的页码
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // 添加最后一页
    if (end < total) {
      if (end < total - 1) {
        pages.push(-1); // 表示省略号
      }
      pages.push(total);
    }
  }
  
  return pages;
};
</script>

<template>
  <div class="order-table-panel">
    <div class="table-header">
      <h3>订单列表</h3>
      <div class="table-info">
        <span class="order-count">{{ orders.length }} 条订单</span>
        <span v-if="orders.length > 0" class="page-info">
          第 {{ currentPage }} 页，共 {{ totalPages }} 页
        </span>
      </div>
    </div>

    <div class="table-container">
      <!-- 表头 -->
      <div class="table-header-row">
        <div v-for="column in columns" :key="column.key" class="table-header-cell" :style="{ width: column.width }">
          {{ column.label }}
        </div>
      </div>

             <!-- 表格内容 -->
       <div v-if="orders.length > 0" class="table-content">
         <div v-for="order in paginatedOrders" :key="order.orderNumber" class="table-row">
           <div v-for="column in columns" :key="column.key" class="table-cell" :class="getCellClass(column.key)" :style="{ width: column.width }">
             <!-- 订单编号 -->
             <span v-if="column.key === 'orderNumber'" class="order-number">{{ order.orderNumber }}</span>
             
             <!-- 订单时间 -->
             <div v-else-if="column.key === 'createdAt'" class="date-cell">
               <div class="date-main">{{ formatOriginalDateTime(order.createdAt) }}</div>
               <div v-if="formatConvertedDateTime(order.createdAt)" class="date-converted">{{ formatConvertedDateTime(order.createdAt) }}</div>
             </div>
             
                           <!-- 商品 -->
              <div v-else-if="column.key === 'items'" class="items">
                <div v-if="order.items && order.items.length > 0" class="item-list">
                  <ItemEntry v-for="item in order.items" :key="item.itemId" :item="item" :allOrders="orders" size="20px" />
                </div>
                <div v-else class="no-items">无商品信息</div>
              </div>
             
             <!-- 支付方式 -->
             <span v-else-if="column.key === 'paymentMethod'" class="payment-method">{{ order.paymentMethod }}</span>
             
             <!-- 金额 -->
             <div v-else-if="column.key === 'totalPrice'" class="price-cell">
               <div class="price-main">{{ formatJPY(order.totalPrice) }}</div>
               <div v-if="formatConverted(order.totalPrice)" class="price-converted">{{ formatConverted(order.totalPrice) }}</div>
             </div>
             
             <!-- 手续费 -->
             <div v-else-if="column.key === 'boothFee'" class="booth-fee-cell">
               <div class="price-main">{{ formatBoothFeeForOrder(order) }}</div>
               <div v-if="formatBoothFeeConverted(order)" class="price-converted">{{ formatBoothFeeConverted(order) }}</div>
             </div>
             
             <!-- 到手金额 -->
             <div v-else-if="column.key === 'netAmount'" class="net-amount-cell">
               <div class="price-main">{{ formatNetAmountForOrder(order) }}</div>
               <div v-if="formatNetAmountConverted(order)" class="price-converted">{{ formatNetAmountConverted(order) }}</div>
             </div>
           </div>
         </div>
       </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-icon">📋</div>
        <div class="empty-text">暂无订单数据</div>
        <div class="empty-hint">请先加载数据或调整筛选条件</div>
      </div>
    </div>

    <!-- 分页控件 -->
    <div v-if="orders.length > 0" class="pagination">
      <button @click="goToPrevPage" :disabled="currentPage === 1" class="page-btn">
        上一页
      </button>

      <div class="page-numbers">
        <button v-for="page in getVisiblePages()" :key="page"
          :class="['page-btn', { active: currentPage === page, ellipsis: page === -1 }]" 
          @click="page === -1 ? null : goToPage(page)">
          {{ page === -1 ? '...' : page }}
        </button>
      </div>

      <button @click="goToNextPage" :disabled="currentPage === totalPages" class="page-btn">
        下一页
      </button>
    </div>
  </div>
</template>

<style scoped>
.order-table-panel {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-header h3 {
  margin: 0;
  color: #374151;
  font-size: 16px;
  font-weight: 600;
}

.table-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.order-count {
  font-size: 14px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 4px;
}

.page-info {
  font-size: 12px;
  color: #9ca3af;
}

.table-container {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.table-header-row {
  display: flex;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.table-header-cell {
  padding: 12px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  border-right: 1px solid #e5e7eb;
}

.table-header-cell:last-child {
  border-right: none;
}

.table-content {
  max-height: 400px;
  overflow-y: auto;
}

.table-row {
  display: flex;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s;
  min-height: 36px;
}

.table-row:hover {
  background: #f9fafb;
}

.table-cell {
  padding: 8px 12px;
  font-size: 14px;
  color: #6b7280;
  border-right: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  min-height: 36px;
}

.table-cell:last-child {
  border-right: none;
}

.order-number {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  color: #1f2937;
  font-weight: 500;
}

.date-cell {
  align-items: center;
  flex-direction: column;
  padding-top: 8px;
  padding-bottom: 8px;
}

.date-main {
  color: #1f2937;
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 2px;
}

.date-converted {
  color: #6b7280;
  font-size: 11px;
  font-weight: 500;
}

.items {
  color: #374151;
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
}

.items-cell {
  align-items: center;
  justify-content: flex-start;
  padding-top: 8px;
  padding-bottom: 8px;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.no-items {
  color: #9ca3af;
  font-size: 12px;
  font-style: italic;
}

.payment-method {
  color: #6b7280;
  font-size: 12px;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 3px;
}

.price-cell, .booth-fee-cell, .net-amount-cell {
  align-items: center;
  flex-direction: column;
  padding-top: 8px;
  padding-bottom: 8px;
}

.price-main {
  color: #1f2937;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 2px;
}

.price-converted {
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #9ca3af;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #6b7280;
}

.empty-hint {
  font-size: 14px;
  color: #9ca3af;
}

/* 分页控件 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.page-btn {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.page-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.page-btn.ellipsis {
  background: none;
  border: none;
  color: #6b7280;
  cursor: default;
  padding: 8px 4px;
}

.page-btn.ellipsis:hover {
  background: none;
  border: none;
}

.page-btn:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .table-content {
    max-height: 300px;
  }

  .table-cell {
    padding: 8px;
    font-size: 13px;
  }

  .pagination {
    flex-wrap: wrap;
  }
}
</style>