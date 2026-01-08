import { GM_getValue, GM_setValue } from '$';
import { ref, watch, type Ref } from 'vue';
import {
  AppData,
  createDefaultData,
  Node,
  NodeTree
} from '../config-types';

const STORAGE_KEY = 'booth-enhancer-config-v2';
const SAVE_DEBOUNCE = 500;

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

  private load(): AppData {
    try {
      const stored = GM_getValue(STORAGE_KEY, null);
      if (stored) {
        const parsed = JSON.parse(stored) as any;
        const defaults = createDefaultData();
        
        // 数据迁移：保留旧数据，添加缺失的新字段
        return {
          tagTree: parsed.tagTree || defaults.tagTree,
          itemTree: parsed.itemTree || defaults.itemTree,
          templateTree: parsed.templateTree || defaults.templateTree,
          activeTemplateId: parsed.activeTemplateId || defaults.activeTemplateId,
          ui: parsed.ui || defaults.ui
        };
      }
    } catch (e) {
      console.error('Failed to load config:', e);
    }
    
    // 加载失败，返回默认数据
    return createDefaultData();
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

  /**
   * 导出数据为 JSON
   */
  exportData(): string {
    return JSON.stringify(this._data.value, null, 2);
  }

  /**
   * 导入数据从 JSON
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
