<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
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
const selectingItemForFile = ref<{ variationIndex: number; fileId: string } | null>(null);

// 响应式的页面 variation 名称集合
const pageVariationNames = ref<Set<string>>(new Set());

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
  
  // 自动检测通用文件（未映射到商品的文件）
  const allFiles = new Set<string>();
  const mappedFiles = new Set<string>();
  
  props.itemConfig.variations.forEach((variation: any) => {
    // 收集所有文件
    variation.fileIds?.forEach((fileId: string) => allFiles.add(fileId));
    
    // 收集已映射的文件
    if (variation.fileItemMap) {
      Object.entries(variation.fileItemMap).forEach(([fileId, itemId]) => {
        if (itemId) mappedFiles.add(fileId);
      });
    }
  });
  
  // 计算通用文件（所有文件减去已映射文件）
  const commonFiles = Array.from(allFiles).filter(fileId => !mappedFiles.has(fileId));
  props.itemConfig.commonFiles = commonFiles;
  
  const messages: string[] = [`已导入 ${pageVariations.length} 个 Variations`];
  if (commonFiles.length > 0) {
    messages.push(`检测到 ${commonFiles.length} 个通用文件`);
  }
  toast.success(messages.join('，'));
  
  // 导入不会改变页面 DOM，但会改变配置数据，需要刷新锁定状态
  updatePageVariationNames();
}

// 根据页面 Variation 顺序同步配置顺序
function syncVariationOrderFromPage(): void {
  const pageVariations = props.api.variations;
  
  if (pageVariations.length === 0 || props.itemConfig.variations.length === 0) {
    return;
  }
  
  // 获取页面 variation 的名称顺序
  const pageNames = pageVariations.map(v => v.nameInput?.value?.trim() || '');
  const pageNameSet = new Set(pageNames);
  
  // 按页面顺序重组配置项
  const configInPageOrder = pageNames
    .map(pageName => props.itemConfig.variations.find(v => (v.name?.trim() || '') === pageName))
    .filter((v): v is any => v !== undefined);
  
  // 添加配置中有但页面没有的项（保持原有顺序）
  const configNotInPage = props.itemConfig.variations.filter(
    v => !pageNameSet.has(v.name?.trim() || '')
  );
  
  const newOrder = [...configInPageOrder, ...configNotInPage];
  
  // 检查顺序是否改变
  const currentOrder = props.itemConfig.variations.map(v => v.name?.trim() || '');
  const targetOrder = newOrder.map(v => v.name?.trim() || '');
  
  if (JSON.stringify(currentOrder) !== JSON.stringify(targetOrder)) {
    props.itemConfig.variations = newOrder;
  }
}

// MutationObserver 用于监听页面 variation 列表变化
let variationObserver: MutationObserver | null = null;

// 等待 API 的 variations 数据加载完成
function waitForVariationsReady(timeout: number = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const checkVariations = () => {
      const variations = props.api.variations;
      
      // 检查是否有 variations（至少有数据）
      if (variations && variations.length > 0) {
        resolve(true);
        return;
      }
      
      // 超时检查
      if (Date.now() - startTime > timeout) {
        console.warn('[VariationsListSection] 等待 variations 数据超时，可能页面暂无 variation');
        resolve(false);
        return;
      }
      
      // 继续轮询
      setTimeout(checkVariations, 100);
    };
    
    checkVariations();
  });
}

// 找到 variation 列表的容器元素（用于监听 DOM 变化）
function findVariationListContainer(): HTMLElement | null {
  const variations = props.api.variations;
  if (variations.length === 0) return null;
  
  // 从第一个 variation 元素向上查找 ul 容器
  const firstVariationElement = variations[0]?.element;
  if (!firstVariationElement) return null;
  
  return firstVariationElement.parentElement as HTMLElement | null;
}

// 启动页面 variation 顺序监听
async function startVariationOrderSync(): Promise<void> {
  // 等待 API 的 variations 数据加载完成
  const hasVariations = await waitForVariationsReady();
  
  if (!hasVariations) {
    console.log('[VariationsListSection] 页面暂无 variations，跳过顺序同步');
    return;
  }
  
  // 首次加载时同步顺序
  syncVariationOrderFromPage();
  
  // 更新页面输入框禁用状态
  updatePageVariationInputsDisabledState();
  
  // 刷新锁定状态（首次启动需要手动刷新一次）
  updatePageVariationNames();
  
  // 找到 variation 列表容器
  const variationListContainer = findVariationListContainer();
  
  if (!variationListContainer) {
    console.warn('[VariationsListSection] 无法找到 variation 列表容器，跳过 DOM 监听');
    return;
  }
  
  // 创建 MutationObserver 监听 DOM 变化
  variationObserver = new MutationObserver((mutations) => {
    // 检查是否有子节点顺序变化
    const hasOrderChange = mutations.some(mutation => {
      return mutation.type === 'childList' && (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0);
    });
    
    if (hasOrderChange) {
      // 延迟执行，确保 DOM 更新完成
      setTimeout(() => {
        syncVariationOrderFromPage();
        updatePageVariationInputsDisabledState();
        updatePageVariationNames();
      }, 100);
    }
  });
  
  // 监听子节点变化
  variationObserver.observe(variationListContainer, {
    childList: true, // 监听子节点添加/删除
    subtree: false   // 不监听更深层级
  });
}

// 停止监听
function stopVariationOrderSync(): void {
  if (variationObserver) {
    variationObserver.disconnect();
    variationObserver = null;
  }
}

// 更新页面 variation 输入框的禁用状态
/**
 * 为单个输入框添加或移除锁定状态和锁图标
 */
function toggleInputLock(
  input: HTMLInputElement,
  shouldLock: boolean,
  inputType: 'name' | 'price'
): void {
  const LOCKED_ICON_CLASS = 'booth-enhancer-lock-icon';
  
  input.disabled = shouldLock;
  
  const parent = input.parentElement;
  if (!parent) return;
  
  const lockIcon = parent.querySelector(
    `.${LOCKED_ICON_CLASS}[data-for="${inputType}"]`
  ) as HTMLElement | null;
  
  if (shouldLock) {
    // 确保父元素可以定位锁图标
    if (getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }
    
    // 创建锁图标（如果不存在）
    if (!lockIcon) {
      const icon = document.createElement('span');
      icon.className = LOCKED_ICON_CLASS;
      icon.setAttribute('data-for', inputType);
      icon.innerHTML = withSize(icons.lock, 14);
      icon.title = '此项由脚本管理，禁止手动编辑';
      parent.appendChild(icon);
    }
  } else {
    lockIcon?.remove();
  }
}

/**
 * 更新页面 variation 输入框的禁用状态
 */
function updatePageVariationInputsDisabledState(): void {
  const configNameSet = new Set(
    props.itemConfig.variations
      .map(v => v.name?.trim())
      .filter(Boolean)
  );
  
  props.api.variations.forEach(pageVar => {
    const pageName = pageVar.nameInput?.value?.trim() || '';
    const shouldDisable = Boolean(pageName && configNameSet.has(pageName));
    
    if (pageVar.nameInput) {
      toggleInputLock(pageVar.nameInput, shouldDisable, 'name');
    }
    
    if (pageVar.priceInput) {
      toggleInputLock(pageVar.priceInput, shouldDisable, 'price');
    }
  });
}

// 组件挂载时启动监听
onMounted(() => {
  // 注册 API 回调：监听 variation 添加/删除
  props.api.onVariationAdded(() => {
    updatePageVariationNames();
    updatePageVariationInputsDisabledState();
  });
  
  // 启动顺序同步和 DOM 监听
  startVariationOrderSync();
});

// 组件卸载时停止监听
onUnmounted(() => {
  stopVariationOrderSync();
});

// 自动根据文件创建 Variations
function autoCreateVariationsFromFiles(): void {
  const files = availableFiles.value;
  
  if (files.length === 0) {
    toast.info('暂无可用文件');
    return;
  }
  
  // 构建现有 variation 名称集合（用于去重）
  const existingNames = new Set(
    props.itemConfig.variations.map(v => v.name?.trim()).filter(Boolean)
  );
  
  let createdCount = 0;
  let skippedCount = 0;
  const commonFiles: string[] = [];
  
  for (const file of files) {
    const matchedItemId = findBestMatchItem(file.name);
    
    if (matchedItemId) {
      // 找到匹配的商品
      const node = props.itemTree.nodes[matchedItemId];
      const itemName = (node?.data?.itemName || node?.name || file.name).trim();
      
      // 检查是否已存在同名 variation
      if (existingNames.has(itemName)) {
        skippedCount++;
        continue;
      }
      
      // 创建新 variation
      props.itemConfig.variations.push({
        name: itemName,
        price: 0,
        isFullset: false,
        fileIds: [file.id],
        fileItemMap: { [file.id]: matchedItemId }
      });
      
      existingNames.add(itemName);
      createdCount++;
    } else {
      // 找不到匹配的商品，划分到通用文件
      commonFiles.push(file.id);
    }
  }
  
  // 更新通用文件列表（合并并去重）
  if (commonFiles.length > 0) {
    const existing = props.itemConfig.commonFiles || [];
    props.itemConfig.commonFiles = Array.from(new Set([...existing, ...commonFiles]));
  }
  
  // 显示结果
  const messages: string[] = [];
  if (createdCount > 0) messages.push(`已创建 ${createdCount} 个 Variations`);
  if (skippedCount > 0) messages.push(`跳过 ${skippedCount} 个已存在`);
  if (commonFiles.length > 0) messages.push(`${commonFiles.length} 个文件划分为通用文件`);
  
  if (messages.length > 0) {
    toast.success(messages.join('，'));
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
  const variation = props.itemConfig.variations[variationIndex];
  
  if (availableFiles.value.length === 0) {
    toast.error('无法获取文件列表，请先上传文件');
    return;
  }
  
  selectedVariationIndex.value = variationIndex;
  
  const fileResult = await props.modal.openModal({
    type: 'selectFile',
    title: '选择文件（可多选）',
    formData: {
      fileIds: variation.fileIds ?? []
    }
  });
  
  selectedVariationIndex.value = null;
  
  if (!fileResult?.fileIds) return;
  
  const selectedFileIds = fileResult.fileIds as string[];
  const oldFileIds = variation.fileIds ?? [];
  const newFileIds = selectedFileIds.filter(id => !oldFileIds.includes(id));
  
  variation.fileIds = selectedFileIds;
  
  if (newFileIds.length > 0) {
    autoMatchItemsForFiles(variationIndex, newFileIds);
  }
}

// 商品选择
async function selectItemForFile(variationIndex: number, fileId: string): Promise<void> {
  const variation = props.itemConfig.variations[variationIndex];
  const currentItemId = variation.fileItemMap?.[fileId];
  
  selectingItemForFile.value = { variationIndex, fileId };
  
  const result = await props.modal.openModal({
    type: 'selectItem',
    title: `为 ${getFileName(fileId)} 选择商品（单选）`,
    formData: {
      itemIds: currentItemId ? [currentItemId] : []
    }
  });
  
  selectingItemForFile.value = null;
  
  if (!result?.itemIds) return;
  
  const selectedItemIds = result.itemIds as string[];
  
  if (!variation.fileItemMap) {
    variation.fileItemMap = {};
  }
  
  if (selectedItemIds.length === 0) {
    delete variation.fileItemMap[fileId];
  } else {
    variation.fileItemMap[fileId] = selectedItemIds[0];
  }
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
  
  return node.data?.itemName || node.name;
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
  const MIN_SCORE_THRESHOLD = 0.4;
  
  let bestMatch: { itemId: string; score: number } | null = null;
  
  for (const [nodeId, node] of Object.entries(props.itemTree.nodes)) {
    const itemName = (node as any).data?.itemName;
    if (!itemName) continue;
    
    const normalizedItemName = normalizeString(itemName);
    const score = calculateMatchScore(normalizedFileName, normalizedItemName);
    
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { itemId: nodeId, score };
    }
  }
  
  return bestMatch && bestMatch.score >= MIN_SCORE_THRESHOLD ? bestMatch.itemId : null;
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
  if (fileName.startsWith(itemName)) return 0.95;
  
  if (fileName.includes(itemName)) {
    const position = fileName.indexOf(itemName);
    const relativePosition = position / fileName.length;
    return 0.9 - (relativePosition * 0.2);
  }
  
  if (itemName.includes(fileName)) return 0.6;
  
  // 使用最长公共子串计算相似度
  const lcs = longestCommonSubstring(fileName, itemName);
  if (lcs.length === 0) return 0;
  
  const lcsRatio = lcs.length / itemName.length;
  if (lcsRatio >= 0.8) {
    return 0.5 + lcsRatio * 0.3;
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

/**
 * 比较两个文件ID数组是否包含相同的文件（忽略顺序）
 */
function fileIdsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  const setB = new Set(b);
  // 如果去重后大小不同，说明有重复元素
  if (setA.size !== a.length || setB.size !== b.length) return false;
  // 只需检查一个方向，因为长度已经相等
  return Array.from(setA).every(id => setB.has(id));
}

/**
 * 更新响应式的页面 variation 名称集合
 */
function updatePageVariationNames(): void {
  const names = props.api.variations
    .map(v => v.nameInput?.value?.trim())
    .filter(Boolean) as string[];
  
  pageVariationNames.value = new Set(names);
}

/**
 * 判断配置项是否应该被锁定（不允许拖动）
 * 规则：如果配置项的名称在页面中存在，则锁定
 */
function isVariationLocked(variation: any): boolean {
  const configName = variation.name?.trim();
  return configName ? pageVariationNames.value.has(configName) : false;
}

/**
 * 获取 variation 的完整文件列表（包含通用文件）
 */
function getVariationFileIds(config: any): string[] {
  return [
    ...(config.fileIds || []),
    ...(props.itemConfig.commonFiles || [])
  ];
}

// 应用到页面
async function applyVariations(): Promise<void> {
  const configVariations = props.itemConfig.variations;
  const pageVariations = props.api.variations;
  
  // ========== 步骤1: 检测配置中的重复名称 ==========
  const configNameCount = new Map<string, number>();
  configVariations.forEach(v => {
    const name = v.name?.trim() || '';
    if (name) {
      configNameCount.set(name, (configNameCount.get(name) || 0) + 1);
    }
  });
  
  const duplicates = Array.from(configNameCount.entries())
    .filter(([_, count]) => count > 1)
    .map(([name]) => name);
  
  if (duplicates.length > 0) {
    toast.error(
      `配置中存在重复名称：${duplicates.join('、')}，请先修正`,
      5000
    );
    return;
  }
  
  // ========== 步骤2: 构建页面 variation 名称映射 ==========
  const pageNameMap = new Map<string, number>(); // name -> index
  pageVariations.forEach((v, idx) => {
    const name = v.nameInput?.value?.trim() || '';
    if (name) pageNameMap.set(name, idx);
  });
  
  // ========== 步骤3: 分类配置项 ==========
  const toCreate: any[] = []; // 配置有但页面没有
  const toUpdate: Array<{ config: any; pageIndex: number }> = []; // 两者都有
  
  configVariations.forEach(config => {
    const name = config.name?.trim() || '';
    if (!name) return; // 跳过空名称
    
    const pageIndex = pageNameMap.get(name);
    if (pageIndex !== undefined) {
      toUpdate.push({ config, pageIndex });
    } else {
      toCreate.push(config);
    }
  });
  
  // ========== 步骤4: 检查页面多余的项 ==========
  const configNames = new Set(configVariations.map(v => v.name?.trim()).filter(Boolean));
  const extraOnPage = pageVariations.filter(v => {
    const name = v.nameInput?.value?.trim() || '';
    return name && !configNames.has(name);
  });
  
  if (extraOnPage.length > 0) {
    toast.warning(
      `页面有 ${extraOnPage.length} 个配置中不存在的 Variation，请手动删除`,
      5000
    );
  }
  
  // ========== 步骤5: 创建缺失的 variation ==========
  let createdCount = 0;
  
  if (toCreate.length > 3) {
    toast.info(`正在创建 ${toCreate.length} 个 Variations...`, 3000);
  }
  
  for (const config of toCreate) {
    const success = await props.api.addVariation();
    if (!success) {
      toast.error(`创建 Variation "${config.name}" 失败`);
      return;
    }
    
    // 获取最新的页面 variations
    const currentVariations = props.api.variations;
    const newIndex = currentVariations.length - 1; // 新创建的在最后
    
    // 设置名称和价格
    const targetPrice = getVariationPrice(config);
    props.api.updateVariation(newIndex, {
      name: config.name,
      price: targetPrice.toString()
    });
    
    // 设置文件
    const targetFileIds = getVariationFileIds(config);
    if (targetFileIds.length > 0) {
      await props.api.setVariationFiles(newIndex, targetFileIds, 'replace');
    }
    
    createdCount++;
  }
  
  // ========== 步骤6: 更新已存在的 variation ==========
  let updatedPriceCount = 0;
  let updatedFileCount = 0;
  
  for (const { config, pageIndex } of toUpdate) {
    const pageVar = props.api.variations[pageIndex];
    if (!pageVar) continue;
    
    // 检查并更新价格
    const targetPrice = getVariationPrice(config);
    const currentPrice = pageVar.priceInput?.value?.trim() || '';
    if (currentPrice !== targetPrice.toString()) {
      props.api.updateVariation(pageIndex, { price: targetPrice.toString() });
      updatedPriceCount++;
    }
    
    // 检查并更新文件
    const targetFileIds = getVariationFileIds(config);
    const currentFiles = props.api.getVariationFiles(pageIndex);
    if (!fileIdsEqual(currentFiles, targetFileIds) && targetFileIds.length > 0) {
      await props.api.setVariationFiles(pageIndex, targetFileIds, 'replace');
      updatedFileCount++;
    }
  }
  
  // ========== 步骤7: 显示结果 ==========
  const messages: string[] = [];
  if (createdCount > 0) messages.push(`创建 ${createdCount} 个`);
  if (updatedPriceCount > 0) messages.push(`更新 ${updatedPriceCount} 个价格`);
  if (updatedFileCount > 0) messages.push(`更新 ${updatedFileCount} 个文件`);
  
  if (messages.length > 0) {
    toast.success(`已应用：${messages.join('，')}`);
  } else {
    toast.success('所有 Variations 已是最新');
  }
  
  // ========== 步骤8: 更新页面输入框禁用状态 ==========
  // 页面 DOM 已改变，MutationObserver 会自动触发 updatePageVariationNames() 和 updatePageVariationInputsDisabledState()
  
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
        v-if="itemConfig.variations.length === 0"
        class="booth-btn booth-btn-sm booth-btn-ghost" 
        type="button"
        title="从页面导入"
        @click="importVariations"
      >
        <span v-html="withSize(icons.download, 14)"></span>
      </button>
      <button 
        v-if="itemConfig.variations.length === 0"
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
      :key-extractor="(item: any, index: number) => item.name || `variation-${index}`"
      :is-item-locked="isVariationLocked"
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
              <label 
                class="booth-toggle be-flex-shrink-0" 
                title="自定义此 Variation 的价格"
              >
                <input 
                  type="checkbox" 
                  v-model="variation.useCustomPrice"
                />
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
            v-if="variation.fileIds && variation.fileIds.length > 0" 
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
                  @click.stop="selectItemForFile(index, fileId)"
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
  grid-template-columns: repeat(3, 1fr);
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

<style>
/* 锁图标样式（全局样式，影响 Booth 页面） */
.booth-enhancer-lock-icon {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  cursor: help;
  z-index: 10;
}

.booth-enhancer-lock-icon svg {
  display: block;
}
</style>
