/**
 * Tree Tab 通用逻辑 Composable
 * 提取 TagTab 和 ItemTab 的通用树操作逻辑
 */

import { computed, ref } from 'vue';
import type { Node, NodeTree } from '../config-types';
import { useModal } from './useModal';
import { useStorage } from './useStorage';

export interface UseTreeTabOptions<T = any> {
  tree: NodeTree<T> | (() => NodeTree<T>);
  onCreateFolder?: (parentId: string | null) => string;
  onCreateItem?: (parentId: string | null) => string;
  onEditItem?: (nodeId: string) => Promise<void> | void;
}

export function useTreeTab<T = any>(options: UseTreeTabOptions<T>) {
  const { renameNode, deleteNode } = useStorage();
  const modal = useModal();
  const selectedNodeId = ref<string | null>(null);

  const tree = computed(() => 
    typeof options.tree === 'function' ? options.tree() : options.tree
  );

  function handleSelect(nodes: Node<T>[]): void {
    if (nodes.length > 0) {
      selectedNodeId.value = nodes[0].id;
    }
  }

  function handleCreateFolder(parentId: string | null): string {
    if (options.onCreateFolder) {
      return options.onCreateFolder(parentId);
    }
    // 默认实现
    const storage = useStorage();
    const newNode = storage.createNode(tree.value, '新建文件夹', undefined, parentId);
    return newNode.id;
  }

  function handleCreateItem(parentId: string | null): string {
    if (options.onCreateItem) {
      return options.onCreateItem(parentId);
    }
    throw new Error('onCreateItem is required');
  }

  async function handleEditItem(nodeId: string): Promise<void> {
    if (options.onEditItem) {
      await options.onEditItem(nodeId);
    }
  }

  function handleRename(nodeId: string, newName: string): void {
    const trimmedName = newName.trim();
    if (trimmedName) {
      renameNode(tree.value, nodeId, trimmedName);
    }
  }

  async function handleDelete(nodeId: string): Promise<void> {
    const node = tree.value.nodes[nodeId];
    if (!node) return;

    const confirmed = await modal.openModal({
      type: 'delete',
      title: '确认删除',
      formData: { message: `确定要删除"${node.name}"吗？` }
    });

    if (confirmed) {
      deleteNode(tree.value, nodeId);
    }
  }

  return {
    selectedNodeId,
    tree,
    handleSelect,
    handleCreateFolder,
    handleCreateItem,
    handleEditItem,
    handleRename,
    handleDelete,
    modal
  };
}
