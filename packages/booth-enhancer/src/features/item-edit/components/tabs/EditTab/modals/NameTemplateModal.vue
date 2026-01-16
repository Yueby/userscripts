<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTemplateManager } from '../../../../composables';
import type { GlobalTemplateConfig, ItemData, ItemEditConfig, NameTemplate, NodeTree } from '../../../../config-types';
import { getSelectedDiscountIndicatorTemplate } from '../../../../config-types';
import { calculateTotalSupport, parseTemplate, pluralize } from '../../../../utils/templateParser';
import { PreviewBox, SectionHeader } from '../../../ui';
import { icons, withSize } from '../../../ui/icons';
import { DraggableCardList } from '../../../ui/list';
import Modal from '../../../ui/Modal.vue';
import DiscountIndicatorTemplateModal from './DiscountIndicatorTemplateModal.vue';
import { BUTTON_CLASSES, TEMPLATE_HINTS } from './template-hints';

const props = defineProps<{
  show: boolean;
  globalTemplates: GlobalTemplateConfig;
  itemConfig: ItemEditConfig;
  itemTree: NodeTree<ItemData>;
}>();

const emit = defineEmits<{
  close: [];
}>();

// 预览 Modal 状态
const showPreviewModal = ref(false);
const previewTemplateIndex = ref<number>(-1);

const templates = computed({
  get(): NameTemplate[] {
    return props.globalTemplates.nameTemplates ||= [];
  },
  set(value: NameTemplate[]): void {
    props.globalTemplates.nameTemplates = value;
  }
});

const { addTemplate, removeTemplate, onReorder } = useTemplateManager({
  templates,
  defaultTemplate: { template: '{smartTitle}' }
});

// 折扣标识模板配置 Modal 状态
const showDiscountIndicatorModal = ref(false);

// 计算模板变量（用于预览）
const templateVars = computed(() => {
  const config = props.itemConfig;
  if (!config) return { itemName: '', supportCount: 0 };
  
  const normalVariations = config.variations.filter(v => !v.isFullset);
  const firstVariation = normalVariations[0];
  const supportCount = calculateTotalSupport(config.variations);
  const itemTypeName = config.itemTypeName || 'Item';
  
  // 获取首个变体名
  const firstItemId = firstVariation?.fileItemMap ? Object.values(firstVariation.fileItemMap)[0] : null;
  const getItemName = (itemId: string) => {
    const node = props.itemTree.nodes[itemId];
    if (!node) return '未知商品';
    const itemData = node.data;
    if (!itemData) return node.name;
    return itemData.itemName;
  };
  const firstName = firstVariation?.name 
    || (firstItemId && getItemName(firstItemId))
    || config.itemName;
  
  // 智能标题
  const smartTitle = (normalVariations.length > 1 || supportCount > 1)
    ? `${supportCount} ${pluralize(itemTypeName, supportCount)}`
    : firstName;
  
  // 获取折扣标识
  const discountIndicatorTemplate = config.discount.enabled 
    ? getSelectedDiscountIndicatorTemplate(props.globalTemplates, config)
    : '';
  const discountIndicator = parseTemplate(discountIndicatorTemplate, {
    discountPercent: config.discount.discountPercent
  });
  
  return {
    itemName: config.itemName || '',
    supportCount,
    itemTypeName,
    itemTypePlural: pluralize(itemTypeName, supportCount),
    variationCount: normalVariations.length,
    firstName,
    smartTitle,
    discountIndicator
  };
});

// 预览指定模板
const previewTemplate = computed(() => {
  if (previewTemplateIndex.value < 0 || !templates.value[previewTemplateIndex.value]) {
    return '';
  }
  const template = templates.value[previewTemplateIndex.value];
  return parseTemplate(template.template, templateVars.value);
});

// 打开预览
function handlePreview(index: number): void {
  previewTemplateIndex.value = index;
  showPreviewModal.value = true;
}
</script>

<template>
  <Modal
    :show="show"
    title="商品名模板配置"
    :teleport-to="'.booth-enhancer-sidebar'"
    @close="emit('close')"
  >
    <template #header-actions>
      <button 
        :class="BUTTON_CLASSES.addButton" 
        @click="addTemplate"
        title="添加商品名模板"
        type="button"
      >
        <span v-html="withSize(icons.plus, 18)"></span>
      </button>
      <button 
        :class="BUTTON_CLASSES.addButton" 
        @click="showDiscountIndicatorModal = true"
        title="折扣标识模板配置"
        type="button"
      >
        <span v-html="withSize(icons.settings, 18)"></span>
      </button>
    </template>

    <SectionHeader>
      <p class="form-hint" v-html="TEMPLATE_HINTS.full.replace('\n', '<br>')"></p>
      <DraggableCardList
        v-if="globalTemplates.nameTemplates && globalTemplates.nameTemplates.length > 0"
        :items="globalTemplates.nameTemplates"
        :key-extractor="(item: NameTemplate) => item.id"
        @remove="removeTemplate"
        @reorder="onReorder"
      >
        <template #actions="{ item: template, index }">
          <input 
            v-model="template.name" 
            type="text" 
            placeholder="输入模板名称" 
            style="flex: 1; min-width: 0;" 
          />
          <button 
            class="booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm" 
            type="button"
            title="预览"
            @click.stop.prevent="handlePreview(index)"
          >
            <span v-html="withSize(icons.eye, 14)"></span>
          </button>
        </template>
        <template #content="{ item }">
          <div class="be-flex be-flex-column be-gap-sm">
            <div class="form-group">
              <label>模板内容</label>
              <textarea v-model="item.template" rows="1" placeholder="输入模板内容"></textarea>
            </div>
          </div>
        </template>
      </DraggableCardList>

      <div v-else class="empty-hint">
        暂无模板，点击"添加模板"创建
      </div>
    </SectionHeader>
  </Modal>

  <!-- 折扣标识模板配置 Modal -->
  <DiscountIndicatorTemplateModal
    :show="showDiscountIndicatorModal"
    :global-templates="globalTemplates"
    @close="showDiscountIndicatorModal = false"
  />

  <!-- 预览 Modal -->
  <Modal
    :show="showPreviewModal"
    title="商品名预览"
    :teleport-to="'.booth-enhancer-sidebar'"
    @close="showPreviewModal = false"
  >
    <PreviewBox label="预览结果:" type="text">
      <span class="be-text-primary be-text-lg be-font-semibold">{{ previewTemplate }}</span>
    </PreviewBox>
    
    <template #footer>
      <button 
        :class="BUTTON_CLASSES.closeButton" 
        @click="showPreviewModal = false" 
        title="关闭"
      >
        <span v-html="withSize(icons.close, 18)"></span>
      </button>
    </template>
  </Modal>
</template>
