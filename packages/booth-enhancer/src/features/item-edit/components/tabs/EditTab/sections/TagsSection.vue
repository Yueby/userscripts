<script setup lang="ts">
import { computed, watch } from 'vue';
import type { ItemEditAPI } from '../../../../../../api/item-edit';
import type { ItemData, ItemEditConfig, NodeTree, TagData } from '../../../../config-types';
import { PreviewBox, SectionHeader } from '../../../ui';
import { icons, withSize } from '../../../ui/icons';
import { toast } from '../../../ui/Toast';

const props = defineProps<{
  itemConfig: ItemEditConfig;
  api: ItemEditAPI;
  itemTree: NodeTree<ItemData>;
  tagTree: NodeTree<TagData>;
}>();

const emit = defineEmits<{
  applied: [];
}>();

// 获取所有标签（直接从 tagNodeIds 提取，使用 length 来触发响应式）
const allTags = computed(() => {
  const tagsSet = new Set<string>();
  const nodeIds = props.itemConfig.tagNodeIds || [];
  
  // 访问 length 确保响应式追踪
  const nodeCount = nodeIds.length;
  
  for (let i = 0; i < nodeCount; i++) {
    const nodeId = nodeIds[i];
    const node = props.tagTree.nodes[nodeId];
    if (node?.data?.tags) {
      node.data.tags.forEach(tag => tagsSet.add(tag));
    }
  }
  
  return Array.from(tagsSet);
});

// 智能获取标签节点（静默模式，不显示 toast）
function smartFetchTags(silent = false): void {
  const matchedNodeIds = new Set<string>();
  
  // 1. 遍历所有 variations（跳过 fullset）
  for (const variation of props.itemConfig.variations) {
    if (variation.isFullset || !variation.fileItemMap) continue;
    
    // 2. 获取关联的商品数据
    const itemIds = Object.values(variation.fileItemMap);
    
    for (const itemId of itemIds) {
      const itemNode = props.itemTree.nodes[itemId];
      if (!itemNode?.data) continue;
      
      const { itemName, authorName } = itemNode.data;
      
      // 3. 在 tagTree 中查找匹配节点
      for (const nodeId in props.tagTree.nodes) {
        const tagNode = props.tagTree.nodes[nodeId];
        if (!tagNode.data?.tags || tagNode.data.tags.length === 0) continue; // 只匹配有标签的节点
        
        const nodeName = tagNode.name.toLowerCase();
        const itemNameLower = itemName?.toLowerCase() || '';
        const authorNameLower = authorName?.toLowerCase() || '';
        
        // 4. 模糊匹配：节点名包含商品名或作者名
        if (
          (itemNameLower && nodeName.includes(itemNameLower)) ||
          (authorNameLower && nodeName.includes(authorNameLower))
        ) {
          matchedNodeIds.add(nodeId);
        }
      }
    }
  }
  
  // 5. 使用数组变异方法更新，确保触发响应式（清空并填充新数据）
  const newIds = Array.from(matchedNodeIds);
  
  if (!props.itemConfig.tagNodeIds) {
    props.itemConfig.tagNodeIds = [];
  }
  props.itemConfig.tagNodeIds.splice(0, props.itemConfig.tagNodeIds.length, ...newIds);
  
  if (!silent && matchedNodeIds.size > 0) {
    toast.success(`已匹配 ${matchedNodeIds.size} 个标签节点`);
  }
}

// 自动监听 variations 变化
watch(
  () => props.itemConfig.variations,
  () => {
    // 始终重新计算标签（包括删除 variation 的情况）
    smartFetchTags(true);
  },
  { deep: true, immediate: true }
);

// 应用标签到页面
async function applyTags(): Promise<void> {
  const tagsToApply = new Set<string>();
  
  // 从所有关联的节点提取标签
  const nodeIds = props.itemConfig.tagNodeIds || [];
  for (const nodeId of nodeIds) {
    const node = props.tagTree.nodes[nodeId];
    if (node?.data?.tags) {
      node.data.tags.forEach(tag => tagsToApply.add(tag));
    }
  }
  
  if (tagsToApply.size === 0) {
    toast.info('没有可应用的标签');
    return;
  }
  
  // 过滤掉页面上已存在的标签
  const newTags = Array.from(tagsToApply).filter(tag => !props.api.hasTag(tag));
  
  if (newTags.length > 0) {
    await props.api.addTags(newTags);
    toast.success(`已添加 ${newTags.length} 个新标签`);
    emit('applied');
  } else {
    toast.info('所有标签已存在，无需添加');
  }
}

// 删除标签节点
function removeTagNode(nodeId: string): void {
  if (!props.itemConfig.tagNodeIds) return;
  const index = props.itemConfig.tagNodeIds.indexOf(nodeId);
  if (index > -1) {
    props.itemConfig.tagNodeIds.splice(index, 1);
  }
}

// 暴露方法给父组件
defineExpose({
  applyTags
});
</script>

<template>
  <SectionHeader title="Tags">
    <template #actions>
      <button 
        class="booth-btn booth-btn-sm booth-btn-primary" 
        type="button"
        title="应用到页面"
        @click="applyTags"
      >
        <span v-html="withSize(icons.send, 14)"></span>
      </button>
    </template>
    
    <PreviewBox
      :is-empty="allTags.length === 0"
      empty-text="标签会根据 Variations 中的商品自动匹配"
    >
      <div class="tag-badges-wrapper">
        <span 
          v-for="(tag, index) in allTags"
          :key="index" 
          class="tag-badge"
        >
          <span class="tag-text">{{ tag }}</span>
        </span>
      </div>
    </PreviewBox>
  </SectionHeader>
</template>

<style scoped>
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
</style>
