<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from '../composables/useI18n';
import { useDrawHistory } from '../composables/useDrawHistory';
import { useToast } from '../composables/useToast';
import { gmStorage } from '../utils/storage';
import { STORAGE_KEYS } from '../constants';
import { DEFAULT_ENDPOINTS, updateEndpoints } from '../api/twitter';
import Modal from './Modal.vue';

const emit = defineEmits<{ close: [] }>();

const { t } = useI18n();
const { clearHistory } = useDrawHistory();
const { show: showToast } = useToast();

type EndpointKeys = keyof typeof DEFAULT_ENDPOINTS;

const saved = gmStorage.get<Record<string, string>>(STORAGE_KEYS.CUSTOM_ENDPOINTS, {});
const endpoints = ref({
  retweeters: extractQueryId(saved.retweeters || DEFAULT_ENDPOINTS.retweeters),
  favoriters: extractQueryId(saved.favoriters || DEFAULT_ENDPOINTS.favoriters),
  searchTimeline: extractQueryId(saved.searchTimeline || DEFAULT_ENDPOINTS.searchTimeline),
});

function extractQueryId(endpoint: string): string {
  return endpoint.includes('/') ? endpoint.split('/')[0] : endpoint;
}

function handleSave() {
  const custom: Record<string, string> = {};
  for (const [k, v] of Object.entries(endpoints.value)) {
    if (v.trim()) custom[k] = v.trim();
  }
  gmStorage.set(STORAGE_KEYS.CUSTOM_ENDPOINTS, custom);
  updateEndpoints(custom);
  showToast(t('saved'), 'success');
}

function handleReset() {
  endpoints.value = {
    retweeters: extractQueryId(DEFAULT_ENDPOINTS.retweeters),
    favoriters: extractQueryId(DEFAULT_ENDPOINTS.favoriters),
    searchTimeline: extractQueryId(DEFAULT_ENDPOINTS.searchTimeline),
  };
  gmStorage.set(STORAGE_KEYS.CUSTOM_ENDPOINTS, {});
  updateEndpoints(DEFAULT_ENDPOINTS);
  showToast(t('saved'), 'success');
}

function handleClearCache() {
  const keys = GM_listValues?.() ?? [];
  let count = 0;
  for (const key of keys) {
    if (typeof key === 'string' && key.startsWith(STORAGE_KEYS.TWEET_CACHE_PREFIX)) {
      GM_deleteValue?.(key);
      count++;
    }
  }
  showToast(`${t('cacheCleared')} (${count})`, 'success');
}

const confirmingClearHistory = ref(false);

function handleClearHistory() {
  if (!confirmingClearHistory.value) {
    confirmingClearHistory.value = true;
    setTimeout(() => { confirmingClearHistory.value = false; }, 3000);
    return;
  }
  confirmingClearHistory.value = false;
  clearHistory();
  showToast(t('cacheCleared'), 'success');
}

const ENDPOINT_FIELDS: { key: EndpointKeys; label: string }[] = [
  { key: 'retweeters', label: 'retweetersEndpoint' },
  { key: 'favoriters', label: 'favoritersEndpoint' },
  { key: 'searchTimeline', label: 'searchEndpoint' },
];
</script>

<template>
  <Modal :title="t('settings')" max-width="480px" :z-index="10001" @close="emit('close')">
    <div class="flex-1 overflow-auto min-h-0 p-5 space-y-6">
      <!-- API Endpoints -->
      <div>
        <h3 :style="{ color: '#e7e9ea', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }">{{ t('apiEndpoints') }}</h3>
        <p :style="{ color: '#71767b', fontSize: '12px', marginBottom: '12px', lineHeight: '1.4' }">{{ t('apiEndpointsDesc') }}</p>
        <div class="space-y-3">
          <div v-for="field in ENDPOINT_FIELDS" :key="field.key">
            <label :style="{ color: '#71767b', fontSize: '12px', display: 'block', marginBottom: '4px' }">{{ t(field.label) }}</label>
            <input
              v-model="endpoints[field.key]"
              type="text"
              class="xd-input w-full text-sm"
              :placeholder="extractQueryId(DEFAULT_ENDPOINTS[field.key])"
            />
          </div>
        </div>
        <div :style="{ display: 'flex', gap: '8px', marginTop: '12px' }">
          <button class="xd-btn xd-btn-primary text-sm" @click="handleSave">{{ t('save') }}</button>
          <button class="xd-btn xd-btn-ghost text-sm" @click="handleReset">{{ t('reset') }}</button>
        </div>
      </div>

      <!-- Data Management -->
      <div>
        <h3 :style="{ color: '#e7e9ea', fontWeight: 700, fontSize: '14px', marginBottom: '12px' }">{{ t('dataManagement') }}</h3>
        <div :style="{ display: 'flex', gap: '8px' }">
          <button class="xd-btn xd-btn-secondary text-sm" @click="handleClearCache">{{ t('clearCache') }}</button>
          <button class="xd-btn text-sm" :class="confirmingClearHistory ? 'xd-btn-primary' : 'xd-btn-secondary'" :style="confirmingClearHistory ? { background: '#f4212e' } : { color: '#f4212e' }" @click="handleClearHistory">{{ confirmingClearHistory ? t('confirmClear') : t('clearHistory') }}</button>
        </div>
      </div>
    </div>
  </Modal>
</template>
