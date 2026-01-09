/**
 * Modal 状态管理 Composable
 * 统一管理各种弹窗的状态和操作
 */

import { ref } from 'vue';

export type ModalType = 
  | 'createFolder' 
  | 'createTag' 
  | 'createItem' 
  | 'rename' 
  | 'delete' 
  | 'template'
  | 'input'      // 通用输入框
  | 'textarea'   // 通用文本域
  | 'alert'      // 通用提示框
  | '';

export interface ModalState<T = any> {
  show: boolean;
  type: ModalType;
  title: string;
  message: string;       // 提示信息
  inputValue: string;
  placeholder: string;   // 输入框占位符
  targetId: string;
  formData: T;           // 通用表单数据，动态传入
}

export interface ModalOptions<T = any> {
  type: ModalType;
  title: string;
  message?: string;      // 提示信息
  defaultValue?: string;
  placeholder?: string;  // 输入框占位符
  targetId?: string;
  formData?: T;          // 动态表单数据
}

export function useModal<T = any>() {
  const state = ref<ModalState<T>>({
    show: false,
    type: '',
    title: '',
    message: '',
    inputValue: '',
    placeholder: '',
    targetId: '',
    formData: {} as T
  });

  // 用于 Promise 的 resolve/reject
  let resolvePromise: ((value: any) => void) | null = null;
  let rejectPromise: ((reason?: any) => void) | null = null;

  /**
   * 打开 Modal
   */
  const openModal = <D = T>(options: ModalOptions<D>): Promise<any> => {
    state.value = {
      show: true,
      type: options.type,
      title: options.title,
      message: options.message || '',
      inputValue: options.defaultValue || '',
      placeholder: options.placeholder || '',
      targetId: options.targetId || '',
      formData: (options.formData || {}) as any
    };

    return new Promise((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });
  };

  /**
   * 关闭 Modal
   */
  const closeModal = () => {
    state.value.show = false;
    if (resolvePromise) {
      resolvePromise(undefined);
      resolvePromise = null;
      rejectPromise = null;
    }
  };

  /**
   * 确认 Modal（返回结果）
   */
  const confirmModal = (result?: any) => {
    state.value.show = false;
    if (resolvePromise) {
      resolvePromise(result !== undefined ? result : state.value.inputValue);
      resolvePromise = null;
      rejectPromise = null;
    }
  };

  /**
   * 快速打开确认对话框
   */
  const confirm = (title: string, message?: string): Promise<boolean> => {
    return openModal({
      type: 'delete',
      title,
      defaultValue: message || ''
    }).then(result => !!result);
  };

  return {
    state,
    openModal,
    closeModal,
    confirmModal,
    confirm
  };
}
