<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import { ConfigStorage } from '../../features/item-edit/modules/ConfigStorage';
import type { ItemEditAPI } from '../../api/item-edit';
import './styles.css';

const props = defineProps<{
  api: ItemEditAPI;
  itemId: string;
}>();

// 异步加载标签页组件
const TagPresetTab = defineAsyncComponent(() => import('./TagPresetTab.vue'));
const ItemDataTab = defineAsyncComponent(() => import('./ItemDataTab.vue'));
const ItemEditTab = defineAsyncComponent(() => import('./ItemEditTab.vue'));

const storage = ConfigStorage.getInstance();
const uiState = computed(() => storage.data.value.uiState);

// 拖拽调整宽度
const isResizing = ref(false);
const startX = ref(0);
const startWidth = ref(0);

const handleResizeStart = (e: MouseEvent) => {
  isResizing.value = true;
  startX.value = e.clientX;
  startWidth.value = uiState.value.sidebarWidth;
  document.addEventListener('mousemove', handleResizeMove);
  document.addEventListener('mouseup', handleResizeEnd);
  document.body.style.cursor = 'ew-resize';
  document.body.style.userSelect = 'none';
};

const handleResizeMove = (e: MouseEvent) => {
  if (!isResizing.value) return;
  // 计算新宽度：向左拖动是增加宽度
  const delta = startX.value - e.clientX;
  const newWidth = Math.max(400, Math.min(800, startWidth.value + delta));
  uiState.value.sidebarWidth = newWidth;
};

const handleResizeEnd = () => {
  isResizing.value = false;
  document.removeEventListener('mousemove', handleResizeMove);
  document.removeEventListener('mouseup', handleResizeEnd);
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
};

const closeSidebar = () => {
  uiState.value.sidebarOpen = false;
};

// 导出/导入功能
const handleExport = () => {
  const json = JSON.stringify(storage.data.value, null, 2);
  // 创建下载链接
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `booth-enhancer-config-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const handleImport = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        try {
          const parsed = JSON.parse(content);
          storage.data.value = { ...storage.data.value, ...parsed };
          alert('配置导入成功！');
        } catch (err) {
          alert('导入失败：文件格式错误');
        }
      }
    };
    reader.readAsText(file);
  };
  input.click();
};

// 快捷键支持 (Ctrl+B)
const handleKeydown = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key.toLowerCase() === 'b') {
    e.preventDefault();
    uiState.value.sidebarOpen = !uiState.value.sidebarOpen;
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div 
    class="booth-enhancer-sidebar"
    :class="{ 'is-open': uiState.sidebarOpen }"
    :style="{ width: uiState.sidebarWidth + 'px' }"
  >
    <!-- 调整宽度的把手 -->
    <div class="resize-handle" @mousedown="handleResizeStart"></div>

    <!-- 顶部工具栏 -->
    <div class="sidebar-header">
      <div class="tabs">
        <button 
          class="tab-btn" 
          :class="{ active: uiState.activeTab === 'tags' }"
          @click="uiState.activeTab = 'tags'"
        >
          Tag预设
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: uiState.activeTab === 'items' }"
          @click="uiState.activeTab = 'items'"
        >
          商品数据
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: uiState.activeTab === 'edit' }"
          @click="uiState.activeTab = 'edit'"
        >
          当前编辑
        </button>
      </div>
      
      <div class="actions">
        <button class="icon-btn" @click="handleImport" title="导入配置">
          <i class="icon-import"></i>
        </button>
        <button class="icon-btn" @click="handleExport" title="导出配置">
          <i class="icon-export"></i>
        </button>
        <button class="icon-btn close-btn" @click="closeSidebar">
          <i class="icon-close"></i>
        </button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="sidebar-content">
      <KeepAlive>
        <component 
          :is="uiState.activeTab === 'tags' ? TagPresetTab : 
               uiState.activeTab === 'items' ? ItemDataTab : 
               ItemEditTab"
          :api="api"
          :item-id="itemId"
        />
      </KeepAlive>
    </div>
  </div>

  <!-- 遮罩层 (在移动端或者宽度较窄时显示) -->
  <div 
    v-if="uiState.sidebarOpen" 
    class="sidebar-overlay"
    @click="closeSidebar"
  ></div>
</template>

<style scoped>
.booth-enhancer-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 20px rgba(0,0,0,0.1);
  z-index: 10000;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.booth-enhancer-sidebar.is-open {
  transform: translateX(0);
}

.resize-handle {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  cursor: ew-resize;
  background: transparent;
  transition: background 0.2s;
  z-index: 10;
}

.resize-handle:hover,
.resize-handle:active {
  background: rgba(59, 130, 246, 0.5);
}

.sidebar-header {
  height: 48px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: #f8fafc;
}

.tabs {
  display: flex;
  gap: 4px;
}

.tab-btn {
  padding: 8px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  color: #64748b;
  border-radius: 4px;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.tab-btn.active {
  background: white;
  color: #3b82f6;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.close-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  background: white;
}

.sidebar-overlay {
  display: none;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .booth-enhancer-sidebar {
    width: 85% !important;
    max-width: 400px;
  }
  
  .resize-handle {
    display: none;
  }
  
  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.3);
    z-index: 9999;
    backdrop-filter: blur(2px);
  }
}

/* 图标样式 (使用 CSS 绘制简单的图标) */
.icon-close::before { content: "×"; font-size: 20px; }
.icon-import::before { content: "↓"; }
.icon-export::before { content: "↑"; }
</style>
