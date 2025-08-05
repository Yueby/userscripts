import { ref, computed, watch, type Ref } from 'vue';

export function useTableData(data: Ref<any[]>, pageSize: Ref<number>) {
  const currentPage = ref(1);
  
  const totalItems = computed(() => data.value.length);
  const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value));
  
  const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return data.value.slice(start, end);
  });
  
  // 监听数据变化，重置分页
  watch(data, () => {
    currentPage.value = 1;
  }, { deep: true });
  
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
  
  return {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    goToPrevPage,
    goToNextPage
  };
} 