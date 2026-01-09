<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref, watch } from 'vue';
import type { ItemEditAPI } from '../../api/item-edit';
import { IconButton, TabBar, toast } from './components/ui';
import type { MenuItem } from './components/ui/ContextMenu.vue';
import ContextMenu from './components/ui/ContextMenu.vue';
import { icons, withSize } from './components/ui/icons';
import { ConfigStorage } from './modules/ConfigStorage';
import './styles/index.css';

const props = defineProps<{
  api: ItemEditAPI;
  itemId: string;
}>();

// 异步加载标签页组件
const TagTab = defineAsyncComponent(() => import('./components/tabs/TagTab.vue'));
const ItemTab = defineAsyncComponent(() => import('./components/tabs/ItemTab.vue'));
const EditTab = defineAsyncComponent(() => import('./components/tabs/EditTab.vue'));

const storage = ConfigStorage.getInstance();
const uiState = computed(() => storage.data.value.ui);

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

// 菜单项配置
const menuItems = computed<MenuItem[]>(() => [
  {
    label: '导出配置',
    icon: withSize(icons.upload, 14),
    action: handleExport
  },
  {
    label: '导入配置',
    icon: withSize(icons.download, 14),
    action: handleImport
  }
]);

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
      @update:active-tab="(val) => uiState.activeTab = val as 'tags' | 'items' | 'edit'"
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
      <Transition name="tab-slide" mode="out-in">
        <KeepAlive>
          <component
            :is="uiState.activeTab === 'tags' ? TagTab : uiState.activeTab === 'items' ? ItemTab : EditTab"
            :key="uiState.activeTab"
            :api="props.api"
          />
        </KeepAlive>
      </Transition>
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
