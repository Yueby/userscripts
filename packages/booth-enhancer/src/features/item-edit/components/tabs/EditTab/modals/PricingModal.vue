<script setup lang="ts">
import { computed, ref } from 'vue';
import type { DiscountPeriod, GlobalTemplateConfig, ItemEditConfig } from '../../../../config-types';
import { getSelectedDiscountTemplate } from '../../../../config-types';
import { applyDiscount, applyDiscountPercent, suggestFullsetPrice } from '../../../../utils/priceCalculator';
import { calculateTotalSupport, formatDateTime, parseTemplate } from '../../../../utils/templateParser';
import { PreviewBox, SectionHeader } from '../../../ui';
import { icons, withSize } from '../../../ui/icons';
import { DraggableCardList } from '../../../ui/list';
import Modal from '../../../ui/Modal.vue';
import TemplateSelector from '../../../ui/TemplateSelector.vue';
import DiscountTemplateModal from './DiscountTemplateModal.vue';

const props = defineProps<{
  show: boolean;
  itemConfig: ItemEditConfig;
  globalTemplates: GlobalTemplateConfig;
}>();

const emit = defineEmits<{
  close: [];
}>();

const showDiscountTemplateModal = ref(false);

// 价格计算
const totalSupport = computed(() => calculateTotalSupport(props.itemConfig.variations));

const suggestedPrice = computed(() => 
  suggestFullsetPrice(
    props.itemConfig.pricing.normalVariationPrice,
    totalSupport.value,
    props.itemConfig.discount
  )
);

const normalOriginalPrice = computed(() => props.itemConfig.pricing.normalVariationPrice);
const fullsetOriginalPrice = computed(() => props.itemConfig.pricing.fullsetPrice);
const normalDiscountedPrice = computed(() => applyDiscount(normalOriginalPrice.value, props.itemConfig.discount));
const fullsetDiscountedPrice = computed(() => applyDiscount(fullsetOriginalPrice.value, props.itemConfig.discount));

// 判断某个时段是否当前生效
function isPeriodActive(period: DiscountPeriod): boolean {
  const now = Date.now();
  const start = period.startDate ? new Date(period.startDate).getTime() : 0;
  const end = period.endDate ? new Date(period.endDate).getTime() : Infinity;
  return now >= start && now <= end;
}

// 折扣时段操作
function addPeriod(): void {
  props.itemConfig.discount.periods.push({
    id: crypto.randomUUID(),
    discountPercent: 0,
    startDate: '',
    endDate: ''
  });
}

function removePeriod(index: number): void {
  props.itemConfig.discount.periods.splice(index, 1);
}

function onPeriodReorder(from: number, to: number): void {
  const [removed] = props.itemConfig.discount.periods.splice(from, 1);
  props.itemConfig.discount.periods.splice(to, 0, removed);
}

// 折扣描述预览（B 方案：header + 循环 periodTemplate）
const discountPreview = computed((): string => {
  if (!props.itemConfig.discount.enabled || props.itemConfig.discount.periods.length === 0) return '';
  
  const discountTpl = getSelectedDiscountTemplate(props.globalTemplates, props.itemConfig);
  if (!discountTpl) return '';
  
  const headerText = discountTpl.header || '';
  const periodTpl = discountTpl.periodTemplate || (discountTpl as any).template || '';
  
  const periodTexts = props.itemConfig.discount.periods.map(period => {
    return parseTemplate(periodTpl, {
      originalPrice: normalOriginalPrice.value,
      discountedPrice: applyDiscountPercent(normalOriginalPrice.value, period.discountPercent),
      discountPercent: period.discountPercent,
      fullsetOriginalPrice: fullsetOriginalPrice.value,
      fullsetDiscountedPrice: applyDiscountPercent(fullsetOriginalPrice.value, period.discountPercent),
      startDate: formatDateTime(period.startDate),
      endDate: formatDateTime(period.endDate)
    });
  });
  
  return [headerText, ...periodTexts].filter(Boolean).join('\n');
});
</script>

<template>
  <Modal
    :show="show"
    title="价格与折扣配置"
    :teleport-to="'.booth-enhancer-sidebar'"
    @close="emit('close')"
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
          <span class="be-p-xs be-px-sm be-text-sm be-text-secondary">
            当前折后: ¥{{ normalDiscountedPrice }} / Fullset ¥{{ fullsetDiscountedPrice }}
          </span>
        </div>
      </SectionHeader>

      <!-- 折扣配置区 -->
      <SectionHeader title="折扣配置">
        <template #actions>
          <button 
            v-if="itemConfig.discount.enabled"
            class="booth-btn booth-btn-ghost booth-btn-icon booth-btn-sm" 
            type="button"
            title="配置折扣模板"
            @click="showDiscountTemplateModal = true"
          >
            <span v-html="withSize(icons.settings, 14)"></span>
          </button>
          <button 
            v-if="itemConfig.discount.enabled"
            class="booth-btn booth-btn-sm booth-btn-secondary" 
            type="button"
            title="添加折扣时段"
            @click="addPeriod"
          >
            <span v-html="withSize(icons.plus, 14)"></span>
          </button>
        </template>

        <div class="be-flex be-align-center be-gap-sm be-mb-sm">
          <label class="booth-toggle" title="启用打折功能">
            <input v-model="itemConfig.discount.enabled" type="checkbox" />
            <span class="toggle-slider"></span>
            <span class="toggle-label">启用打折</span>
          </label>
        </div>

        <div v-if="itemConfig.discount.enabled">
          <TemplateSelector
            v-model="itemConfig.selectedTemplates.discountTemplateId"
            :templates="globalTemplates.discountTemplates"
            label="选择折扣模板"
            empty-hint="请先在折扣模板配置中添加模板"
          />

          <!-- 折扣时段列表 -->
          <div v-if="itemConfig.discount.periods.length === 0" class="empty-hint be-mt-sm">
            暂无折扣时段，点击"+"添加
          </div>

          <DraggableCardList
            v-else
            :items="itemConfig.discount.periods"
            :key-extractor="(item: DiscountPeriod) => item.id"
            @remove="removePeriod"
            @reorder="onPeriodReorder"
          >
            <template #actions="{ item: period }">
              <div class="be-flex be-align-center be-gap-xs be-flex-1">
                <input 
                  v-model.number="period.discountPercent" 
                  type="number" 
                  min="0" max="100" 
                  placeholder="%" 
                  style="width: 60px; height: 26px;"
                />
                <span class="be-text-xs be-text-secondary">% OFF</span>
                <span v-if="isPeriodActive(period)" class="period-active-badge">生效中</span>
              </div>
            </template>
            <template #content="{ item: period }">
              <div class="be-flex be-gap-xs">
                <input 
                  v-model="period.startDate" 
                  type="datetime-local" 
                  style="flex: 1; height: 26px;"
                />
                <span class="be-text-xs be-text-secondary be-flex-shrink-0" style="line-height: 26px;">→</span>
                <input 
                  v-model="period.endDate" 
                  type="datetime-local" 
                  style="flex: 1; height: 26px;"
                />
              </div>
            </template>
          </DraggableCardList>

          <!-- 预览 -->
          <PreviewBox v-if="discountPreview" label="折扣描述预览:" type="pre" class="be-mt-sm">{{ discountPreview }}</PreviewBox>
        </div>
      </SectionHeader>
    </div>
  </Modal>

  <!-- 折扣模板配置 Modal -->
  <DiscountTemplateModal
    :show="showDiscountTemplateModal"
    :global-templates="globalTemplates"
    @close="showDiscountTemplateModal = false"
  />
</template>

<style scoped>
.period-active-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 8px;
  background: rgba(16, 185, 129, 0.12);
  color: var(--be-color-success);
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
