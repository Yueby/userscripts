<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref, watch } from 'vue';
import type { ItemEditAPI } from '../../api/item-edit';
import { IconButton, TabBar, toast } from './components/ui';
import type { MenuItem } from './components/ui/ContextMenu.vue';
import ContextMenu from './components/ui/ContextMenu.vue';
import { icons, withSize } from './components/ui/icons';
import { useStorage } from './composables';
import './styles/index.css';
import { downloadJSON, downloadZIP, readJSONFile, readZIPFile, triggerFileInput } from './utils/exportHelper';

const props = defineProps<{
  api: ItemEditAPI;
  itemId: string;
}>();

// 异步加载标签页组件
const TagTab = defineAsyncComponent(() => import('./components/tabs/TagTab.vue'));
const ItemTab = defineAsyncComponent(() => import('./components/tabs/ItemTab.vue'));
const EditTab = defineAsyncComponent(() => import('./components/tabs/EditTab.vue'));

const { 
  data,
  exportTags, 
  exportItems, 
  exportTemplates, 
  exportAllItems, 
  importAllFromZip,
  importTags,
  importItems
} = useStorage();

// 获取当前 Tab 组件
function getTabComponent() {
  const activeTab = data.value.ui.activeTab;
  switch (activeTab) {
    case 'tags':
      return TagTab;
    case 'items':
      return ItemTab;
    case 'edit':
      return EditTab;
    default:
      return TagTab;
  }
}

// 根元素引用（用于 Toast 容器）
const sidebarRef = ref<HTMLElement | null>(null);

// 下拉菜单状态
const showMenu = ref(false);
const menuPosition = ref({ x: 0, y: 0 });

// 标签页配置
const tabs = [
  { id: 'tags', label: '标签' },
  { id: 'items', label: '商品' },
  { id: 'edit', label: '编辑' }
];

// 监听侧边栏开关状态
watch(() => data.value.ui.sidebarOpen, (isOpen) => {
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
  data.value.ui.sidebarOpen = false;
};

// 处理 Tab 切换
const handleTabChange = (tab: string) => {
  data.value.ui.activeTab = tab as 'tags' | 'items' | 'edit';
};

// 生成时间戳（用于文件名）
function generateTimestamp(): string {
  return new Date().toISOString().slice(0, 10);
}

// 导出/导入功能
const handleExport = async () => {
  try {
    const files: Record<string, any> = {
      'tags.json': exportTags(),
      'items.json': exportItems(),
      'templates.json': exportTemplates()
    };
    
    const allItems = exportAllItems();
    for (const [itemId, config] of Object.entries(allItems)) {
      files[`item-${itemId}.json`] = config;
    }
    
    await downloadZIP(files, `booth-backup-${generateTimestamp()}.zip`);
    toast.success('导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    toast.error('导出失败：' + (error as Error).message);
  }
};

const handleImport = () => {
  triggerFileInput('.zip,application/zip', async (file) => {
    try {
      const files = await readZIPFile(file);
      importAllFromZip(files);
      toast.success('导入成功');
    } catch (error) {
      console.error('导入失败:', error);
      toast.error('导入失败：' + (error as Error).message);
    }
  });
};

// 切换下拉菜单
const toggleMenu = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  menuPosition.value = {
    x: rect.left - 100,
    y: rect.bottom + 4
  };
  showMenu.value = !showMenu.value;
};

// 关闭菜单
const closeMenu = () => {
  showMenu.value = false;
};

// 导出当前 Tab 数据
function handleTabExport() {
  const activeTab = data.value.ui.activeTab;
  if (activeTab === 'edit') return;
  
  try {
    const timestamp = generateTimestamp();
    const exportData = activeTab === 'tags' ? exportTags() : exportItems();
    const fileName = `booth-${activeTab}-${timestamp}.json`;
    
    downloadJSON(exportData, fileName);
    toast.success(`${currentTabLabel.value}数据导出成功`);
  } catch (error) {
    console.error('导出失败:', error);
    toast.error('导出失败：' + (error as Error).message);
  }
}

// 导入当前 Tab 数据
function handleTabImport() {
  const activeTab = data.value.ui.activeTab;
  if (activeTab === 'edit') return;
  
  triggerFileInput('.json,application/json', async (file) => {
    try {
      const importData = await readJSONFile(file);
      
      if (activeTab === 'tags') {
        importTags(importData);
      } else {
        importItems(importData);
      }
      
      toast.success(`${currentTabLabel.value}数据导入成功`);
    } catch (error) {
      console.error('导入失败:', error);
      toast.error('导入失败：' + (error as Error).message);
    }
  });
}

// 获取当前 Tab 名称
const currentTabLabel = computed(() => {
  switch (data.value.ui.activeTab) {
    case 'tags': return '标签';
    case 'items': return '商品';
    case 'edit': return '编辑';
    default: return '';
  }
});

// 菜单项配置
const menuItems = computed<MenuItem[]>(() => {
  const isEditTab = data.value.ui.activeTab === 'edit';
  
  return [
    {
      label: '导出完整备份 (ZIP)',
      icon: withSize(icons.upload, 14),
      action: handleExport
    },
    {
      label: '导入完整备份 (ZIP)',
      icon: withSize(icons.download, 14),
      action: handleImport
    },
    {
      label: '-',
      icon: '',
      action: () => {}
    },
    {
      label: `导出${currentTabLabel.value}数据 (JSON)`,
      icon: withSize(icons.upload, 14),
      action: handleTabExport,
      disabled: isEditTab
    },
    {
      label: `导入${currentTabLabel.value}数据 (JSON)`,
      icon: withSize(icons.download, 14),
      action: handleTabImport,
      disabled: isEditTab
    }
  ];
});

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
      :active-tab="data.ui.activeTab"
      :tabs="tabs"
      @update:active-tab="handleTabChange"
    >
      <template #actions>
        <IconButton :icon="icons.moreVertical" title="更多操作" @click="toggleMenu" />
        <IconButton :icon="icons.close" title="关闭" @click="closeSidebar" />
      </template>
    </TabBar>

    <!-- 下拉菜单 -->
    <ContextMenu
      :show="showMenu"
      :x="menuPosition.x"
      :y="menuPosition.y"
      :items="menuItems"
      @close="closeMenu"
    />

    <!-- 内容区 -->
    <div class="sidebar-content">
      <component
        :is="getTabComponent()"
        :key="data.ui.activeTab + '-' + Date.now()"
        :api="props.api"
      />
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
  position: relative;
}

/* Tab 切换动画 */
.tab-slide-enter-active {
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
}

.tab-slide-leave-active {
  transition: opacity 0.15s ease-in, transform 0.15s ease-in;
}

.tab-slide-enter-from {
  opacity: 0;
  transform: translateX(15px);
}

.tab-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.tab-slide-enter-to,
.tab-slide-leave-from {
  opacity: 1;
  transform: translateX(0);
}

/* 确保过渡元素占满容器 */
.sidebar-content > * {
  width: 100%;
  height: 100%;
}
</style>
