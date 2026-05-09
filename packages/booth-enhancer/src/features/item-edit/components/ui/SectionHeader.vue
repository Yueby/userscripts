<template>
  <section :class="['section-header-container', { 'no-header': !hasHeader, 'no-border': noBorder, 'is-collapsed': collapsible && isCollapsed }]">
    <div v-if="hasHeader" class="section-header" :class="{ 'is-clickable': collapsible }" @click="toggleCollapse">
      <div class="section-header-title">
        <span v-if="collapsible" class="collapse-icon" :class="{ 'is-collapsed': isCollapsed }">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
        <span v-if="title || $slots.title" class="be-text-base be-font-bold">
          <slot name="title">{{ title }}</slot>
        </span>
      </div>
      <div v-if="$slots.actions" class="actions" @click.stop>
        <slot name="actions"></slot>
      </div>
    </div>
    <div v-show="!isCollapsed" class="section-content">
      <slot></slot>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, useSlots } from 'vue';
import { ConfigStorage } from '../../modules/ConfigStorage';

const props = withDefaults(defineProps<{
  title?: string;
  noBorder?: boolean;
  collapsible?: boolean;
  sectionId?: string; // 用于持久化折叠状态的唯一 ID
}>(), {
  title: '',
  noBorder: false,
  collapsible: false,
  sectionId: ''
});

const slots = useSlots();
const hasHeader = computed(() => props.title || slots.title || slots.actions);

// 持久化折叠状态
const storage = props.sectionId ? ConfigStorage.getInstance() : null;

const isCollapsed = computed({
  get(): boolean {
    if (!props.collapsible) return false;
    if (!props.sectionId || !storage) return localCollapsed.value;
    return storage.data.value.ui.collapsedSections?.includes(props.sectionId) ?? false;
  },
  set(value: boolean) {
    if (!props.collapsible) return;
    if (!props.sectionId || !storage) {
      localCollapsed.value = value;
      return;
    }
    const sections = storage.data.value.ui.collapsedSections ??= [];
    const idx = sections.indexOf(props.sectionId);
    if (value && idx === -1) {
      sections.push(props.sectionId);
    } else if (!value && idx !== -1) {
      sections.splice(idx, 1);
    }
  }
});

// 非持久化的本地状态（没有 sectionId 时用）
const localCollapsed = ref(false);

function toggleCollapse(): void {
  if (!props.collapsible) return;
  isCollapsed.value = !isCollapsed.value;
}
</script>

<style scoped>
.section-header-container {
  padding: 12px 14px;
  border-bottom: 1px solid var(--be-color-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-header-container.no-header {
  padding-top: 12px;
}

.section-header-container.no-border {
  border-bottom: none;
}

.section-header-container.is-collapsed {
  gap: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  min-height: 28px;
}

.section-header.is-clickable {
  cursor: pointer;
  user-select: none;
}

.section-header.is-clickable:hover .section-header-title {
  color: var(--be-color-primary);
}

.section-header-title {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
  letter-spacing: -0.01em;
  transition: color 0.15s ease;
}

.collapse-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--be-color-text-muted);
  transition: transform 0.2s ease;
}

.collapse-icon.is-collapsed {
  transform: rotate(-90deg);
}

.actions {
  display: flex;
  gap: 4px;
  flex-wrap: nowrap;
  align-items: center;
  flex-shrink: 0;
}
</style>
