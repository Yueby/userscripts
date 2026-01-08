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
  itemUrl: string;
}

// 模板数据
export interface TemplateData {
  content: string;  // 模板内容
}

// 树存储结构（扁平化）
export interface NodeTree<T> {
  rootIds: string[];
  nodes: { [id: string]: Node<T> };
}

// 应用数据
export interface AppData {
  tagTree: NodeTree<TagData>;
  itemTree: NodeTree<ItemData>;
  templateTree: NodeTree<TemplateData>;
  activeTemplateId: string;  // 当前选中的模板节点ID
  ui: {
    sidebarOpen: boolean;
    activeTab: 'tags' | 'items' | 'templates';
  };
}

// 创建默认数据
export const createDefaultData = (): AppData => {
  const defaultTemplateId = 'default-template-node';
  const now = Date.now();
  
  return {
    tagTree: {
      rootIds: [],
      nodes: {}
    },
    itemTree: {
      rootIds: [],
      nodes: {}
    },
    templateTree: {
      rootIds: [defaultTemplateId],
      nodes: {
        [defaultTemplateId]: {
          id: defaultTemplateId,
          parentId: null,
          name: '默认模板',
          children: [],
          expanded: false,
          data: {
            content: '{{authorName}} - {{itemName}}\n{{itemUrl}}'
          },
          createdAt: now,
          updatedAt: now
        }
      }
    },
    activeTemplateId: defaultTemplateId,
    ui: {
      sidebarOpen: false,
      activeTab: 'tags'
    }
  };
};
