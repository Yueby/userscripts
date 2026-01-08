<script setup lang="ts">
import { computed } from 'vue';
import type { ItemEditAPI } from '../../../../api/item-edit';
import { useModal } from '../../composables';
import { ConfigStorage } from '../../modules/ConfigStorage';
import Modal from '../ui/Modal.vue';
import { Tree, type ContextMenuItem } from '../ui/tree';

defineProps<{
  api: ItemEditAPI;
}>();

const storage = ConfigStorage.getInstance();
const modal = useModal();

// 树形数据
const tree = computed(() => storage.data.value.templateTree);
const activeTemplateId = computed(() => storage.data.value.activeTemplateId);

// === 列表操作回调 ===

// 创建模板
const handleCreateTemplate = (): string => {
  const data = { content: '{{authorName}} - {{itemName}}\n{{itemUrl}}' };
  const newNode = storage.createNode(tree.value, '新建模板', data, null);
  return newNode.id;
};

// 编辑模板内容
const handleEditTemplate = async (nodeId: string) => {
  const node = storage.data.value.templateTree.nodes[nodeId];
  if (!node || !node.data) return;
  
  const result = await modal.openModal({
    type: 'textarea',
    title: '编辑模板内容',
    message: '可用占位符：{{authorName}}, {{itemName}}, {{itemUrl}}',
    placeholder: '输入模板内容...',
    defaultValue: node.data.content
  });
  
  if (result === null || result === node.data.content) return;
  
  node.data.content = result;
  node.updatedAt = Date.now();
  storage['saveWithDebounce']();
};

// 重命名
const handleRename = (nodeId: string, newName: string) => {
  storage.renameNode(tree.value, nodeId, newName);
};

// 删除
const handleDelete = async (nodeId: string) => {
  const node = tree.value.nodes[nodeId];
  if (!node) return;
  
  // 不能删除当前激活的模板
  if (nodeId === activeTemplateId.value) {
    await modal.openModal({
      type: 'alert',
      title: '无法删除',
      message: '不能删除当前激活的模板，请先激活其他模板'
    });
    return;
  }
  
  const confirmed = await modal.openModal({
    type: 'delete',
    title: '确认删除',
    message: `确定要删除"${node.name}"吗？`
  });
  
  if (!confirmed) return;
  
  storage.deleteNode(tree.value, nodeId);
};

// 激活模板
const handleActivateTemplate = (nodeId: string) => {
  const node = tree.value.nodes[nodeId];
  if (!node || !node.data) return; // 只能激活有数据的节点（模板）
  
  storage.data.value.activeTemplateId = nodeId;
  storage['saveWithDebounce']();
};

// 自定义右键菜单项
const customMenuItems = computed<ContextMenuItem[]>(() => [
  {
    label: '选择此模板',
    action: (node) => {
      if (node && node.id !== activeTemplateId.value) {
        handleActivateTemplate(node.id);
      }
    },
    show: (node) => node !== null && node.data && node.id !== activeTemplateId.value, // 只在非当前模板的数据节点显示
  }
]);

// 获取示例预览（用示例数据替换占位符）
const getExamplePreview = (content: string): string => {
  return content
    .replace(/\{\{authorName\}\}/g, '示例作者')
    .replace(/\{\{itemName\}\}/g, '示例商品名称')
    .replace(/\{\{itemUrl\}\}/g, 'https://booth.pm/items/1234567');
};
</script>

<template>
  <div class="template-tab">
    <Tree
      :tree="tree"
      mode="list"
      search-placeholder="搜索模板..."
      :search-filter="(node, searchText) => node.name.toLowerCase().includes(searchText.toLowerCase())"
      :custom-menu-items="customMenuItems"
      :on-create-item="handleCreateTemplate"
      :on-rename="handleRename"
      :on-delete="handleDelete"
      :on-edit="handleEditTemplate"
    >
      <!-- 上层右侧：当前标签（仅当前模板显示） -->
      <template #header="{ node }">
        <span v-if="node.data && node.id === activeTemplateId" class="active-badge">当前</span>
      </template>
      
      <!-- 下层：模板预览 -->
      <template #default="{ node }">
        <div class="template-custom-content">
          <div class="template-preview">
            <pre>{{ getExamplePreview(node.data.content) }}</pre>
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
      <!-- 通用输入框 -->
      <div v-if="modal.state.value.type === 'input'">
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
      
      <!-- 删除确认 -->
      <div v-else-if="modal.state.value.type === 'delete'">
        <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">{{ modal.state.value.message }}</p>
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
          v-if="modal.state.value.type === 'delete'"
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
.template-tab {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  overflow: hidden;
}

/* 激活标签 */
.active-badge {
  padding: 2px 6px;
  background: #3b82f6;
  color: white;
  font-size: 10px;
  border-radius: 3px;
  font-weight: 500;
  line-height: 1.2;
}

/* 模板预览 */
.template-preview {
  padding: 8px 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
}

.template-preview pre {
  margin: 0;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 11px;
  line-height: 1.5;
  color: #334155;
  white-space: pre-wrap;
  word-break: break-all;
}

/* Modal 输入框样式 */
.modal-input {
  width: 100%;
  padding: 10px 12px;
  font-size: 13px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  transition: all 0.2s;
  background: #fff;
  color: #1f2937;
  line-height: 1.5;
}

.modal-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-input::placeholder {
  color: #9ca3af;
}

textarea.modal-input {
  resize: vertical;
  min-height: 80px;
}
</style>
