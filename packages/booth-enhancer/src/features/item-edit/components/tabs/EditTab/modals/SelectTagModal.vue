<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { ItemEditConfig, NodeTree, TagData } from '../../../../config-types';
import { icons, withSize } from '../../../ui/icons';
import Modal from '../../../ui/Modal.vue';
import { toast } from '../../../ui/Toast';

const props = defineProps<{
  show: boolean;
  itemConfig: ItemEditConfig;
  tagTree: NodeTree<TagData>;
}>();

const emit = defineEmits<{
  close: [];
  save: [];
}>();

// 搜索和选择状态
const tagSearchKeyword = ref('');
const selectedTagNodeIds = ref<Set<string>>(new Set());

// 递归收集标签节点（按树的层级顺序）
function collectTagNodesInOrder(nodeIds: string[], result: string[] = []): string[] {
  for (const nodeId of nodeIds) {
    const node = props.tagTree.nodes[nodeId];
    if (!node) continue;
    
    // 如果当前节点有标签，添加到结果
    if (node.data?.tags && node.data.tags.length > 0) {
      result.push(nodeId);
    }
    
    // 递归处理子节点
    if (node.children && node.children.length > 0) {
      collectTagNodesInOrder(node.children, result);
    }
  }
  return result;
}

// 过滤后的标签节点（用于 Modal，按树的顺序）
const filteredTagNodes = computed(() => {
  // 从根节点开始递归收集
  const orderedNodeIds = collectTagNodesInOrder(props.tagTree.rootIds || []);
  
  const keyword = tagSearchKeyword.value.toLowerCase().trim();
  if (!keyword) {
    return orderedNodeIds;
  }
  
  // 根据关键词过滤
  return orderedNodeIds.filter(nodeId => {
    const node = props.tagTree.nodes[nodeId];
    if (!node) return false;
    
    const nodeName = node.name.toLowerCase();
    const tagsText = node.data?.tags?.join(' ').toLowerCase() || '';
    
    return nodeName.includes(keyword) || tagsText.includes(keyword);
  });
});

// 判断标签节点是否已选中
function isTagNodeSelected(nodeId: string): boolean {
  return selectedTagNodeIds.value.has(nodeId);
}

// 切换标签节点选中状态
function toggleTagNode(nodeId: string): void {
  if (selectedTagNodeIds.value.has(nodeId)) {
    selectedTagNodeIds.value.delete(nodeId);
  } else {
    selectedTagNodeIds.value.add(nodeId);
  }
}

// 确认选择标签节点
function confirmSelectTagNodes(): void {
  const newIds = Array.from(selectedTagNodeIds.value);
  
  if (!props.itemConfig.tagNodeIds) {
    props.itemConfig.tagNodeIds = [];
  }
  props.itemConfig.tagNodeIds.splice(0, props.itemConfig.tagNodeIds.length, ...newIds);
  
  toast.success(`已选择 ${newIds.length} 个标签预设`);
  emit('save');
  emit('close');
}

// 监听 modal 显示状态，初始化选择
watch(() => props.show, (isOpen) => {
  if (isOpen) {
    selectedTagNodeIds.value = new Set(props.itemConfig.tagNodeIds || []);
    tagSearchKeyword.value = '';
  }
});
</script>

<template>
  <Modal
    :show="show"
    title="选择标签预设"
    :teleport-to="'.booth-enhancer-sidebar'"
    @close="emit('close')"
  >
    <div class="be-flex be-flex-column be-gap-sm">
      <p class="form-hint be-text-xs be-text-secondary">
        点击选择/取消标签预设（已选择: {{ selectedTagNodeIds.size }}）
      </p>
      
      <!-- 搜索框 -->
      <div class="be-flex be-gap-xs be-align-center">
        <input
          v-model="tagSearchKeyword"
          type="text"
          class="be-flex-1"
          placeholder="搜索标签预设或标签内容..."
          style="padding: 6px 10px; border: 1px solid #e0e0e0; border-radius: 4px; font-size: 12px;"
        />
        <span class="be-text-xs be-text-secondary be-flex-shrink-0">
          {{ filteredTagNodes.length }} 个预设
        </span>
      </div>
      
      <div 
        v-if="filteredTagNodes.length > 0"
        class="tag-select-list"
        style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-height: 400px; overflow-y: auto;"
      >
        <button
          v-for="nodeId in filteredTagNodes"
          :key="nodeId"
          class="tag-select-btn booth-btn booth-btn-sm booth-btn-ghost be-text-left"
          type="button"
          :style="{
            padding: '6px 8px',
            backgroundColor: isTagNodeSelected(nodeId) ? 'rgba(59, 130, 246, 0.1)' : undefined,
            borderColor: isTagNodeSelected(nodeId) ? 'rgba(59, 130, 246, 0.3)' : undefined
          }"
          @click="toggleTagNode(nodeId)"
        >
          <div style="display: flex; flex-direction: column; gap: 2px; width: 100%;">
            <span class="be-text-sm be-font-medium">{{ tagTree.nodes[nodeId].name }}</span>
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
              <span
                v-for="(tag, index) in tagTree.nodes[nodeId].data?.tags"
                :key="index"
                class="tag-badge-preview"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </button>
      </div>
      
      <div v-else class="empty-hint">
        {{ tagSearchKeyword ? '未找到匹配的标签预设' : '暂无标签预设，请先在 Tag 标签页创建' }}
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
        @click="confirmSelectTagNodes"
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

.tag-badge-preview {
  display: inline-flex;
  align-items: center;
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
</style>
