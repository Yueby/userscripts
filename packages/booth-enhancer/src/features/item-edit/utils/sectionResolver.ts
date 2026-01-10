import type { SectionInstance, SectionTemplate } from '../config-types';

// 解析 Section 实例，获取实际显示的内容
export function resolveSectionContent(
  instance: SectionInstance,
  templates: SectionTemplate[]
): { headline: string; body: string } {
  // 如果有 templateId，先从模板获取基础内容
  if (instance.templateId) {
    const template = templates.find(t => t.id === instance.templateId);
    if (template) {
      return {
        headline: instance.headline ?? template.headline,
        body: instance.body ?? template.body
      };
    }
  }
  
  // 自定义 Section 或模板未找到
  return {
    headline: instance.headline ?? '',
    body: instance.body ?? ''
  };
}

// 创建引用模板的 Section 实例
export function createSectionFromTemplate(template: SectionTemplate): SectionInstance {
  return {
    id: crypto.randomUUID(),
    templateId: template.id
  };
}

// 创建自定义 Section 实例
export function createCustomSection(headline = '', body = ''): SectionInstance {
  return {
    id: crypto.randomUUID(),
    headline,
    body
  };
}
