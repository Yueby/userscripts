import { GM_getValue, GM_setValue } from '$';
import { ref, watch, type Ref } from 'vue';
import {
  AppData,
  createDefaultData,
  createDefaultGlobalTemplates,
  Node,
  NodeTree,
  type GlobalTemplateConfig,
  type ItemsData,
  type SingleItemConfig,
  type TagsData,
  type TemplatesData
} from '../config-types';

const STORAGE_KEY = 'booth-enhancer-config-v4';
const SAVE_DEBOUNCE = 500;

// 当前数据 schema 版本，用于增量迁移
const CURRENT_SCHEMA_VERSION = 2;

/**
 * 导入结果
 */
export interface ImportResult {
  success: boolean;
  failedParts: string[];
}

export class ConfigStorage {
  private static instance: ConfigStorage;
  private _data: Ref<AppData>;
  private _saveTimer: number | null = null;

  private constructor() {
    this._data = ref(this.load());
    
    // 监听数据变化并自动保存
    watch(
      this._data,
      () => this.saveWithDebounce(),
      { deep: true }
    );
  }

  static getInstance(): ConfigStorage {
    if (!ConfigStorage.instance) {
      ConfigStorage.instance = new ConfigStorage();
    }
    return ConfigStorage.instance;
  }

  get data(): Ref<AppData> {
    return this._data;
  }

  /**
   * 迁移旧数据：把 fileItemMap 中的 string 值转换为 string[]
   * 只在 schemaVersion < 1 时执行
   */
  private migrateFileItemMap(data: AppData): boolean {
    let changed = false;
    Object.values(data.itemConfigs).forEach(config => {
      config.variations.forEach(variation => {
        if (!variation.fileItemMap) return;
        Object.keys(variation.fileItemMap).forEach(fileId => {
          const value = variation.fileItemMap![fileId];
          if (typeof value === 'string') {
            variation.fileItemMap![fileId] = [value] as any;
            changed = true;
          }
        });
      });
    });
    return changed;
  }

  /**
   * 确保 globalTemplates 有所有必需的字段
   * 向后兼容老用户数据（如增加了 discountIndicatorTemplates 之后）
   * 只补齐缺失的数组字段，不覆盖已有内容
   */
  private ensureGlobalTemplatesShape(data: AppData): void {
    const defaults = createDefaultGlobalTemplates();
    if (!data.globalTemplates) {
      data.globalTemplates = defaults;
      return;
    }
    // 对每个字段，若用户数据里缺失或不是数组则用默认值
    (Object.keys(defaults) as Array<keyof GlobalTemplateConfig>).forEach(key => {
      if (!Array.isArray(data.globalTemplates[key])) {
        (data.globalTemplates as any)[key] = defaults[key];
      }
    });
  }

  /**
   * 迁移旧数据：单时段折扣 → 多时段 periods[]
   * 旧格式: { enabled, discountPercent, startDate?, endDate? }
   * 新格式: { enabled, periods: [{ id, discountPercent, startDate?, endDate? }] }
   * 
   * 同时迁移旧折扣模板：{ template } → { header, periodTemplate }
   */
  private migrateDiscountPeriods(data: AppData): void {
    // 迁移 itemConfigs 里的 discount 结构
    Object.values(data.itemConfigs).forEach(config => {
      const d = config.discount as any;
      if (d && d.discountPercent !== undefined && !d.periods) {
        d.periods = [];
        if (d.discountPercent > 0) {
          d.periods.push({
            id: crypto.randomUUID(),
            discountPercent: d.discountPercent,
            startDate: d.startDate,
            endDate: d.endDate
          });
        }
        delete d.discountPercent;
        delete d.startDate;
        delete d.endDate;
      }
      // 确保 periods 字段存在
      if (d && !d.periods) {
        d.periods = [];
      }
    });
    
    // 迁移折扣模板：旧 { template } → 新 { header, periodTemplate }
    if (data.globalTemplates?.discountTemplates) {
      data.globalTemplates.discountTemplates.forEach((tpl: any) => {
        if (tpl.template !== undefined && tpl.periodTemplate === undefined) {
          // 把旧的 template 整体作为 periodTemplate，header 留空
          tpl.periodTemplate = tpl.template;
          tpl.header = '';
          delete tpl.template;
        }
      });
    }
  }

  private load(): AppData {
    try {
      const stored = GM_getValue(STORAGE_KEY, null);
      if (stored) {
        const data = JSON.parse(stored) as AppData & { schemaVersion?: number };
        const version = data.schemaVersion ?? 0;
        
        // 增量迁移：schemaVersion 0 -> 1
        if (version < 1) {
          this.migrateFileItemMap(data);
        }
        
        // 增量迁移：schemaVersion 1 -> 2（单时段折扣 → 多时段）
        if (version < 2) {
          this.migrateDiscountPeriods(data);
        }
        
        // 每次加载都补齐可能缺失的默认字段（防止老数据结构不完整）
        this.ensureGlobalTemplatesShape(data);
        
        // 标记当前版本
        (data as any).schemaVersion = CURRENT_SCHEMA_VERSION;
        
        // 每次打开页面时，侧边栏默认关闭（不保存窗口打开状态）
        if (data.ui) {
          data.ui.sidebarOpen = false;
        }
        return data;
      }
    } catch (e) {
      console.error('Failed to load config:', e);
    }
    
    const fresh = createDefaultData() as AppData & { schemaVersion?: number };
    fresh.schemaVersion = CURRENT_SCHEMA_VERSION;
    return fresh;
  }

  private save(): void {
    try {
      GM_setValue(STORAGE_KEY, JSON.stringify(this._data.value));
    } catch (e) {
      console.error('Failed to save config:', e);
    }
  }

  private saveWithDebounce() {
    if (this._saveTimer) window.clearTimeout(this._saveTimer);
    this._saveTimer = window.setTimeout(() => {
      this.save();
      this._saveTimer = null;
    }, SAVE_DEBOUNCE);
  }

  // === Unity 风格节点操作 ===

  /**
   * 创建节点
   */
  createNode<T>(tree: NodeTree<T>, name: string, data?: T, parentId: string | null = null): Node<T> {
    const id = crypto.randomUUID();
    const node: Node<T> = {
      id,
      parentId,
      name,
      children: [],
      expanded: true,
      data,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    tree.nodes[id] = node;
    
    if (parentId) {
      const parent = tree.nodes[parentId];
      if (parent) parent.children.push(id);
    } else {
      tree.rootIds.push(id);
    }

    this.saveWithDebounce();
    return node;
  }

  /**
   * 删除节点
   */
  deleteNode<T>(tree: NodeTree<T>, id: string) {
    const node = tree.nodes[id];
    if (!node) return;

    // 递归删除所有子节点
    [...node.children].forEach((childId: string) => this.deleteNode(tree, childId));

    // 从父节点移除引用
    if (node.parentId) {
      const parent = tree.nodes[node.parentId];
      if (parent) {
        parent.children = parent.children.filter((cid: string) => cid !== id);
      }
    } else {
      tree.rootIds = tree.rootIds.filter((rid: string) => rid !== id);
    }

    delete tree.nodes[id];
    this.saveWithDebounce();
  }

  /**
   * 移动节点
   */
  moveNode<T>(tree: NodeTree<T>, id: string, targetParentId: string | null) {
    const node = tree.nodes[id];
    if (!node) return;
    if (node.id === targetParentId) return;
    
    // 检查循环引用
    if (targetParentId) {
      let current = tree.nodes[targetParentId];
      while (current) {
        if (current.id === id) return;
        if (!current.parentId) break;
        current = tree.nodes[current.parentId];
      }
    }

    // 从旧父节点移除
    if (node.parentId) {
      const oldParent = tree.nodes[node.parentId];
      if (oldParent) {
        oldParent.children = oldParent.children.filter((cid: string) => cid !== id);
      }
    } else {
      tree.rootIds = tree.rootIds.filter((rid: string) => rid !== id);
    }

    // 添加到新父节点
    if (targetParentId) {
      const newParent = tree.nodes[targetParentId];
      if (newParent) {
        newParent.children.push(id);
      }
    } else {
      tree.rootIds.push(id);
    }

    node.parentId = targetParentId;
    node.updatedAt = Date.now();
    
    this.saveWithDebounce();
  }

  /**
   * 在指定位置插入节点（用于排序）
   */
  insertNodeAt<T>(
    tree: NodeTree<T>, 
    nodeId: string, 
    targetParentId: string | null, 
    index: number
  ) {
    const node = tree.nodes[nodeId];
    if (!node) return;
    
    // 检查循环引用
    if (targetParentId) {
      if (nodeId === targetParentId) return;
      let current = tree.nodes[targetParentId];
      while (current) {
        if (current.id === nodeId) return;
        if (!current.parentId) break;
        current = tree.nodes[current.parentId];
      }
    }

    // 从旧位置移除
    if (node.parentId) {
      const oldParent = tree.nodes[node.parentId];
      if (oldParent) {
        oldParent.children = oldParent.children.filter((cid: string) => cid !== nodeId);
      }
    } else {
      tree.rootIds = tree.rootIds.filter((rid: string) => rid !== nodeId);
    }

    // 插入到新位置
    if (targetParentId) {
      const newParent = tree.nodes[targetParentId];
      if (newParent) {
        newParent.children.splice(index, 0, nodeId);
      }
    } else {
      tree.rootIds.splice(index, 0, nodeId);
    }

    node.parentId = targetParentId;
    node.updatedAt = Date.now();
    
    this.saveWithDebounce();
  }

  /**
   * 重命名节点
   */
  renameNode<T>(tree: NodeTree<T>, id: string, newName: string) {
    const node = tree.nodes[id];
    if (!node) return;
    
    node.name = newName;
    node.updatedAt = Date.now();
    this.saveWithDebounce();
  }

  // ===== 导出方法 =====

  exportTags(): TagsData {
    return { tagTree: this._data.value.tagTree };
  }

  exportItems(): ItemsData {
    return { itemTree: this._data.value.itemTree };
  }

  exportTemplates(): TemplatesData {
    return { globalTemplates: this._data.value.globalTemplates };
  }

  exportSingleItem(itemId: string): SingleItemConfig | null {
    const config = this._data.value.itemConfigs[itemId];
    return config || null;
  }

  exportAllItems(): Record<string, SingleItemConfig> {
    return { ...this._data.value.itemConfigs };
  }

  // ===== 导入方法 =====

  importTags(data: TagsData): void {
    if (!data.tagTree || !data.tagTree.nodes) {
      throw new Error('无效的标签数据格式');
    }
    this._data.value.tagTree = data.tagTree;
  }

  importItems(data: ItemsData): void {
    if (!data.itemTree || !data.itemTree.nodes) {
      throw new Error('无效的商品数据格式');
    }
    this._data.value.itemTree = data.itemTree;
  }

  importTemplates(data: TemplatesData): void {
    if (!data.globalTemplates) {
      throw new Error('无效的模板数据格式');
    }
    this._data.value.globalTemplates = data.globalTemplates;
  }

  importSingleItem(config: SingleItemConfig, options?: { replace?: boolean }): boolean {
    if (!config.itemId) {
      throw new Error('商品配置缺少 itemId');
    }
    
    const exists = !!this._data.value.itemConfigs[config.itemId];
    
    // 如果已存在且不强制替换，返回 false 让调用方处理
    if (exists && !options?.replace) {
      return false;
    }
    
    this._data.value.itemConfigs[config.itemId] = config;
    return true;
  }

  importAllFromZip(files: Record<string, any>): ImportResult {
    const errors: string[] = [];
    
    // 导入全局数据
    if (files['tags.json']) {
      try {
        this.importTags(files['tags.json']);
      } catch (e) {
        errors.push('标签数据');
      }
    }
    
    if (files['items.json']) {
      try {
        this.importItems(files['items.json']);
      } catch (e) {
        errors.push('商品列表');
      }
    }
    
    if (files['templates.json']) {
      try {
        this.importTemplates(files['templates.json']);
      } catch (e) {
        errors.push('全局模板');
      }
    }
    
    // 导入所有商品配置（item-*.json）
    for (const [filename, data] of Object.entries(files)) {
      if (filename.startsWith('item-') && filename.endsWith('.json')) {
        try {
          this.importSingleItem(data as SingleItemConfig, { replace: true });
        } catch (e) {
          errors.push(`商品配置 ${filename}`);
        }
      }
    }
    
    return { success: errors.length === 0, failedParts: errors };
  }

  importAllFromJSON(importData: any): ImportResult {
    const errors: string[] = [];
    
    // 检查数据格式
    if (!importData.data) {
      throw new Error('无效的备份文件格式');
    }
    
    const { tags, items, templates, itemConfigs } = importData.data;
    
    // 导入全局数据
    if (tags) {
      try {
        this.importTags(tags);
      } catch (e) {
        errors.push('标签数据');
      }
    }
    
    if (items) {
      try {
        this.importItems(items);
      } catch (e) {
        errors.push('商品列表');
      }
    }
    
    if (templates) {
      try {
        this.importTemplates(templates);
      } catch (e) {
        errors.push('全局模板');
      }
    }
    
    // 导入所有商品配置
    if (itemConfigs) {
      for (const [itemId, config] of Object.entries(itemConfigs)) {
        try {
          this.importSingleItem(config as SingleItemConfig, { replace: true });
        } catch (e) {
          errors.push(`商品配置 ${itemId}`);
        }
      }
    }
    
    return { success: errors.length === 0, failedParts: errors };
  }

  /**
   * 导出数据为 JSON（保留用于向后兼容）
   */
  exportData(): string {
    return JSON.stringify(this._data.value, null, 2);
  }

  /**
   * 导入数据从 JSON（保留用于向后兼容）
   */
  importData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString) as AppData;
      // 验证数据结构
      if (!parsed.tagTree || !parsed.itemTree) {
        throw new Error('Invalid data structure');
      }
      this._data.value = parsed;
      this.save();
      return true;
    } catch (e) {
      console.error('Failed to import data:', e);
      return false;
    }
  }
}
