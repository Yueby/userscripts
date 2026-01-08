/**
 * 搜索过滤 Composable
 * 通用的搜索和过滤逻辑
 */

import { ref, computed, Ref } from 'vue';
import { Node } from '../config-types';

export interface SearchOptions {
  nodes: Ref<Record<string, Node<any>>>;
  filterFn: (node: Node<any>, searchText: string) => boolean;
}

export function useSearch(options: SearchOptions) {
  const { nodes, filterFn } = options;
  const searchText = ref('');

  /**
   * 过滤后的结果
   */
  const filteredResults = computed(() => {
    if (!searchText.value.trim()) {
      return [];
    }

    return Object.values(nodes.value).filter(node => 
      filterFn(node, searchText.value)
    );
  });

  /**
   * 清空搜索
   */
  const clearSearch = () => {
    searchText.value = '';
  };

  /**
   * 是否有搜索结果
   */
  const hasResults = computed(() => filteredResults.value.length > 0);

  /**
   * 是否正在搜索
   */
  const isSearching = computed(() => searchText.value.trim().length > 0);

  return {
    searchText,
    filteredResults,
    clearSearch,
    hasResults,
    isSearching
  };
}

/**
 * Tag 搜索的预设过滤函数
 */
export function tagSearchFilter(node: Node<any>, searchText: string): boolean {
  // 只搜索有 tags 数据的节点
  if (!node.data?.tags) return false;
  
  const lowerSearch = searchText.toLowerCase();
  const nodeName = node.name.toLowerCase();
  const tagsText = node.data.tags.join(' ').toLowerCase();
  
  return nodeName.includes(lowerSearch) || tagsText.includes(lowerSearch);
}

/**
 * 商品数据搜索的预设过滤函数
 */
export function itemDataSearchFilter(node: Node<any>, searchText: string): boolean {
  // 只搜索有商品数据的节点
  if (!node.data?.authorName && !node.data?.itemUrl) return false;
  
  const lowerSearch = searchText.toLowerCase();
  const nodeName = node.name.toLowerCase();
  const authorName = node.data?.authorName?.toLowerCase() || '';
  const itemUrl = node.data?.itemUrl?.toLowerCase() || '';
  
  return nodeName.includes(lowerSearch) || 
         authorName.includes(lowerSearch) || 
         itemUrl.includes(lowerSearch);
}
