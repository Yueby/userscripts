/**
 * Unity 风格的树节点系统
 * 所有节点平等，都可以有子节点，都可以携带数据
 */

// 核心节点接口
export interface Node<T = any> {
  id: string;
  parentId: string | null;
  name: string;
  children: string[];     // 子节点ID列表
  expanded: boolean;      // UI 展开状态
  data?: T;               // 可选的数据载荷
  createdAt: number;
  updatedAt: number;
}

// Tag 数据
export interface TagData {
  tags: string[];
}

// 商品数据
export interface ItemData {
  authorName: string;
  itemName: string;
  itemUrl: string;
}

// 树存储结构（扁平化）
export interface NodeTree<T> {
  rootIds: string[];
  nodes: { [id: string]: Node<T> };
}

// ===== 模块化数据类型 =====

// 标签数据
export interface TagsData {
  tagTree: NodeTree<TagData>;
}

// 商品列表数据
export interface ItemsData {
  itemTree: NodeTree<ItemData>;
}

// 全局模板数据
export interface TemplatesData {
  globalTemplates: GlobalTemplateConfig;
}

// ===== 编辑Tab相关类型 =====

// 商品类型
export type ItemType = 'adaptation' | 'normal';

// Section 类型
export type SectionType = 'normal' | 'log' | 'iteminfo';

// Log 条目
export interface LogEntry {
  id: string;
  date: number; // 时间戳
  content: string;
}

// Variation 数据
export interface VariationData {
  name: string;
  price: number; // Variation 价格（根据打折开关自动调整）
  isFullset?: boolean; // 是否为 Fullset variation
  useCustomPrice?: boolean; // 是否使用自定义价格
  customPrice?: number; // 自定义价格（覆盖配置的价格）
  fileIds?: string[]; // 关联的文件 ID 列表
  fileItemMap?: { [fileId: string]: string }; // 文件ID到商品ID的映射关系
}

// 打折配置
export interface DiscountConfig {
  enabled: boolean; // 打折开关
  discountPercent: number; // 折扣百分比
  startDate?: string; // 折扣开始时间 (ISO 8601 格式)
  endDate?: string; // 折扣结束时间 (ISO 8601 格式)
}

// 价格配置
export interface PriceConfig {
  normalVariationPrice: number; // 普通 Variation 的基础价格
  fullsetPrice: number; // Fullset Variation 的价格
}

// ===== 模板类型定义 =====

// 通用模板项基础接口
export interface BaseTemplate {
  id: string;
  name: string; // 模板显示名称
  isDefault?: boolean; // 是否为默认模板
}

// 通用文本模板（商品名、描述、打折、更新日志、商品信息都用这个）
export interface TextTemplate extends BaseTemplate {
  template: string;
}

// Section 模板（特殊，有 headline 和 body）
export interface SectionTemplate extends BaseTemplate {
  type?: 'normal' | 'iteminfo' | 'log'; // 模板类型，默认 normal
  headline: string; // 可用变量: {itemName}, {supportCount}
  body?: string; // 可用变量: {itemName}, {supportCount}，log 类型不需要 body
}

// 类型别名（方便理解各个模板的用途和可用变量）
export type NameTemplate = TextTemplate;         // 可用变量: {itemName}, {supportCount}
export type DescriptionTemplate = TextTemplate;  // 可用变量: {itemName}, {supportCount}
export type DiscountTemplate = TextTemplate;     // 可用变量: {originalPrice}, {discountedPrice}, {discountPercent}, {fullsetOriginalPrice}, {fullsetDiscountedPrice}, {startDate}, {endDate}
export type LogTemplate = TextTemplate;          // 可用变量: {date}, {content}
export type ItemInfoTemplate = TextTemplate;     // 可用变量: {authorName}, {itemName}, {itemUrl}

// 全局模板配置
export interface GlobalTemplateConfig {
  nameTemplates: NameTemplate[];
  descriptionTemplates: DescriptionTemplate[];
  discountTemplates: DiscountTemplate[];
  logTemplates: LogTemplate[];
  itemInfoTemplates: ItemInfoTemplate[];
  sectionTemplates: SectionTemplate[];
}

// Section 实例基础接口
interface BaseSectionInstance {
  id: string;
  type: SectionType;
}

// 普通 Section（引用全局模板或自定义）
export interface NormalSectionInstance extends BaseSectionInstance {
  type: 'normal';
  templateId?: string; // 如果引用全局模板，存储模板ID
  // 覆盖字段（如果为空则使用模板的值）
  headline?: string;
  body?: string;
}

// 日志 Section
export interface LogSectionInstance extends BaseSectionInstance {
  type: 'log';
  headline?: string; // Section 标题
  logEntries: LogEntry[];
  logTemplateId: string; // 实例级别的模板选择
}

// 商品信息 Section
export interface ItemInfoSectionInstance extends BaseSectionInstance {
  type: 'iteminfo';
  headline?: string; // Section 标题
  itemInfoTemplateId: string; // 使用哪个全局模板
}

// Section 实例联合类型
export type SectionInstance = 
  | NormalSectionInstance 
  | LogSectionInstance 
  | ItemInfoSectionInstance;

// 单商品配置（完整的独立配置）
export interface SingleItemConfig {
  itemId: string; // 商品ID（从URL提取）
  itemName: string; // 商品基础名称
  itemType: ItemType; // 商品类型
  itemTypeName: string; // 商品类型名称（如 "Avatar", "Model"）
  useSmartLogic: boolean; // 是否启用智能逻辑
  
  // 选择的模板ID
  selectedTemplates: {
    nameTemplateId: string;
    descriptionTemplateId: string;
    discountTemplateId: string;
  };
  
  customDescription: string; // 自定义描述内容
  discount: DiscountConfig; // 打折配置
  pricing: PriceConfig; // 价格配置
  sections: SectionInstance[]; // Section 实例列表
  variations: VariationData[]; // Variation 列表
  commonFiles?: string[]; // 全局通用文件 ID 列表（所有 variation 共享）
  tagNodeIds: string[]; // 关联的 tag 节点 ID 列表
}

// 兼容旧名称
export type ItemEditConfig = SingleItemConfig;

// 应用数据
export interface AppData {
  tagTree: NodeTree<TagData>;
  itemTree: NodeTree<ItemData>;
  globalTemplates: GlobalTemplateConfig; // 全局模板配置
  itemConfigs: Record<string, SingleItemConfig>; // 按商品ID索引的配置
  ui: {
    sidebarOpen: boolean;
    activeTab: 'tags' | 'items' | 'edit';
  };
}

// 创建默认全局模板配置
export function createDefaultGlobalTemplates(): GlobalTemplateConfig {
  return {
    nameTemplates: [
      {
        id: 'default-name',
        name: '默认商品名',
        template: '{商品名}',
        isDefault: true
      },
      {
        id: 'smart-auto',
        name: '智能商品名（推荐）',
        template: '{智能标题}',
        isDefault: false
      },
      {
        id: 'smart-with-discount',
        name: '智能商品名（含折扣标识）',
        template: '{折扣标识}{智能标题}',
        isDefault: false
      },
      {
        id: 'always-show-count',
        name: '总是显示数量',
        template: '{支持数} {商品类型复数} | {首个变体名}',
        isDefault: false
      }
    ],
    descriptionTemplates: [
      {
        id: 'default-desc',
        name: '默认描述',
        template: '',
        isDefault: true
      }
    ],
    discountTemplates: [
      {
        id: 'default-discount',
        name: '默认打折',
        template: '【セール中】\n通常価格: ¥{原价} → セール価格: ¥{折扣价} ({折扣百分比}% OFF)',
        isDefault: true
      },
      {
        id: 'fullset-discount',
        name: '含 Fullset',
        template: '◆[セール開催中]◆\n- フルセット : {Fullset原价} JPY >> {Fullset折扣价} JPY\n- 単品: {原价} JPY >> {折扣价} JPY\n⏰ {折扣开始时间} - {折扣结束时间}\n({折扣百分比}% OFF)',
        isDefault: false
      }
    ],
    logTemplates: [
      {
        id: 'default-log',
        name: '默认日志',
        template: '⟡ {日期}\n　・ {内容}',
        isDefault: true
      }
    ],
    itemInfoTemplates: [
      {
        id: 'default-item-info',
        name: '默认商品信息',
        template: '⟡ {作者名}\nʚ {商品名} ɞ\n- {商品链接} -',
        isDefault: true
      }
    ],
    sectionTemplates: []
  };
}

// 创建默认标签数据
export function createDefaultTagsData(): TagsData {
  return { tagTree: { rootIds: [], nodes: {} } };
}

// 创建默认商品数据
export function createDefaultItemsData(): ItemsData {
  return { itemTree: { rootIds: [], nodes: {} } };
}

// 创建默认模板数据
export function createDefaultTemplatesData(): TemplatesData {
  return { globalTemplates: createDefaultGlobalTemplates() };
}

// 创建默认单商品配置
export function createDefaultSingleItemConfig(itemId: string): SingleItemConfig {
  return {
    itemId,
    itemName: '',
    itemType: 'normal',
    itemTypeName: 'Item',
    useSmartLogic: true,
    selectedTemplates: {
      nameTemplateId: 'default-name',
      descriptionTemplateId: 'default-desc',
      discountTemplateId: 'default-discount'
    },
    customDescription: '',
    discount: {
      enabled: false,
      discountPercent: 0
    },
    pricing: {
      normalVariationPrice: 0,
      fullsetPrice: 0
    },
    sections: [],
    variations: [],
    tagNodeIds: []
  };
}

// 兼容旧名称
export function createDefaultItemConfig(itemId: string): ItemEditConfig {
  return createDefaultSingleItemConfig(itemId);
}

// ===== 模板获取辅助函数 =====

/**
 * 通用模板获取函数
 * @param templates - 模板数组
 * @param selectedTemplateId - 选中的模板ID（可选）
 * @returns 模板内容字符串，如果是 TextTemplate 返回 template 字段
 */
function getSelectedTemplate<T extends BaseTemplate>(
  templates: T[] | undefined,
  selectedTemplateId?: string
): string {
  // 防御性检查：如果模板数组不存在或为空，返回空字符串
  if (!templates || templates.length === 0) {
    return '';
  }
  
  let template: T | undefined;
  
  // 如果有选中的模板ID，尝试查找
  if (selectedTemplateId) {
    template = templates.find(t => t.id === selectedTemplateId);
  }
  
  // 如果没找到，使用默认模板或第一个模板
  if (!template) {
    template = templates.find(t => t.isDefault) || templates[0];
  }
  
  // 返回 template 字段（TextTemplate 类型）
  return (template as any)?.template || '';
}

/**
 * 获取选中的商品名模板
 */
export function getSelectedNameTemplate(
  config: GlobalTemplateConfig,
  itemConfig: SingleItemConfig
): string {
  return getSelectedTemplate(
    config.nameTemplates,
    itemConfig.selectedTemplates?.nameTemplateId
  );
}

/**
 * 获取选中的描述模板
 */
export function getSelectedDescriptionTemplate(
  config: GlobalTemplateConfig,
  itemConfig: SingleItemConfig
): string {
  return getSelectedTemplate(
    config.descriptionTemplates,
    itemConfig.selectedTemplates?.descriptionTemplateId
  );
}

/**
 * 获取选中的打折模板
 */
export function getSelectedDiscountTemplate(
  config: GlobalTemplateConfig,
  itemConfig: SingleItemConfig
): string {
  return getSelectedTemplate(
    config.discountTemplates,
    itemConfig.selectedTemplates?.discountTemplateId
  );
}

// 创建默认数据
export const createDefaultData = (): AppData => {
  return {
    tagTree: {
      rootIds: [],
      nodes: {}
    },
    itemTree: {
      rootIds: [],
      nodes: {}
    },
    globalTemplates: createDefaultGlobalTemplates(),
    itemConfigs: {},
    ui: {
      sidebarOpen: false,
      activeTab: 'tags'
    }
  };
};
