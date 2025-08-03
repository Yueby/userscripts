<script setup lang="ts">
import { computed, ref } from 'vue';
import { CurrencyManager } from '../../utils/currency/currency-manager';
import { ItemManager } from '../../utils/booth/item-manager';
import MaskedText from '../common/MaskedText/index.vue';
import ItemIcon from '../common/ItemIcon/index.vue';
import type { ProductSalesData } from '../../utils/analysis/data-analyzer';
import type { Currency, UserSettings } from '../../types/settings';

interface Props {
  productData: ProductSalesData[];
  targetCurrency?: Currency;
  maxItems?: number;
  userSettings?: UserSettings;
}

const props = withDefaults(defineProps<Props>(), {
  maxItems: 10
});

const sortType = ref<'quantity' | 'revenue'>('quantity');

const itemManager = ItemManager.getInstance();

// 根据排序类型处理数据
const sortedProductData = computed(() => {
  const sorted = [...props.productData];
  if (sortType.value === 'quantity') {
    return sorted.sort((a, b) => b.totalQuantity - a.totalQuantity);
  } else {
    return sorted.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }
});

// 限制显示的商品数量
const limitedProductData = computed(() => {
  return sortedProductData.value.slice(0, props.maxItems);
});

// 格式化日元显示
const formatJPY = (amount: number) => {
  return CurrencyManager.formatCurrencyWithCode(amount, 'JPY');
};

// 格式化转换后的货币显示
const formatConverted = (amount: number) => {
  const targetCurrency = props.targetCurrency || 'CNY';
  if (targetCurrency === 'JPY') {
    return null;
  }
  const convertedAmount = CurrencyManager.convertFromJPYSync(amount, targetCurrency);
  return CurrencyManager.formatCurrencyWithCode(convertedAmount, targetCurrency);
};

// 获取商品链接
const getItemUrl = (itemId: string) => {
  return itemManager.getItemUrl(itemId);
};
</script>

<template>
  <div class="item-ranking">
    <div class="ranking-header">
      <h4>商品排行</h4>
      <div class="ranking-controls">
        <div class="sort-buttons">
          <button 
            :class="['sort-btn', { active: sortType === 'quantity' }]" 
            @click="sortType = 'quantity'"
          >
            销量
          </button>
          <button 
            :class="['sort-btn', { active: sortType === 'revenue' }]" 
            @click="sortType = 'revenue'"
          >
            收入
          </button>
        </div>
      </div>
    </div>

    <div class="ranking-list">
      <div v-for="(product, index) in limitedProductData" :key="product.itemId" class="ranking-item">
        <!-- 排名 -->
        <div class="rank-badge" :class="`rank-${index + 1}`">
          {{ index + 1 }}
        </div>

                 <!-- 商品信息 -->
         <div class="product-info">
           <div class="product-icon">
             <ItemIcon :item-id="product.itemId" size="28px" :privacy-mode="userSettings?.privacyMode || false" />
           </div>
          <div class="product-details">
                         <div class="product-name">
               <a v-if="!userSettings?.privacyMode" :href="getItemUrl(product.itemId)" target="_blank" class="product-link">
                 <MaskedText :value="product.name" :masked="userSettings?.privacyMode || false" :mask-char="'商品'" />
               </a>
               <span v-else class="product-link">
                 <MaskedText :value="product.name" :masked="userSettings?.privacyMode || false" :mask-char="'商品'" />
               </span>
             </div>
          </div>
        </div>

        <!-- 销量/收入数据 -->
        <div class="sales-data">
          <div class="quantity">
            <span class="quantity-label">{{ sortType === 'quantity' ? '销量' : '收入' }}</span>
            <span class="quantity-value">
                              <template v-if="sortType === 'quantity'">
                  <MaskedText :value="product.totalQuantity" :masked="userSettings?.privacyMode || false" />
                </template>
                <template v-else>
                  <MaskedText :value="formatJPY(product.totalRevenue)" :masked="userSettings?.privacyMode || false" />
                </template>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="limitedProductData.length === 0" class="empty-state">
      <div class="empty-icon">📦</div>
      <div class="empty-text">暂无商品数据</div>
    </div>
  </div>
</template>

<style scoped>
.item-ranking {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  height: 300px;
  display: flex;
  flex-direction: column;
  min-height: 300px;
  max-height: 300px;
}

.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.ranking-header h4 {
  margin: 0;
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
}

.ranking-controls {
  display: flex;
  align-items: center;
}

.sort-buttons {
  display: flex;
  gap: 4px;
}

.sort-btn {
  padding: 3px 6px;
  border: 1px solid #d1d5db;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 500;
  background: white;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.sort-btn:hover {
  border-color: #9ca3af;
  color: #374151;
  background: #f9fafb;
}

.sort-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.sort-btn.active:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}

.ranking-list::-webkit-scrollbar {
  width: 4px;
}

.ranking-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.ranking-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.ranking-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.ranking-item:hover {
  background: #f1f5f9;
  border-color: #d1d5db;
  transform: translateY(-1px);
}

/* 排名徽章 */
.rank-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 11px;
  color: white;
  flex-shrink: 0;
}

.rank-1 {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
}

.rank-2 {
  background: linear-gradient(135deg, #9ca3af, #6b7280);
}

.rank-3 {
  background: linear-gradient(135deg, #cd7f32, #b8860b);
}

.rank-4, .rank-5, .rank-6, .rank-7, .rank-8, .rank-9, .rank-10 {
  background: linear-gradient(135deg, #e5e7eb, #d1d5db);
  color: #6b7280;
}

/* 商品信息 */
.product-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.product-icon {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-details {
  flex: 1;
  min-width: 0;
}

.product-name {
  margin-bottom: 0;
}

.product-link {
  color: #1f2937;
  text-decoration: none;
  font-weight: 500;
  font-size: 11px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-link:hover {
  color: #3b82f6;
  text-decoration: underline;
}

/* 销量数据 */
.sales-data {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-end;
  flex-shrink: 0;
}

.quantity {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
}

.quantity-label {
  font-size: 9px;
  color: #6b7280;
  font-weight: 500;
}

.quantity-value {
  font-size: 12px;
  font-weight: 700;
  color: #1f2937;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #6b7280;
  flex: 1;
}

.empty-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.empty-text {
  font-size: 12px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .item-ranking {
    padding: 12px;
  }

  .ranking-header h4 {
    font-size: 13px;
  }

  .ranking-item {
    padding: 5px;
    gap: 6px;
  }

  .product-icon {
    width: 24px;
    height: 24px;
  }

  .product-link {
    font-size: 10px;
  }

  .quantity-value {
    font-size: 11px;
  }

  .quantity-label {
    font-size: 8px;
  }

  .rank-badge {
    width: 20px;
    height: 20px;
    font-size: 10px;
  }
}
</style> 