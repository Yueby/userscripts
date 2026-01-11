<script setup lang="ts">
import type { GlobalTemplateConfig, SectionTemplate } from '../../../../config-types';
import { icons, withSize } from '../../../ui/icons';
import Modal from '../../../ui/Modal.vue';

const props = defineProps<{
  show: boolean;
  globalTemplates: GlobalTemplateConfig;
}>();

const emit = defineEmits<{
  close: [];
  select: [template: SectionTemplate | null]; // null 表示创建空 section
}>();

// 类型样式映射
const TYPE_STYLES = {
  normal: {
    background: 'rgba(107, 114, 128, 0.1)',
    color: '#6b7280',
    label: '普通'
  },
  log: {
    background: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
    label: '日志'
  },
  iteminfo: {
    background: 'rgba(59, 130, 246, 0.1)',
    color: '#3b82f6',
    label: '商品信息'
  }
} as const;

function getTypeStyle(type?: string) {
  return TYPE_STYLES[type as keyof typeof TYPE_STYLES] || TYPE_STYLES.normal;
}

function handleSelectTemplate(template: SectionTemplate): void {
  emit('select', template);
}

function handleCreateEmpty(): void {
  emit('select', null);
}
</script>

<template>
  <Modal
    :show="show"
    title="选择 Section 模板"
    width="500px"
    :teleport-to="'.booth-enhancer-sidebar'"
    @close="emit('close')"
  >
    <div class="be-flex be-flex-column be-gap-sm">
      <p class="form-hint be-text-xs be-text-secondary">
        点击创建空白 Section 或从模板快速创建
      </p>

      <!-- 模板列表（包含创建空 Section） -->
      <div class="template-grid">
        <!-- 创建空 Section 选项 -->
        <button
          class="template-item booth-btn booth-btn-sm booth-btn-ghost be-justify-start"
          type="button"
          @click="handleCreateEmpty"
        >
          <div class="be-flex be-align-center be-gap-xs">
            <span v-html="withSize(icons.plus, 14)"></span>
            <span class="be-text-sm be-font-medium">创建空 Section</span>
          </div>
        </button>

        <!-- 模板选项 -->
        <button
          v-for="template in globalTemplates.sectionTemplates"
          :key="template.id"
          class="template-item booth-btn booth-btn-sm booth-btn-ghost be-justify-start"
          type="button"
          @click="handleSelectTemplate(template)"
        >
          <div class="be-flex be-flex-column" style="gap: 4px;">
            <div class="be-flex be-align-center be-gap-xs">
              <span class="be-text-sm be-font-medium">{{ template.name || '未命名模板' }}</span>
              <span 
                class="be-text-xs be-px-xs be-py-1 be-rounded"
                :style="{
                  background: getTypeStyle(template.type).background,
                  color: getTypeStyle(template.type).color
                }"
              >
                {{ getTypeStyle(template.type).label }}
              </span>
            </div>
            <div v-if="template.headline" class="be-text-xs be-text-secondary be-truncate">
              {{ template.headline }}
            </div>
          </div>
        </button>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.template-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid var(--be-color-border);
  border-radius: var(--be-radius-sm);
}

.template-item {
  padding: 8px;
  transition: all 0.15s ease;
}

.template-item:hover {
  transform: translateY(-1px);
}
</style>
