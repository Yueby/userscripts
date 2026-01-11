import type { VariationData } from '../config-types';

export interface TemplateVariables {
  // 基础变量
  itemName?: string;
  supportCount?: number;

  // 新增变量
  itemTypeName?: string;
  itemTypePlural?: string;
  variationCount?: number;
  firstName?: string;

  // 智能变量
  smartTitle?: string;
  discountIndicator?: string;

  // 折扣相关
  originalPrice?: number;
  discountedPrice?: number;
  discountPercent?: number;

  // 其他变量
  date?: string;
  content?: string;
  authorName?: string;
  itemUrl?: string;
  [key: string]: string | number | undefined;
}

// 中文模板占位符映射
const TEMPLATE_VAR_MAP: Record<string, string> = {
  '商品名': 'itemName',
  '支持数': 'supportCount',
  '商品类型': 'itemTypeName',
  '商品类型复数': 'itemTypePlural',
  '变体数量': 'variationCount',
  '首个变体名': 'firstName',
  '智能标题': 'smartTitle',
  '折扣标识': 'discountIndicator',
  '原价': 'originalPrice',
  '折扣价': 'discountedPrice',
  '折扣百分比': 'discountPercent',
  'Fullset原价': 'fullsetOriginalPrice',
  'Fullset折扣价': 'fullsetDiscountedPrice',
  '折扣开始时间': 'startDate',
  '折扣结束时间': 'endDate',
  '日期': 'date',
  '内容': 'content',
  '作者名': 'authorName',
  '商品链接': 'itemUrl'
};

export function parseTemplate(
  template: string,
  variables: TemplateVariables
): string {
  let result = template;

  // 处理中文占位符，映射到英文变量名
  Object.entries(TEMPLATE_VAR_MAP).forEach(([chineseName, englishName]) => {
    const value = variables[englishName];
    if (value !== undefined && value !== null) {
      const regex = new RegExp(`\\{${chineseName}\\}`, 'g');
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
  return variations
    .filter(v => !v.isFullset)
    .reduce((sum, v) => {
      // 统计有多少个文件关联了商品
      if (!v.fileItemMap) return sum;
      const count = Object.keys(v.fileItemMap).filter(fileId => v.fileItemMap![fileId]).length;
      return sum + count;
    }, 0);
}

/**
 * 复数处理函数（简化版）
 * @param word - 单词
 * @param count - 数量（可选，如果为1则返回单数）
 * @returns 复数形式
 */
export function pluralize(word: string, count?: number): string {
  if (count === 1) return word;
  if (!word) return word;

  const lowerWord = word.toLowerCase();

  // 基础规则
  if (/[sxz]$|[cs]h$/.test(lowerWord)) {
    return word + 'es';
  }
  if (/[^aeiou]y$/.test(lowerWord)) {
    return word.slice(0, -1) + 'ies';
  }

  return word + 's';
}
