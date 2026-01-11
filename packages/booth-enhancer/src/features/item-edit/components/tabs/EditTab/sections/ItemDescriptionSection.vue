<script setup lang="ts">
import { computed } from 'vue';
import type { ItemEditAPI } from '../../../../../../api/item-edit';
import { useModal } from '../../../../composables';
import type { GlobalTemplateConfig, ItemEditConfig } from '../../../../config-types';
import { getSelectedDescriptionTemplate, getSelectedDiscountTemplate } from '../../../../config-types';
import { applyDiscount } from '../../../../utils/priceCalculator';
import type { TemplateVariables } from '../../../../utils/templateParser';
import { parseTemplate } from '../../../../utils/templateParser';
import { PreviewBox, SectionHeader } from '../../../ui';
import { icons, withSize } from '../../../ui/icons';
import { toast } from '../../../ui/Toast';

const props = defineProps<{
  itemConfig: ItemEditConfig;
  globalTemplates: GlobalTemplateConfig;
  templateVars: TemplateVariables;
  api: ItemEditAPI;
  modal: ReturnType<typeof useModal>;
  currentItemId: string;
  onDescriptionUpdated: (description: string) => void;
}>();

const emit = defineEmits<{
  applied: [];
}>();

// 预览：描述
const previewDescription = computed((): string => {
  const parts: string[] = [];
  
  const descTemplate = getSelectedDescriptionTemplate(props.globalTemplates, props.itemConfig);
  const templateDesc = parseTemplate(descTemplate, props.templateVars);
  if (templateDesc) parts.push(templateDesc);
  
  if (props.itemConfig.customDescription) {
    parts.push(props.itemConfig.customDescription);
  }
  
  if (props.itemConfig.discount.enabled) {
    const normalOriginalPrice = props.itemConfig.pricing.normalVariationPrice;
    const normalDiscountedPrice = applyDiscount(
      normalOriginalPrice,
      props.itemConfig.discount
    );
    const fullsetOriginalPrice = props.itemConfig.pricing.fullsetPrice;
    const fullsetDiscountedPrice = applyDiscount(
      fullsetOriginalPrice,
      props.itemConfig.discount
    );
    
    // 格式化时间
    const formatDateTime = (isoString?: string): string => {
      if (!isoString) return '';
      const date = new Date(isoString);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');
      return `${month}/${day} ${hour}:${minute}`;
    };
    
    const discountTemplate = getSelectedDiscountTemplate(props.globalTemplates, props.itemConfig);
    const discountText = parseTemplate(
      discountTemplate,
      {
        ...props.templateVars,
        originalPrice: normalOriginalPrice,
        discountedPrice: normalDiscountedPrice,
        discountPercent: props.itemConfig.discount.discountPercent,
        fullsetOriginalPrice: fullsetOriginalPrice,
        fullsetDiscountedPrice: fullsetDiscountedPrice,
        startDate: formatDateTime(props.itemConfig.discount.startDate),
        endDate: formatDateTime(props.itemConfig.discount.endDate)
      }
    );
    parts.push(discountText);
  }
  
  return parts.join('\n\n');
});

// 编辑描述
async function handleEditDescription(): Promise<void> {
  const result = await props.modal.openModal({
    type: 'editDescription',
    title: '编辑描述',
    formData: {
      customDescription: props.itemConfig.customDescription
    }
  });
  
  if (result) {
    // 通知父组件更新自定义描述
    props.onDescriptionUpdated(result.customDescription);
  }
}

// 应用到页面
function applyDescription(): void {
  props.api.setDescription(previewDescription.value);
  toast.success('已应用描述');
  emit('applied');
}

defineExpose({
  applyDescription
});
</script>

<template>
  <SectionHeader title="商品描述">
    <template #actions>
      <button 
        class="booth-btn booth-btn-sm booth-btn-secondary" 
        type="button"
        title="编辑描述"
        @click="handleEditDescription"
      >
        <span v-html="withSize(icons.edit, 14)"></span>
      </button>
      <button 
        class="booth-btn booth-btn-sm booth-btn-primary" 
        type="button"
        title="应用到页面"
        @click="applyDescription"
      >
        <span v-html="withSize(icons.send, 14)"></span>
      </button>
    </template>
    
    <PreviewBox 
      label="预览:" 
      type="pre"
      :is-empty="!previewDescription"
      empty-text='暂无描述，点击"编辑描述"添加'
    >{{ previewDescription }}</PreviewBox>
  </SectionHeader>
</template>
