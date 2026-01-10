<script setup lang="ts">
import { computed, ref } from 'vue';
import { itemDataSearchFilter, useModal, useStorage } from '../../composables';
import { Node } from '../../config-types';
import Modal from '../ui/Modal.vue';
import { Tree, type ContextMenuItem } from '../ui/tree';

// 使用 Composables
const { data, createNode, renameNode, deleteNode } = useStorage();
const modal = useModal();

// 核心状态
const selectedNodeId = ref<string | null>(null);

// 树形数据
const tree = computed(() => data.value.itemTree);

// 处理节点选择
const handleSelect = (nodes: Node<any>[]) => {
  if (nodes.length > 0) {
    selectedNodeId.value = nodes[0].id;
  }
};

// === 树操作回调（传递给 Tree） ===

// Unity 风格创建文件夹：直接创建，返回节点ID
function handleCreateFolder(parentId: string | null): string {
  const newNode = createNode(tree.value, '新建文件夹', undefined, parentId);
  return newNode.id;
}

// Unity 风格创建商品数据：直接创建，返回节点ID
function handleCreateItem(parentId: string | null): string {
  const itemData = {
    authorName: '',
    itemName: '',
    itemUrl: ''
  };
  const newNode = createNode(tree.value, '新建商品数据', itemData, parentId);
  return newNode.id;
}

// 编辑商品数据
async function handleEditItem(nodeId: string) {
  const node = data.value.itemTree.nodes[nodeId];
  if (!node || !node.data) return;
  
  const result = await modal.openModal({
    type: 'createItem',
    title: '编辑商品数据',
    formData: {
      name: node.name,
      authorName: node.data.authorName || '',
      itemUrl: node.data.itemUrl || ''
    }
  });
  
  if (result?.name?.trim()) {
    const trimmedName = result.name.trim();
    renameNode(tree.value, nodeId, trimmedName);
    node.data.authorName = result.authorName.trim();
    node.data.itemName = trimmedName;
    node.data.itemUrl = result.itemUrl.trim();
  }
}

// 重命名（Unity 风格：内联编辑）
function handleRename(nodeId: string, newName: string) {
  const trimmedName = newName.trim();
  if (trimmedName) {
    renameNode(tree.value, nodeId, trimmedName);
  }
}

// 删除
async function handleDelete(nodeId: string) {
  const node = data.value.itemTree.nodes[nodeId];
  if (!node) return;
  
  const confirmed = await modal.openModal({
    type: 'delete',
    title: '确认删除',
    formData: { message: `确定要删除"${node.name}"吗？` }
  });
  
  if (confirmed) {
    deleteNode(tree.value, nodeId);
  }
}

// 自定义右键菜单项（导出/导入功能已移至顶栏菜单）
const customMenuItems = computed<ContextMenuItem[]>(() => []);
</script>

<template>
  <div class="item-data-tab">
    <!-- 文件树（内置搜索） -->
    <Tree
      :tree="tree"
      search-placeholder="搜索商品数据..."
      :search-filter="itemDataSearchFilter"
      :on-create-folder="handleCreateFolder"
      :on-create-item="handleCreateItem"
      :on-rename="handleRename"
      :on-delete="handleDelete"
      :on-edit="handleEditItem"
      :custom-menu-items="customMenuItems"
      @selection-change="handleSelect"
    >
      <!-- 下层：自定义内容（仅商品数据显示） -->
      <template #default="{ node }">
        <div v-if="node.data?.authorName || node.data?.itemUrl" class="item-custom-content">
          <span class="item-field">{{ node.data.authorName || '—' }}</span>
          <span class="item-separator">·</span>
          <span class="item-field">{{ node.name }}</span>
        </div>
      </template>
    </Tree>

    <!-- CRUD Modal -->
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
      
      <!-- 创建商品数据 -->
      <div v-else-if="modal.state.value.type === 'createItem'">
        <div class="form-group">
          <label>商品名称 <span class="required">*</span></label>
          <input
            v-model="modal.state.value.formData.name"
            type="text"
            placeholder="例如：イチゴ - Ichigo"
          />
        </div>
        
        <div class="form-group">
          <label>作者名称</label>
          <input
            v-model="modal.state.value.formData.authorName"
            type="text"
            placeholder="例如：みゅ"
          />
        </div>
        
        <div class="form-group">
          <label>商品链接</label>
          <input
            v-model="modal.state.value.formData.itemUrl"
            type="text"
            placeholder="https://booth.pm/..."
          />
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
          v-if="modal.state.value.type === 'createItem'"
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
.item-data-tab {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

/* 商品数据下层自定义内容 */
.item-custom-content {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.4;
}

.item-field {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-separator {
  flex-shrink: 0;
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
</style>
