/**
 * EditTab Modal 通用逻辑
 * 处理模板变量、保存逻辑等共享功能
 */

import { computed, type ComputedRef } from 'vue';
import type { ItemEditConfig } from '../config-types';
import type { TemplateVariables } from '../utils/templateParser';

export interface EditModalEmits {
  (e: 'close'): void;
  (e: 'save'): void;
}

export interface UseEditModalOptions {
  itemConfig: ItemEditConfig;
  totalSupport: number;
}

export interface UseEditModalReturn {
  templateVars: ComputedRef<TemplateVariables>;
  handleClose: (emit: EditModalEmits) => void;
  handleSave: (emit: EditModalEmits) => void;
}

/**
 * 创建模板变量的计算属性
 */
export function createTemplateVars(
  itemConfig: ItemEditConfig,
  totalSupport: number
): ComputedRef<TemplateVariables> {
  return computed(() => ({
    itemName: itemConfig.itemName,
    supportCount: totalSupport
  }));
}

/**
 * 创建标准的 Modal 事件处理器
 */
export function createModalHandlers(emit: EditModalEmits) {
  return {
    handleClose: () => emit('close'),
    handleSave: () => {
      emit('save');
      emit('close');
    }
  };
}

/**
 * 通用的 EditModal composable
 */
export function useEditModal(options: UseEditModalOptions): UseEditModalReturn {
  const templateVars = createTemplateVars(options.itemConfig, options.totalSupport);

  return {
    templateVars,
    handleClose: (emit) => emit('close'),
    handleSave: (emit) => {
      emit('save');
      emit('close');
    }
  };
}
