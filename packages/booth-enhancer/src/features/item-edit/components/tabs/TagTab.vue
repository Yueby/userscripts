<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ItemEditAPI } from '../../../../api/item-edit';
import { tagSearchFilter, useModal, useStorage } from '../../composables';
import { Node } from '../../config-types';
import Modal from '../ui/Modal.vue';
import type { ContextMenuItem } from '../ui/tree/Tree.vue';
import Tree from '../ui/tree/Tree.vue';

const props = defineProps<{
  api: ItemEditAPI;
}>();

// 使用 Composables
const { data, createNode, renameNode, deleteNode } = useStorage();
const modal = useModal();

// 核心状态
const selectedNodeId = ref<string | null>(null);

// 树形数据
const tree = computed(() => data.value.tagTree);

// 处理节点选择
const handleSelect = (nodes: Node[]) => {
  if (nodes.length > 0) {
    selectedNodeId.value = nodes[0].id;
  }
};

// 递归检查节点是否包含标签
function hasTagsRecursive(node: Node | null): boolean {
  if (!node) return false;
  
  const hasTags = node.data?.tags && Array.isArray(node.data.tags) && node.data.tags.length > 0;
  if (hasTags) return true;
  
  if (!node.children || node.children.length === 0) return false;
  
  return node.children.some((childId: string) => {
    const childNode = tree.value.nodes[childId];
    return childNode && hasTagsRecursive(childNode);
  });
}

// 递归提取节点及其子节点的所有标签
function extractTagsRecursive(node: Node, tagsSet: Set<string>): void {
  if (node.data?.tags && Array.isArray(node.data.tags)) {
    node.data.tags.forEach((tag: string) => tagsSet.add(tag));
  }
  
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
    label: '应用标签',
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
    show: (node, selection) => {
      if (selection && selection.length > 0) {
        return selection.some(hasTagsRecursive);
      }
      return hasTagsRecursive(node);
    },
  },
  {
    label: '移除标签',
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
    show: (node, selection) => {
      if (selection && selection.length > 0) {
        return selection.some(hasTagsRecursive);
      }
      return hasTagsRecursive(node);
    },
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

// Unity 风格创建文件夹：直接创建，返回节点ID
const handleCreateFolder = (parentId: string | null): string => {
  const newNode = createNode(tree.value, '新建文件夹', undefined, parentId);
  return newNode.id;
};

// Unity 风格创建 Tag 预设：直接创建，返回节点ID
const handleCreateTag = (parentId: string | null): string => {
  const tagData = { tags: [] }; // 创建空的Tag预设
  const newNode = createNode(tree.value, '新建 Tag 预设', tagData, parentId);
  return newNode.id;
};

// 编辑 Tag 数据
const handleEditTag = async (nodeId: string) => {
  const node = data.value.tagTree.nodes[nodeId];
  if (!node || !node.data) return;
  
  const result = await modal.openModal({
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
      // 更新节点名称和数据
      renameNode(tree.value, nodeId, result.name.trim());
      node.data.tags = tags;
    }
  }
};

// 重命名（Unity 风格：内联编辑）
const handleRename = (nodeId: string, newName: string) => {
  const trimmedName = newName.trim();
  if (trimmedName) {
    renameNode(tree.value, nodeId, trimmedName);
  }
};

// 删除
const handleDelete = async (nodeId: string) => {
  const node = data.value.tagTree.nodes[nodeId];
  if (!node) return; // 节点不存在时直接返回
  
  const confirmed = await modal.openModal({
    type: 'delete',
    title: '确认删除',
    formData: { message: `确定要删除"${node.name}"吗？` }
  });
  
  if (confirmed) {
    deleteNode(tree.value, nodeId);
  }
  // 取消时直接返回，不抛出错误
};
</script>

<template>
  <div class="tag-preset-tab">
    <!-- 文件树（内置搜索） -->
    <Tree
      :tree="tree"
      search-placeholder="搜索 Tag..."
      :search-filter="tagSearchFilter"
      :custom-menu-items="customMenuItems"
      :on-create-folder="handleCreateFolder"
      :on-create-item="handleCreateTag"
      :on-rename="handleRename"
      :on-delete="handleDelete"
      :on-edit="handleEditTag"
      @selection-change="handleSelect"
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
                  ×
                </button>
              </span>
            </div>
          </div>
      </template>
    </Tree>

    <!-- Modal -->
    <Modal
      :show="modal.state.value.show"
      :title="modal.state.value.title"
      :teleport-to="'.booth-enhancer-sidebar'"
      @close="modal.closeModal"
    >
      <!-- 创建文件夹 -->
      <div v-if="modal.state.value.type === 'createFolder'">
        <input
          v-model="modal.state.value.inputValue"
          type="text"
          placeholder="文件夹名称"
          @keyup.enter="modal.confirmModal()"
        />
      </div>
      
      <!-- 创建 Tag 预设 -->
      <div v-else-if="modal.state.value.type === 'createTag'">
        <div class="form-group">
          <label>预设名称 <span class="required">*</span></label>
          <input
            v-model="modal.state.value.formData.name"
            type="text"
            placeholder="例如：イチゴ配布物"
          />
        </div>
        
        <div class="form-group">
          <label>标签列表 <span class="required">*</span></label>
          <textarea
            v-model="modal.state.value.formData.tagsText"
            class="modal-textarea-code-small"
            placeholder='支持两种格式：&#10;1. JSON 数组（从 Booth 复制）：["アクセサリー","眼鏡","イチゴ"]&#10;2. 普通文本（逗号/换行/空格分隔）：アクセサリー,眼鏡,イチゴ'
            rows="8"
          ></textarea>
          <small class="form-hint-small">
            💡 直接粘贴从 Booth "复制标签"功能得到的 JSON 数据，或手动输入
          </small>
        </div>
      </div>
      
      <!-- 重命名 -->
      <div v-else-if="modal.state.value.type === 'rename'">
        <input
          v-model="modal.state.value.inputValue"
          type="text"
          placeholder="新名称"
          @keyup.enter="modal.confirmModal()"
        />
      </div>
      
      <!-- 删除确认 -->
      <div v-else-if="modal.state.value.type === 'delete'">
        <p class="modal-message">{{ modal.state.value.formData.message }}</p>
      </div>
      
      <!-- 通用输入框 -->
      <div v-else-if="modal.state.value.type === 'input'">
        <p v-if="modal.state.value.message" class="modal-message-with-margin">
          {{ modal.state.value.message }}
        </p>
        <input
          v-model="modal.state.value.inputValue"
          type="text"
          :placeholder="modal.state.value.placeholder"
          @keyup.enter="modal.confirmModal()"
        />
      </div>
      
      <!-- 通用文本域 -->
      <div v-else-if="modal.state.value.type === 'textarea'">
        <p v-if="modal.state.value.message" class="modal-message-with-margin">
          {{ modal.state.value.message }}
        </p>
        <textarea
          v-model="modal.state.value.inputValue"
          class="modal-textarea-code"
          :placeholder="modal.state.value.placeholder"
          rows="8"
        ></textarea>
      </div>
      
      <!-- 通用提示框 -->
      <div v-else-if="modal.state.value.type === 'alert'">
        <p class="modal-message">{{ modal.state.value.message }}</p>
      </div>

      <template #footer>
        <button 
          v-if="modal.state.value.type !== 'alert'"
          class="booth-btn booth-btn-md booth-btn-secondary" 
          @click="modal.closeModal"
        >
          取消
        </button>
        <button 
          v-if="modal.state.value.type === 'createTag'"
          class="booth-btn booth-btn-md booth-btn-primary"
          @click="modal.confirmModal(modal.state.value.formData)"
        >
          确定
        </button>
        <button 
          v-else-if="modal.state.value.type === 'delete'"
          class="booth-btn booth-btn-md booth-btn-danger"
          @click="modal.confirmModal(true)"
        >
          删除
        </button>
        <button 
          v-else-if="modal.state.value.type === 'alert'"
          class="booth-btn booth-btn-md booth-btn-primary"
          @click="modal.confirmModal()"
        >
          确定
        </button>
        <button 
          v-else
          class="booth-btn booth-btn-md booth-btn-primary"
          @click="modal.confirmModal()"
        >
          确定
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
  font-size: 16px;
  line-height: 0;
  cursor: pointer;
  transition: all 0.15s ease;
  opacity: 0.7;
  font-family: Arial, sans-serif;
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
