<template>
    <DataTable :data="sortedItems" :columns="itemColumns" :config="tableConfig" :display="displayConfig">
        <!-- 头部控制区域 -->
        <template #header-controls>
            <Selector v-model="sortMode" :options="sortOptions" @change="handleSortChange" />
        </template>

        <!-- 自定义单元格渲染 -->
        <template #cell="{ item, column }">
            <!-- 商品ID -->
            <template v-if="column.key === 'itemId'">
                <MaskedText :value="item.itemId" :masked="props.userSettings?.privacyMode || false" />
            </template>

            <!-- 商品图标 -->
            <template v-else-if="column.key === 'icon'">
                <ItemIcon :item-id="item.itemId" size="40px" :privacy-mode="props.userSettings?.privacyMode || false" />
            </template>

            <!-- 商品名称 -->
            <template v-else-if="column.key === 'name'">
                <MaskedText :value="item.item.name" :masked="props.userSettings?.privacyMode || false" mask-char="商品" />
            </template>

            <!-- 商品状态 -->
            <template v-else-if="column.key === 'state'">
                <MaskedText :value="item.item.state_label" :masked="props.userSettings?.privacyMode || false" />
            </template>

            <!-- 总销量 -->
            <template v-else-if="column.key === 'totalQuantity'">
                <MaskedText :value="getNestedValue(item, 'salesStats.totalQuantity') || 0"
                    :masked="props.userSettings?.privacyMode || false" />
            </template>

            <!-- 总收入 -->
            <template v-else-if="column.key === 'totalRevenue'">
                <div class="price-cell">
                    <div class="price-main">
                        <MaskedText :value="formatJPY(getNestedValue(item, 'salesStats.totalRevenue') || 0)"
                            :masked="props.userSettings?.privacyMode || false" />
                    </div>
                    <div v-if="!(props.userSettings?.privacyMode || false) && getNestedValue(item, 'salesStats.totalRevenue') && targetCurrency && CurrencyManager.formatConverted(getNestedValue(item, 'salesStats.totalRevenue'), targetCurrency as any)"
                        class="price-converted">
                        {{ CurrencyManager.formatConverted(getNestedValue(item, 'salesStats.totalRevenue'),
                            targetCurrency as any) }}
                    </div>
                </div>
            </template>

            <!-- 总手续费 -->
            <template v-else-if="column.key === 'totalBoothFee'">
                <div class="price-cell">
                    <div class="price-main">
                        <MaskedText :value="formatJPY(getNestedValue(item, 'salesStats.totalBoothFee') || 0)"
                            :masked="props.userSettings?.privacyMode || false" />
                    </div>
                    <div v-if="!(props.userSettings?.privacyMode || false) && getNestedValue(item, 'salesStats.totalBoothFee') && targetCurrency && CurrencyManager.formatConverted(getNestedValue(item, 'salesStats.totalBoothFee'), targetCurrency as any)"
                        class="price-converted">
                        {{ CurrencyManager.formatConverted(getNestedValue(item, 'salesStats.totalBoothFee'),
                            targetCurrency as any) }}
                    </div>
                </div>
            </template>

            <!-- 净收入 -->
            <template v-else-if="column.key === 'totalNetRevenue'">
                <div class="price-cell">
                    <div class="price-main">
                        <MaskedText :value="formatJPY(getNestedValue(item, 'salesStats.totalNetRevenue') || 0)"
                            :masked="props.userSettings?.privacyMode || false" />
                    </div>
                    <div v-if="!(props.userSettings?.privacyMode || false) && getNestedValue(item, 'salesStats.totalNetRevenue') && targetCurrency && CurrencyManager.formatConverted(getNestedValue(item, 'salesStats.totalNetRevenue'), targetCurrency as any)"
                        class="price-converted">
                        {{ CurrencyManager.formatConverted(getNestedValue(item, 'salesStats.totalNetRevenue'),
                            targetCurrency as any) }}
                    </div>
                </div>
            </template>

            <!-- 商品链接 -->
            <template v-else-if="column.key === 'link'">
                <a v-if="!(props.userSettings?.privacyMode || false) && item.item.url" :href="item.item.url"
                    target="_blank" class="item-link">
                    查看商品
                </a>
                <span v-else-if="props.userSettings?.privacyMode || false" class="item-link-masked">
                    ****
                </span>
                <span v-else class="no-link">
                    无链接
                </span>
            </template>

            <!-- 操作按钮 -->
            <template v-else-if="column.key === 'action'">
                <button class="booth-btn booth-btn-primary booth-btn-sm"
                    :disabled="props.userSettings?.privacyMode || false" @click="showSalesDetails(item)">
                    查看销量
                </button>
            </template>
        </template>
    </DataTable>

    <!-- 销量详情弹窗 -->
    <Modal :visible="showSalesModal" title="销量详情" size="large" @close="closeSalesModal">
        <div v-if="selectedItem" class="sales-details">
            <div class="item-info">
                <div class="item-icon">
                    <ItemIcon :item-id="selectedItem.itemId" size="60px"
                        :privacy-mode="userSettings?.privacyMode || false" />
                </div>
                <div class="item-details">
                    <h4>{{ userSettings?.privacyMode ? '商品' : selectedItem.item.name }}</h4>
                    <p class="item-id">商品ID: {{ userSettings?.privacyMode ? '****' : selectedItem.itemId }}</p>
                </div>
            </div>

            <div class="sales-summary">
                <div class="summary-item">
                    <span class="summary-label">总销量:</span>
                    <span class="summary-value">
                        <MaskedText :value="selectedItem.salesStats.totalQuantity"
                            :masked="userSettings?.privacyMode || false" />
                    </span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">总收入:</span>
                    <span class="summary-value">
                        <MaskedText :value="formatJPY(selectedItem.salesStats.totalRevenue)"
                            :masked="userSettings?.privacyMode || false" />
                    </span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">净收入:</span>
                    <span class="summary-value">
                        <MaskedText :value="formatJPY(selectedItem.salesStats.totalNetRevenue)"
                            :masked="userSettings?.privacyMode || false" />
                    </span>
                </div>
            </div>

            <div class="variant-sales">
                <h5>变体销量详情</h5>
                <div v-if="getItemVariants(selectedItem.itemId).length > 0" class="variant-summary">
                    <div class="summary-stats">
                        <span class="summary-stat">
                            变体数量: <strong>
                                <MaskedText :value="getItemVariants(selectedItem.itemId).length"
                                    :masked="userSettings?.privacyMode || false" />
                            </strong>
                        </span>
                        <span class="summary-stat">
                            变体总销量: <strong>
                                <MaskedText :value="getVariantTotalQuantity(selectedItem.itemId)"
                                    :masked="userSettings?.privacyMode || false" />
                            </strong>
                        </span>
                        <span class="summary-stat">
                            变体总收入: <strong>
                                <MaskedText :value="formatJPY(getVariantTotalRevenue(selectedItem.itemId))"
                                    :masked="userSettings?.privacyMode || false" />
                            </strong>
                        </span>
                    </div>
                </div>
                <div class="variant-list">
                    <div v-for="variant in getItemVariants(selectedItem.itemId)" :key="variant.variantName"
                        class="variant-item">
                        <div class="variant-info">
                            <div class="variant-details">
                                <span class="variant-name">{{ userSettings?.privacyMode ? '变体商品' :
                                    variant.variantName }}</span>
                                <span v-if="!userSettings?.privacyMode" class="variant-source">
                                    来自订单数据
                                </span>
                            </div>
                        </div>
                        <div class="variant-stats">
                            <span class="variant-quantity">
                                销量:
                                <MaskedText :value="variant.totalQuantity"
                                    :masked="userSettings?.privacyMode || false" />
                            </span>
                            <span class="variant-revenue">
                                收入:
                                <MaskedText :value="formatJPY(variant.totalRevenue)"
                                    :masked="userSettings?.privacyMode || false" />
                            </span>
                        </div>
                    </div>
                </div>
                <div v-if="getItemVariants(selectedItem.itemId).length === 0" class="no-variants">
                    <p>暂无变体商品</p>
                </div>
            </div>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { UserSettings } from '../../types/settings';
import type { CustomDateRange, TimePeriod } from '../../utils/analysis/data-analyzer';
import { DataAnalyzer } from '../../utils/analysis/data-analyzer';
import { OrderManager } from '../../utils/booth/order-manager';
import { DataLoader } from '../../utils/core/data-loader';
import { getNestedValue } from '../../utils/core/object-utils';
import { CurrencyManager } from '../../utils/currency/currency-manager';
import DataTable from '../common/DataTable/index.vue';
import ItemIcon from '../common/ItemIcon/index.vue';
import MaskedText from '../common/MaskedText/index.vue';
import Modal from '../common/Modal/index.vue';
import Selector from '../common/Selector/index.vue';

interface Props {
    userSettings?: UserSettings;
    selectedPeriod?: TimePeriod;
    customRange?: CustomDateRange;
    targetCurrency?: string;
}

const props = defineProps<Props>();

// 弹窗状态
const showSalesModal = ref(false);
const selectedItem = ref<any>(null);

// 排序状态
const sortMode = ref<'original' | 'sales'>('original');

// 获取订单数据
const dataLoader = DataLoader.getInstance();
const orders = computed(() => dataLoader.getOrders());

// 根据过滤器获取过滤后的订单
const filteredOrders = computed(() => {
    if (orders.value.length === 0) return [];

    const result = DataAnalyzer.filterOrdersByPeriod(orders.value, {
        period: props.selectedPeriod || 'all',
        customRange: props.customRange
    });

    return result;
});

// 获取商品数据（包含销量统计）
const items = computed(() => {
    const orderManager = OrderManager.getInstance();
    return orderManager.getAllItemsWithStats(filteredOrders.value);
});

// 根据排序模式获取排序后的商品数据
const sortedItems = computed(() => {
    if (sortMode.value === 'original') {
        return items.value;
    } else if (sortMode.value === 'sales') {
        return [...items.value].sort((a, b) => b.salesStats.totalQuantity - a.salesStats.totalQuantity);
    }
    return items.value;
});

// 排序选项配置
const sortOptions = [
    { value: 'original', label: '原始顺序' },
    { value: 'sales', label: '按销量' }
];

// 设置排序模式
const setSortMode = (mode: 'original' | 'sales') => {
    sortMode.value = mode;
};

// 处理排序变化
const handleSortChange = (value: string | number | (string | number)[]) => {
    if (typeof value === 'string' || typeof value === 'number') {
        sortMode.value = value as 'original' | 'sales';
    }
};

// 表格列配置
const itemColumns = [
    { key: 'itemId', label: '商品ID', width: '80px' },
    { key: 'icon', label: '图标', width: '60px' },
    { key: 'name', label: '商品名称', width: '300px' },
    { key: 'state', label: '状态', width: '100px' },
    { key: 'totalQuantity', label: '销量', width: '80px' },
    { key: 'totalRevenue', label: '总收入', width: '100px' },
    { key: 'totalBoothFee', label: '手续费', width: '80px' },
    { key: 'totalNetRevenue', label: '净收入', width: '100px' },
    { key: 'link', label: '链接', width: '120px' },
    { key: 'action', label: '操作', width: '100px' }
];

// DataTable 配置
const tableConfig = computed(() => ({
    pageSize: 50,
    privacyMode: props.userSettings?.privacyMode || false,
    scrollable: true,
    showPagination: true,
    getItemKey: (item: any) => item.itemId
}));

const displayConfig = {
    title: '商品列表',
    itemLabel: '个商品',
    emptyIcon: '📦',
    emptyText: '暂无商品数据',
    emptyHint: '请先加载数据'
};

// 获取商品的变体信息（使用缓存优化性能）
const getItemVariants = (itemId: string) => {
    // 从当前商品数据中获取变体信息，避免重复计算
    const currentItem = items.value.find(item => item.itemId === itemId);
    return currentItem?.variantStats || [];
};

// 计算变体总销量（缓存计算结果）
const getVariantTotalQuantity = (itemId: string) => {
    const variants = getItemVariants(itemId);
    return variants.reduce((sum, variant) => sum + variant.totalQuantity, 0);
};

// 计算变体总收入（缓存计算结果）
const getVariantTotalRevenue = (itemId: string) => {
    const variants = getItemVariants(itemId);
    return variants.reduce((sum, variant) => sum + variant.totalRevenue, 0);
};

// 显示销量详情
const showSalesDetails = (item: any) => {
    selectedItem.value = item;
    showSalesModal.value = true;
};

// 关闭销量详情弹窗
const closeSalesModal = () => {
    showSalesModal.value = false;
    selectedItem.value = null;
};

// 格式化日元金额（主要显示）
const formatJPY = (price: number) => {
    return CurrencyManager.formatCurrencyWithCode(price, 'JPY');
};
</script>

<style scoped>
/* 继承DataTable的样式，只保留弹窗相关样式 */

/* 商品链接样式 */
.item-link {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
}

.item-link:hover {
    color: #2563eb;
    text-decoration: underline;
}

.item-link-masked {
    color: #9ca3af;
    font-style: italic;
}

.no-link {
    color: #9ca3af;
    font-style: italic;
}

/* 价格单元格样式 */
.price-cell {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding-top: 8px;
}

.price-main {
    font-weight: 500;
    color: #374151;
}

.price-converted {
    font-size: 12px;
    color: #6b7280;
    margin-top: 2px;
}

.sales-details {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.item-info {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: #f9fafb;
    border-radius: 6px;
}

.item-details h4 {
    margin: 0 0 4px 0;
    color: #374151;
    font-size: 16px;
    font-weight: 600;
}

.item-id {
    margin: 0;
    color: #6b7280;
    font-size: 14px;
}

.sales-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 6px;
}

.summary-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.summary-label {
    font-size: 12px;
    color: #6b7280;
    font-weight: 500;
}

.summary-value {
    font-size: 16px;
    color: #374151;
    font-weight: 600;
}

.variant-sales h5 {
    margin: 0 0 12px 0;
    color: #374151;
    font-size: 14px;
    font-weight: 600;
}

.variant-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.variant-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: #f9fafb;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
}

.variant-info {
    display: flex;
    align-items: center;
}

.variant-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.variant-name {
    font-size: 14px;
    color: #374151;
    font-weight: 500;
}

.variant-stats {
    display: flex;
    flex-direction: column;
    gap: 4px;
    text-align: right;
}

.variant-quantity,
.variant-revenue {
    font-size: 12px;
    color: #6b7280;
}

.variant-summary {
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 16px;
}

.summary-stats {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
}

.summary-stat {
    font-size: 13px;
    color: #0369a1;
}

.variant-source {
    font-size: 11px;
    color: #059669;
    font-style: italic;
}

.no-variants {
    text-align: center;
    padding: 20px;
    color: #9ca3af;
    font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .modal-content {
        width: 95%;
        margin: 20px;
    }

    .variant-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }

    .variant-stats {
        text-align: left;
        width: 100%;
    }
}
</style>