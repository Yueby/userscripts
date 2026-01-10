import type { VariationData } from '../config-types';

export interface TemplateVariables {
  itemName: string;
  supportCount: number;
  date?: string;
  [key: string]: string | number | undefined;
}

export function parseTemplate(
  template: string, 
  variables: TemplateVariables
): string {
  let result = template;
  
  // 替换所有变量
  Object.entries(variables).forEach(([key, value]) => {
    if (value !== undefined) {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, String(value));
    }
  });
  
  return result;
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}/${month}/${day}`;
}

export function calculateTotalSupport(variations: VariationData[]): number {
  return variations.reduce((sum, v) => sum + Number(v.supportCount), 0);
}
