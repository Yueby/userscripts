<script setup lang="ts">
import { computed, ref } from 'vue';
import { itemDataSearchFilter, useModal, useTemplates } from '../../composables';
import { Node, TemplateData } from '../../config-types';
import { ConfigStorage } from '../../modules/ConfigStorage';
import { icons, withSize } from '../ui/icons';
import Modal from '../ui/Modal.vue';
import { Tree } from '../ui/tree';

// 核心状态
const storage = ConfigStorage.getInstance();
const selectedNodeId = ref<string | null>(null);
const showTemplateModal = ref(false);
const selectedItem = ref<{ name: string; data: any } | null>(null);

// 模板管理状态
const showTemplateManagerModal = ref(false);
const showEditTemplateModal = ref(false);
const editingTemplate = ref<{ id: string | null; name: string; content: string; isNew: boolean } | null>(null);

// 使用 Composables
const modal = useModal();
const templates = useTemplates();

// 树形数据
const tree = computed(() => storage.data.value.itemTree);
const templateTree = computed(() => storage.data.value.templateTree);
const activeTemplateId = computed(() => storage.data.value.activeTemplateId);

// 获取扁平模板列表（只包含有 data 的节点）
const flatTemplates = computed(() => {
  const result: Array<Node & { data: TemplateData }> = [];
  for (const nodeId in templateTree.value.nodes) {
    const node = templateTree.value.nodes[nodeId];
    if (node.data?.content) {
      result.push(node as any);
    }
  }
  return result;
});

// 处理节点选择
const handleSelect = (nodes: Node<any>[]) => {
  if (nodes.length > 0) {
    selectedNodeId.value = nodes[0].id;
  }
};

// 处理预览/复制（点击眼睛图标）
const handlePreview = (node: Node<any>) => {
  if (node.data?.authorName || node.data?.itemUrl) {
    selectedItem.value = {
      name: node.name,
      data: node.data
    };
    showTemplateModal.value = true;
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

// === 模板管理功能 ===

// 创建模板 - 不立即创建节点，只打开编辑窗口
const handleCreateTemplate = () => {
  editingTemplate.value = {
    id: null, // 新建时 id 为 null
    name: '新建模板',
    content: '{{authorName}} - {{itemName}}\n{{itemUrl}}',
    isNew: true
  };
  showEditTemplateModal.value = true;
};

// 编辑模板
const handleEditTemplate = (node: Node) => {
  if (node.data?.content) {
    editingTemplate.value = {
      id: node.id,
      name: node.name,
      content: node.data.content,
      isNew: false
    };
    showEditTemplateModal.value = true;
  }
};

// 保存模板
const handleSaveTemplate = () => {
  if (!editingTemplate.value) return;
  
  if (editingTemplate.value.isNew) {
    // 新建模式：创建新节点
    const newNode = storage.createNode(
      templateTree.value,
      editingTemplate.value.name,
      { content: editingTemplate.value.content },
      null
    );
    // 如果是第一个模板，自动设为激活
    if (Object.keys(templateTree.value.nodes).length === 1) {
      storage.data.value.activeTemplateId = newNode.id;
    }
  } else {
    // 编辑模式：更新现有节点
    const node = templateTree.value.nodes[editingTemplate.value.id!];
    if (node && node.data) {
      node.name = editingTemplate.value.name;
      node.data.content = editingTemplate.value.content;
      node.updatedAt = Date.now();
    }
  }
  
  storage['saveWithDebounce']();
  showEditTemplateModal.value = false;
  editingTemplate.value = null;
};

// 删除模板
const handleDeleteTemplate = async (nodeId: string) => {
  const node = templateTree.value.nodes[nodeId];
  if (nodeId === activeTemplateId.value) {
    await modal.openModal({
      type: 'alert',
      title: '无法删除',
      formData: { message: '不能删除当前激活的模板，请先激活其他模板' }
    });
    return;
  }
  
  const confirmed = await modal.openModal({
    type: 'delete',
    title: '确认删除',
    formData: { message: `确定要删除"${node.name}"吗？` }
  });
  
  if (confirmed) {
    storage.deleteNode(templateTree.value, nodeId);
  }
};

// 激活模板
const handleActivateTemplate = (nodeId: string) => {
  storage.data.value.activeTemplateId = nodeId;
  storage['saveWithDebounce']();
};

// 获取预览（使用示例数据）
const getExamplePreview = (content: string): string => {
  return content
    .replace(/\{\{authorName\}\}/g, '示例作者')
    .replace(/\{\{itemName\}\}/g, '示例商品名称')
    .replace(/\{\{itemUrl\}\}/g, 'https://booth.pm/items/1234567');
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
      @selection-change="handleSelect"
    >
      <!-- 工具栏：模板管理按钮 -->
      <template #toolbar>
        <button 
          class="template-manager-btn"
          @click="showTemplateManagerModal = true"
          title="模板管理"
        >
          <span v-html="withSize(icons.settings, 16)"></span>
          <span>模板</span>
        </button>
      </template>

      <!-- 上层右侧：操作按钮 -->
      <template #header="{ node }">
        <span 
          v-if="node.data?.authorName || node.data?.itemUrl" 
          class="action-icon"
          title="预览/复制"
          @click.stop="handlePreview(node)"
          v-html="withSize(icons.eye, 14)"
        ></span>
      </template>

      <!-- 下层：自定义内容（仅商品数据显示） -->
      <template #default="{ node }">
        <div v-if="node.data?.authorName || node.data?.itemUrl" class="item-custom-content">
            <span class="item-field">{{ node.data.authorName || '—' }}</span>
            <span class="item-separator">·</span>
            <span class="item-field">{{ node.name }}</span>
          </div>
      </template>
    </Tree>

    <!-- 模板管理 Modal -->
    <Modal
      :show="showTemplateManagerModal"
      title="模板管理"
      :teleport-to="'.booth-enhancer-sidebar'"
      @close="showTemplateManagerModal = false"
      width="500px"
    >
      <div class="template-manager">
        <!-- 模板列表 -->
        <div class="template-list">
          <div class="template-list-header">
            <button class="booth-btn booth-btn-md booth-btn-secondary btn-create" @click="handleCreateTemplate">
              <span v-html="withSize(icons.plus, 14)"></span>
              新建模板
            </button>
          </div>
          
          <div class="template-items">
            <div 
              v-for="template in flatTemplates" 
              :key="template.id"
              class="template-item"
              :class="{ 'is-active': template.id === activeTemplateId }"
            >
              <div class="template-item-header">
                <span class="template-name">{{ template.name }}</span>
                <span v-if="template.id === activeTemplateId" class="active-badge">当前</span>
                <div class="template-actions">
                  <button class="booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm" @click="handleEditTemplate(template)" title="编辑">
                    <span v-html="withSize(icons.edit, 14)"></span>
                  </button>
                  <button 
                    v-if="template.id !== activeTemplateId"
                    class="booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm"
                    @click="handleActivateTemplate(template.id)" 
                    title="设为当前"
                  >
                    <span v-html="withSize(icons.check, 14)"></span>
                  </button>
                  <button class="booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm" @click="handleDeleteTemplate(template.id)" title="删除">
                    <span v-html="withSize(icons.trash, 14)"></span>
                  </button>
                </div>
              </div>
              <div class="template-preview-item">
                <pre>{{ getExamplePreview(template.data.content) }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>

    <!-- 编辑模板 Modal -->
    <Modal
      :show="showEditTemplateModal"
      title="编辑模板"
      :teleport-to="'.booth-enhancer-sidebar'"
      @close="showEditTemplateModal = false; editingTemplate = null"
      width="500px"
    >
      <div v-if="editingTemplate" class="edit-template-modal-content">
        <div class="form-group">
          <label>模板名称</label>
          <input v-model="editingTemplate.name" type="text" placeholder="输入模板名称" />
        </div>
        <div class="form-group">
          <label>模板内容</label>
          <p class="form-hint" v-pre>可用占位符：{{authorName}}, {{itemName}}, {{itemUrl}}</p>
          <textarea v-model="editingTemplate.content" class="template-textarea" rows="12" placeholder="输入模板内容..."></textarea>
        </div>
        <div class="form-group">
          <label>预览效果</label>
          <div class="template-preview-item">
            <pre>{{ getExamplePreview(editingTemplate.content) }}</pre>
          </div>
        </div>
      </div>

      <template #footer>
        <button class="booth-btn booth-btn-md booth-btn-secondary" @click="showEditTemplateModal = false; editingTemplate = null">
          取消
        </button>
        <button class="booth-btn booth-btn-md booth-btn-primary" @click="handleSaveTemplate">
          保存
        </button>
      </template>
    </Modal>

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
          💡 点击工具栏"模板"按钮管理模板
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
          class="modal-input"
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
          class="modal-input"
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
          class="modal-input modal-textarea-code"
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

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: #64748b;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s ease;
  opacity: 0; /* 默认隐藏 */
  border: 1px solid transparent;
}

/* 只有当鼠标悬停在节点上时才显示图标 */
:deep(.node-item:hover) .action-icon {
  opacity: 1;
}

/* 选中状态下也显示 */
:deep(.node-item.selected) .action-icon,
:deep(.node-item.multi-selected) .action-icon {
  opacity: 1;
}

/* 统一 hover 样式 - 与 booth-btn-ghost 一致 */
.action-icon:hover {
  background: #f1f5f9;
  color: #475569;
  border-color: #e2e8f0;
  transform: translateY(-1px);
}

.action-icon:active {
  transform: translateY(1px);
}

/* 模板管理按钮 - 明显的默认状态 */
.template-manager-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  height: 32px;
  font-size: 12px;
  font-weight: 500;
  color: #475569;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.template-manager-btn :deep(svg) {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.template-manager-btn:hover {
  background: #f1f5f9;
  color: #475569;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.template-manager-btn:active {
  transform: translateY(1px);
}

/* 模板管理器 */
.template-manager {
  min-height: 400px;
  max-height: 600px;
}

.template-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

.template-list-header {
  flex-shrink: 0;
}

.btn-create {
  width: 100%;
  gap: 6px;
}

.template-items {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  padding-right: 4px;
}

.template-item {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  transition: all 0.15s ease;
  background: #fff;
}

.template-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.template-item.is-active {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.02);
}

.template-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.template-name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
}

.active-badge {
  padding: 2px 6px;
  background: #3b82f6;
  color: white;
  font-size: 10px;
  border-radius: 3px;
  font-weight: 500;
  line-height: 1.2;
}

.template-actions {
  display: flex;
  gap: 4px;
}

.template-preview-item {
  padding: 8px 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
}

.template-preview-item pre {
  margin: 0;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 11px;
  line-height: 1.5;
  color: #334155;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 模板 textarea 特殊样式 - 只定义特殊属性，交互样式由全局定义 */
.template-textarea {
  font-family: 'Consolas', 'Monaco', monospace;
  min-height: 150px;
}

/* 表单提示文字 */
.form-hint {
  margin: 0 0 6px 0;
  font-size: 11px;
  color: #6b7280;
  font-style: italic;
}
</style>
