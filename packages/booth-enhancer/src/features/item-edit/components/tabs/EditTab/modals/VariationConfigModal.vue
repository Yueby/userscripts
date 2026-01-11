<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { GlobalTemplateConfig, ItemEditConfig } from '../../../../config-types';
import { getSelectedDiscountTemplate } from '../../../../config-types';
import { applyDiscount, suggestFullsetPrice } from '../../../../utils/priceCalculator';
import { calculateTotalSupport, parseTemplate } from '../../../../utils/templateParser';
import { FileSelector, PreviewBox, SectionHeader } from '../../../ui';
import { icons, withSize } from '../../../ui/icons';
import Modal from '../../../ui/Modal.vue';
import TemplateSelector from '../../../ui/TemplateSelector.vue';
import DiscountTemplateModal from './DiscountTemplateModal.vue';

const props = defineProps<{
  show: boolean;
  itemConfig: ItemEditConfig;
  globalTemplates: GlobalTemplateConfig;
  availableFiles: Array<{ id: string; name: string }>;
}>();

const emit = defineEmits<{
  close: [];
}>();

// 通用文件选择
const tempCommonFiles = ref<string[]>([]);

// 折扣模板配置 modal 状态
const showDiscountTemplateModal = ref(false);

// 监听 modal 打开时重置临时选择
watch(() => props.show, (show: boolean): void => {
  if (show) {
    tempCommonFiles.value = [...(props.itemConfig.commonFiles || [])];
  }
});

function handleSave(): void {
  props.itemConfig.commonFiles = tempCommonFiles.value;
  emit('close');
}

// 价格和折扣计算
const totalSupport = computed((): number => 
  calculateTotalSupport(props.itemConfig.variations)
);

const suggestedPrice = computed((): number => 
  suggestFullsetPrice(
    props.itemConfig.pricing.normalVariationPrice,
    totalSupport.value,
    props.itemConfig.discount
  )
);

const normalOriginalPrice = computed((): number => 
  props.itemConfig.pricing.normalVariationPrice
);

const normalDiscountedPrice = computed((): number => 
  applyDiscount(normalOriginalPrice.value, props.itemConfig.discount)
);

const fullsetOriginalPrice = computed((): number => 
  props.itemConfig.pricing.fullsetPrice
);

const fullsetDiscountedPrice = computed((): number => 
  applyDiscount(fullsetOriginalPrice.value, props.itemConfig.discount)
);

// 格式化日期时间
function formatDateTime(isoString?: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hour}:${minute}`;
}

// 折扣模板预览
const discountPreview = computed((): string => {
  if (!props.itemConfig.discount.enabled) return '';
  
  const discountTemplate = getSelectedDiscountTemplate(
    props.globalTemplates,
    props.itemConfig
  );
  
  return parseTemplate(discountTemplate, {
    originalPrice: normalOriginalPrice.value,
    discountedPrice: normalDiscountedPrice.value,
    discountPercent: props.itemConfig.discount.discountPercent,
    fullsetOriginalPrice: fullsetOriginalPrice.value,
    fullsetDiscountedPrice: fullsetDiscountedPrice.value,
    startDate: formatDateTime(props.itemConfig.discount.startDate),
    endDate: formatDateTime(props.itemConfig.discount.endDate)
  });
});
</script>

<template>
  <Modal
    :show="show"
    title="Variation 配置"
    :teleport-to="'.booth-enhancer-sidebar'"
    @close="emit('close')"
    width="500px"
  >
    <div class="be-flex be-flex-column be-gap-sm">
      <!-- 价格配置区 -->
      <SectionHeader title="价格配置">
        <div class="form-group">
          <label>普通 Variation 价格 (¥)</label>
          <input 
            v-model.number="itemConfig.pricing.normalVariationPrice"
            type="number"
            min="0" 
            placeholder="0"
          />
        </div>
        
        <div class="form-group">
          <label>Fullset 价格 (¥)</label>
          <p class="form-hint">建议: ¥{{ suggestedPrice }}</p>
          <input 
            v-model.number="itemConfig.pricing.fullsetPrice"
            type="number"
            min="0" 
            placeholder="0"
          />
        </div>

        <div class="be-flex be-gap-sm be-flex-wrap">
          <span class="be-p-xs be-px-sm be-text-sm be-text-secondary">
            总支持数: <strong>{{ totalSupport }}</strong>
          </span>
        </div>
      </SectionHeader>

      <!-- 折扣配置区 -->
      <SectionHeader title="折扣配置">
        <div class="be-flex be-align-center be-gap-sm">
          <label class="booth-toggle" title="启用打折功能">
            <input v-model="itemConfig.discount.enabled" type="checkbox" />
            <span class="toggle-slider"></span>
            <span class="toggle-label">启用打折</span>
          </label>
          
          <button 
            v-if="itemConfig.discount.enabled"
            class="booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm" 
            type="button"
            title="配置折扣模板"
            @click="showDiscountTemplateModal = true"
          >
            <span v-html="withSize(icons.settings, 14)"></span>
          </button>
        </div>

        <div v-if="itemConfig.discount.enabled" class="discount-config">
          <TemplateSelector
            v-model="itemConfig.selectedTemplates.discountTemplateId"
            :templates="globalTemplates.discountTemplates"
            label="选择折扣模板"
            empty-hint="请先在折扣模板配置中添加模板"
          />
          
          <div class="form-group">
            <label>折扣百分比 (%)</label>
            <input 
              v-model.number="itemConfig.discount.discountPercent"
              type="number"
              min="0" 
              max="100" 
              placeholder="0"
            />
          </div>

          <div class="be-flex be-gap-sm">
            <div class="form-group be-flex-1">
              <label>折扣开始时间</label>
              <input 
                v-model="itemConfig.discount.startDate"
                type="datetime-local"
              />
            </div>
            <div class="form-group be-flex-1">
              <label>折扣结束时间</label>
              <input 
                v-model="itemConfig.discount.endDate"
                type="datetime-local"
              />
            </div>
          </div>

          <PreviewBox label="折扣描述预览:" type="pre">{{ discountPreview }}</PreviewBox>

          <PreviewBox label="价格预览:" type="text">
            <div class="be-flex be-flex-column be-gap-xs">
              <div class="be-flex be-justify-between">
                <span>普通 Variation:</span>
                <span>¥{{ normalOriginalPrice }} → ¥{{ normalDiscountedPrice }}</span>
              </div>
              <div class="be-flex be-justify-between">
                <span>Fullset:</span>
                <span>¥{{ fullsetOriginalPrice }} → ¥{{ fullsetDiscountedPrice }}</span>
              </div>
            </div>
          </PreviewBox>
        </div>
      </SectionHeader>

      <!-- 通用文件配置区 -->
      <SectionHeader title="通用文件配置">
        <p class="form-hint be-text-xs be-text-secondary be-mb-sm">
          选择所有 variation 共享的通用文件（如材质、配饰等），这些文件会在应用时自动添加到每个 variation
        </p>
        
        <div class="be-text-xs be-text-secondary be-mb-xs">
          已选择: <strong>{{ tempCommonFiles.length }}</strong> 个文件
        </div>
        
        <FileSelector
          :files="availableFiles"
          :selected-file-ids="tempCommonFiles"
          @update:selected-file-ids="tempCommonFiles = $event"
        />
      </SectionHeader>
    </div>

    <template #footer>
      <button 
        class="booth-btn booth-btn-md booth-btn-icon booth-btn-secondary" 
        type="button"
        title="取消"
        @click="emit('close')"
      >
        <span v-html="withSize(icons.close, 18)"></span>
      </button>
      <button 
        class="booth-btn booth-btn-md booth-btn-icon booth-btn-primary" 
        type="button"
        title="保存"
        @click="handleSave"
      >
        <span v-html="withSize(icons.check, 18)"></span>
      </button>
    </template>
  </Modal>

  <!-- 折扣模板配置 Modal -->
  <DiscountTemplateModal
    :show="showDiscountTemplateModal"
    :global-templates="globalTemplates"
    @close="showDiscountTemplateModal = false"
  />
</template>

<style scoped>
.discount-config {
  display: flex;
  flex-direction: column;
  gap: var(--be-space-sm);
  margin-top: var(--be-space-sm);
}
</style>
