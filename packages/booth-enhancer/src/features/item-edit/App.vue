<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref, watch } from 'vue';
import type { ItemEditAPI } from '../../api/item-edit';
import { IconButton, TabBar, toast } from './components/ui';
import { icons } from './components/ui/icons';
import { ConfigStorage } from './modules/ConfigStorage';
import './styles/index.css';

const props = defineProps<{
  api: ItemEditAPI;
  itemId: string;
}>();

// 异步加载标签页组件
const TagPresetTab = defineAsyncComponent(() => import('./components/tabs/TagPresetTab.vue'));
const ItemDataTab = defineAsyncComponent(() => import('./components/tabs/ItemDataTab.vue'));
const TemplateTab = defineAsyncComponent(() => import('./components/tabs/TemplateTab.vue'));

const storage = ConfigStorage.getInstance();
const uiState = computed(() => storage.data.value.ui);

// 根元素引用（用于 Toast 容器）
const sidebarRef = ref<HTMLElement | null>(null);

// 标签页配置
const tabs = [
  { id: 'tags', label: 'Tag预设' },
  { id: 'items', label: '商品数据' },
  { id: 'templates', label: '模板配置' }
];

// 监听侧边栏开关状态
watch(() => uiState.value.sidebarOpen, (isOpen) => {
  const panelRoot = document.getElementById('booth-enhancer-panel-root');
  const toggleBtn = document.querySelector('.booth-enhancer-toggle');
  
  if (panelRoot) {
    if (isOpen) {
      panelRoot.classList.add('panel-open');
    } else {
      panelRoot.classList.remove('panel-open');
    }
  }
  
  if (toggleBtn) {
    toggleBtn.innerHTML = isOpen ? icons.chevronRight : icons.chevronLeft;
  }
});

const closeSidebar = () => {
  uiState.value.sidebarOpen = false;
};

// 导出/导入功能
const handleExport = () => {
  try {
    const json = JSON.stringify(storage.data.value, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booth-enhancer-config-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    toast.error('导出失败');
  }
};

const handleImport = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = async (e) => {
    try {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      const data = JSON.parse(text);
      
      // 验证数据格式
      if (!data.tagTree || !data.itemTree) {
        throw new Error('无效的配置文件格式');
      }

      // 恢复数据
      storage.data.value = data;
      toast.success('导入成功');
    } catch (error) {
      console.error('导入失败:', error);
      toast.error('导入失败：' + (error as Error).message);
    }
  };
  input.click();
};

// 设置 Toast 容器
onMounted(() => {
  if (sidebarRef.value) {
    toast.setContainer(sidebarRef.value);
  }
});

onUnmounted(() => {
  toast.setContainer(null);
});
</script>

<template>
  <div ref="sidebarRef" class="booth-enhancer-sidebar">
    <!-- 标签栏（包含操作按钮） -->
    <TabBar
      :active-tab="uiState.activeTab"
      :tabs="tabs"
      @update:active-tab="(val) => uiState.activeTab = val as 'tags' | 'items' | 'templates'"
    >
      <template #actions>
        <IconButton :icon="icons.upload" title="导出配置" @click="handleExport" />
        <IconButton :icon="icons.download" title="导入配置" @click="handleImport" />
        <IconButton :icon="icons.close" title="关闭" @click="closeSidebar" />
      </template>
    </TabBar>

    <!-- 内容区 -->
    <div class="sidebar-content">
      <KeepAlive>
        <component
          :is="uiState.activeTab === 'tags' ? TagPresetTab : uiState.activeTab === 'items' ? ItemDataTab : TemplateTab"
          :api="props.api"
        />
      </KeepAlive>
    </div>
  </div>
</template>

<style scoped>
.booth-enhancer-sidebar {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid #e0e0e0;
  border-radius: 12px 0 0 12px;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
  font-size: 12px;
  color: #333;
  overflow: hidden;
}

.sidebar-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #fff;
  min-height: 0;
}
</style>
