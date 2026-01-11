import type { NodeTree } from '../config-types';
import { ConfigStorage } from '../modules/ConfigStorage';

/**
 * 统一的 Storage 访问 Composable
 * 提供响应式的 storage 实例和常用方法
 */
export function useStorage() {
  const storage = ConfigStorage.getInstance();
  
  return {
    // 原始实例（用于特殊场景）
    storage,
    // 响应式数据
    data: storage.data,
    
    // === 导出方法 ===
    exportTags: () => storage.exportTags(),
    exportItems: () => storage.exportItems(),
    exportTemplates: () => storage.exportTemplates(),
    exportSingleItem: (itemId: string) => storage.exportSingleItem(itemId),
    exportAllItems: () => storage.exportAllItems(),
    
    // === 导入方法 ===
    importTags: (data: any) => storage.importTags(data),
    importItems: (data: any) => storage.importItems(data),
    importTemplates: (data: any) => storage.importTemplates(data),
    importSingleItem: (config: any, options?: { replace?: boolean }) => 
      storage.importSingleItem(config, options),
    importAllFromZip: (files: Record<string, any>) => storage.importAllFromZip(files),
    importAllFromJSON: (data: any) => storage.importAllFromJSON(data),
    
    // === 节点操作方法 ===
    createNode: <T>(tree: NodeTree<T>, name: string, data?: T, parentId?: string | null) =>
      storage.createNode(tree, name, data, parentId),
    renameNode: <T>(tree: NodeTree<T>, nodeId: string, newName: string) =>
      storage.renameNode(tree, nodeId, newName),
    deleteNode: <T>(tree: NodeTree<T>, nodeId: string) =>
      storage.deleteNode(tree, nodeId),
    moveNode: <T>(tree: NodeTree<T>, nodeId: string, newParentId: string | null) =>
      storage.moveNode(tree, nodeId, newParentId)
  };
}
