<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Order } from '../../types/order';
import { ItemManager } from '../../utils/booth/item-manager';
import ItemIcon from '../common/ItemIcon/index.vue';
import MaskedText from '../common/MaskedText/index.vue';

interface Props {
  item: {
    itemId: string;
    name: string;
    quantity: number;
  };
  size?: string;
  allOrders?: Order[]; // 所有订单数据，用于计算总销量
  privacyMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: '20px',
  privacyMode: false
});

const showTooltip = ref(false);
const tooltipPosition = ref({ x: 0, y: 0 });

// 获取商品详细信息
const itemDetails = computed(() => {
  const itemManager = ItemManager.getInstance();
  const itemData = itemManager.getItem(props.item.itemId);
  const boothItem = itemManager.getBoothItem(props.item.itemId);
  
  // 计算该商品在所有订单中的总销量
  let totalSales = 0;
  if (props.allOrders) {
    props.allOrders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: { itemId: string; quantity: number }) => {
          if (item.itemId === props.item.itemId) {
            totalSales += item.quantity;
          }
        });
      }
    });
  }
  
  return {
    name: boothItem?.name || itemData?.name || props.item.name,
    state: boothItem?.state || itemData?.state || '',
    stateLabel: boothItem?.state || itemData?.state_label || '',
    url: boothItem?.url || itemData?.url || '',
    iconUrl: boothItem?.iconUrl || itemData?.iconUrl || '',
    totalSales: totalSales,
    favorites: boothItem?.favorites || 0
  };
});

// 鼠标悬浮事件
const handleMouseEnter = (event: MouseEvent) => {
  showTooltip.value = true;
  tooltipPosition.value = {
    x: event.clientX + 10,
    y: event.clientY - 10
  };
};

const handleMouseLeave = () => {
  showTooltip.value = false;
};
</script>

<template>
  <div 
    class="item-entry" 
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <ItemIcon :itemId="item.itemId" :size="size" :privacy-mode="props.privacyMode" />
    <span class="item-name">
      <MaskedText :value="item.name" :masked="props.privacyMode" :mask-char="'商品'" /> × 
      <MaskedText :value="item.quantity" :masked="props.privacyMode" />
    </span>
    
    <!-- 悬浮气泡提示 -->
    <div 
      v-if="showTooltip" 
      class="tooltip"
      :style="{
        left: tooltipPosition.x + 'px',
        top: tooltipPosition.y + 'px'
      }"
    >
             <div class="tooltip-header">
         <img 
           v-if="!props.privacyMode && itemDetails.iconUrl" 
           :src="itemDetails.iconUrl" 
           :alt="itemDetails.name"
           class="tooltip-icon"
         />
         <div v-else-if="props.privacyMode" class="tooltip-icon-placeholder">
           <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
             <rect width="32" height="32" rx="4" fill="#f3f4f6"/>
             <path d="M16 8c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="#9ca3af"/>
           </svg>
         </div>
         <div class="tooltip-title">
           <MaskedText :value="itemDetails.name" :masked="props.privacyMode" :mask-char="'商品'" />
         </div>
       </div>
      
      <div class="tooltip-content">
                 <div class="tooltip-row">
           <span class="tooltip-label">商品ID:</span>
           <span class="tooltip-value">
             <MaskedText :value="item.itemId" :masked="props.privacyMode" />
           </span>
         </div>
                 <div class="tooltip-row">
           <span class="tooltip-label">状态:</span>
           <span class="tooltip-value">
             <MaskedText :value="itemDetails.stateLabel" :masked="props.privacyMode" />
           </span>
         </div>
                 <div class="tooltip-row">
           <span class="tooltip-label">订单数量:</span>
           <span class="tooltip-value">
             <MaskedText :value="item.quantity" :masked="props.privacyMode" />
           </span>
         </div>
                 <div class="tooltip-row">
           <span class="tooltip-label">总销量:</span>
           <span class="tooltip-value sales-highlight">
             <MaskedText :value="itemDetails.totalSales" :masked="props.privacyMode" />
           </span>
         </div>
                 <div class="tooltip-row">
           <span class="tooltip-label">点赞数:</span>
           <span class="tooltip-value favorites-display">
             <svg class="heart-icon" viewBox="0 0 16 16" fill="currentColor">
               <path d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
             </svg>
             <MaskedText :value="itemDetails.favorites" :masked="props.privacyMode" />
           </span>
         </div>
                 <div class="tooltip-row">
           <span class="tooltip-label">链接:</span>
           <a 
             v-if="!props.privacyMode && itemDetails.url" 
             :href="itemDetails.url" 
             target="_blank"
             class="tooltip-link"
           >
             查看商品
           </a>
           <span v-else-if="props.privacyMode" class="tooltip-value">****</span>
         </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.item-entry {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  padding: 2px 0;
  position: relative;
}

.item-name {
  font-size: 13px;
  color: #374151;
  word-wrap: break-word;
  word-break: break-word;
  line-height: 1.4;
  flex: 1;
  min-width: 0;
}

/* 气泡提示样式 */
.tooltip {
  position: fixed;
  z-index: 9999;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  padding: 12px;
  min-width: 280px;
  max-width: 350px;
  font-size: 13px;
  animation: tooltipFadeIn 0.2s ease-out;
}

.tooltip-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f3f4f6;
}

.tooltip-icon {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.tooltip-icon-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
}

.tooltip-title {
  font-weight: 600;
  color: #1f2937;
  line-height: 1.3;
  word-wrap: break-word;
}

.tooltip-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tooltip-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tooltip-label {
  color: #6b7280;
  font-size: 12px;
  min-width: 50px;
  flex-shrink: 0;
}

.tooltip-value {
  color: #374151;
  font-weight: 500;
  word-break: break-all;
}

.sales-highlight {
  color: #059669;
  font-weight: 600;
  background: #ecfdf5;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.tooltip-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.tooltip-link:hover {
  color: #2563eb;
  text-decoration: underline;
}

.favorites-display {
  display: flex;
  align-items: center;
  gap: 4px;
}

.heart-icon {
  width: 12px;
  height: 12px;
  color: #ef4444; /* Red color for the heart icon */
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tooltip {
    min-width: 250px;
    max-width: 300px;
    font-size: 12px;
  }
  
  .tooltip-icon {
    width: 28px;
    height: 28px;
  }
}
</style> 