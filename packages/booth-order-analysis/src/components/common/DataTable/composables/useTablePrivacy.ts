import { computed, type Ref } from 'vue';

export function useTablePrivacy(privacyMode: Ref<boolean>) {
  const maskValue = (value: any) => {
    if (privacyMode.value) {
      return typeof value === 'string' ? '****' : '****';
    }
    return value;
  };
  
  const maskText = (text: string) => {
    if (privacyMode.value) {
      return '****';
    }
    return text;
  };
  
  const maskNumber = (number: number) => {
    if (privacyMode.value) {
      return '****';
    }
    return number;
  };
  
  return {
    maskValue,
    maskText,
    maskNumber
  };
} 