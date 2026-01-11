import type {
  GlobalTemplateConfig,
  ItemData,
  ItemInfoSectionInstance,
  ItemInfoTemplate,
  LogSectionInstance,
  LogTemplate,
  NodeTree,
  NormalSectionInstance,
  SectionInstance,
  SectionTemplate,
  SectionType,
  VariationData
} from '../config-types';
import { formatDate, parseTemplate } from './templateParser';

// ===== Section 创建函数 =====

/**
 * 根据类型创建不同的 Section 实例
 */
export function createSectionByType(
  type: SectionType,
  globalTemplates: GlobalTemplateConfig
): SectionInstance {
  const id = crypto.randomUUID();
  
  switch (type) {
    case 'normal':
      return {
        id,
        type: 'normal',
        headline: '',
        body: ''
      };
    
    case 'log':
      const firstLogTemplate = globalTemplates.logTemplates?.[0]?.id || '';
      return {
        id,
        type: 'log',
        headline: '更新日志',
        logEntries: [],
        logTemplateId: firstLogTemplate
      };
    
    case 'iteminfo':
      const firstItemInfoTemplate = globalTemplates.itemInfoTemplates?.[0]?.id || '';
      return {
        id,
        type: 'iteminfo',
        headline: '対応アバター',
        itemInfoTemplateId: firstItemInfoTemplate
      };
  }
}

/**
 * 创建引用模板的 Section 实例（根据模板类型创建对应的 section）
 */
export function createSectionFromTemplate(
  template: SectionTemplate,
  globalTemplates: GlobalTemplateConfig
): SectionInstance {
  const templateType = template.type || 'normal';
  const id = crypto.randomUUID();
  
  switch (templateType) {
    case 'iteminfo':
      // 创建商品信息类型的 section
      const firstItemInfoTemplate = globalTemplates.itemInfoTemplates?.[0]?.id || '';
      return {
        id,
        type: 'iteminfo',
        headline: template.headline || '対応アバター',
        itemInfoTemplateId: firstItemInfoTemplate
      };
    
    case 'log':
      // 创建日志类型的 section
      const firstLogTemplate = globalTemplates.logTemplates?.[0]?.id || '';
      return {
        id,
        type: 'log',
        headline: template.headline || '更新日志',
        logEntries: [],
        logTemplateId: firstLogTemplate
      };
    
    default:
      // 默认创建普通类型的 section，填入模板内容
      return {
        id,
        type: 'normal',
        templateId: template.id,
        headline: template.headline,
        body: template.body || ''
      };
  }
}

/**
 * 创建自定义普通 Section 实例
 */
export function createCustomSection(headline = '', body = ''): NormalSectionInstance {
  return {
    id: crypto.randomUUID(),
    type: 'normal',
    headline,
    body
  };
}

// ===== Section 内容解析 =====

/**
 * 解析上下文接口
 */
export interface ResolveContext {
  variations: VariationData[];
  itemTree: NodeTree<ItemData>;
}

/**
 * 解析 Section 内容（需要根据类型处理）
 */
export function resolveSectionContent(
  section: SectionInstance,
  globalTemplates: GlobalTemplateConfig,
  context: ResolveContext
): { headline: string; body: string } {
  // 向后兼容：旧数据可能没有 type 字段，默认为 normal
  if (!section.type) {
    (section as any).type = 'normal';
  }
  
  switch (section.type) {
    case 'normal':
      return resolveNormalSection(section as NormalSectionInstance, globalTemplates.sectionTemplates);
    
    case 'log':
      return resolveLogSection(section as LogSectionInstance, globalTemplates.logTemplates);
    
    case 'iteminfo':
      return resolveItemInfoSection(
        section as ItemInfoSectionInstance,
        globalTemplates.itemInfoTemplates,
        context
      );
    
    default:
      // 兜底：未知类型按 normal 处理
      return { headline: (section as any).headline || '', body: (section as any).body || '' };
  }
}

/**
 * 解析普通 Section
 */
function resolveNormalSection(
  section: NormalSectionInstance,
  templates: SectionTemplate[] | undefined
): { headline: string; body: string } {
  // 如果有 templateId，先从模板获取基础内容
  if (section.templateId && templates) {
    const template = templates.find(t => t.id === section.templateId);
    if (template) {
      return {
        headline: section.headline ?? template.headline,
        body: section.body ?? template.body ?? ''
      };
    }
  }
  
  // 自定义 Section 或模板未找到
  return {
    headline: section.headline ?? '',
    body: section.body ?? ''
  };
}

/**
 * 解析日志 Section
 */
function resolveLogSection(
  section: LogSectionInstance,
  templates: LogTemplate[] | undefined
): { headline: string; body: string } {
  const headline = section.headline ?? '更新日志';
  
  // 查找选中的模板
  const template = templates?.find(t => t.id === section.logTemplateId);
  const templateStr = template?.template || '{日期} - {内容}';
  
  // 格式化每个日志条目
  const entries = section.logEntries.map(entry => {
    return parseTemplate(templateStr, {
      date: formatDate(entry.date),
      content: entry.content
    });
  });
  
  const body = entries.join('\n\n');
  
  return { headline, body };
}

/**
 * 解析商品信息 Section
 */
function resolveItemInfoSection(
  section: ItemInfoSectionInstance,
  templates: ItemInfoTemplate[] | undefined,
  context: ResolveContext
): { headline: string; body: string } {
  const headline = section.headline ?? '対応アバター';
  
  // 查找选中的模板
  const template = templates?.find(t => t.id === section.itemInfoTemplateId);
  const templateStr = template?.template || '⟡ {作者名}\nʚ {商品名} ɞ\n- {商品链接} -';
  
  // 从 Variations 收集商品数据
  const items = collectItemsFromVariations(context.variations, context.itemTree);
  
  // 按作者分组并格式化
  const body = formatItemInfoList(items, templateStr);
  
  return { headline, body };
}

/**
 * 从 Variations 收集关联的商品数据
 */
function collectItemsFromVariations(
  variations: VariationData[],
  itemTree: NodeTree<ItemData>
): ItemData[] {
  const items: ItemData[] = [];
  const seen = new Set<string>();
  
  variations.forEach(variation => {
    // 从 fileItemMap 中收集所有关联的商品
    if (variation.fileItemMap) {
      Object.values(variation.fileItemMap).forEach(itemId => {
        if (itemId && !seen.has(itemId)) {
          const node = itemTree.nodes[itemId];
          if (node?.data) {
            items.push(node.data);
            seen.add(itemId);
          }
        }
      });
    }
  });
  
  return items;
}

/**
 * 按作者分组商品数据
 */
function groupItemsByAuthor(items: ItemData[]): Map<string, ItemData[]> {
  const grouped = new Map<string, ItemData[]>();
  items.forEach(item => {
    const author = item.authorName || '未知作者';
    if (!grouped.has(author)) {
      grouped.set(author, []);
    }
    grouped.get(author)!.push(item);
  });
  return grouped;
}

/**
 * 格式化商品信息列表（自动按作者分组）
 */
function formatItemInfoList(
  items: ItemData[],
  itemInfoTemplate: string
): string {
  const grouped = groupItemsByAuthor(items);
  const results: string[] = [];
  
  grouped.forEach((authorItems) => {
    // 为每个作者组渲染商品
    authorItems.forEach(item => {
      const formatted = parseTemplate(itemInfoTemplate, {
        authorName: item.authorName,
        itemName: item.itemName,
        itemUrl: item.itemUrl
      });
      results.push(formatted);
    });
  });
  
  return results.join('\n\n');
}
