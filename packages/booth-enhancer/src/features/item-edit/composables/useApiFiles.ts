import { onUnmounted, ref, shallowRef, type Ref } from 'vue';
import type { ItemEditAPI } from '../../../api/item-edit';

/**
 * 把 ItemEditAPI.files 包装成响应式 ref
 *
 * ItemEditAPI.files 是每次访问都重新查 DOM 的 getter，但它没有响应式依赖，
 * 所以 Vue 的 computed/模板渲染首次求值后就缓存住了。本 composable 通过
 * api.onFilesChanged 订阅 MutationObserver 事件，把 DOM 变化转换成真正的
 * 响应式信号。
 */
export function useApiFiles(api: ItemEditAPI): {
  files: Ref<Array<{ id: string; name: string }>>;
  refresh: () => void;
} {
  const files = shallowRef<Array<{ id: string; name: string }>>([]);
  
  const refresh = (): void => {
    files.value = api.files;
  };
  
  // 初始同步
  refresh();
  
  // DOM 变化时刷新
  const unsubscribe = api.onFilesChanged(refresh);
  
  onUnmounted(() => {
    unsubscribe();
  });
  
  return { files, refresh };
}

/**
 * 轻量版：只返回文件 id 的 Set，用于失效检查
 */
export function useApiFileIdSet(api: ItemEditAPI): Ref<Set<string>> {
  const idSet = ref(new Set(api.files.map(f => f.id)));
  
  const unsubscribe = api.onFilesChanged(() => {
    idSet.value = new Set(api.files.map(f => f.id));
  });
  
  onUnmounted(() => {
    unsubscribe();
  });
  
  return idSet;
}
