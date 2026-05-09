<script setup lang="ts">
import { computed } from 'vue';
import type { ItemEditAPI } from '../../../../api/item-edit';
import { tagSearchFilter, useStorage, useTreeTab } from '../../composables';
import { Node } from '../../config-types';
import { icons, withSize } from '../ui/icons';
import Modal from '../ui/Modal.vue';
import type { ContextMenuItem } from '../ui/tree/Tree.vue';
import Tree from '../ui/tree/Tree.vue';

const props = defineProps<{
  api: ItemEditAPI;
}>();

// 使用 Composables
const { data, createNode, renameNode } = useStorage();

// 树形数据
const tree = computed(() => data.value.tagTree);

// 检查节点本身是否包含标签
function hasTags(node: Node | null): boolean {
  if (!node) return false;
  return node.data?.tags && Array.isArray(node.data.tags) && node.data.tags.length > 0;
}

// 检查节点是否有子节点
function hasChildren(node: Node | null): boolean {
  return Boolean(node?.children && node.children.length > 0);
}

// 递归检查节点是否包含标签（包括子节点）
function hasTagsRecursive(node: Node | null): boolean {
  if (!node) return false;
  
  const nodeHasTags = hasTags(node);
  if (nodeHasTags) return true;
  
  if (!hasChildren(node)) return false;
  
  return node.children!.some((childId: string) => {
    const childNode = tree.value.nodes[childId];
    return childNode && hasTagsRecursive(childNode);
  });
}

// 检查节点是否应该显示递归选项（有子节点且子节点有标签）
function shouldShowRecursiveOption(node: Node | null, selection?: Node[]): boolean {
  if (selection && selection.length > 0) {
    return selection.some(n => hasChildren(n) && hasTagsRecursive(n));
  }
  return hasChildren(node) && hasTagsRecursive(node);
}

// 提取单个节点的标签（不递归）
function extractTagsFromNode(node: Node, tagsSet: Set<string>): void {
  if (node.data?.tags && Array.isArray(node.data.tags)) {
    node.data.tags.forEach((tag: string) => tagsSet.add(tag));
  }
}

// 递归提取节点及其子节点的所有标签
function extractTagsRecursive(node: Node, tagsSet: Set<string>): void {
  extractTagsFromNode(node, tagsSet);
  
  if (node.children && node.children.length > 0) {
    node.children.forEach((childId: string) => {
      const childNode = tree.value.nodes[childId];
      if (childNode) {
        extractTagsRecursive(childNode, tagsSet);
      }
    });
  }
}

// 自定义右键菜单项（导出/导入功能已移至顶栏菜单）
const customMenuItems = computed<ContextMenuItem[]>(() => [
  {
    label: '应用当前节点标签',
    action: (node, selection) => {
      const tagsToApply = new Set<string>();

      if (selection && selection.length > 0) {
        selection.forEach(n => extractTagsFromNode(n, tagsToApply));
      } else if (node) {
        extractTagsFromNode(node, tagsToApply);
      }

      if (tagsToApply.size > 0) {
        props.api.addTags(Array.from(tagsToApply));
      }
    },
    show: (node, selection) => {
      if (selection && selection.length > 0) {
        return selection.some(hasTags);
      }
      return hasTags(node);
    },
  },
  {
    label: '应用所有标签（递归）',
    action: (node, selection) => {
      const tagsToApply = new Set<string>();

      if (selection && selection.length > 0) {
        selection.forEach(n => extractTagsRecursive(n, tagsToApply));
      } else if (node) {
        extractTagsRecursive(node, tagsToApply);
      }

      if (tagsToApply.size > 0) {
        props.api.addTags(Array.from(tagsToApply));
      }
    },
    show: shouldShowRecursiveOption,
    separator: true,
  },
  {
    label: '移除当前节点标签',
    action: (node, selection) => {
      const tagsToRemove = new Set<string>();

      if (selection && selection.length > 0) {
        selection.forEach(n => extractTagsFromNode(n, tagsToRemove));
      } else if (node) {
        extractTagsFromNode(node, tagsToRemove);
      }

      if (tagsToRemove.size > 0) {
        props.api.removeTags(Array.from(tagsToRemove));
      }
    },
    show: (node, selection) => {
      if (selection && selection.length > 0) {
        return selection.some(hasTags);
      }
      return hasTags(node);
    },
    danger: true,
  },
  {
    label: '移除所有标签（递归）',
    action: (node, selection) => {
      const tagsToRemove = new Set<string>();

      if (selection && selection.length > 0) {
        selection.forEach(n => extractTagsRecursive(n, tagsToRemove));
      } else if (node) {
        extractTagsRecursive(node, tagsToRemove);
      }

      if (tagsToRemove.size > 0) {
        props.api.removeTags(Array.from(tagsToRemove));
      }
    },
    show: shouldShowRecursiveOption,
    danger: true,
  },
]);

// 删除单个标签
const handleDeleteTag = (node: Node, tagIndex: number) => {
  const tags = node.data?.tags;
  if (tags && Array.isArray(tags)) {
    const newTags = [...tags];
    newTags.splice(tagIndex, 1);
    
    // 更新节点数据
    node.data = { tags: newTags };
  }
};

// 解析标签文本，支持 JSON 数组和普通文本
const parseTags = (tagsText: string): string[] => {
  const trimmed = tagsText.trim();
  
  // 尝试解析为 JSON 数组
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map(tag => String(tag).trim())
          .filter(tag => tag.length > 0);
      }
    } catch (e) {
      // JSON 解析失败，继续尝试普通文本解析
      console.warn('JSON 解析失败，尝试普通文本解析:', e);
    }
  }
  
  // 普通文本解析：支持逗号、换行分隔（保留空格）
  return trimmed
    .split(/[,\n]+/)
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
};

// === 树操作回调（传递给 Tree） ===
// 使用 TreeTab composable 处理基础树操作
const treeTab = useTreeTab({
  tree: () => data.value.tagTree,
  onCreateFolder: (parentId) => {
    const newNode = createNode(tree.value, '新建文件夹', undefined, parentId);
  return newNode.id;
  },
  onCreateItem: (parentId) => {
    const tagData = { tags: [] };
    const newNode = createNode(tree.value, '新建 Tag 预设', tagData, parentId);
  return newNode.id;
  },
  onEditItem: async (nodeId) => {
    const node = data.value.tagTree.nodes[nodeId];
  if (!node || !node.data) return;
  
    const result = await treeTab.modal.openModal({
    type: 'createTag',
    title: '编辑 Tag 预设',
    formData: {
      name: node.name,
      tagsText: node.data.tags.join('\n')
    }
  });
  
  if (result && result.name && result.tagsText) {
    const tags = parseTags(result.tagsText);
    if (tags.length > 0) {
        renameNode(tree.value, nodeId, result.name.trim());
      node.data.tags = tags;
    }
  }
  }
});
</script>

<template>
  <div class="tag-preset-tab">
    <!-- 文件树（内置搜索） -->
    <Tree
      :tree="treeTab.tree.value"
      search-placeholder="搜索 Tag..."
      :search-filter="tagSearchFilter"
      :custom-menu-items="customMenuItems"
      :on-create-folder="treeTab.handleCreateFolder"
      :on-create-item="treeTab.handleCreateItem"
      :on-rename="treeTab.handleRename"
      :on-delete="treeTab.handleDelete"
      :on-edit="treeTab.handleEditItem"
      @selection-change="treeTab.handleSelect"
    >
      
      <!-- 下层：Tag 标签列表（仅 Tag 预设显示） -->
      <template #default="{ node }">
        <div v-if="node.data?.tags" class="tag-custom-content">
            <div class="tag-badges-wrapper">
              <span 
                v-for="(tag, index) in node.data.tags" 
                :key="index" 
                class="tag-badge"
              >
                <span class="tag-text">{{ tag }}</span>
                <button 
                  class="tag-delete-btn"
                  @click.stop="handleDeleteTag(node, index as number)"
                  title="删除此标签"
                >
                  <span v-html="withSize(icons.close, 12)"></span>
                </button>
              </span>
            </div>
          </div>
      </template>
    </Tree>

    <!-- Modal -->
    <Modal
      :show="treeTab.modal.state.value.show"
      :title="treeTab.modal.state.value.title"
      :teleport-to="'.booth-enhancer-sidebar'"
      @close="treeTab.modal.closeModal"
    >
      <!-- 创建文件夹 -->
      <div v-if="treeTab.modal.state.value.type === 'createFolder'">
        <input
          v-model="treeTab.modal.state.value.inputValue"
          type="text"
          placeholder="文件夹名称"
          @keyup.enter="treeTab.modal.confirmModal()"
        />
      </div>
      
      <!-- 创建 Tag 预设 -->
      <div v-else-if="treeTab.modal.state.value.type === 'createTag'">
        <div class="form-group">
          <label>预设名称 <span class="required">*</span></label>
          <input
            v-model="treeTab.modal.state.value.formData.name"
            type="text"
            placeholder="例如：イチゴ配布物"
          />
        </div>
        
        <div class="form-group">
          <label>标签列表 <span class="required">*</span></label>
          <textarea
            v-model="treeTab.modal.state.value.formData.tagsText"
            class="modal-textarea-code-small"
            placeholder='支持两种格式：&#10;1. JSON 数组（从 Booth 复制）：["アクセサリー","眼鏡","イチゴ"]&#10;2. 普通文本（逗号/换行/空格分隔）：アクセサリー,眼鏡,イチゴ'
            rows="4"
          ></textarea>
          <small class="form-hint-small">
            💡 直接粘贴从 Booth "复制标签"功能得到的 JSON 数据，或手动输入
          </small>
        </div>
      </div>
      
      <!-- 重命名 -->
      <div v-else-if="treeTab.modal.state.value.type === 'rename'">
        <input
          v-model="treeTab.modal.state.value.inputValue"
          type="text"
          placeholder="新名称"
          @keyup.enter="treeTab.modal.confirmModal()"
        />
      </div>
      
      <!-- 删除确认 -->
      <div v-else-if="treeTab.modal.state.value.type === 'delete'">
        <p class="modal-message">{{ treeTab.modal.state.value.formData.message }}</p>
      </div>
      
      <!-- 通用输入框 -->
      <div v-else-if="treeTab.modal.state.value.type === 'input'">
        <p v-if="treeTab.modal.state.value.message" class="modal-message-with-margin">
          {{ treeTab.modal.state.value.message }}
        </p>
        <input
          v-model="treeTab.modal.state.value.inputValue"
          type="text"
          :placeholder="treeTab.modal.state.value.placeholder"
          @keyup.enter="treeTab.modal.confirmModal()"
        />
      </div>
      
      <!-- 通用文本域 -->
      <div v-else-if="treeTab.modal.state.value.type === 'textarea'">
        <p v-if="treeTab.modal.state.value.message" class="modal-message-with-margin">
          {{ treeTab.modal.state.value.message }}
        </p>
        <textarea
          v-model="treeTab.modal.state.value.inputValue"
          class="modal-textarea-code"
          :placeholder="treeTab.modal.state.value.placeholder"
          rows="4"
        ></textarea>
      </div>
      
      <!-- 通用提示框 -->
      <div v-else-if="treeTab.modal.state.value.type === 'alert'">
        <p class="modal-message">{{ treeTab.modal.state.value.message }}</p>
      </div>

      <template #footer>
        <button 
          v-if="treeTab.modal.state.value.type !== 'alert'"
          class="booth-btn booth-btn-md booth-btn-icon booth-btn-secondary" 
          @click="treeTab.modal.closeModal"
          title="取消"
        >
          <span v-html="withSize(icons.close, 16)"></span>
        </button>
        <button 
          v-if="treeTab.modal.state.value.type === 'createTag'"
          class="booth-btn booth-btn-md booth-btn-icon booth-btn-primary"
          @click="treeTab.modal.confirmModal(treeTab.modal.state.value.formData)"
          title="确定"
        >
          <span v-html="withSize(icons.check, 16)"></span>
        </button>
        <button 
          v-else-if="treeTab.modal.state.value.type === 'delete'"
          class="booth-btn booth-btn-md booth-btn-icon booth-btn-danger"
          @click="treeTab.modal.confirmModal(true)"
          title="删除"
        >
          <span v-html="withSize(icons.trash, 16)"></span>
        </button>
        <button 
          v-else-if="treeTab.modal.state.value.type === 'alert'"
          class="booth-btn booth-btn-md booth-btn-icon booth-btn-primary"
          @click="treeTab.modal.confirmModal()"
          title="确定"
        >
          <span v-html="withSize(icons.check, 16)"></span>
        </button>
        <button 
          v-else
          class="booth-btn booth-btn-md booth-btn-icon booth-btn-primary"
          @click="treeTab.modal.confirmModal()"
          title="确定"
        >
          <span v-html="withSize(icons.check, 16)"></span>
        </button>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.tag-preset-tab {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.toolbar {
  flex-shrink: 0;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.tree-container {
  flex: 1;
  overflow-y: auto;
  padding: 4px;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f5f5f5;
}

.tree-container::-webkit-scrollbar {
  width: 6px;
}

.tree-container::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 3px;
}

.tree-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.tree-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 文件夹内容样式 */
.folder-content {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 6px 8px;
}

.folder-content .icon {
  color: #fbbf24;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  flex-shrink: 0;
}

.folder-content .name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  color: #334155;
}

.folder-content .count {
  font-size: 12px;
  color: #94a3b8;
  margin-left: 4px;
}

/* Tag 预设下层自定义内容 */
.tag-custom-content {
  width: 100%;
}

.tag-badges-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  font-size: 10px;
  color: #2563eb;
  line-height: 1.2;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.tag-badge:hover {
  background: #dbeafe;
  border-color: #93c5fd;
}

.tag-text {
  flex-shrink: 0;
}

.tag-delete-btn {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: #3b82f6;
  cursor: pointer;
  transition: all 0.15s ease;
  opacity: 0.7;
}

.tag-delete-btn:hover {
  opacity: 1;
  background: #3b82f6;
  color: white;
  transform: scale(1.1);
}

/* Modal 内容样式 */
.modal-message {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.6;
  margin: 0;
}

.modal-message-with-margin {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.modal-textarea-code {
  font-family: 'Consolas', 'Monaco', monospace;
  line-height: 1.5;
}

.modal-textarea-code-small {
  font-family: 'Consolas', 'Monaco', monospace;
  line-height: 1.5;
  font-size: 11px;
}

.form-hint-small {
  display: block;
  margin-top: 6px;
  color: #6b7280;
  font-size: 11px;
}
</style>
