<template>
  <div class="pagination">
    <button @click="goToPrevPage" :disabled="currentPage === 1" class="page-btn">
      上一页
    </button>

    <div class="page-numbers">
      <button v-for="page in getVisiblePages()" :key="page"
        :class="['page-btn', { active: currentPage === page, ellipsis: page === -1 }]" 
        @click="page === -1 ? null : goToPage(page)">
        {{ page === -1 ? '...' : (privacyMode ? '***' : page) }}
      </button>
    </div>

    <button @click="goToNextPage" :disabled="currentPage === totalPages" class="page-btn">
      下一页
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  goToPrevPage: () => void;
  goToNextPage: () => void;
  privacyMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  privacyMode: false
});

// 获取可见的页码按钮
const getVisiblePages = () => {
  const pages: number[] = [];
  const total = props.totalPages;
  const current = props.currentPage;
  
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

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--table-border-color, #e5e7eb);
}

.page-btn {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  background: white;
  color: var(--table-text-primary, #374151);
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
  color: var(--table-text-secondary, #6b7280);
  cursor: default;
  padding: 8px 4px;
}

.page-btn.ellipsis:hover {
  background: none;
  border: none;
}

.page-btn:disabled {
  background: #f3f4f6;
  color: var(--table-text-muted, #9ca3af);
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .pagination {
    flex-wrap: wrap;
  }
}
</style> 