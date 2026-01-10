/**
 * 模板管理 Composable
 * 提供通用的模板 CRUD 操作
 */

import type { Ref } from 'vue';

export interface TemplateItem {
  id: string;
  name: string;
  isDefault?: boolean;
  [key: string]: any;
}

export interface UseTemplateManagerOptions<T extends TemplateItem> {
  templates: Ref<T[]>;
  defaultTemplate?: Partial<T>;
  minTemplates?: number;
}

export function useTemplateManager<T extends TemplateItem>(
  options: UseTemplateManagerOptions<T>
) {
  const { templates, defaultTemplate, minTemplates = 1 } = options;

  function addTemplate(): void {
    const templateArray = templates.value ||= [];
    const newTemplate: T = {
      id: crypto.randomUUID(),
      name: `模板 ${templateArray.length + 1}`,
      isDefault: false,
      ...defaultTemplate
    } as T;
    templateArray.push(newTemplate);
  }

  function removeTemplate(index: number): void {
    const templateArray = templates.value;
    if (!templateArray || templateArray.length <= minTemplates) return;
    templateArray.splice(index, 1);
  }

  function setDefaultTemplate(index: number): void {
    const templateArray = templates.value;
    if (!templateArray) return;
    templateArray.forEach((t, i) => {
      t.isDefault = i === index;
    });
  }

  function onReorder(fromIndex: number, toIndex: number): void {
    const templateArray = templates.value;
    if (!templateArray) return;
    const [removed] = templateArray.splice(fromIndex, 1);
    templateArray.splice(toIndex, 0, removed);
  }

  return {
    addTemplate,
    removeTemplate,
    setDefaultTemplate,
    onReorder
  };
}
