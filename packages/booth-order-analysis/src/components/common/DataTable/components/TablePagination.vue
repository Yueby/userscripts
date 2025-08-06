<template>
  <div class="pagination">
    <div class="pagination-controls">
      <button @click="goToPrevPage" :disabled="currentPage === 1" class="booth-btn booth-btn-secondary booth-btn-sm" title="上一页">
        ‹
      </button>

      <div class="page-numbers">
        <button v-for="page in getVisiblePages()" :key="page" :class="['booth-btn', 'booth-btn-sm', {
          'booth-btn-primary': currentPage === page,
          'booth-btn-ghost': page === -1,
          'booth-btn-secondary': page !== -1 && currentPage !== page
        }]" @click="page === -1 ? null : goToPage(page)">
          {{ page === -1 ? '...' : (privacyMode ? '***' : page) }}
        </button>
      </div>

      <button @click="goToNextPage" :disabled="currentPage === totalPages" class="booth-btn booth-btn-secondary booth-btn-sm" title="下一页">
        ›
      </button>
    </div>

    <div class="pagination-info">
      <span v-if="totalPages > 0" class="page-info">
        第 <span class="page-current">{{ privacyMode ? '***' : currentPage }}</span> 页，共 <span class="page-total">{{
          privacyMode ? '***' : totalPages }}</span> 页
      </span>
    </div>
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
  position: relative;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--table-border-color, #e5e7eb);
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.pagination-info {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.page-info {
  font-size: 12px;
  color: var(--table-text-secondary, #6b7280);
  font-weight: 500;
  padding: 4px 8px;
  background: #f8fafc;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.page-current {
  color: var(--table-text-primary, #374151);
  font-weight: 600;
}

.page-total {
  color: var(--table-text-primary, #374151);
  font-weight: 600;
}

.page-numbers {
  display: flex;
  gap: 2px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .pagination {
    flex-wrap: wrap;
  }
}
</style>