import { ref } from 'vue';
import { TIMING } from '../constants';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

const toasts = ref<ToastItem[]>([]);
let nextId = 0;

export function useToast() {
  function show(message: string, type: ToastType = 'info', duration = TIMING.TOAST_DURATION) {
    const id = nextId++;
    toasts.value.push({ id, message, type });
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, duration);
  }

  return { toasts, show };
}
