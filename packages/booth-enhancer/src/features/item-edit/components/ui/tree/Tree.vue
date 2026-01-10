<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import {
  Node,
  NodeTree as TreeType
} from '../../../config-types';
import { ConfigStorage } from '../../../modules/ConfigStorage';
import type { MenuItem } from '../ContextMenu.vue';
import ContextMenu from '../ContextMenu.vue';
import TreeNode from './TreeNode.vue';

// 自定义菜单项接口
export interface ContextMenuItem {
  label: string;
  action: (node: Node | null, selection: Node[]) => void; // selection 为当前选中的所有节点
  show?: (node: Node | null, selection: Node[]) => boolean; // 是否显示该菜单项
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
  // 选择功能
  selectable?: boolean; // 是否启用选择功能
  selectableFilter?: (node: Node) => boolean; // 节点选择过滤函数
  // 回调函数
  onCreateFolder?: (parentId: string | null) => string | void; // 返回新创建的节点ID
  onCreateItem?: (parentId: string | null) => string | void; // 返回新创建的节点ID
  onRename?: (nodeId: string, newName: string) => void;
  onDelete?: (nodeId: string) => Promise<void>;
  onEdit?: (nodeId: string) => void; // 编辑数据
}>(), {
  mode: 'tree',
  selectable: true
});

const emit = defineEmits<{
  (e: 'selectionChange', nodes: Node[]): void;
}>();

const configStorage = ConfigStorage.getInstance();

// 搜索状态
const searchText = ref('');

// 选择状态管理（Unity 风格）
const selection = ref<Set<string>>(new Set());
const activeNodeId = ref<string | null>(null); // 当前活动节点（最后点击的）
const anchorNodeId = ref<string | null>(null); // 范围选择的锚点

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

// DOM 引用
const treeRootRef = ref<HTMLElement | null>(null);

// 全局点击处理 - 点击外部取消选择
const handleGlobalClick = (e: MouseEvent) => {
  // 必须开启选择功能且有选中项
  if (!props.selectable || selection.value.size === 0) return;
  
  // 如果 Tree 已经被卸载或不可见，不处理
  if (!treeRootRef.value) return;
  
  // 检查点击目标是否在当前 Tree 组件内部
  // 如果点击的是 Tree 内部，已经在 handleTreeClick 中处理了（或者被 stopPropagation 了）
  // 注意：Node 类型冲突，使用 HTMLElement 替代
  if (treeRootRef.value.contains(e.target as HTMLElement)) return;
  
  // 点击了外部，清除选择
  clearSelection();
};

onMounted(() => {
  document.addEventListener('click', handleGlobalClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick);
});

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

// 获取可见的自定义菜单项
function getVisibleCustomMenuItems(node: Node | null): ContextMenuItem[] {
  if (!props.customMenuItems || props.customMenuItems.length === 0) {
    return [];
  }
  const selectedNodes = getSelectedNodes();
  return props.customMenuItems.filter(item => 
    !item.show || item.show(node, selectedNodes)
  );
}

// 计算可见的自定义菜单项（用于节点右键）
const visibleCustomMenuItems = computed(() => 
  getVisibleCustomMenuItems(targetNode.value)
);

// 计算可见的自定义菜单项（用于空白处右键）
const visibleCustomMenuItemsForRoot = computed(() => 
  getVisibleCustomMenuItems(null)
);

// 添加自定义菜单项到列表
function appendCustomMenuItems(
  items: MenuItem[],
  customItems: ContextMenuItem[],
  node: Node | null,
  selectedNodes: Node[]
): void {
  if (customItems.length === 0) return;
  
  if (items.length > 0) {
    items[items.length - 1].separator = true;
  }
  
  customItems.forEach(item => {
    items.push({
      label: item.label,
      action: () => item.action(node, selectedNodes),
      danger: item.danger,
      separator: item.separator
    });
  });
}

// 添加基础创建菜单项
function addBaseCreateItems(items: MenuItem[]): void {
  if (props.mode === 'tree') {
    items.push({
      label: '新建文件夹节点',
      action: handleCreateFolder
    });
  }
  items.push({
    label: '新建数据节点',
    action: handleCreateItem,
    separator: true
  });
}

// 构建菜单项列表（转换为通用 MenuItem 格式）
const menuItems = computed<MenuItem[]>(() => {
  const items: MenuItem[] = [];
  const selectedNodes = getSelectedNodes();
  
  // 添加基础创建菜单
  addBaseCreateItems(items);
  
  if (targetNode.value) {
    // 节点右键菜单
    items.push({
      label: '重命名',
      action: handleRename
    });
    
    if (targetNode.value.data && props.onEdit) {
      items.push({
        label: '编辑',
        action: handleEdit
      });
    }
    
    // 自定义菜单项
    appendCustomMenuItems(items, visibleCustomMenuItems.value, targetNode.value, selectedNodes);
    
    // 删除按钮
    if (items.length > 0) {
      items[items.length - 1].separator = true;
    }
    items.push({
      label: '删除',
      action: handleDelete,
      danger: true
    });
  } else {
    // 空白处右键菜单 - 只有自定义菜单项
    appendCustomMenuItems(items, visibleCustomMenuItemsForRoot.value, null, selectedNodes);
  }
  
  return items;
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
};

// 创建文件夹（Unity 风格：直接创建并进入编辑模式）
const handleCreateFolder = () => {
  const parentId = getParentId();
  const newNodeId = props.onCreateFolder?.(parentId);
  
  // 如果返回了节点ID，立即激活编辑模式
  if (newNodeId) {
    editingNodeId.value = newNodeId;
  }
};

// 创建项目（Unity 风格：直接创建并进入编辑模式）
const handleCreateItem = () => {
  const parentId = getParentId();
  const newNodeId = props.onCreateItem?.(parentId);
  
  // 如果返回了节点ID，立即激活编辑模式
  if (newNodeId) {
    editingNodeId.value = newNodeId;
  }
};

// 编辑数据
const handleEdit = () => {
  if (!contextMenu.value.targetId) return;
  props.onEdit?.(contextMenu.value.targetId);
};

// Unity 风格重命名：触发内联编辑
const handleRename = () => {
  if (!contextMenu.value.targetId) return;
  editingNodeId.value = contextMenu.value.targetId;
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

// 空白处点击 - 取消所有选择
const handleTreeClick = (e: MouseEvent) => {
  // 如果点击的不是节点项（.node-item），取消所有选择
  const target = e.target as HTMLElement;
  if (!target.closest('.node-item')) {
    if (selection.value.size > 0) {
      clearSelection();
    }
  }
};

// 获取视觉顺序的所有可见节点（用于 Shift 范围选择）
const getVisibleNodes = (): Node[] => {
  const result: Node[] = [];
  
  const traverse = (nodeIds: string[]) => {
    for (const id of nodeIds) {
      const node = props.tree.nodes[id];
      if (!node) continue;
      
      result.push(node);
      
      // 如果节点展开且有子节点，递归遍历
      if (node.expanded && node.children.length > 0) {
        traverse(node.children);
      }
    }
  };
  
  // 从根节点开始遍历
  if (props.mode === 'list') {
    result.push(...rootNodes.value);
  } else if (isSearching.value) {
    result.push(...searchResults.value);
  } else {
    traverse(props.parentId ? props.tree.nodes[props.parentId]?.children || [] : props.tree.rootIds);
  }
  
  return result;
};

// 获取所有选中的节点对象
const getSelectedNodes = (): Node[] => {
  // 保持插入顺序可能更好，但 Set 是按插入顺序的
  // 如果需要按树的顺序，可以使用 getVisibleNodes 过滤
  return Array.from(selection.value)
    .map(id => props.tree.nodes[id])
    .filter(Boolean);
};

// 发射选择变更事件
const emitSelectionChange = () => {
  const selectedNodes = getSelectedNodes();
  emit('selectionChange', selectedNodes);
};

// 统一的选择处理
const handleSelection = (node: Node, event?: MouseEvent) => {
  // 检查节点是否可选择
  if (props.selectableFilter && !props.selectableFilter(node)) {
    return;
  }

  const isCtrl = event?.ctrlKey || event?.metaKey;
  const isShift = event?.shiftKey;
  
  const newSelection = new Set(selection.value); // 复制当前选择

  if (isShift && anchorNodeId.value) {
    // Shift 范围选择
    const visibleNodes = getVisibleNodes();
    const anchorIndex = visibleNodes.findIndex(n => n.id === anchorNodeId.value);
    const currentIndex = visibleNodes.findIndex(n => n.id === node.id);

    if (anchorIndex !== -1 && currentIndex !== -1) {
      newSelection.clear(); // 重置选择
      const startIndex = Math.min(anchorIndex, currentIndex);
      const endIndex = Math.max(anchorIndex, currentIndex);
      
      for (let i = startIndex; i <= endIndex; i++) {
        const n = visibleNodes[i];
        if (!props.selectableFilter || props.selectableFilter(n)) {
          newSelection.add(n.id);
        }
      }
      activeNodeId.value = node.id;
    }
  } else if (isCtrl) {
    // Ctrl 切换选择
    if (newSelection.has(node.id)) {
      newSelection.delete(node.id);
      if (activeNodeId.value === node.id) {
        activeNodeId.value = null; // 取消激活
      }
    } else {
      newSelection.add(node.id);
      activeNodeId.value = node.id;
      anchorNodeId.value = node.id;
    }
  } else {
    // 单选
    newSelection.clear();
    newSelection.add(node.id);
    activeNodeId.value = node.id;
    anchorNodeId.value = node.id;
  }
  
  selection.value = newSelection; // 赋值新 Set 触发更新
  emitSelectionChange();
};

// 清除选择
const clearSelection = () => {
  selection.value = new Set();
  activeNodeId.value = null;
  anchorNodeId.value = null;
  emitSelectionChange();
};

const handleContextmenu = (event: MouseEvent, node: Node) => {
  // 如果右键点击的节点不在当前选中列表中，则改为选中该节点（单选）
  if (!selection.value.has(node.id)) {
    handleSelection(node);
  }
  showContextMenu(event, node);
};
</script>

<template>
  <div class="tree-wrapper" ref="treeRootRef">
    <!-- 搜索框 -->
    <div v-if="searchFilter" class="tree-search">
      <input 
        v-model="searchText"
        type="text" 
        :placeholder="searchPlaceholder || '搜索...'"
        class="search-input"
      />
      <!-- 右侧工具栏插槽 -->
      <div v-if="$slots.toolbar" class="tree-search-toolbar">
        <slot name="toolbar" />
      </div>
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
          :selection="selection"
          :active-node-id="activeNodeId"
          :selectable="selectable"
          :selectable-filter="selectableFilter"
          @select="handleSelection"
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
      @click="handleTreeClick"
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
          :selection="selection"
          :active-node-id="activeNodeId"
          :selectable="selectable"
          :selectable-filter="selectableFilter"
          @select="handleSelection"
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
    <ContextMenu
      :show="contextMenu.show"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :items="menuItems"
      @close="contextMenu.show = false"
    />
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

/* 自定义操作栏 */
.tree-toolbar {
  padding: 8px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 12px;
  color: #374151;
}

.tree-search-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
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

.search-empty {
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}

.tree-toolbar {
  padding: 8px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  background: #fff;
  min-height: 40px;
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
</style>
