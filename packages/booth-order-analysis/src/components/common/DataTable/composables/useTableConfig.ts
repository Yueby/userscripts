import { computed, type Ref } from 'vue';

export function useTableConfig(
  data: Ref<any[]>,
  display: Ref<any>,
  config: Ref<any>,
  currentPage: Ref<number>,
  totalPages: Ref<number>,
  goToPage: (page: number) => void,
  goToPrevPage: () => void,
  goToNextPage: () => void
) {
  const tableClasses = computed(() => {
    const classes = ['data-table'];
    if (config.value?.scrollable) {
      classes.push('table-scrollable');
    }
    return classes;
  });
  
  const tableInfo = computed(() => ({
    totalItems: data.value.length,
    currentPage: currentPage.value,
    totalPages: totalPages.value,
    itemLabel: display.value?.itemLabel || '条记录'
  }));
  
  const emptyConfig = computed(() => ({
    icon: display.value?.emptyIcon || '📋',
    text: display.value?.emptyText || '暂无数据',
    hint: display.value?.emptyHint || '请先加载数据或调整筛选条件'
  }));
  
  const paginationInfo = computed(() => ({
    currentPage: currentPage.value,
    totalPages: totalPages.value,
    goToPage,
    goToPrevPage,
    goToNextPage
  }));
  
  return {
    tableClasses,
    tableInfo,
    emptyConfig,
    paginationInfo
  };
} 