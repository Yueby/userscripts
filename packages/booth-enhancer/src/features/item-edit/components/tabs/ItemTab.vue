<script setup lang="ts">
import { computed } from 'vue';
import { itemDataSearchFilter, useStorage, useTreeTab } from '../../composables';
import { icons, withSize } from '../ui/icons';
import Modal from '../ui/Modal.vue';
import { Tree, type ContextMenuItem } from '../ui/tree';

// 使用 Composables
const { data, createNode, renameNode } = useStorage();

// 使用 TreeTab composable
const treeTab = useTreeTab({
  tree: () => data.value.itemTree,
  onCreateFolder: (parentId) => {
    const newNode = createNode(data.value.itemTree, '新建文件夹', undefined, parentId);
    return newNode.id;
  },
  onCreateItem: (parentId) => {
    const itemData = {
      authorName: '',
      itemName: '',
      itemUrl: ''
    };
    const newNode = createNode(data.value.itemTree, '新建商品数据', itemData, parentId);
    return newNode.id;
  },
  onEditItem: async (nodeId) => {
    const node = data.value.itemTree.nodes[nodeId];
    if (!node || !node.data) return;
    
    const result = await treeTab.modal.openModal({
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
      renameNode(data.value.itemTree, nodeId, trimmedName);
      node.data.authorName = result.authorName.trim();
      node.data.itemName = trimmedName;
      node.data.itemUrl = result.itemUrl.trim();
    }
  }
});

// 自定义右键菜单项（导出/导入功能已移至顶栏菜单）
const customMenuItems = computed<ContextMenuItem[]>(() => []);
</script>

<template>
  <div class="item-data-tab">
    <!-- 文件树（内置搜索） -->
    <Tree
      :tree="treeTab.tree.value"
      search-placeholder="搜索商品数据..."
      :search-filter="itemDataSearchFilter"
      :on-create-folder="treeTab.handleCreateFolder"
      :on-create-item="treeTab.handleCreateItem"
      :on-rename="treeTab.handleRename"
      :on-delete="treeTab.handleDelete"
      :on-edit="treeTab.handleEditItem"
      :custom-menu-items="customMenuItems"
      @selection-change="treeTab.handleSelect"
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
      
      <!-- 创建商品数据 -->
      <div v-else-if="treeTab.modal.state.value.type === 'createItem'">
        <div class="form-group">
          <label>商品名称 <span class="required">*</span></label>
          <input
            v-model="treeTab.modal.state.value.formData.name"
            type="text"
            placeholder="例如：イチゴ - Ichigo"
          />
        </div>
        
        <div class="form-group">
          <label>作者名称</label>
          <input
            v-model="treeTab.modal.state.value.formData.authorName"
            type="text"
            placeholder="例如：みゅ"
          />
        </div>
        
        <div class="form-group">
          <label>商品链接</label>
          <input
            v-model="treeTab.modal.state.value.formData.itemUrl"
            type="text"
            placeholder="https://booth.pm/..."
          />
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
          <span v-html="withSize(icons.close, 18)"></span>
        </button>
        <button 
          v-if="treeTab.modal.state.value.type === 'createItem'"
          class="booth-btn booth-btn-md booth-btn-icon booth-btn-primary"
          @click="treeTab.modal.confirmModal(treeTab.modal.state.value.formData)"
          title="确定"
        >
          <span v-html="withSize(icons.check, 18)"></span>
        </button>
        <button 
          v-else-if="treeTab.modal.state.value.type === 'delete'"
          class="booth-btn booth-btn-md booth-btn-icon booth-btn-danger"
          @click="treeTab.modal.confirmModal(true)"
          title="删除"
        >
          <span v-html="withSize(icons.trash, 18)"></span>
        </button>
        <button 
          v-else-if="treeTab.modal.state.value.type === 'alert'"
          class="booth-btn booth-btn-md booth-btn-icon booth-btn-primary"
          @click="treeTab.modal.confirmModal()"
          title="确定"
        >
          <span v-html="withSize(icons.check, 18)"></span>
        </button>
        <button 
          v-else
          class="booth-btn booth-btn-md booth-btn-icon booth-btn-primary"
          @click="treeTab.modal.confirmModal()"
          title="确定"
        >
          <span v-html="withSize(icons.check, 18)"></span>
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
