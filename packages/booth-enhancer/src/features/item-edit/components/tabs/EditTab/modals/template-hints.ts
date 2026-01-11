/**
 * 模板变量提示文本常量
 * 统一管理所有模板中使用的变量提示，避免重复和不一致
 */

export const TEMPLATE_HINTS = {
  // 基础模板变量提示（用于名称、描述、Section 模板）
  basic: '基础: {商品名}, {支持数}, {商品类型}, {商品类型复数}, {变体数量}, {首个变体名}',
  smart: '智能: {智能标题}, {折扣标识}',
  
  // Log 模板变量提示
  log: '可用变量: {日期}, {内容}',
  
  // 折扣模板变量提示
  discount: '可用变量: {原价}, {折扣价}, {折扣百分比}, {Fullset原价}, {Fullset折扣价}, {折扣开始时间}, {折扣结束时间}',
  
  // 完整的基础和智能变量提示
  get full(): string {
    return `${this.basic}\n${this.smart}`;
  }
} as const;

/**
 * 按钮样式类名常量
 */
export const BUTTON_CLASSES = {
  addButton: 'booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm',
  closeButton: 'booth-btn booth-btn-md booth-btn-icon booth-btn-secondary',
  saveButton: 'booth-btn booth-btn-md booth-btn-icon booth-btn-primary'
} as const;
