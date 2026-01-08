<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import {
  Node,
  NodeTree
} from '../../../config-types';
import { ConfigStorage } from '../../../modules/ConfigStorage';
import { icons, withSize } from '../icons';

const props = withDefaults(defineProps<{
  node: Node;
  tree: NodeTree<any>;
  level?: number;
  editingNodeId?: string | null;
  showChildren?: boolean; // 是否显示子节点（列表模式下为false）
}>(), {
  showChildren: true
});

const emit = defineEmits<{
  (e: 'select', node: Node): void;
  (e: 'contextmenu', event: MouseEvent, node: Node): void;
  (e: 'rename', nodeId: string, newName: string): void;
}>();

const configStorage = ConfigStorage.getInstance();
const currentLevel = computed(() => props.level || 0);
const isDragOver = ref(false);
const dropPosition = ref<'before' | 'inside' | 'after' | null>(null);

// 内联编辑状态
const isEditing = computed(() => props.editingNodeId === props.node.id);
const editingName = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

// 计算子节点（保持用户拖拽的顺序）
const children = computed(() => {
  const allNodes = props.tree.nodes;
  return props.node.children
    .map((id: string) => allNodes[id])
    .filter(Boolean);
});

// 是否有子节点
const hasChildren = computed(() => props.node.children.length > 0);

// 展开/折叠（Unity 风格：所有节点都可以展开/折叠）
const toggleExpanded = () => {
  props.node.expanded = !props.node.expanded;
};

// 拖拽处理
const handleDragStart = (e: DragEvent) => {
  if (e.dataTransfer) {
    e.dataTransfer.setData('text/plain', props.node.id);
    e.dataTransfer.effectAllowed = 'move';
  }
};

const handleDragEnd = () => {
  isDragOver.value = false;
  dropPosition.value = null;
};

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move';
  }
  
  // 计算拖拽位置（Unity 风格的三分法）
  const element = e.currentTarget as HTMLElement;
  const rect = element.getBoundingClientRect();
  const y = e.clientY - rect.top;
  const height = rect.height;
  
  // 根据鼠标位置决定插入方式
  if (y < height * 0.25) {
    // 上1/4：插入前面
    dropPosition.value = 'before';
  } else if (y > height * 0.75) {
    // 下1/4：插入后面
    dropPosition.value = 'after';
  } else {
    // 中间1/2：作为子节点
    dropPosition.value = 'inside';
  }
  
  isDragOver.value = true;
};

const handleDragLeave = (e: DragEvent) => {
  // 检查是否真的离开了节点（不是进入子元素）
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const x = e.clientX;
  const y = e.clientY;
  
  if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
    isDragOver.value = false;
    dropPosition.value = null;
  }
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  
  const draggedNodeId = e.dataTransfer?.getData('text/plain');
  if (!draggedNodeId) {
    isDragOver.value = false;
    dropPosition.value = null;
    return;
  }
  
  // 防止拖拽到自己或自己的子节点
  if (draggedNodeId === props.node.id) {
    isDragOver.value = false;
    dropPosition.value = null;
    return;
  }
  if (isDescendant(draggedNodeId, props.node.id)) {
    isDragOver.value = false;
    dropPosition.value = null;
    return;
  }
  
  // 根据 dropPosition 执行不同的操作
  const position = dropPosition.value;
  
  if (position === 'inside') {
    // 作为子节点
    configStorage.moveNode(props.tree, draggedNodeId, props.node.id);
    // 自动展开目标节点
    if (!props.node.expanded) {
      props.node.expanded = true;
    }
  } else {
    // 插入到同级（before 或 after）
    const parentId = props.node.parentId;
    const siblingIds = parentId 
      ? props.tree.nodes[parentId].children 
      : props.tree.rootIds;
    
    const currentIndex = siblingIds.indexOf(props.node.id);
    const insertIndex = position === 'before' ? currentIndex : currentIndex + 1;
    
    configStorage.insertNodeAt(props.tree, draggedNodeId, parentId, insertIndex);
  }
  
  isDragOver.value = false;
  dropPosition.value = null;
};

// 检查 targetId 是否是 ancestorId 的后代
const isDescendant = (ancestorId: string, targetId: string): boolean => {
  let current = props.tree.nodes[targetId];
  while (current) {
    if (current.id === ancestorId) return true;
    if (!current.parentId) break;
    current = props.tree.nodes[current.parentId];
  }
  return false;
};

// 监听编辑状态变化
// 监听编辑状态变化（包括初始状态）
watch(isEditing, async (newValue) => {
  if (newValue) {
    editingName.value = props.node.name;
    await nextTick();
    // 确保输入框已经渲染并可见
    setTimeout(() => {
      if (inputRef.value) {
        inputRef.value.focus();
        inputRef.value.select();
      }
    }, 0);
  }
}, { immediate: true });

// 同时监听 editingNodeId 的变化（处理新创建节点的情况）
watch(() => props.editingNodeId, async (newId) => {
  if (newId === props.node.id) {
    editingName.value = props.node.name;
    await nextTick();
    setTimeout(() => {
      if (inputRef.value) {
        inputRef.value.focus();
        inputRef.value.select();
      }
    }, 0);
  }
});

// 内联编辑
const saveEdit = () => {
  const newName = editingName.value.trim();
  if (newName && newName !== props.node.name) {
    emit('rename', props.node.id, newName);
  } else {
    // 如果没有修改，也要触发 rename 事件来清除编辑状态
    emit('rename', props.node.id, props.node.name);
  }
};

const cancelEdit = () => {
  // 取消时也触发 rename 事件，但使用原名称
  emit('rename', props.node.id, props.node.name);
};

const handleEditKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    saveEdit();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    cancelEdit();
  }
};

// 事件转发
const handleSelect = (node: Node) => {
  emit('select', node);
};

const handleContextmenu = (event: MouseEvent, node: Node) => {
  if (isEditing.value) {
    return;
  }
  event.stopPropagation(); // 确保阻止冒泡
  emit('contextmenu', event, node);
};
</script>

<template>
  <div class="tree-item">
    <!-- 插入指示器（上方） -->
    <div 
      v-if="isDragOver && dropPosition === 'before'" 
      class="drop-indicator drop-indicator-before"
      :style="{ paddingLeft: (currentLevel * 20) + 'px' }"
    ></div>
    
    <!-- Unity 风格：统一的节点渲染 -->
    <div 
      :class="[
        'tree-node-wrapper', 
        { 
          'drag-over': isDragOver,
          'drag-over-inside': dropPosition === 'inside'
        }
      ]"
      draggable="true"
      @dragstart="handleDragStart"
      @dragend="handleDragEnd"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <!-- 节点整体容器（上下层一体） -->
      <div 
        :class="['node-item', { 'has-custom-content': $slots.default, 'is-editing': isEditing }]"
      >
        <!-- 上层：统一的图标 + 名字 -->
        <div 
          :class="['tree-node-content', { 'expanded': node.expanded, 'has-children': hasChildren }]"
          :style="{ paddingLeft: (currentLevel * 20) + 'px' }"
          @click="!isEditing && (hasChildren ? toggleExpanded() : handleSelect(node))"
          @contextmenu.prevent="handleContextmenu($event, node)"
        >
          <!-- 展开/折叠箭头（有子节点时显示） -->
          <span 
            v-if="showChildren && hasChildren"
            class="expand-icon" 
            @click.stop="!isEditing && toggleExpanded()"
            v-html="withSize(node.expanded ? icons.chevronDown : icons.chevronRight, 12)"
          ></span>
          <span v-else class="expand-icon placeholder"></span>
          
          <!-- 编辑模式 -->
          <template v-if="isEditing">
            <span 
              class="icon" 
              v-html="withSize(node.data ? icons.file : icons.folder, 16)"
              :style="{ color: node.data ? '#94a3b8' : '#fbbf24' }"
            ></span>
            <input
              ref="inputRef"
              v-model="editingName"
              class="node-name-input"
              @blur="saveEdit"
              @keydown="handleEditKeydown"
            />
          </template>
          
          <!-- 普通模式：统一渲染图标和名字 -->
          <template v-else>
            <span 
              class="icon" 
              v-html="withSize(node.data ? icons.file : icons.folder, 16)"
              :style="{ color: node.data ? '#94a3b8' : '#fbbf24' }"
            ></span>
            <span class="name">{{ node.name }}</span>
            <span v-if="hasChildren" class="count">({{ node.children.length }})</span>
            
            <!-- 上层右侧的额外内容插槽 -->
            <div v-if="$slots.header" class="node-header-extra">
              <slot name="header" :node="node" :level="currentLevel" />
            </div>
          </template>
        </div>
        
        <!-- 下层：自定义内容（插槽）- 重命名时也保持显示 -->
        <div 
          v-if="$slots.default"
          class="node-custom-content"
          :style="{ paddingLeft: (currentLevel * 20 + 36) + 'px' }"
          @contextmenu.prevent="handleContextmenu($event, node)"
        >
          <slot 
            :node="node" 
            :level="currentLevel"
          />
        </div>
      </div>
    </div>
    
    <!-- 插入指示器（下方） -->
    <div 
      v-if="isDragOver && dropPosition === 'after'" 
      class="drop-indicator drop-indicator-after"
      :style="{ paddingLeft: (currentLevel * 20) + 'px' }"
    ></div>

    <!-- 递归渲染子节点（仅在showChildren为true时） -->
    <div v-if="showChildren && node.expanded && hasChildren" class="tree-children">
      <TreeNode
        v-for="child in children"
        :key="child.id"
        :node="child"
        :tree="tree"
        :level="currentLevel + 1"
        :editing-node-id="editingNodeId"
        :show-children="showChildren"
        @select="handleSelect"
        @contextmenu="handleContextmenu"
        @rename="(nodeId, newName) => emit('rename', nodeId, newName)"
      >
        <!-- 转发所有插槽 -->
        <template v-for="(_, name) in $slots" :key="name" #[name]="slotData: any">
          <slot :name="name" v-bind="slotData || {}"></slot>
        </template>
      </TreeNode>
    </div>
  </div>
</template>

<style scoped>
.tree-item {
  user-select: none;
}

.tree-node-wrapper {
  position: relative;
  transition: all 0.15s ease;
}

.tree-node-wrapper[draggable="true"] {
  cursor: move;
}

.tree-node-wrapper:active {
  cursor: grabbing;
}

/* 拖拽悬停效果 - 仅在 inside 模式下显示 */
.tree-node-wrapper.drag-over-inside {
  background: #eff6ff;
  border-radius: 4px;
}

.tree-node-wrapper.drag-over-inside::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  border: 2px solid #3b82f6;
  border-radius: 4px;
  pointer-events: none;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Unity 风格插入指示器 */
.drop-indicator {
  position: relative;
  height: 2px;
  margin: 2px 0;
  pointer-events: none;
}

.drop-indicator::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: #3b82f6;
  box-shadow: 0 0 4px rgba(59, 130, 246, 0.5);
}

.drop-indicator::after {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #3b82f6;
  box-shadow: 0 0 4px rgba(59, 130, 246, 0.5);
}

/* 节点整体容器（上下层一体） */
.node-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  transition: background 0.15s ease;
}

/* 整体 hover（非编辑模式） */
.node-item:not(.is-editing):hover {
  background: #f3f4f6;
}

/* 上层内容 */
.tree-node-content {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  min-height: 28px;
  cursor: pointer;
}

/* 有自定义内容时，上层不要下边距 */
.node-item.has-custom-content .tree-node-content {
  padding-bottom: 2px;
}

/* 编辑模式下上层不响应鼠标 */
.node-item.is-editing .tree-node-content {
  cursor: default;
}

.tree-node-content.has-children {
  cursor: default;
}

/* 展开/折叠箭头 */
.expand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-right: 4px;
  color: #6b7280;
  flex-shrink: 0;
  transition: transform 0.2s ease;
  cursor: pointer;
}

.expand-icon.placeholder {
  visibility: hidden;
  cursor: default;
}

/* 编辑模式下箭头不可点击 */
.node-item.is-editing .expand-icon {
  cursor: default;
  opacity: 0.5;
}

.expand-icon :deep(svg) {
  width: 12px;
  height: 12px;
}

/* 图标 */
.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  flex-shrink: 0;
}

.icon :deep(svg) {
  display: block;
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

/* 下层自定义内容 */
.node-custom-content {
  padding-top: 2px;
  padding-bottom: 4px;
  padding-right: 8px;
}

/* 编辑模式下自定义内容降低不透明度 */
.node-item.is-editing .node-custom-content {
  opacity: 0.6;
  pointer-events: none;
}

/* Unity 风格内联编辑输入框 */
.node-name-input {
  flex: 1;
  padding: 2px 6px;
  border: 1px solid #3b82f6;
  border-radius: 3px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  background: #ffffff;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  line-height: 1.4;
}

.node-name-input:focus {
  border-color: #2563eb;
}

/* 名称 */
.name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: #374151;
  line-height: 1.4;
}

.count {
  font-size: 11px;
  color: #9ca3af;
  margin-left: 6px;
  font-weight: 400;
}

/* 上层右侧额外内容 */
.node-header-extra {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
