<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import type { ItemEditAPI } from '../../../../../../api/item-edit';
import type { ItemData, ItemEditConfig, NodeTree, TagData } from '../../../../config-types';
import { PreviewBox, SectionHeader } from '../../../ui';
import { icons, withSize } from '../../../ui/icons';
import { toast } from '../../../ui/Toast';
import SelectTagModal from '../modals/SelectTagModal.vue';

const props = defineProps<{
  itemConfig: ItemEditConfig;
  api: ItemEditAPI;
  itemTree: NodeTree<ItemData>;
  tagTree: NodeTree<TagData>;
}>();

const emit = defineEmits<{
  applied: [];
}>();

// 手动选择标签 Modal 状态
const showSelectTagModal = ref(false);

// 从节点ID列表提取所有唯一标签
function extractTagsFromNodeIds(nodeIds: string[]): string[] {
  const tagsSet = new Set<string>();
  
  for (const nodeId of nodeIds) {
    const node = props.tagTree.nodes[nodeId];
    if (node?.data?.tags) {
      node.data.tags.forEach(tag => tagsSet.add(tag));
    }
  }
  
  return Array.from(tagsSet);
}

// 获取所有标签
const allTags = computed(() => {
  return extractTagsFromNodeIds(props.itemConfig.tagNodeIds || []);
});

// 智能匹配标签节点
// @param mode - 'merge': 只添加新匹配（保留手动选择）；'replace': 完全替换（覆盖手动选择）
// @param silent - 是否静默（不显示 toast）
function smartFetchTags(mode: 'merge' | 'replace' = 'merge', silent = false): void {
  const matchedNodeIds = new Set<string>();
  
  // 遍历所有 variations（跳过 fullset）
  for (const variation of props.itemConfig.variations) {
    if (variation.isFullset || !variation.fileItemMap) continue;
    
    // 获取关联的商品数据（展平数组）
    const itemIds = Object.values(variation.fileItemMap).flat().filter(Boolean);
    
    for (const itemId of itemIds) {
      const itemNode = props.itemTree.nodes[itemId];
      if (!itemNode?.data) continue;
      
      const { itemName, authorName } = itemNode.data;
      const itemNameLower = itemName?.toLowerCase() || '';
      const authorNameLower = authorName?.toLowerCase() || '';
      
      if (!itemNameLower && !authorNameLower) continue;
      
      // 在 tagTree 中查找匹配节点
      for (const nodeId in props.tagTree.nodes) {
        const tagNode = props.tagTree.nodes[nodeId];
        // 只匹配有标签的节点
        if (!tagNode.data?.tags || tagNode.data.tags.length === 0) continue;
        
        const nodeName = tagNode.name.toLowerCase();
        
        // 模糊匹配：节点名包含商品名或作者名
        if (
          (itemNameLower && nodeName.includes(itemNameLower)) ||
          (authorNameLower && nodeName.includes(authorNameLower))
        ) {
          matchedNodeIds.add(nodeId);
        }
      }
    }
  }
  
  if (!props.itemConfig.tagNodeIds) {
    props.itemConfig.tagNodeIds = [];
  }
  
  const existing = props.itemConfig.tagNodeIds;
  let finalIds: string[];
  let addedCount = 0;
  
  if (mode === 'replace') {
    finalIds = Array.from(matchedNodeIds);
    addedCount = matchedNodeIds.size;
  } else {
    // merge: 保留已有的，只添加新匹配
    const existingSet = new Set(existing);
    const newlyAdded: string[] = [];
    matchedNodeIds.forEach(id => {
      if (!existingSet.has(id)) {
        newlyAdded.push(id);
      }
    });
    finalIds = [...existing, ...newlyAdded];
    addedCount = newlyAdded.length;
  }
  
  // 使用变异方法更新，确保触发响应式
  props.itemConfig.tagNodeIds.splice(0, props.itemConfig.tagNodeIds.length, ...finalIds);
  
  if (!silent) {
    if (mode === 'replace') {
      toast.success(`已匹配 ${matchedNodeIds.size} 个标签节点`);
    } else if (addedCount > 0) {
      toast.success(`已新增 ${addedCount} 个匹配的标签节点`);
    } else {
      toast.info('未发现新的匹配');
    }
  }
}

// 手动触发完全重新匹配（清空后重新匹配）
function handleResync(): void {
  smartFetchTags('replace', false);
}

// 自动监听 variations 变化（merge 模式，避免覆盖手动选择）
watch(
  () => props.itemConfig.variations,
  () => {
    smartFetchTags('merge', true);
  },
  { deep: true }
);

// 首次挂载：如果 config 里还没有 tagNodeIds，自动跑一次匹配
// （合并模式下不会覆盖任何东西，对有手动选择的 config 无影响）
onMounted(() => {
  if ((props.itemConfig.tagNodeIds?.length ?? 0) === 0) {
    smartFetchTags('merge', true);
  }
});

// 应用标签到页面
async function applyTags(): Promise<void> {
  const tagsToApply = extractTagsFromNodeIds(props.itemConfig.tagNodeIds || []);
  
  if (tagsToApply.length === 0) {
    toast.info('没有可应用的标签');
    return;
  }
  
  // 过滤掉页面上已存在的标签
  const newTags = tagsToApply.filter(tag => !props.api.hasTag(tag));
  
  if (newTags.length > 0) {
    await props.api.addTags(newTags);
    toast.success(`已添加 ${newTags.length} 个新标签`);
    emit('applied');
  } else {
    toast.info('所有标签已存在，无需添加');
  }
}

// 暴露方法给父组件
defineExpose({
  applyTags
});
</script>

<template>
  <SectionHeader title="Tags" collapsible section-id="edit-tags">
    <template #actions>
      <button 
        class="booth-btn booth-btn-sm booth-btn-ghost" 
        type="button"
        title="根据 Variations 重新匹配（会清除手动选择）"
        @click="handleResync"
      >
        <span v-html="withSize(icons.magic, 14)"></span>
      </button>
      <button 
        class="booth-btn booth-btn-sm booth-btn-secondary" 
        type="button"
        title="选择标签预设"
        @click="showSelectTagModal = true"
      >
        <span v-html="withSize(icons.edit, 14)"></span>
      </button>
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
      empty-text="标签会根据 Variations 自动匹配，也可以手动选择"
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

  <!-- 选择标签预设 Modal -->
  <SelectTagModal
    :show="showSelectTagModal"
    :item-config="itemConfig"
    :tag-tree="tagTree"
    @close="showSelectTagModal = false"
    @save="showSelectTagModal = false"
  />
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
