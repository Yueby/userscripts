<template>
  <div class="data-table" :class="tableClasses">
    <!-- 表格头部 -->
    <slot name="header" :title="display?.title" :info="tableInfo">
      <TableHeader 
        :title="display?.title" 
        :info="tableInfo"
        :privacy-mode="privacyMode"
      />
    </slot>

    <!-- 表格容器 -->
    <div class="table-container" :class="{ 'table-scrollable': scrollable }">
      <!-- 表头 -->
      <slot name="table-header" :columns="columns">
        <TableHeaderRow :columns="columns" />
      </slot>

      <!-- 表格内容或空状态 -->
      <slot name="table-body" :data="paginatedData" :columns="columns">
        <TableBody 
          v-if="paginatedData.length > 0"
          :data="paginatedData" 
          :columns="columns"
          :privacy-mode="privacyMode"
          :get-item-key="getItemKey"
        >
          <template #cell="{ item, column, index }">
            <slot name="cell" :item="item" :column="column" :index="index">
              <!-- 默认单元格渲染 -->
              <TableCell :item="item" :column="column" :privacy-mode="privacyMode" />
            </slot>
          </template>
        </TableBody>
        <TableEmptyState v-else :config="emptyConfig" />
      </slot>
    </div>

    <!-- 分页控件 -->
    <slot name="pagination" :pagination="paginationInfo">
      <TablePagination 
        v-if="showPagination"
        :current-page="currentPage"
        :total-pages="totalPages"
        :go-to-page="goToPage"
        :go-to-prev-page="goToPrevPage"
        :go-to-next-page="goToNextPage"
        :privacy-mode="privacyMode"
      />
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import TableHeader from './components/TableHeader.vue';
import TableHeaderRow from './components/TableHeaderRow.vue';
import TableBody from './components/TableBody.vue';
import TableCell from './components/TableCell.vue';
import TableEmptyState from './components/TableEmptyState.vue';
import TablePagination from './components/TablePagination.vue';
import { useTableData } from './composables/useTableData';
import { useTablePrivacy } from './composables/useTablePrivacy';
import { useTableConfig } from './composables/useTableConfig';

// 类型定义
export interface TableColumn {
  key: string;
  label: string;
  width: string;
  render?: any; // 自定义渲染组件
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

export interface TableConfig {
  pageSize?: number;
  privacyMode?: boolean;
  scrollable?: boolean;
  showPagination?: boolean;
  getItemKey?: (item: any, index: number) => string | number;
}

export interface DisplayConfig {
  title?: string;
  itemLabel?: string;
  emptyIcon?: string;
  emptyText?: string;
  emptyHint?: string;
}

export interface DataTableProps {
  data: any[];
  columns: TableColumn[];
  config?: TableConfig;
  display?: DisplayConfig;
}

// Props 定义
const props = withDefaults(defineProps<DataTableProps>(), {
  config: () => ({
    pageSize: 50,
    privacyMode: false,
    scrollable: false,
    showPagination: true,
    getItemKey: (item: any, index: number) => item.id || item.orderNumber || item.itemId || index
  }),
  display: () => ({
    title: '数据表格',
    itemLabel: '条记录',
    emptyIcon: '📋',
    emptyText: '暂无数据',
    emptyHint: '请先加载数据或调整筛选条件'
  })
});

// 组合式函数
const { 
  currentPage, 
  totalPages, 
  paginatedData, 
  goToPage, 
  goToPrevPage, 
  goToNextPage 
} = useTableData(
  computed(() => props.data), 
  computed(() => props.config?.pageSize || 50)
);

const { maskValue } = useTablePrivacy(computed(() => props.config?.privacyMode || false));

const { tableClasses, tableInfo, emptyConfig, paginationInfo } = useTableConfig(
  computed(() => props.data),
  computed(() => props.display),
  computed(() => props.config),
  currentPage,
  totalPages,
  goToPage,
  goToPrevPage,
  goToNextPage
);

// 计算属性
const privacyMode = computed(() => props.config?.privacyMode || false);
const scrollable = computed(() => props.config?.scrollable || false);
const showPagination = computed(() => props.config?.showPagination !== false);
const getItemKey = computed(() => props.config?.getItemKey || ((item: any, index: number) => item.id || item.orderNumber || item.itemId || index));

// 监听数据变化，重置分页
watch(() => props.data, () => {
  currentPage.value = 1;
}, { deep: true });

// 事件处理
const handlePageChange = (page: number) => {
  goToPage(page);
};
</script>

<style scoped>
.data-table {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-container {
  border: 1px solid var(--table-border-color, #e5e7eb);
  border-radius: 6px;
  overflow: hidden;
}

.table-container.table-scrollable {
  min-width: 1200px;
}

/* 主题变量 */
.data-table {
  --table-border-color: #e5e7eb;
  --table-header-bg: #f8fafc;
  --table-row-hover: #f9fafb;
  --table-text-primary: #374151;
  --table-text-secondary: #6b7280;
  --table-text-muted: #9ca3af;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .data-table {
    padding: 16px;
  }
}
</style>