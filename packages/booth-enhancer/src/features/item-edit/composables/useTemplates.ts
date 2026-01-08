/**
 * 模板复制功能 Composable
 * 处理商品数据的模板替换和复制
 */

import { computed } from 'vue';
import { ItemData, Node, TemplateData as TemplateDataType } from '../config-types';
import { toast } from '../components/ui/Toast';
import { ConfigStorage } from '../modules/ConfigStorage';

export interface TemplateData {
  name: string;
  data: ItemData;
}

export interface Template {
  id: string;
  name: string;
  content: string;
}

export function useTemplates() {
  const storage = ConfigStorage.getInstance();
  
  // 从 templateTree 中提取所有有数据的模板节点
  const templates = computed(() => {
    const tree = storage.data.value.templateTree;
    const result: Template[] = [];
    
    // 遍历所有节点，提取有 data 的（模板节点）
    for (const nodeId in tree.nodes) {
      const node = tree.nodes[nodeId];
      if (node.data) {
        result.push({
          id: node.id,
          name: node.name,
          content: node.data.content
        });
      }
    }
    
    return result;
  });
  
  const selectedTemplateId = computed(() => storage.data.value.activeTemplateId);

  /**
   * 应用模板（替换占位符）
   */
  const applyTemplate = (template: string, data: TemplateData): string => {
    return template
      .replace(/\{\{authorName\}\}/g, data.data.authorName)
      .replace(/\{\{itemName\}\}/g, data.name)
      .replace(/\{\{itemUrl\}\}/g, data.data.itemUrl);
  };

  /**
   * 复制到剪贴板
   */
  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        toast.success('已复制到剪贴板');
        return true;
      } else {
        // 降级方案
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        
        if (success) {
          toast.success('已复制到剪贴板');
          return true;
        } else {
          throw new Error('复制失败');
        }
      }
    } catch (error) {
      console.error('复制到剪贴板失败:', error);
      toast.error('复制失败');
      return false;
    }
  };

  /**
   * 使用模板并复制
   */
  const applyAndCopy = async (templateId: string, data: TemplateData): Promise<boolean> => {
    const template = templates.value.find(t => t.id === templateId);
    if (!template) {
      toast.error('模板不存在');
      return false;
    }

    const result = applyTemplate(template.content, data);
    return await copyToClipboard(result);
  };


  /**
   * 获取当前选中的模板
   */
  const getSelectedTemplate = (): Template | undefined => {
    return templates.value.find(t => t.id === selectedTemplateId.value);
  };

  /**
   * 预览模板效果
   */
  const previewTemplate = (templateId: string, data: TemplateData): string => {
    const template = templates.value.find(t => t.id === templateId);
    if (!template) return '';
    
    return applyTemplate(template.content, data);
  };

  return {
    templates,
    selectedTemplateId,
    applyTemplate,
    copyToClipboard,
    applyAndCopy,
    getSelectedTemplate,
    previewTemplate
  };
}
