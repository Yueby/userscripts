<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  Node,
  NodeTree as TreeType
} from '../../../config-types';
import { ConfigStorage } from '../../../modules/ConfigStorage';
import { icons, withSize } from '../icons';
import TreeNode from './TreeNode.vue';

// 自定义菜单项接口
export interface ContextMenuItem {
  label: string;
  action: (node: Node | null) => void; // node 为 null 表示在空白处右键
  show?: (node: Node | null) => boolean; // 是否显示该菜单项
  separator?: boolean; // 是否在此项后显示分隔符
  danger?: boolean; // 是否为危险操作（红色）
}

const props = withDefaults(defineProps<{
  tree: TreeType<any>;
  parentId?: string | null;
  mode?: 'tree' | 'list'; // 显示模式：树形或列表
  searchPlaceholder?: string; // 搜索框占位符
  searchFilter?: (node: Node, searchText: string) => boolean; // 搜索过滤函数
  customMenuItems?: ContextMenuItem[]; // 自定义右键菜单项
  // 回调函数
  onCreateFolder?: (parentId: string | null) => string | void; // 返回新创建的节点ID
  onCreateItem?: (parentId: string | null) => string | void; // 返回新创建的节点ID
  onRename?: (nodeId: string, newName: string) => void;
  onDelete?: (nodeId: string) => Promise<void>;
  onEdit?: (nodeId: string) => void; // 编辑数据
}>(), {
  mode: 'tree'
});

const emit = defineEmits<{
  (e: 'select', node: Node): void;
}>();

const configStorage = ConfigStorage.getInstance();

// 搜索状态
const searchText = ref('');

// 是否在搜索模式
const isSearching = computed(() => searchText.value.trim().length > 0);

// 搜索结果（扁平列表）
const searchResults = computed(() => {
  if (!isSearching.value || !props.searchFilter) {
    return [];
  }
  
  const allNodes = Object.values(props.tree.nodes);
  return allNodes.filter(node => props.searchFilter!(node, searchText.value.trim()));
});

// 是否有搜索结果
const hasSearchResults = computed(() => searchResults.value.length > 0);

// 右键菜单状态
const contextMenu = ref({
  show: false,
  targetId: null as string | null,
  x: 0,
  y: 0
});

// 正在编辑的节点 ID
const editingNodeId = ref<string | null>(null);

// 计算根级别的节点（保持用户拖拽的顺序）
const rootNodes = computed(() => {
  const allNodes = props.tree.nodes;
  
  // 列表模式：只显示有数据的节点，按更新时间倒序
  if (props.mode === 'list') {
    return Object.values(allNodes)
      .filter(node => node.data) // 只要有data的节点
      .sort((a, b) => b.updatedAt - a.updatedAt); // 按更新时间倒序
  }
  
  // 树形模式：保持原有逻辑
  const ids = props.parentId 
    ? allNodes[props.parentId]?.children || []
    : props.tree.rootIds;
    
  return ids
    .map(id => allNodes[id])
    .filter(Boolean);
});

// 获取右键目标节点
const targetNode = computed(() => {
  if (!contextMenu.value.targetId) return null;
  return props.tree.nodes[contextMenu.value.targetId];
});

// 计算可见的自定义菜单项（用于节点右键）
const visibleCustomMenuItems = computed(() => {
  if (!props.customMenuItems || props.customMenuItems.length === 0) {
    return [];
  }
  return props.customMenuItems.filter(item => 
    !item.show || item.show(targetNode.value)
  );
});

// 计算可见的自定义菜单项（用于空白处右键）
const visibleCustomMenuItemsForRoot = computed(() => {
  if (!props.customMenuItems || props.customMenuItems.length === 0) {
    return [];
  }
  return props.customMenuItems.filter(item => 
    !item.show || item.show(null)
  );
});

// 计算父节点ID（基于右键目标）
const getParentId = (): string | null => {
  if (!contextMenu.value.targetId) return null; // 空白处右键，根级别
  
  const node = targetNode.value;
  if (!node) return null;
  
  // Unity 风格：右键节点默认在其内部创建
  // 用户可以通过拖拽来调整层级和顺序
  return node.id;
};

// 右键菜单处理
const showContextMenu = (event: MouseEvent, node: Node | null) => {
  contextMenu.value = {
    show: true,
    targetId: node?.id || null,
    x: event.clientX,
    y: event.clientY
  };
  
  const closeMenu = () => {
    contextMenu.value.show = false;
    document.removeEventListener('click', closeMenu);
  };
  setTimeout(() => document.addEventListener('click', closeMenu), 0);
};

// 创建文件夹（Unity 风格：直接创建并进入编辑模式）
const handleCreateFolder = () => {
  const parentId = getParentId();
  const newNodeId = props.onCreateFolder?.(parentId);
    contextMenu.value.show = false;
  
  // 如果返回了节点ID，立即激活编辑模式
  if (newNodeId) {
    editingNodeId.value = newNodeId;
  }
};

// 创建项目（Unity 风格：直接创建并进入编辑模式）
const handleCreateItem = () => {
  const parentId = getParentId();
  const newNodeId = props.onCreateItem?.(parentId);
    contextMenu.value.show = false;
  
  // 如果返回了节点ID，立即激活编辑模式
  if (newNodeId) {
    editingNodeId.value = newNodeId;
  }
};

// 编辑数据
const handleEdit = () => {
  if (!contextMenu.value.targetId) return;
  
  props.onEdit?.(contextMenu.value.targetId);
  contextMenu.value.show = false;
};

// Unity 风格重命名：触发内联编辑
const handleRename = () => {
  if (!contextMenu.value.targetId) return;
  
  editingNodeId.value = contextMenu.value.targetId;
    contextMenu.value.show = false;
};

// 处理重命名完成
const handleNodeRename = (nodeId: string, newName: string) => {
  props.onRename?.(nodeId, newName);
  editingNodeId.value = null;
};

// 删除
const handleDelete = async () => {
  if (!contextMenu.value.targetId) return;
  
  try {
    await props.onDelete?.(contextMenu.value.targetId);
    contextMenu.value.show = false;
  } catch (error) {
    // 用户取消或失败
    console.debug('Delete cancelled or failed:', error);
  }
};

// 整个树区域的拖拽处理（拖到空白区域 = 移到根目录）
const isTreeDragOver = ref(false);

const handleTreeDragOver = (e: DragEvent) => {
  // 只处理拖到空白区域的情况
  const target = e.target as HTMLElement;
  if (target.closest('.tree-node-wrapper')) {
    return; // 如果拖到节点上，不处理
  }
  
  e.preventDefault();
  e.stopPropagation();
  
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move';
  }
  
  isTreeDragOver.value = true;
};

const handleTreeDragLeave = (e: DragEvent) => {
  const target = e.target as HTMLElement;
  // 只有真正离开树区域才清除状态
  if (!target.closest('.node-tree')) {
    isTreeDragOver.value = false;
  }
};

const handleTreeDrop = (e: DragEvent) => {
  // 只处理拖到空白区域的情况
  const target = e.target as HTMLElement;
  if (target.closest('.tree-node-wrapper')) {
    return; // 如果拖到节点上，不处理
  }
  
  e.preventDefault();
  e.stopPropagation();
  
  const nodeId = e.dataTransfer?.getData('text/plain');
  if (nodeId) {
    // 移动到根目录
    configStorage.moveNode(props.tree, nodeId, props.parentId || null);
  }
  
  isTreeDragOver.value = false;
};

// 空白处右键
const handleRootContextmenu = (e: MouseEvent) => {
  // 如果点击的是节点内容，不触发根级别右键菜单
  if ((e.target as HTMLElement).closest('.tree-node-content')) {
    return;
  }
  showContextMenu(e, null);
};

// 事件转发
const handleSelect = (node: Node) => {
  emit('select', node);
};

const handleContextmenu = (event: MouseEvent, node: Node) => {
  showContextMenu(event, node);
};
</script>

<template>
  <div class="tree-wrapper">
    <!-- 搜索框 -->
    <div v-if="searchFilter" class="tree-search">
      <span class="search-icon" v-html="withSize(icons.search, 14)"></span>
      <input 
        v-model="searchText"
        type="text" 
        :placeholder="searchPlaceholder || '搜索...'"
        class="search-input"
      />
    </div>

    <!-- 搜索结果 -->
    <div v-if="isSearching" class="search-results">
      <div v-if="hasSearchResults" class="search-results-list">
        <TreeNode
          v-for="node in searchResults"
          :key="node.id"
          :node="node"
          :tree="tree"
          :level="0"
          :editing-node-id="editingNodeId"
          :show-children="false"
          @select="handleSelect"
          @contextmenu="handleContextmenu"
          @rename="handleNodeRename"
        >
          <!-- 转发所有插槽 -->
          <template v-for="(_, name) in $slots" v-slot:[name]="slotData">
            <slot :name="name" v-bind="slotData || {}"></slot>
          </template>
        </TreeNode>
      </div>
      <div v-else class="search-empty">
        没有找到匹配的结果
      </div>
    </div>

    <!-- 树形结构 -->
    <div 
      v-else
      :class="['node-tree', { 'tree-drag-over': isTreeDragOver }]"
      @contextmenu.prevent="handleRootContextmenu"
      @dragover="handleTreeDragOver"
      @dragleave="handleTreeDragLeave"
      @drop="handleTreeDrop"
    >
    <!-- 空状态提示 -->
    <div 
      v-if="rootNodes.length === 0" 
      class="empty-state"
    >
      暂无数据，右键新建
    </div>

    <!-- 根节点列表 -->
      <div v-else class="tree-content">
        <TreeNode
        v-for="node in rootNodes"
        :key="node.id"
        :node="node"
        :tree="tree"
        :level="0"
          :editing-node-id="editingNodeId"
          :show-children="mode === 'tree'"
        @select="handleSelect"
        @contextmenu="handleContextmenu"
          @rename="handleNodeRename"
      >
        <!-- 转发所有插槽 -->
        <template v-for="(_, name) in $slots" v-slot:[name]="slotData">
          <slot :name="name" v-bind="slotData || {}"></slot>
        </template>
        </TreeNode>
      </div>
    </div>

    <!-- 右键菜单 -->
    <Teleport to="body">
      <div
        v-if="contextMenu.show"
        class="context-menu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      >
        <!-- Unity 风格：统一的节点菜单 -->
        <template v-if="targetNode">
          <div v-if="mode === 'tree'" class="menu-item" @click="handleCreateFolder">新建文件夹节点</div>
          <div class="menu-item" @click="handleCreateItem">新建数据节点</div>
          <div class="menu-separator"></div>
          <div class="menu-item" @click="handleRename">重命名</div>
          <div v-if="targetNode.data && onEdit" class="menu-item" @click="handleEdit">编辑数据</div>
          
          <!-- 自定义菜单项（节点右键） -->
          <div v-if="visibleCustomMenuItems.length > 0" class="menu-separator"></div>
          <template v-for="(item, index) in visibleCustomMenuItems" :key="index">
            <div 
              :class="['menu-item', { 'menu-item-danger': item.danger }]" 
              @click="() => { item.action(targetNode); contextMenu.show = false; }"
            >
              {{ item.label }}
            </div>
            <div v-if="item.separator" class="menu-separator"></div>
          </template>
          
          <div class="menu-separator"></div>
          <div class="menu-item menu-item-danger" @click="handleDelete">删除</div>
        </template>
        
        <!-- 空白处菜单（根级别） -->
        <template v-else>
          <div v-if="mode === 'tree'" class="menu-item" @click="handleCreateFolder">新建文件夹节点</div>
          <div class="menu-item" @click="handleCreateItem">新建数据节点</div>
          
          <!-- 自定义菜单项（空白处右键） -->
          <div v-if="visibleCustomMenuItemsForRoot.length > 0" class="menu-separator"></div>
          <template v-for="(item, index) in visibleCustomMenuItemsForRoot" :key="index">
            <div 
              :class="['menu-item', { 'menu-item-danger': item.danger }]" 
              @click="() => { item.action(null); contextMenu.show = false; }"
            >
              {{ item.label }}
            </div>
            <div v-if="item.separator" class="menu-separator"></div>
          </template>
        </template>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.tree-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* 搜索框 */
.tree-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.search-icon {
  display: flex;
  align-items: center;
  color: #9ca3af;
}

.search-icon :deep(svg) {
  width: 14px;
  height: 14px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 12px;
  color: #374151;
}

.search-input::placeholder {
  color: #9ca3af;
}

/* 搜索结果 */
.search-results {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.search-results-list {
  /* 直接使用 TreeNode 组件，无需额外样式 */
}

.search-empty {
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}

/* 树形结构 */
.node-tree {
  user-select: none;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  position: relative;
}

.tree-content {
  position: relative;
  z-index: 1;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
  border: 1px dashed #cbd5e1;
  border-radius: 4px;
  margin: 8px;
  transition: all 0.15s ease;
}

/* 右键菜单 */
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  min-width: 140px;
  overflow: hidden;
  padding: 4px 0;
}

.menu-item {
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 12px;
  color: #374151;
  display: flex;
  align-items: center;
}

.menu-item:hover {
  background: #f3f4f6;
}

.menu-item-danger {
  color: #ef4444;
}

.menu-item-danger:hover {
  background: #fef2f2;
  color: #dc2626;
}

.menu-separator {
  height: 1px;
  min-height: 1px;
  max-height: 1px;
  background: #e5e7eb;
  margin: 4px 0;
  font-size: 0;
  line-height: 0;
}
</style>
