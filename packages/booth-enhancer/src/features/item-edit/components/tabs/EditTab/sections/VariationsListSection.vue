<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import type { ItemEditAPI } from '../../../../../../api/item-edit';
import { useModal } from '../../../../composables';
import type { GlobalTemplateConfig, ItemEditConfig } from '../../../../config-types';
import { applyDiscount } from '../../../../utils/priceCalculator';
import { SectionHeader } from '../../../ui';
import { icons, withSize } from '../../../ui/icons';
import { DraggableCardList } from '../../../ui/list';
import { toast } from '../../../ui/Toast';
import VariationConfigModal from '../modals/VariationConfigModal.vue';

const props = defineProps<{
  itemConfig: ItemEditConfig;
  globalTemplates: GlobalTemplateConfig;
  api: ItemEditAPI;
  modal: ReturnType<typeof useModal>;
  itemTree: any;
}>();

const emit = defineEmits<{
  applied: [];
}>();

// Modal 状态
const showPriceModal = ref(false);
const selectedVariationIndex = ref<number | null>(null);
const tempSelectedItems = ref<string[]>([]);
const tempSelectedFileIds = ref<string[]>([]);
const selectingItemForFile = ref<{ variationIndex: number; fileId: string } | null>(null);

// Computed
const hasFullset = computed((): boolean => 
  props.itemConfig.variations.some((v: any) => v.isFullset)
);

const availableFiles = computed(() => props.api.files);

// 从页面导入 Variations
async function importVariations(): Promise<void> {
  const pageVariations = props.api.variations;
  
  if (pageVariations.length === 0) {
    toast.info('页面没有 Variations');
    return;
  }
  
  // 导入 variations，包括文件关联
  props.itemConfig.variations = pageVariations.map((variation: any, index: number) => {
    const name = variation.nameInput?.value || '';
    const isFullset = name.toLowerCase().includes('fullset');
    const priceStr = variation.priceInput?.value || '0';
    const price = parseInt(priceStr.replace(/\D/g, '')) || 0;
    
    // 获取该 variation 的文件列表
    const fileIds = props.api.getVariationFiles(index);
    
    return {
      name,
      price,
      isFullset,
      fileIds, // 导入已关联的文件
      fileItemMap: {} // 初始化为空对象，待自动匹配
    };
  });
  
  // 为导入的文件自动匹配商品
  props.itemConfig.variations.forEach((variation: any, index: number) => {
    if (variation.fileIds && variation.fileIds.length > 0) {
      autoMatchItemsForFiles(index, variation.fileIds);
    }
  });
  
  // 自动检测通用文件
  const allFiles = new Set<string>();
  props.itemConfig.variations.forEach((variation: any) => {
    if (variation.fileIds) {
      variation.fileIds.forEach((fileId: string) => allFiles.add(fileId));
    }
  });
  
  const mappedFiles = new Set<string>();
  props.itemConfig.variations.forEach((variation: any) => {
    if (variation.fileItemMap) {
      Object.keys(variation.fileItemMap).forEach((fileId: string) => {
        if (variation.fileItemMap![fileId]) {
          mappedFiles.add(fileId);
        }
      });
    }
  });
  
  const commonFiles: string[] = [];
  allFiles.forEach((fileId: string) => {
    if (!mappedFiles.has(fileId)) {
      commonFiles.push(fileId);
    }
  });
  
  if (commonFiles.length > 0) {
    props.itemConfig.commonFiles = commonFiles;
  } else {
    props.itemConfig.commonFiles = [];
  }
  
  const messages: string[] = [`已导入 ${pageVariations.length} 个 Variations`];
  if (commonFiles.length > 0) {
    messages.push(`检测到 ${commonFiles.length} 个通用文件`);
  }
  toast.success(messages.join('，'));
}

// 自动根据文件创建 Variations
function autoCreateVariationsFromFiles(): void {
  const files = availableFiles.value;
  
  if (files.length === 0) {
    toast.info('暂无可用文件');
    return;
  }
  
  let createdCount = 0;
  let commonFilesCount = 0;
  const commonFiles: string[] = [];
  
  for (const file of files) {
    // 尝试匹配商品
    const matchedItemId = findBestMatchItem(file.name);
    
    if (matchedItemId) {
      // 找到匹配的商品，创建 variation
      const node = props.itemTree.nodes[matchedItemId];
      const itemName = node?.data?.itemName || node?.name || file.name;
      
      props.itemConfig.variations.push({
        name: itemName,
        price: 0, // 默认价格，后续可在配置中调整
        isFullset: false,
        fileIds: [file.id],
        fileItemMap: {
          [file.id]: matchedItemId
        }
      });
      
      createdCount++;
    } else {
      // 找不到匹配的商品，划分到通用文件
      commonFiles.push(file.id);
      commonFilesCount++;
    }
  }
  
  // 更新通用文件列表
  if (commonFiles.length > 0) {
    if (!props.itemConfig.commonFiles) {
      props.itemConfig.commonFiles = [];
    }
    // 合并并去重
    props.itemConfig.commonFiles = Array.from(new Set([...props.itemConfig.commonFiles, ...commonFiles]));
  }
  
  if (createdCount > 0 || commonFilesCount > 0) {
    toast.success(`已创建 ${createdCount} 个 Variations，${commonFilesCount} 个文件划分为通用文件`);
  } else {
    toast.info('没有可创建的 Variations');
  }
}

// 添加 Variation
function addVariation(): void {
  const price = applyDiscount(
    props.itemConfig.pricing.normalVariationPrice,
    props.itemConfig.discount
  );
  
  props.itemConfig.variations.push({
    name: '',
    price,
    isFullset: false,
    useCustomPrice: false,
    fileIds: [],
    fileItemMap: {}
  });
}

// 删除 Variation
function removeVariation(index: number): void {
  props.itemConfig.variations.splice(index, 1);
}

// 拖拽排序
function onVariationReorder(fromIndex: number, toIndex: number): void {
  const [removed] = props.itemConfig.variations.splice(fromIndex, 1);
  props.itemConfig.variations.splice(toIndex, 0, removed);
}

// 切换 Fullset
function toggleFullset(variation: any, index: number): void {
  if (variation.isFullset) {
    variation.isFullset = false;
    return;
  }
  
  // 取消其他 variation 的 fullset 状态
  props.itemConfig.variations.forEach((v: any, i: number) => {
    if (i !== index && v.isFullset) {
      v.isFullset = false;
      if (!v.fileIds) {
        v.fileIds = [];
      }
    }
  });
  
  variation.isFullset = true;
}

// 获取 Variation 价格
function getVariationPrice(variation: any): number {
  const { pricing, discount } = props.itemConfig;
  
  if (variation.isFullset) {
    return applyDiscount(pricing.fullsetPrice, discount);
  }
  
  if (variation.useCustomPrice && variation.customPrice !== undefined) {
    return applyDiscount(variation.customPrice, discount);
  }
  
  return applyDiscount(pricing.normalVariationPrice, discount);
}

// 获取支持数
function getVariationSupportCount(variation: any): number {
  if (variation.isFullset) return 1;
  
  if (!variation.fileItemMap) return 0;
  return Object.keys(variation.fileItemMap).filter(fileId => variation.fileItemMap[fileId]).length;
}

// 文件选择
async function selectFilesForVariation(variationIndex: number): Promise<void> {
  selectedVariationIndex.value = variationIndex;
  const variation = props.itemConfig.variations[variationIndex];
  
  if (availableFiles.value.length === 0) {
    toast.error('无法获取文件列表，请先上传文件');
    selectedVariationIndex.value = null;
    return;
  }
  
  tempSelectedFileIds.value = variation.fileIds ? [...variation.fileIds] : [];
  
  const fileResult = await props.modal.openModal({
    type: 'selectFile',
    title: '选择文件（可多选）'
  });
  
  if (!fileResult?.fileIds) {
    selectedVariationIndex.value = null;
    return;
  }
  
  const selectedFileIds = fileResult.fileIds as string[];
  const oldFileIds = variation.fileIds || [];
  const newFileIds = selectedFileIds.filter(id => !oldFileIds.includes(id));
  
  variation.fileIds = selectedFileIds;
  
  if (newFileIds.length > 0) {
    autoMatchItemsForFiles(variationIndex, newFileIds);
  }
  
  selectedVariationIndex.value = null;
  tempSelectedFileIds.value = [];
}

// 商品选择
async function selectItemForFile(variationIndex: number, fileId: string): Promise<void> {
  const variation = props.itemConfig.variations[variationIndex];
  
  const currentItemId = variation.fileItemMap?.[fileId];
  tempSelectedItems.value = currentItemId ? [currentItemId] : [];
  selectingItemForFile.value = { variationIndex, fileId };
  
  const result = await props.modal.openModal({
    type: 'selectItem',
    title: `为 ${getFileName(fileId)} 选择商品（单选）`
  });
  
  if (result?.itemIds) {
    if (!variation.fileItemMap) {
      variation.fileItemMap = {};
    }
    
    const selectedItemIds = result.itemIds as string[];
    
    if (selectedItemIds.length === 0) {
      delete variation.fileItemMap[fileId];
    } else {
      variation.fileItemMap[fileId] = selectedItemIds[0];
    }
  }
  
  selectingItemForFile.value = null;
  tempSelectedItems.value = [];
}

// 辅助函数
function getFileName(fileId: string): string {
  const file = availableFiles.value.find(f => f.id === fileId);
  return file ? file.name : `File #${fileId}`;
}

function getFileItemId(variationIndex: number, fileId: string): string | undefined {
  const variation = props.itemConfig.variations[variationIndex];
  return variation.fileItemMap?.[fileId];
}

function getFileItemName(variationIndex: number, fileId: string): string {
  const itemId = getFileItemId(variationIndex, fileId);
  if (!itemId) return '';
  
  const node = props.itemTree.nodes[itemId];
  if (!node) return '未知商品';
  
  const itemData = node.data;
  if (!itemData) return node.name;
  
  return itemData.itemName;
}

function removeFileFromVariation(variationIndex: number, fileId: string): void {
  const variation = props.itemConfig.variations[variationIndex];
  if (variation.fileIds) {
    variation.fileIds = variation.fileIds.filter(id => id !== fileId);
  }
  if (variation.fileItemMap) {
    delete variation.fileItemMap[fileId];
  }
}

// 自动匹配逻辑
function autoMatchItemsForFiles(variationIndex: number, fileIds: string[]): void {
  const variation = props.itemConfig.variations[variationIndex];
  
  if (!variation.fileItemMap) {
    variation.fileItemMap = {};
  }
  
  for (const fileId of fileIds) {
    if (variation.fileItemMap[fileId]) {
      continue;
    }
    
    const file = availableFiles.value.find(f => f.id === fileId);
    if (!file) continue;
    
    const matchedItemId = findBestMatchItem(file.name);
    
    if (matchedItemId) {
      variation.fileItemMap[fileId] = matchedItemId;
    }
  }
}

function findBestMatchItem(fileName: string): string | null {
  if (!fileName || !props.itemTree) return null;
  
  const normalizedFileName = normalizeString(fileName);
  
  let bestMatch: { itemId: string; score: number } | null = null;
  
  for (const [nodeId, node] of Object.entries(props.itemTree.nodes)) {
    const typedNode = node as any;
    if (!typedNode.data?.itemName) continue;
    
    const normalizedItemName = normalizeString(typedNode.data.itemName);
    const score = calculateMatchScore(normalizedFileName, normalizedItemName);
    
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { itemId: nodeId, score };
    }
  }
  
  return bestMatch && bestMatch.score >= 0.4 ? bestMatch.itemId : null;
}

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/\.(zip|rar|7z|unitypackage)$/i, '')
    .replace(/[_\-\s]?v?\d+[\._]\d+[\._]?\d*/gi, '')
    .replace(/[(\[（【][^)\]）】]*[)\]）】]/g, '')
    .replace(/[\s\-_\.]/g, '')
    .trim();
}

function calculateMatchScore(fileName: string, itemName: string): number {
  if (!itemName || !fileName) return 0;
  
  if (fileName === itemName) return 1.0;
  
  if (fileName.startsWith(itemName)) {
    return 0.95;
  }
  
  if (fileName.includes(itemName)) {
    const position = fileName.indexOf(itemName);
    const relativePosition = position / fileName.length;
    return 0.9 - (relativePosition * 0.2);
  }
  
  if (itemName.includes(fileName)) {
    return 0.6;
  }
  
  const lcs = longestCommonSubstring(fileName, itemName);
  
  if (lcs.length === 0) return 0;
  
  if (lcs.length >= itemName.length * 0.8) {
    return 0.5 + (lcs.length / itemName.length) * 0.3;
  }
  
  const minLen = Math.min(itemName.length, fileName.length);
  return (lcs.length / minLen) * 0.5;
}

function longestCommonSubstring(str1: string, str2: string): string {
  if (!str1 || !str2) return '';
  
  const m = str1.length;
  const n = str2.length;
  let maxLength = 0;
  let endIndex = 0;
  
  const dp: number[] = new Array(n + 1).fill(0);
  
  for (let i = 1; i <= m; i++) {
    let prev = 0;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      if (str1[i - 1] === str2[j - 1]) {
        dp[j] = prev + 1;
        if (dp[j] > maxLength) {
          maxLength = dp[j];
          endIndex = i;
        }
      } else {
        dp[j] = 0;
      }
      prev = temp;
    }
  }
  
  return maxLength > 0 ? str1.substring(endIndex - maxLength, endIndex) : '';
}

// 应用到页面
async function applyVariations(): Promise<void> {
  const variations = props.itemConfig.variations;
  const updatedVariations = new Set<number>(); // 记录被更新的 variation 索引
  
  // 同步数量
  const diff = variations.length - props.api.variations.length;
  
  if (diff > 0) {
    // 添加新 variations
    const startIndex = props.api.variations.length;
    for (let i = 0; i < diff; i++) {
      if (!await props.api.addVariation()) {
        toast.error('添加 Variation 失败');
        return;
      }
      updatedVariations.add(startIndex + i); // 标记新添加的 variations
    }
  } else if (diff < 0) {
    // 删除的 variations 计入更新数（虽然已删除，但也算是应用了）
    for (let i = 0; i < -diff; i++) {
      if (!await props.api.removeVariation(props.api.variations.length - 1)) {
        toast.error('删除 Variation 失败');
        return;
      }
    }
  }
  
  await nextTick();
  
  // 填充数据
  variations.forEach((variation: any, index: number) => {
    props.api.updateVariation(index, {
      name: variation.name,
      price: variation.price.toString()
    });
  });
  
  await nextTick();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 选择文件
  for (let i = 0; i < variations.length; i++) {
    const variation = variations[i];
    const fileIds = [
      ...(variation.fileIds || []),
      ...(props.itemConfig.commonFiles || [])
    ];
    
    if (fileIds.length > 0) {
      const result = await props.api.setVariationFiles(i, fileIds, 'replace');
      if (!result.success) {
        toast.error(`Variation ${i} 文件选择失败`);
        return;
      }
      if (result.updated) {
        updatedVariations.add(i); // 标记文件被更新的 variations
      }
    }
  }
  
  // 清理多余的 variations（健壮性检查）
  await nextTick();
  const currentCount = props.api.variations.length;
  const targetCount = variations.length;
  
  if (currentCount > targetCount) {
    // 页面上有多余的 variations，删除它们
    const excessCount = currentCount - targetCount;
    for (let i = 0; i < excessCount; i++) {
      await props.api.removeVariation(props.api.variations.length - 1);
    }
  }
  
  const updatedCount = updatedVariations.size + Math.max(0, -diff); // Set 大小 + 删除数量
  
  if (updatedCount > 0) {
    toast.success(`已应用 ${updatedCount} 个 Variations`);
  } else {
    toast.success('所有 Variations 已是最新');
  }
  emit('applied');
}

defineExpose({
  applyVariations
});
</script>

<template>
  <SectionHeader :title="`Variations (${itemConfig.variations.length})`" no-border>
    <template #actions>
      <button 
        class="booth-btn booth-btn-sm booth-btn-ghost" 
        type="button"
        title="从页面导入"
        @click="importVariations"
      >
        <span v-html="withSize(icons.download, 14)"></span>
      </button>
      <button 
        class="booth-btn booth-btn-sm booth-btn-ghost" 
        type="button"
        title="根据文件自动创建"
        @click="autoCreateVariationsFromFiles"
      >
        <span v-html="withSize(icons.magic, 14)"></span>
      </button>
      <button 
        class="booth-btn booth-btn-sm booth-btn-secondary" 
        type="button"
        title="添加"
        @click="addVariation"
      >
        <span v-html="withSize(icons.plus, 14)"></span>
      </button>
      <button 
        class="booth-btn booth-btn-sm booth-btn-secondary" 
        type="button"
        title="配置价格与通用文件"
        @click="showPriceModal = true"
      >
        <span v-html="withSize(icons.edit, 14)"></span>
      </button>
      <button 
        class="booth-btn booth-btn-sm booth-btn-primary" 
        type="button"
        title="应用到页面"
        @click="applyVariations"
      >
        <span v-html="withSize(icons.send, 14)"></span>
      </button>
    </template>

    <!-- 通用文件预览 -->
    <div 
      v-if="itemConfig.commonFiles && itemConfig.commonFiles.length > 0" 
      class="common-files-preview be-mb-sm"
    >
      <div 
        class="be-flex be-align-center be-gap-xs be-flex-wrap be-p-xs be-px-sm"
        style="background: var(--be-color-bg-secondary); border-radius: var(--be-radius-sm); border: 1px solid var(--be-color-border);"
      >
        <span class="be-text-xs be-text-secondary be-font-semibold">通用文件:</span>
        <span 
          v-for="fileId in itemConfig.commonFiles" 
          :key="fileId" 
          class="file-tag be-text-xs be-px-xs be-py-1"
          style="background: var(--be-color-bg); border: 1px solid var(--be-color-border); border-radius: 4px;"
        >
          {{ getFileName(fileId) }}
        </span>
      </div>
    </div>

    <div v-if="itemConfig.variations.length === 0" class="empty-hint">
      暂无 Variations，点击"添加"或"从页面导入"
    </div>

    <DraggableCardList
      v-else
      :items="itemConfig.variations"
      @remove="removeVariation"
      @reorder="onVariationReorder"
    >
      <template #actions="{ item: variation, index }">
        <div class="be-flex be-align-center be-gap-sm" style="flex: 1;">
          <input 
            v-model="variation.name" 
            type="text" 
            class="be-flex-1 be-p-xs be-px-sm be-text-base"
            style="height: 28px;" 
            placeholder="Variation 名称"
          />
          <label 
            v-if="!hasFullset || variation.isFullset" 
            class="booth-toggle" 
            title="将此 Variation 设为 Fullset（合集包）"
          >
            <input 
              type="checkbox" 
              :checked="variation.isFullset" 
              @change="toggleFullset(variation, index)"
            />
            <span class="toggle-slider"></span>
          </label>
          <button 
            v-if="!variation.isFullset"
            class="booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm" 
            type="button"
            title="选择关联文件"
            @click.stop.prevent="selectFilesForVariation(index)"
          >
            <span v-html="withSize(icons.folder, 14)"></span>
          </button>
        </div>
      </template>
      
      <template #content="{ item: variation, index }">
        <div class="be-flex be-flex-column be-gap-xs">
          <div class="be-flex be-align-center be-gap-sm">
            <span v-if="variation.isFullset" class="be-text-base be-text-primary">
              ¥{{ getVariationPrice(variation) }}
            </span>
            <template v-else>
              <span class="be-text-base be-text-primary be-flex-shrink-0">
                ¥{{ getVariationPrice(variation) }}
              </span>
              <label class="booth-toggle be-flex-shrink-0" title="自定义此 Variation 的价格">
                <input type="checkbox" v-model="variation.useCustomPrice" />
                <span class="toggle-slider"></span>
              </label>
              <input 
                v-if="variation.useCustomPrice"
                v-model.number="variation.customPrice" 
                type="number" 
                class="be-flex-1 be-p-xs be-px-sm be-text-base" 
                style="height: 28px; min-width: 80px;" 
                min="0" 
                placeholder="价格" 
              />
              <span class="be-text-sm be-text-secondary be-flex-shrink-0">
                支持数: {{ getVariationSupportCount(variation) }}
              </span>
            </template>
          </div>
          
          <div 
            v-if="!variation.isFullset && variation.fileIds && variation.fileIds.length > 0" 
            class="item-cards-grid"
            :class="{ 'single-item': variation.fileIds.length === 1 }"
          >
            <div 
              v-for="fileId in variation.fileIds" 
              :key="fileId"
              class="item-card"
            >
              <div class="item-card-header">
                <span class="item-card-title">{{ getFileName(fileId) }}</span>
                <button 
                  class="item-card-delete-btn"
                  type="button"
                  title="取消关联"
                  @click="removeFileFromVariation(index, fileId)"
                >
                  <span v-html="withSize(icons.close, 12)"></span>
                </button>
              </div>
              
              <div class="item-card-content">
                <button
                  class="item-select-btn"
                  :class="{ 'has-item': getFileItemId(index, fileId) }"
                  type="button"
                  @click="selectItemForFile(index, fileId)"
                >
                  <span v-html="withSize(icons.file, 12)"></span>
                  <span class="item-select-text">
                    {{ getFileItemId(index, fileId) ? getFileItemName(index, fileId) : '选择商品' }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </DraggableCardList>
  </SectionHeader>

  <!-- Variation Config Modal -->
  <VariationConfigModal
    :show="showPriceModal"
    :item-config="itemConfig"
    :global-templates="globalTemplates"
    :available-files="availableFiles"
    @close="showPriceModal = false"
  />
</template>

<style scoped>
.empty-hint {
  padding: var(--be-space-md);
  text-align: center;
  color: var(--be-color-text-secondary);
  font-size: var(--be-font-size-md);
  background: var(--be-color-bg-secondary);
  border-radius: var(--be-radius);
}

.item-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 4px;
}

.item-cards-grid.single-item {
  grid-template-columns: 1fr;
}

.item-card {
  display: flex;
  flex-direction: column;
  background: var(--be-color-bg);
  border: 1px solid var(--be-color-border);
  border-radius: var(--be-radius-md);
  overflow: hidden;
}

.item-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  background: var(--be-color-bg-secondary);
  border-bottom: 1px solid var(--be-color-border);
  gap: 4px;
}

.item-card-title {
  flex: 1;
  font-size: 11px;
  font-weight: 600;
  color: var(--be-color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-card-delete-btn {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: var(--be-color-text-secondary);
  cursor: pointer;
  opacity: 0.6;
}

.item-card-delete-btn:hover {
  opacity: 1;
  background: var(--be-color-bg-hover);
}

.item-card-content {
  padding: 6px 8px;
}

.item-select-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: var(--be-color-bg);
  border: 1px dashed var(--be-color-border);
  border-radius: var(--be-radius-sm);
  font-size: 10px;
  color: var(--be-color-text-secondary);
  cursor: pointer;
}

.item-select-btn:hover {
  border-style: solid;
}

.item-select-btn.has-item {
  border-style: solid;
}

.item-select-text {
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
