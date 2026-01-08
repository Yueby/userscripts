<script setup lang="ts">
import { computed, ref } from 'vue';
import { itemDataSearchFilter, useModal, useTemplates } from '../../composables';
import { Node } from '../../config-types';
import { ConfigStorage } from '../../modules/ConfigStorage';
import Modal from '../ui/Modal.vue';
import { Tree } from '../ui/tree';

// 核心状态
const storage = ConfigStorage.getInstance();
const selectedNodeId = ref<string | null>(null);
const showTemplateModal = ref(false);
const selectedItem = ref<{ name: string; data: any } | null>(null);

// 使用 Composables
const modal = useModal();
const templates = useTemplates();

// 树形数据
const tree = computed(() => storage.data.value.itemTree);

// 处理节点选择
const handleSelect = (node: Node<any>) => {
  // 如果有商品数据，显示模板复制窗口
  if (node.data?.authorName || node.data?.itemUrl) {
    selectedItem.value = {
      name: node.name,
      data: node.data
    };
    showTemplateModal.value = true;
  } else {
    selectedNodeId.value = node.id;
  }
};

// === 树操作回调（传递给 Tree） ===

// Unity 风格创建文件夹：直接创建，返回节点ID
const handleCreateFolder = (parentId: string | null): string => {
  const newNode = storage.createNode(tree.value, '新建文件夹', undefined, parentId);
  return newNode.id;
};

// Unity 风格创建商品数据：直接创建，返回节点ID
const handleCreateItem = (parentId: string | null): string => {
  const data = {
    authorName: '',
    itemName: '',
    itemUrl: ''
  };
  const newNode = storage.createNode(tree.value, '新建商品数据', data, parentId);
  return newNode.id;
};

// 编辑商品数据
const handleEditItem = async (nodeId: string) => {
  const node = storage.data.value.itemTree.nodes[nodeId];
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
  
  if (result && result.name && result.name.trim()) {
    // 更新节点名称和数据
    storage.renameNode(tree.value, nodeId, result.name.trim());
    node.data.authorName = result.authorName.trim();
    node.data.itemName = result.name.trim();
    node.data.itemUrl = result.itemUrl.trim();
    storage['saveWithDebounce'](); // 触发保存
  }
};

// 重命名（Unity 风格：内联编辑）
const handleRename = (nodeId: string, newName: string) => {
  const trimmedName = newName.trim();
  if (trimmedName) {
    storage.renameNode(tree.value, nodeId, trimmedName);
  }
};

// 删除
const handleDelete = async (nodeId: string) => {
  const node = storage.data.value.itemTree.nodes[nodeId];
  if (!node) return; // 节点不存在时直接返回
  
  const confirmed = await modal.openModal({
    type: 'delete',
    title: '确认删除',
    formData: { message: `确定要删除"${node.name}"吗？` }
  });
  
  if (confirmed) {
    storage.deleteNode(tree.value, nodeId);
  }
  // 取消时直接返回，不抛出错误
};
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
      @select="handleSelect"
    >
      <!-- 下层：自定义内容（仅商品数据显示） -->
      <template #default="{ node }">
        <template v-if="node.data?.authorName || node.data?.itemUrl">
          <div class="item-custom-content">
            <span class="item-field">{{ node.data.authorName || '—' }}</span>
            <span class="item-separator">·</span>
            <span class="item-field">{{ node.name }}</span>
          </div>
        </template>
      </template>
    </Tree>

    <!-- 模板复制弹窗 -->
    <Modal
      :show="showTemplateModal"
      title="复制商品数据"
      :teleport-to="'.booth-enhancer-sidebar'"
      @close="showTemplateModal = false"
    >
      <div v-if="selectedItem" class="template-section">
        <h4 class="section-title">
          当前模板：{{ templates.getSelectedTemplate()?.name || '无' }}
        </h4>
        <div class="template-preview">
          {{ templates.previewTemplate(templates.selectedTemplateId.value, selectedItem) }}
        </div>
        <p class="template-hint">
          💡 在"模板配置"标签页中管理模板
        </p>
      </div>

      <template #footer>
        <button class="booth-btn booth-btn-md booth-btn-secondary" @click="showTemplateModal = false">取消</button>
        <button 
          class="booth-btn booth-btn-md booth-btn-primary"
          @click="selectedItem && templates.applyAndCopy(templates.selectedTemplateId.value, selectedItem).then(() => showTemplateModal = false)"
        >
          复制
        </button>
      </template>
    </Modal>

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
          class="modal-input"
          placeholder="文件夹名称"
          @keyup.enter="modal.confirmModal()"
        />
      </div>
      
      <!-- 创建商品数据 -->
      <div v-else-if="modal.state.value.type === 'createItem'" class="item-form">
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
          class="modal-input"
          placeholder="新名称"
          @keyup.enter="modal.confirmModal()"
        />
      </div>

      <!-- 删除确认 -->
      <div v-else-if="modal.state.value.type === 'delete'">
        <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">{{ modal.state.value.formData.message }}</p>
      </div>
      
      <!-- 通用输入框 -->
      <div v-else-if="modal.state.value.type === 'input'">
        <p v-if="modal.state.value.message" style="color: #6b7280; font-size: 13px; line-height: 1.6; margin-bottom: 12px;">
          {{ modal.state.value.message }}
        </p>
        <input
          v-model="modal.state.value.inputValue"
          type="text"
          class="modal-input"
          :placeholder="modal.state.value.placeholder"
          @keyup.enter="modal.confirmModal()"
        />
      </div>
      
      <!-- 通用文本域 -->
      <div v-else-if="modal.state.value.type === 'textarea'">
        <p v-if="modal.state.value.message" style="color: #6b7280; font-size: 13px; line-height: 1.6; margin-bottom: 12px;">
          {{ modal.state.value.message }}
        </p>
        <textarea
          v-model="modal.state.value.inputValue"
          class="modal-input"
          :placeholder="modal.state.value.placeholder"
          rows="8"
          style="font-family: 'Consolas', 'Monaco', monospace; line-height: 1.5; font-size: 12px;"
        ></textarea>
      </div>
      
      <!-- 通用提示框 -->
      <div v-else-if="modal.state.value.type === 'alert'">
        <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">{{ modal.state.value.message }}</p>
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

/* 商品数据项样式 */
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

/* 模板相关 */
.template-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.template-preview {
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 11px;
  color: #374151;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: 'Consolas', 'Monaco', monospace;
  margin-bottom: 8px;
}

.template-hint {
  margin: 0;
  font-size: 11px;
  color: #6b7280;
  font-style: italic;
}

/* 表单 */
.item-form {
  display: flex;
  flex-direction: column;
  gap: 1em;
}
</style>
