<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { ItemEditAPI } from '../../../../../../api/item-edit';
import { Simulate } from '../../../../../../utils/simulate';
import { getStableKey } from '../../../../../../utils/utils';
import { useApiFiles, useModal } from '../../../../composables';
import type { ItemData, ItemEditConfig, NodeTree, VariationData } from '../../../../config-types';
import { applyDiscount } from '../../../../utils/priceCalculator';
import { cleanMissingFileIds } from '../../../../utils/fileCleanup';
import { findBestMatchItem } from '../../../../utils/fileNameMatcher';
import { SectionHeader } from '../../../ui';
import { icons, withSize } from '../../../ui/icons';
import { DraggableCardList } from '../../../ui/list';
import { toast } from '../../../ui/Toast';
import VariationConfigModal from '../modals/VariationConfigModal.vue';

const props = defineProps<{
  itemConfig: ItemEditConfig;
  api: ItemEditAPI;
  modal: ReturnType<typeof useModal>;
  itemTree: NodeTree<ItemData>;
}>();

const emit = defineEmits<{
  applied: [];
}>();

// config variation -> page variation index 的映射（每个组件实例独立）
// 使用 Map（非 WeakMap）以支持原地 clear；内部 key 是 config variation 对象引用
const _variationPageIndexMap = new Map<object, number>();

/**
 * 规范化 variation 名称用于匹配：trim + lowercase
 * Booth 页面和用户输入常有大小写差异（MAYO vs Mayo），统一小写避免匹配失败
 */
function normalizeVariationName(name: string | undefined | null): string {
  return (name ?? '').trim().toLowerCase();
}

// Modal 状态
const showCommonFilesModal = ref(false);
const selectedVariationIndex = ref<number | null>(null);
const selectingItemForFile = ref<{ variationIndex: number; fileId: string } | null>(null);

// 响应式的页面 variation 名称集合
const pageVariationNames = ref<Set<string>>(new Set());

// 响应式的文件列表（监听 Booth 文件面板 DOM 变化）
const { files: reactiveFiles, refresh: refreshFiles } = useApiFiles(props.api);

// Computed
const hasFullset = computed((): boolean => 
  props.itemConfig.variations.some(v => v.isFullset)
);

const availableFiles = computed(() => reactiveFiles.value);

/**
 * 从页面解析出当前 variation 的完整状态
 * 
 * 作为 importVariations 和 restoreFilesFromPage 的共享解析层：
 * 1. 读取每个页面 variation 的名称、价格、fileIds
 * 2. 对每个文件尝试匹配商品，产出 fileItemMap
 * 3. 识别通用文件（未匹配到商品的 = 通用）
 * 4. 从各 variation 的 fileIds 里移除通用文件
 * 
 * Fullset 也会被包含在返回结果里（由调用方决定如何处理）。
 */
type ParsedPageVariation = {
  name: string;
  isFullset: boolean;
  price: number;
  fileIds: string[];
  fileItemMap: Record<string, string[]>;
};

function parseVariationsFromPage(): {
  variations: ParsedPageVariation[];
  commonFiles: string[];
} {
  const pageVariations = props.api.variations;
  if (pageVariations.length === 0) {
    return { variations: [], commonFiles: [] };
  }
  
  const files = reactiveFiles.value;
  
  // 步骤1：读取并初步匹配商品（商品匹配只决定 fileItemMap 默认值，不影响 fileIds 归属）
  const parsed: ParsedPageVariation[] = pageVariations.map((variation, index) => {
    const name = variation.nameInput?.value?.trim() || '';
    const isFullset = name.toLowerCase().includes('fullset');
    const priceStr = variation.priceInput?.value || '0';
    const price = parseInt(priceStr.replace(/\D/g, '')) || 0;
    const fileIds = props.api.getVariationFiles(index);
    
    const fileItemMap: Record<string, string[]> = {};
    for (const fileId of fileIds) {
      const file = files.find(f => f.id === fileId);
      if (!file) continue;
      const matchedItemId = findBestMatchItem(file.name, props.itemTree);
      if (matchedItemId) {
        fileItemMap[fileId] = [matchedItemId];
      }
    }
    
    return { name, isFullset, price, fileIds: [...fileIds], fileItemMap };
  });
  
  // 步骤2：识别通用文件（在多个 non-fullset variation 中同时出现的文件）
  // 页面是权威数据源：用户已经把文件分配好了，只有真正共享的才算通用
  // Fullset 会包含全部文件，所以不参与计数
  const occurCount = new Map<string, number>();
  parsed.forEach(pv => {
    if (pv.isFullset) return;
    pv.fileIds.forEach(id => {
      occurCount.set(id, (occurCount.get(id) || 0) + 1);
    });
  });
  const commonFiles = Array.from(occurCount.entries())
    .filter(([, count]) => count > 1)
    .map(([id]) => id);
  
  // 步骤3：从每个 variation 的 fileIds 移除通用文件（保持 ownFiles 语义）
  // Fullset 也一并处理（虽然它的 fileIds 在 apply 阶段不会直接用到）
  const commonSet = new Set(commonFiles);
  parsed.forEach(pv => {
    pv.fileIds = pv.fileIds.filter(id => !commonSet.has(id));
  });
  
  return { variations: parsed, commonFiles };
}

// 从页面导入 Variations（完全替换配置）
async function importVariations(): Promise<void> {
  const { variations: parsed, commonFiles } = parseVariationsFromPage();
  
  if (parsed.length === 0) {
    toast.info('页面没有 Variations');
    return;
  }
  
  // 同步价格到 pricing 配置
  const fullsetVariation = parsed.find(v => v.isFullset);
  const normalVariation = parsed.find(v => !v.isFullset);
  
  if (fullsetVariation) {
    props.itemConfig.pricing.fullsetPrice = fullsetVariation.price;
  }
  if (normalVariation) {
    props.itemConfig.pricing.normalVariationPrice = normalVariation.price;
  }
  
  // 写入配置（剥离 parse 阶段多出的 price 字段，保持 VariationData 结构）
  props.itemConfig.variations = parsed.map(pv => ({
    name: pv.name,
    price: pv.price,
    isFullset: pv.isFullset,
    fileIds: pv.fileIds,
    fileItemMap: pv.fileItemMap
  }));
  props.itemConfig.commonFiles = commonFiles;
  
  const messages: string[] = [`已导入 ${parsed.length} 个 Variations`];
  if (commonFiles.length > 0) {
    messages.push(`检测到 ${commonFiles.length} 个通用文件`);
  }
  toast.success(messages.join('，'));
  
  updatePageVariationNames();
}

/**
 * 仅从页面恢复 variation 的文件关联 + 补齐缺失的 variation
 * 
 * 双重恢复策略：
 * 1. **已有 variation（按名匹配成功）**：保留用户手动设置的 name/price/isFullset/customPrice 等
 *    不动，仅回填 fileIds / fileItemMap。
 * 2. **config 中缺失但页面存在**：按页面状态完整补回（name/price/fileIds/fileItemMap），
 *    isFullset 默认 false，用户可在 UI 上再切换。
 * 3. config 中已有但页面没有的 variation 不动（可能是用户刚在面板里加的还没应用）。
 * 
 * commonFiles 做合并去重（保留原有 + 新识别，最后用实际页面文件过滤）。
 * 
 * @returns { restoredFiles: 回填文件的 variation 数, addedVariations: 新增的 variation 数 }
 */
function restoreFilesFromPage(): { restoredFiles: number; addedVariations: number } {
  const { variations: parsed, commonFiles: detectedCommon } = parseVariationsFromPage();
  if (parsed.length === 0) return { restoredFiles: 0, addedVariations: 0 };
  
  // 建立 config 中 name → variation 的索引（跳过没名的，避免命名空导致误匹配）
  // 使用规范化名称（lowercase trimmed）做 key，避免大小写差异导致匹配失败
  const configByName = new Map<string, VariationData>();
  props.itemConfig.variations.forEach(v => {
    const key = normalizeVariationName(v.name);
    if (key) configByName.set(key, v);
  });
  
  let restoredFiles = 0;
  let addedVariations = 0;
  
  parsed.forEach(pv => {
    // Fullset 跳过：它的文件在 apply 阶段由其它 variation 推导，isFullset 状态由用户在 UI 控制
    if (pv.isFullset) return;
    
    const existing = configByName.get(normalizeVariationName(pv.name));
    if (existing) {
      // 已存在：只回填文件关联，保留其它字段
      existing.fileIds = [...pv.fileIds];
      if (!existing.fileItemMap) existing.fileItemMap = {};
      for (const [fileId, itemIds] of Object.entries(pv.fileItemMap)) {
        if (existing.fileItemMap[fileId]?.length) continue; // 保留用户已有映射
        existing.fileItemMap[fileId] = itemIds;
      }
      restoredFiles++;
    } else {
      // 配置中不存在：完整补回
      props.itemConfig.variations.push({
        name: pv.name,
        price: pv.price,
        isFullset: false,
        fileIds: pv.fileIds,
        fileItemMap: pv.fileItemMap
      });
      addedVariations++;
    }
  });
  
  // commonFiles 合并：保留 config 原有 + 新识别的，再用实际页面文件过滤
  const allPageFiles = new Set<string>();
  parsed.forEach(pv => pv.fileIds.forEach(id => allPageFiles.add(id)));
  detectedCommon.forEach(id => allPageFiles.add(id));
  
  const mergedCommon = new Set<string>([
    ...(props.itemConfig.commonFiles || []),
    ...detectedCommon
  ]);
  props.itemConfig.commonFiles = Array.from(mergedCommon).filter(id => allPageFiles.has(id));
  
  // 按页面顺序对齐 config.variations 排序
  syncVariationOrderFromPage();
  updatePageVariationNames();
  return { restoredFiles, addedVariations };
}

/**
 * 智能"从页面导入"：
 * - 当 config 中没有 variations 时，执行完整导入（原 importVariations 逻辑）
 * - 当已有 variations 时，弹确认对话框让用户选择行为（增量恢复）
 */
async function handleImportFromPage(): Promise<void> {
  const pageVariations = props.api.variations;
  
  if (pageVariations.length === 0) {
    toast.info('页面没有 Variations');
    return;
  }
  
  // 没有配置 → 走完整导入
  if (props.itemConfig.variations.length === 0) {
    await importVariations();
    return;
  }
  
  // 有配置 → 先问用户意图
  const choice = await props.modal.openModal({
    type: 'delete',
    title: '从页面恢复',
    formData: {
      message: '将从页面增量恢复 Variation 数据：\n' +
        '  • 已存在的：保留名称/价格/自定义价格等，仅回填文件关联\n' +
        '  • 配置中缺失但页面有的：完整补回\n' +
        '  • 配置中有但页面没有的：不动\n\n' +
        '取消=不做任何改动；确认=开始恢复。'
    }
  });
  
  if (!choice) return;
  
  const { restoredFiles, addedVariations } = restoreFilesFromPage();
  
  const messages: string[] = [];
  if (restoredFiles > 0) messages.push(`恢复 ${restoredFiles} 个的文件关联`);
  if (addedVariations > 0) messages.push(`补回 ${addedVariations} 个缺失项`);
  
  if (messages.length > 0) {
    toast.success(messages.join('，'));
  } else {
    toast.warning('没有需要恢复的内容');
  }
}

// 根据页面 Variation 顺序同步配置顺序
function syncVariationOrderFromPage(): void {
  const pageVariations = props.api.variations;
  
  if (pageVariations.length === 0 || props.itemConfig.variations.length === 0) {
    return;
  }
  
  // 获取页面 variation 的名称顺序（原始）和规范化版本（用于匹配）
  const pageNames = pageVariations.map(v => v.nameInput?.value?.trim() || '');
  const pageNamesNormalized = pageNames.map(normalizeVariationName);
  const pageNameSet = new Set(pageNamesNormalized);
  
  // 按页面顺序重组配置项（大小写不敏感匹配）
  const configInPageOrder = pageNamesNormalized
    .map(key => props.itemConfig.variations.find(v => normalizeVariationName(v.name) === key))
    .filter((v): v is VariationData => v !== undefined);
  
  // 添加配置中有但页面没有的项（保持原有顺序）
  const configNotInPage = props.itemConfig.variations.filter(
    v => !pageNameSet.has(normalizeVariationName(v.name))
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
// 不再等待（避免 5s 阻塞）：若页面暂无 variation，直接返回，
// 由 onVariationAdded 回调中的补跑逻辑接手
function startVariationOrderSync(): void {
  const variations = props.api.variations;
  
  if (variations.length === 0) {
    // 页面暂无 variation，跳过并等待新增事件
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
      .map(v => normalizeVariationName(v.name))
      .filter(Boolean)
  );
  
  props.api.variations.forEach(pageVar => {
    const pageKey = normalizeVariationName(pageVar.nameInput?.value);
    const shouldDisable = Boolean(pageKey && configNameSet.has(pageKey));
    
    if (pageVar.nameInput) {
      toggleInputLock(pageVar.nameInput, shouldDisable, 'name');
    }
    
    if (pageVar.priceInput) {
      toggleInputLock(pageVar.priceInput, shouldDisable, 'price');
    }
  });
}

/**
 * 清理所有已锁定的页面 variation 输入框状态
 * 组件卸载时调用
 */
function clearAllPageLocks(): void {
  const variations = props.api.variations;
  variations.forEach(pageVar => {
    if (pageVar.nameInput) {
      toggleInputLock(pageVar.nameInput, false, 'name');
    }
    if (pageVar.priceInput) {
      toggleInputLock(pageVar.priceInput, false, 'price');
    }
  });
  
  // 兜底：清理所有残留的锁图标（以防 variations 元素已被 DOM 替换）
  document.querySelectorAll('.booth-enhancer-lock-icon').forEach(el => el.remove());
  document
    .querySelectorAll<HTMLInputElement>('input[disabled].charcoal-text-field-input')
    .forEach(input => {
      // 只解锁由我们管理的输入框（variation name/price 区域）
      if (input.closest('[id^="variationName-"]') || input.closest('[id^="variationDigitalPrice-"]')) {
        input.disabled = false;
      }
    });
}

// 组件挂载时启动监听
// 取消订阅函数（组件卸载时清理）
let unsubscribeFilesChanged: (() => void) | null = null;

onMounted(() => {
  // 注册 API 回调：监听 variation 添加/删除
  props.api.onVariationAdded(() => {
    updatePageVariationNames();
    updatePageVariationInputsDisabledState();
    
    // 如果之前因为没有 variation 而跳过了 observer，现在首次出现时补跑
    if (!variationObserver) {
      startVariationOrderSync();
    }
  });
  
  // 启动顺序同步和 DOM 监听
  startVariationOrderSync();
  
  // 初次挂载时清理一次历史失效引用（等文件面板 DOM 就绪）
  // 注意：页面无文件时不清理，避免把 config 里的 fileId 全当失效
  setTimeout(() => {
    if (reactiveFiles.value.length > 0) {
      syncFilesWithPage(true);
    }
  }, 500);
  
  // 订阅文件面板变化：用户在 Booth 页面增删文件时立即清理 config
  // 注意：useApiFiles 的订阅在 setup 阶段已注册且先于此订阅，
  // 所以此回调触发时 reactiveFiles 已经是最新值
  unsubscribeFilesChanged = props.api.onFilesChanged(() => {
    // 安全守卫：页面上读不到任何文件时绝对不清理
    // 这几乎总是"面板 DOM 未就绪 / 临时消失"而非用户真的删光，
    // 如果此时清理会把用户所有 fileIds/fileItemMap 全抹掉
    if (reactiveFiles.value.length === 0) return;
    
    // 签名变化才会触发此回调，若 config 中有对已删除文件的引用，会被立即清掉
    const removed = syncFilesWithPage(true);
    if (removed > 0) {
      toast.info(`检测到文件变动，已清理 ${removed} 个失效引用`, 2500);
    }
  });
});

// 组件卸载时停止监听并清理页面修改
onUnmounted(() => {
  stopVariationOrderSync();
  clearAllPageLocks();
  unsubscribeFilesChanged?.();
  unsubscribeFilesChanged = null;
});

// 自动根据文件创建 Variations
function autoCreateVariationsFromFiles(): void {
  // 使用响应式文件列表
  const files = reactiveFiles.value;
  
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
    const matchedItemId = findBestMatchItem(file.name, props.itemTree);
    
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
        fileItemMap: { [file.id]: [matchedItemId] }
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
function toggleFullset(variation: VariationData, index: number): void {
  if (variation.isFullset) {
    variation.isFullset = false;
    return;
  }
  
  // 取消其他 variation 的 fullset 状态
  props.itemConfig.variations.forEach((v, i) => {
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
function getVariationPrice(variation: VariationData): number {
  const { pricing, discount } = props.itemConfig;
  
  if (variation.isFullset) {
    return applyDiscount(pricing.fullsetPrice, discount);
  }
  
  if (variation.useCustomPrice && variation.customPrice !== undefined) {
    return applyDiscount(variation.customPrice, discount);
  }
  
  return applyDiscount(pricing.normalVariationPrice, discount);
}

// 获取支持数（统计唯一商品数量，多个文件引用同一商品只算一次）
function getVariationSupportCount(variation: VariationData): number {
  if (variation.isFullset) return 1;
  
  if (!variation.fileItemMap) return 0;
  
  // 收集所有唯一的商品 ID
  const uniqueItemIds = new Set<string>();
  Object.values(variation.fileItemMap).forEach((itemIds) => {
    if (Array.isArray(itemIds)) {
      itemIds.forEach(id => {
        if (id) uniqueItemIds.add(id);
      });
    }
  });
  
  return uniqueItemIds.size;
}

// 文件选择
async function selectFilesForVariation(variationIndex: number): Promise<void> {
  const variation = props.itemConfig.variations[variationIndex];
  
  // 使用响应式文件列表
  const files = reactiveFiles.value;
  if (files.length === 0) {
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

// 商品选择（支持多选）
async function selectItemsForFile(variationIndex: number, fileId: string): Promise<void> {
  const variation = props.itemConfig.variations[variationIndex];
  const currentItemIds = variation.fileItemMap?.[fileId] || [];
  
  selectingItemForFile.value = { variationIndex, fileId };
  
  const result = await props.modal.openModal({
    type: 'selectItem',
    title: `为 ${getFileName(fileId)} 选择商品（可多选）`,
    formData: {
      itemIds: currentItemIds
    }
  });
  
  selectingItemForFile.value = null;
  
  if (!result?.itemIds) return;
  
  const selectedItemIds = result.itemIds as string[];
  
  if (!variation.fileItemMap) {
    variation.fileItemMap = {};
  }
  
  // 存储为数组
  if (selectedItemIds.length === 0) {
    delete variation.fileItemMap[fileId];
  } else {
    variation.fileItemMap[fileId] = selectedItemIds;
    
    // 如果 variation 没有名字，使用第一个选中商品的名字
    if (!variation.name || variation.name.trim() === '') {
      const firstItemId = selectedItemIds[0];
      const firstItemNode = props.itemTree.nodes[firstItemId];
      if (firstItemNode) {
        variation.name = firstItemNode.data?.itemName || firstItemNode.name || '';
      }
    }
  }
}

// 辅助函数
function getFileName(fileId: string): string {
  // 使用响应式的 files 以便 DOM 变化后自动更新
  const file = reactiveFiles.value.find(f => f.id === fileId);
  // 如果文件在页面上已不存在，返回空字符串（UI 层会显示为失效状态或直接过滤）
  return file ? file.name : '';
}

/**
 * 同步本地配置与页面实际文件：清理所有已失效的 fileId
 * @param silent 是否静默（不显示 toast）
 * @returns 清理的总数
 */
function syncFilesWithPage(silent = true): number {
  const availableFileIds = new Set(reactiveFiles.value.map(f => f.id));
  const result = cleanMissingFileIds(props.itemConfig, availableFileIds);
  
  if (!silent && result.total > 0) {
    toast.info(`已清理 ${result.total} 个失效的文件引用`, 3000);
  }
  
  return result.total;
}

function getFileItemIds(variationIndex: number, fileId: string): string[] {
  const variation = props.itemConfig.variations[variationIndex];
  return variation.fileItemMap?.[fileId] || [];
}

function removeItemFromFile(variationIndex: number, fileId: string, itemId: string): void {
  const variation = props.itemConfig.variations[variationIndex];
  if (!variation.fileItemMap?.[fileId]) return;
  
  const itemIds = variation.fileItemMap[fileId];
  const index = itemIds.indexOf(itemId);
  if (index > -1) {
    itemIds.splice(index, 1);
  }
  
  // 如果没有商品了，删除整个映射
  if (itemIds.length === 0) {
    delete variation.fileItemMap[fileId];
  }
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

function removeCommonFile(fileId: string): void {
  if (!props.itemConfig.commonFiles) return;
  props.itemConfig.commonFiles = props.itemConfig.commonFiles.filter(
    id => id !== fileId
  );
}

// 自动匹配逻辑
function autoMatchItemsForFiles(variationIndex: number, fileIds: string[]): void {
  const variation = props.itemConfig.variations[variationIndex];
  
  if (!variation.fileItemMap) {
    variation.fileItemMap = {};
  }
  
  let firstMatchedItemId: string | null = null;
  
  // 使用响应式文件列表
  const files = reactiveFiles.value;
  
  for (const fileId of fileIds) {
    if (variation.fileItemMap[fileId]) {
      continue;
    }
    
    const file = files.find(f => f.id === fileId);
    if (!file) continue;
    
    const matchedItemId = findBestMatchItem(file.name, props.itemTree);
    
    if (matchedItemId) {
      variation.fileItemMap[fileId] = [matchedItemId]; // 改为数组
      if (!firstMatchedItemId) {
        firstMatchedItemId = matchedItemId;
      }
    }
  }
  
  // 如果 variation 没有名字且匹配到了商品，使用第一个匹配商品的名字
  if (firstMatchedItemId && (!variation.name || variation.name.trim() === '')) {
    const firstItemNode = props.itemTree.nodes[firstMatchedItemId];
    if (firstItemNode) {
      variation.name = firstItemNode.data?.itemName || firstItemNode.name || '';
    }
  }
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
 * 更新响应式的页面 variation 名称集合，并刷新 config -> page 映射
 * 注意：名称比较统一使用规范化（lowercase trimmed），避免大小写导致匹配失败
 */
function updatePageVariationNames(): void {
  const pageVariations = props.api.variations;
  const normalizedNames = pageVariations
    .map(v => normalizeVariationName(v.nameInput?.value))
    .filter(Boolean);
  
  pageVariationNames.value = new Set(normalizedNames);

  // 重建 config variation -> page variation index 映射（大小写不敏感）
  _variationPageIndexMap.clear();
  const pageNameToIndex = new Map<string, number>();
  pageVariations.forEach((v, idx) => {
    const key = normalizeVariationName(v.nameInput?.value);
    if (key) pageNameToIndex.set(key, idx);
  });

  for (const configVar of props.itemConfig.variations) {
    const key = normalizeVariationName(configVar.name);
    if (key && pageNameToIndex.has(key)) {
      _variationPageIndexMap.set(configVar, pageNameToIndex.get(key)!);
    }
  }
}

/**
 * 处理 variation 名称输入，实时同步到页面
 */
function handleVariationNameInput(variation: VariationData, event: Event): void {
  const newValue = (event.target as HTMLInputElement).value;
  const oldKey = normalizeVariationName(variation.name);
  variation.name = newValue;

  const pageIndex = _variationPageIndexMap.get(variation);
  if (pageIndex === undefined) return;

  const pageVar = props.api.variations[pageIndex];
  if (pageVar?.nameInput) {
    Simulate.input(pageVar.nameInput, newValue);

    // 同步更新 pageVariationNames 保持锁定状态（规范化 key，重新赋值触发响应式）
    const updated = new Set(pageVariationNames.value);
    if (oldKey) updated.delete(oldKey);
    const newKey = normalizeVariationName(newValue);
    if (newKey) updated.add(newKey);
    pageVariationNames.value = updated;
  }
}

/**
 * 判断配置项是否应该被锁定（不允许拖动）
 * 规则：如果配置项的名称在页面中存在，则锁定
 */
function isVariationLocked(variation: VariationData): boolean {
  const key = normalizeVariationName(variation.name);
  return key ? pageVariationNames.value.has(key) : false;
}

/**
 * 获取 variation 的完整文件列表（包含通用文件）
 * 同时过滤掉页面上已不存在的 fileId，保证 apply 阶段 diff 能正确判等
 */
function getVariationFileIds(config: VariationData): string[] {
  const availableFileIds = new Set(reactiveFiles.value.map(f => f.id));
  const isValid = (id: string) => availableFileIds.has(id);
  
  const commonFiles = (props.itemConfig.commonFiles || []).filter(isValid);
  
  // Fullset 应该包含所有非 fullset variations 的文件
  if (config.isFullset) {
    const allFileIds = new Set<string>();
    
    props.itemConfig.variations.forEach(v => {
      if (!v.isFullset && v.fileIds) {
        v.fileIds.forEach(fileId => {
          if (isValid(fileId)) allFileIds.add(fileId);
        });
      }
    });
    
    commonFiles.forEach(fileId => allFileIds.add(fileId));
    
    return Array.from(allFileIds);
  }
  
  // 普通 variation
  const ownFiles = (config.fileIds || []).filter(isValid);
  return [...ownFiles, ...commonFiles];
}

// 应用到页面
async function applyVariations(): Promise<void> {
  // 应用前刷新一次文件列表作为兜底
  // （正常情况下 onFilesChanged 已即时清理，这里只为极端时序兜底）
  refreshFiles();
  if (reactiveFiles.value.length > 0) {
    syncFilesWithPage(true);
  }
  
  const configVariations = props.itemConfig.variations;
  const pageVariations = props.api.variations;
  
  // ========== 步骤1: 检测配置中的重复名称（大小写不敏感） ==========
  const configNameCount = new Map<string, number>();
  const configNameDisplay = new Map<string, string>(); // key -> 第一次出现的原始名，用于报错展示
  configVariations.forEach(v => {
    const key = normalizeVariationName(v.name);
    if (!key) return;
    configNameCount.set(key, (configNameCount.get(key) || 0) + 1);
    if (!configNameDisplay.has(key)) {
      configNameDisplay.set(key, v.name?.trim() || key);
    }
  });
  
  const duplicates = Array.from(configNameCount.entries())
    .filter(([_, count]) => count > 1)
    .map(([key]) => configNameDisplay.get(key) || key);
  
  if (duplicates.length > 0) {
    toast.error(
      `配置中存在重复名称：${duplicates.join('、')}，请先修正`,
      5000
    );
    return;
  }
  
  // ========== 步骤2: 构建页面 variation 名称映射（大小写不敏感） ==========
  const pageNameMap = new Map<string, number>(); // normalizedKey -> index
  pageVariations.forEach((v, idx) => {
    const key = normalizeVariationName(v.nameInput?.value);
    if (key) pageNameMap.set(key, idx);
  });
  
  // ========== 步骤3: 分类配置项 ==========
  const toCreate: VariationData[] = []; // 配置有但页面没有
  const toUpdate: Array<{ config: VariationData; pageIndex: number }> = []; // 两者都有
  
  configVariations.forEach(config => {
    const key = normalizeVariationName(config.name);
    if (!key) return; // 跳过空名称
    
    const pageIndex = pageNameMap.get(key);
    if (pageIndex !== undefined) {
      toUpdate.push({ config, pageIndex });
    } else {
      toCreate.push(config);
    }
  });
  
  // ========== 步骤4: 处理页面多余的项 ==========
  // 页面上存在但配置里不存在的 variation
  const configNames = new Set(
    configVariations.map(v => normalizeVariationName(v.name)).filter(Boolean)
  );
  const extraOnPage = pageVariations
    .map((v, idx) => ({
      pageIndex: idx,
      name: v.nameInput?.value?.trim() || '',
      key: normalizeVariationName(v.nameInput?.value)
    }))
    .filter(item => item.key && !configNames.has(item.key));
  
  // ========== 步骤4.5: 复用页面多余项（就地覆盖，避免删+建） ==========
  // 如果有"需要创建"的 config 和"页面多余"的 variation，优先配对复用
  const toReuse: Array<{ config: VariationData; pageIndex: number }> = [];
  while (toCreate.length > 0 && extraOnPage.length > 0) {
    const config = toCreate.shift()!;
    const extra = extraOnPage.shift()!;
    toReuse.push({ config, pageIndex: extra.pageIndex });
  }
  
  // 剩余的 extraOnPage 才是真正多余的，询问用户是否删除
  let deletedExtraCount = 0;
  if (extraOnPage.length > 0) {
    const names = extraOnPage.map(e => e.name).join('、');
    const shouldDelete = await props.modal.openModal({
      type: 'delete',
      title: '删除多余 Variation？',
      formData: {
        message: `页面有 ${extraOnPage.length} 个配置中不存在的 Variation：${names}。是否自动删除？（取消则保留）`
      }
    });
    
    if (shouldDelete) {
      // 从后往前删除，避免索引偏移
      const sortedIndices = extraOnPage.map(e => e.pageIndex).sort((a, b) => b - a);
      for (const pageIndex of sortedIndices) {
        const ok = await props.api.removeVariation(pageIndex);
        if (ok) {
          deletedExtraCount++;
        } else {
          toast.error(`删除页面第 ${pageIndex + 1} 个 Variation 失败`);
          break;
        }
      }
    }
  }
  
  // ========== 步骤5: 创建缺失的 variation ==========
  let createdCount = 0;
  
  if (toCreate.length > 0) {
    toast.info(`准备创建 ${toCreate.length} 个 Variations...`, 2000);
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
    
    // 每创建 3 个（或最后一个）更新一次进度提示
    if (toCreate.length > 3 && (createdCount % 3 === 0 || createdCount === toCreate.length)) {
      toast.info(`创建进度: ${createdCount} / ${toCreate.length}`, 1500);
    }
  }
  
  // ========== 步骤6: 更新已存在的 variation + 复用项 ==========
  let updatedPriceCount = 0;
  let updatedFileCount = 0;
  let updatedNameCount = 0;
  let updateProcessedCount = 0;
  
  // 合并 toUpdate（名字匹配的）和 toReuse（就地覆盖的）
  const allUpdates = [
    ...toUpdate,
    ...toReuse
  ];
  const totalToUpdate = allUpdates.length;
  
  for (const { config, pageIndex } of allUpdates) {
    const pageVar = props.api.variations[pageIndex];
    if (!pageVar) continue;
    
    // 检查并更新名称（复用项名字一定不同，需要覆盖）
    const currentName = pageVar.nameInput?.value?.trim() || '';
    const targetName = config.name?.trim() || '';
    if (currentName !== targetName && targetName) {
      props.api.updateVariation(pageIndex, { name: targetName });
      updatedNameCount++;
    }
    
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
    if (!fileIdsEqual(currentFiles, targetFileIds)) {
      await props.api.setVariationFiles(pageIndex, targetFileIds, 'replace');
      updatedFileCount++;
    }
    
    updateProcessedCount++;
    if (totalToUpdate > 5 && (updatedFileCount > 0) && (updateProcessedCount % 3 === 0)) {
      toast.info(`更新进度: ${updateProcessedCount} / ${totalToUpdate}`, 1500);
    }
  }
  
  // ========== 步骤7: 显示结果 ==========
  const messages: string[] = [];
  if (createdCount > 0) messages.push(`创建 ${createdCount} 个`);
  if (deletedExtraCount > 0) messages.push(`删除 ${deletedExtraCount} 个多余项`);
  if (updatedNameCount > 0) messages.push(`覆盖 ${updatedNameCount} 个名称`);
  if (updatedPriceCount > 0) messages.push(`更新 ${updatedPriceCount} 个价格`);
  if (updatedFileCount > 0) messages.push(`更新 ${updatedFileCount} 个文件`);
  
  if (messages.length > 0) {
    toast.success(`已应用：${messages.join('，')}`);
  } else {
    toast.success('所有 Variations 已是最新');
  }
  
  // ========== 步骤8: 应用后强制同步面板状态 ==========
  // 页面 DOM 已改变（名字/价格/文件都可能变了），主动刷新一次：
  // 1. 按页面顺序重排 config.variations
  // 2. 重建 name → pageIndex 映射
  // 3. 更新锁定状态
  syncVariationOrderFromPage();
  updatePageVariationNames();
  updatePageVariationInputsDisabledState();
  
  emit('applied');
}

defineExpose({
  applyVariations
});
</script>

<template>
  <SectionHeader :title="`Variations (${itemConfig.variations.length})`" no-border collapsible section-id="edit-variations">
    <template #actions>
      <button 
        class="booth-btn booth-btn-sm booth-btn-ghost" 
        type="button"
        :title="itemConfig.variations.length === 0 ? '从页面导入' : '从页面恢复（补回缺失的 Variation 和文件关联）'"
        @click="handleImportFromPage"
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
        title="通用文件配置"
        @click="showCommonFilesModal = true"
      >
        <span v-html="withSize(icons.folder, 14)"></span>
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
          class="common-file-tag"
          :class="{ 'is-missing': !getFileName(fileId) }"
          :title="getFileName(fileId) ? '' : '此文件已不存在，点击 × 移除'"
        >
          <span class="common-file-tag-text">
            {{ getFileName(fileId) || '(已失效)' }}
          </span>
          <button 
            class="common-file-remove"
            type="button"
            title="从通用文件中移除"
            @click.stop="removeCommonFile(fileId)"
          >
            <span v-html="withSize(icons.close, 10)"></span>
          </button>
        </span>
      </div>
    </div>

    <div v-if="itemConfig.variations.length === 0" class="empty-hint">
      暂无 Variations，点击"添加"或"从页面导入"
    </div>

    <DraggableCardList
      v-else
      :items="itemConfig.variations"
      :key-extractor="(item: any) => getStableKey(item)"
      :is-item-locked="isVariationLocked"
      @remove="removeVariation"
      @reorder="onVariationReorder"
    >
      <template #actions="{ item: variation, index }">
        <div class="be-flex be-align-center be-gap-sm" style="flex: 1;">
          <input 
            :value="variation.name" 
            type="text" 
            class="be-flex-1 be-p-xs be-px-sm be-text-base"
            style="height: 28px;" 
            placeholder="Variation 名称"
            @input="handleVariationNameInput(variation, $event)"
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
          
          <!-- Fullset 不需要显示文件-商品关联 -->
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
                <span 
                  class="item-card-title"
                  :class="{ 'is-missing': !getFileName(fileId) }"
                  :title="getFileName(fileId) ? getFileName(fileId) : '此文件已不存在，点击 × 移除'"
                >
                  {{ getFileName(fileId) || '(已失效)' }}
                </span>
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
                <!-- 改为显示多个商品标签 -->
                <div class="item-list-container">
                  <div 
                    v-for="itemId in getFileItemIds(index, fileId)" 
                    :key="itemId"
                    class="item-tag"
                  >
                    <span class="item-tag-text">
                      {{ props.itemTree.nodes[itemId]?.data?.itemName || props.itemTree.nodes[itemId]?.name || '未知商品' }}
                    </span>
                    <button 
                      class="item-tag-remove"
                      type="button"
                      title="移除此商品"
                      @click.stop="removeItemFromFile(index, fileId, itemId)"
                    >
                      <span v-html="withSize(icons.close, 10)"></span>
                    </button>
                  </div>
                  
                  <!-- 添加商品按钮 -->
                  <button
                    class="item-add-btn"
                    type="button"
                    title="添加商品"
                    @click.stop="selectItemsForFile(index, fileId)"
                  >
                    <span v-html="withSize(icons.plus, 12)"></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </DraggableCardList>
  </SectionHeader>

  <!-- 通用文件配置 Modal -->
  <VariationConfigModal
    :show="showCommonFilesModal"
    :item-config="itemConfig"
    :available-files="availableFiles"
    @close="showCommonFilesModal = false"
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

.item-card-title.is-missing {
  color: var(--be-color-danger, #ef4444);
  font-style: italic;
  font-weight: 500;
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

.item-card-delete-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.2);
}

.item-card-delete-btn:focus:not(:focus-visible) {
  box-shadow: none;
}

.item-card-content {
  padding: 6px 8px;
}

.item-list-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.item-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--be-space-xs);
  padding: 4px 8px;
  background: var(--be-color-bg-secondary);
  border: 1px solid var(--be-color-border);
  border-radius: var(--be-radius-sm);
  font-size: var(--be-font-size-xs);
  color: var(--be-color-text);
  font-weight: 500;
  transition: var(--be-transition-normal);
}

.item-tag-text {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-tag-remove {
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
  transition: var(--be-transition-normal);
}

.item-tag-remove:hover {
  background: var(--be-color-danger);
  color: white;
}

.item-tag-remove:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.item-tag-remove:focus:not(:focus-visible) {
  box-shadow: none;
}

.item-add-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: var(--be-color-bg);
  border: 1px dashed var(--be-color-border);
  border-radius: var(--be-radius-sm);
  color: var(--be-color-text-secondary);
  cursor: pointer;
  transition: var(--be-transition-normal);
}

.item-add-btn:hover {
  border-style: solid;
  border-color: var(--be-color-primary);
  color: var(--be-color-primary);
  background: var(--be-color-bg-secondary);
}

.item-add-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.item-add-btn:focus:not(:focus-visible) {
  box-shadow: none;
}

.item-add-text {
  white-space: nowrap;
}

/* 通用文件标签 */
.common-file-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 4px 2px 6px;
  background: var(--be-color-bg);
  border: 1px solid var(--be-color-border);
  border-radius: 4px;
  font-size: var(--be-font-size-xs);
  line-height: 1.2;
  transition: var(--be-transition-normal);
}

.common-file-tag.is-missing {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.35);
  color: var(--be-color-danger, #ef4444);
  font-style: italic;
}

.common-file-tag-text {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.common-file-remove {
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
  color: inherit;
  cursor: pointer;
  opacity: 0.6;
  transition: var(--be-transition-normal);
}

.common-file-remove:hover {
  opacity: 1;
  background: rgba(239, 68, 68, 0.15);
}

.common-file-remove:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.common-file-remove:focus:not(:focus-visible) {
  box-shadow: none;
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
