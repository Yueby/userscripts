<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { ItemData, NodeTree } from '../../../../config-types';
import { icons, withSize } from '../../../ui/icons';
import Modal from '../../../ui/Modal.vue';
import { toast } from '../../../ui/Toast';

const props = defineProps<{
  show: boolean;
  itemTree: NodeTree<ItemData>;
  initialSelectedIds?: string[];
}>();

const emit = defineEmits<{
  close: [];
  save: [itemIds: string[]];
}>();

const itemSearchKeyword = ref('');
const selectedItemIds = ref<Set<string>>(new Set());

// 过滤后的商品列表
const filteredItemNodes = computed(() => {
  const keyword = itemSearchKeyword.value.toLowerCase().trim();
  const allNodeIds = Object.keys(props.itemTree.nodes).filter(
    id => props.itemTree.nodes[id].data
  );
  
  if (!keyword) {
    return allNodeIds;
  }
  
  return allNodeIds.filter(nodeId => {
    const node = props.itemTree.nodes[nodeId];
    if (!node?.data) return false;
    
    const itemName = (node.data.itemName || node.name).toLowerCase();
    const authorName = (node.data.authorName || '').toLowerCase();
    
    return itemName.includes(keyword) || authorName.includes(keyword);
  });
});

function isItemSelected(itemId: string): boolean {
  return selectedItemIds.value.has(itemId);
}

function toggleItemSelection(itemId: string): void {
  if (selectedItemIds.value.has(itemId)) {
    selectedItemIds.value.delete(itemId);
  } else {
    selectedItemIds.value.add(itemId);
  }
}

function confirmSelection(): void {
  const itemIds = Array.from(selectedItemIds.value);
  toast.success(`已选择 ${itemIds.length} 个商品`);
  emit('save', itemIds);
  emit('close');
}

// 监听 modal 打开，初始化选择状态
watch(() => props.show, (isOpen) => {
  if (isOpen) {
    selectedItemIds.value = new Set(props.initialSelectedIds || []);
    itemSearchKeyword.value = '';
  }
});
</script>

<template>
  <Modal
    :show="show"
    title="选择商品"
    :teleport-to="'.booth-enhancer-sidebar'"
    @close="emit('close')"
  >
    <div class="be-flex be-flex-column be-gap-sm">
      <p class="form-hint be-text-xs be-text-secondary">
        点击选择/取消商品关联（已选择: {{ selectedItemIds.size }}）
      </p>
      
      <!-- 搜索框 -->
      <div class="be-flex be-gap-xs be-align-center">
        <input
          v-model="itemSearchKeyword"
          type="text"
          class="be-flex-1"
          placeholder="搜索商品名或作者名..."
          style="padding: 6px 10px; border: 1px solid #e0e0e0; border-radius: 4px; font-size: 12px;"
        />
        <span class="be-text-xs be-text-secondary be-flex-shrink-0">
          {{ filteredItemNodes.length }} 个商品
        </span>
      </div>
      
      <!-- 商品列表 -->
      <div 
        v-if="filteredItemNodes.length > 0"
        class="item-select-list"
        style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-height: 400px; overflow-y: auto;"
      >
        <button
          v-for="nodeId in filteredItemNodes"
          :key="nodeId"
          class="item-select-btn booth-btn booth-btn-sm booth-btn-ghost be-text-left"
          type="button"
          :style="{
            padding: '6px 8px',
            backgroundColor: isItemSelected(nodeId) ? 'rgba(59, 130, 246, 0.1)' : undefined,
            borderColor: isItemSelected(nodeId) ? 'rgba(59, 130, 246, 0.3)' : undefined
          }"
          @click="toggleItemSelection(nodeId)"
        >
          <div class="be-flex be-flex-column" style="gap: 2px;">
            <span class="be-text-sm be-font-medium">
              {{ itemTree.nodes[nodeId].data?.itemName || itemTree.nodes[nodeId].name }}
            </span>
            <span class="be-text-xs be-text-secondary">
              {{ itemTree.nodes[nodeId].data?.authorName }}
            </span>
          </div>
        </button>
      </div>
      
      <div v-else class="empty-hint">
        {{ itemSearchKeyword ? '未找到匹配的商品' : '暂无商品数据，请先在 ItemTab 中添加' }}
      </div>
    </div>
    
    <template #footer>
      <button 
        class="booth-btn booth-btn-md booth-btn-icon booth-btn-secondary"
        type="button"
        title="取消"
        @click="emit('close')"
      >
        <span v-html="withSize(icons.close, 18)"></span>
      </button>
      <button 
        class="booth-btn booth-btn-md booth-btn-icon booth-btn-primary"
        type="button"
        title="确认"
        @click="confirmSelection"
      >
        <span v-html="withSize(icons.check, 18)"></span>
      </button>
    </template>
  </Modal>
</template>

<style scoped>
.empty-hint {
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}
</style>
