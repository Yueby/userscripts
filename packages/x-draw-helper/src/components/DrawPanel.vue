<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from '../composables/useI18n';
import { useDrawData } from '../composables/useDrawData';
import { useExport } from '../composables/useExport';
import type { DrawUser, LangKey } from '../types';
import DrawResult from './DrawResult.vue';
import DrawSettings from './DrawSettings.vue';
import Modal from './Modal.vue';

const emit = defineEmits<{
  close: [];
}>();

const { t, currentLang, setLang, availableLangs, getLangName } = useI18n();
const drawData = useDrawData();
const { exportCsv } = useExport();

type TabFilter = 'all' | 'retweet' | 'like' | 'quote' | 'followed_by';
type SortKey = 'username' | 'handle' | 'retweet' | 'like' | 'quote' | 'followed_by';
type SortDir = 'asc' | 'desc';

const activeFilter = ref<TabFilter>('all');
const showResult = ref(false);
const showSettings = ref(false);
const winners = ref<DrawUser[]>([]);
const hoveredUser = ref<DrawUser | null>(null);
const tooltipPos = ref({ x: 0, y: 0 });
const sortKey = ref<SortKey | null>(null);
const sortDir = ref<SortDir>('asc');

// Pagination
const PAGE_SIZE = 20;
const currentPage = ref(1);

// Always fetch fresh data on mount (stale data remains visible during loading)
drawData.fetchInteractionData().catch((err) => {
  if (err.message !== 'Aborted') {
    alert(t(err.message || 'loginRequired'));
  }
});

const filteredUsers = computed<DrawUser[]>(() => {
  const users = drawData.mergedUsers.value;
  if (activeFilter.value === 'all') return users;
  if (activeFilter.value === 'retweet') return users.filter((u) => u.hasRetweet);
  if (activeFilter.value === 'like') return users.filter((u) => u.hasLike);
  if (activeFilter.value === 'quote') return users.filter((u) => u.hasQuote);
  if (activeFilter.value === 'followed_by') return users.filter((u) => u.followed_by);
  return users;
});

const sortedUsers = computed<DrawUser[]>(() => {
  const users = [...filteredUsers.value];
  if (!sortKey.value) return users;

  const key = sortKey.value;
  const dir = sortDir.value === 'asc' ? 1 : -1;

  return users.sort((a, b) => {
    if (key === 'username') return dir * a.username.localeCompare(b.username);
    if (key === 'handle') return dir * a.handle.localeCompare(b.handle);
    if (key === 'retweet') return dir * (Number(!!b.hasRetweet) - Number(!!a.hasRetweet));
    if (key === 'like') return dir * (Number(!!b.hasLike) - Number(!!a.hasLike));
    if (key === 'quote') return dir * (Number(!!b.hasQuote) - Number(!!a.hasQuote));
    if (key === 'followed_by') return dir * (Number(!!b.followed_by) - Number(!!a.followed_by));
    return 0;
  });
});

// Pagination computed
const totalPages = computed(() => Math.max(1, Math.ceil(sortedUsers.value.length / PAGE_SIZE)));
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return sortedUsers.value.slice(start, start + PAGE_SIZE);
});
const pageOffset = computed(() => (currentPage.value - 1) * PAGE_SIZE);

// Reset page when filter/sort changes
watch([activeFilter, sortKey, sortDir], () => {
  currentPage.value = 1;
});

// Clamp page when data shrinks
watch(totalPages, (tp) => {
  if (currentPage.value > tp) currentPage.value = tp;
});

// Visible page numbers (max 5 around current)
const visiblePages = computed(() => {
  const total = totalPages.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const cur = currentPage.value;
  const pages: (number | '...')[] = [1];
  if (cur > 3) pages.push('...');
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
  if (cur < total - 2) pages.push('...');
  pages.push(total);
  return pages;
});

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortDir.value = 'asc';
  }
}

function getSortIcon(key: SortKey): string {
  if (sortKey.value !== key) return '↕';
  return sortDir.value === 'asc' ? '↑' : '↓';
}

const stats = computed(() => ({
  total: drawData.mergedUsers.value.length,
  retweets: drawData.retweets.value.length,
  likes: drawData.likes.value.length,
  quotes: drawData.quotes.value.length,
  followers: drawData.mergedUsers.value.filter((u) => u.followed_by).length,
}));

function handleDraw() {
  showSettings.value = true;
}

function onDrawResult(picked: DrawUser[]) {
  winners.value = picked;
  showSettings.value = false;
  showResult.value = true;
}

function handleExport() {
  exportCsv({
    retweets: drawData.retweets.value,
    likes: drawData.likes.value,
    quotes: drawData.quotes.value,
  });
}

function handleLangChange(e: Event) {
  setLang((e.target as HTMLSelectElement).value as LangKey);
}

function onRowEnter(user: DrawUser, e: MouseEvent) {
  const row = (e.currentTarget as HTMLElement);
  const rect = row.getBoundingClientRect();
  tooltipPos.value = { x: rect.left + 60, y: rect.top };
  hoveredUser.value = user;
}

function openProfile(handle: string) {
  window.open(`https://x.com/${handle}`, '_blank');
}
</script>

<template>
  <Modal :title="t('drawHelper')" width="w-[900px]" height="h-[700px]" @close="emit('close')">
    <template #header-controls>
      <select class="xd-select text-sm" :value="currentLang" @change="handleLangChange">
        <option v-for="lang in availableLangs" :key="lang" :value="lang">{{ getLangName(lang) }}</option>
      </select>
    </template>

    <!-- Stats -->
    <div class="grid grid-cols-5 border-b border-[#38444d] shrink-0">
      <div class="flex flex-col items-center py-3 border-r border-[#38444d]">
        <span class="text-xs text-[#71767b]">{{ t('total') }}</span>
        <span class="text-xl font-bold text-white">{{ stats.total }}</span>
      </div>
      <div class="flex flex-col items-center py-3 border-r border-[#38444d]">
        <span class="text-xs text-[#71767b]">{{ t('retweets') }}</span>
        <span class="text-xl font-bold text-[#00ba7c]">{{ stats.retweets }}</span>
        <div v-if="drawData.loading.value" class="mt-1 text-[11px] text-[#71767b] flex items-center gap-1">
          <svg class="animate-spin h-3 w-3 text-[#00ba7c]" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          <span>{{ drawData.retweetProgress.value }}</span>
        </div>
      </div>
      <div class="flex flex-col items-center py-3 border-r border-[#38444d]">
        <span class="text-xs text-[#71767b]">{{ t('likes') }}</span>
        <span class="text-xl font-bold text-[#f91880]">{{ stats.likes }}</span>
        <div v-if="drawData.loading.value" class="mt-1 text-[11px] text-[#71767b] flex items-center gap-1">
          <svg class="animate-spin h-3 w-3 text-[#f91880]" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          <span>{{ drawData.likeProgress.value }}</span>
        </div>
      </div>
      <div class="flex flex-col items-center py-3 border-r border-[#38444d]">
        <span class="text-xs text-[#71767b]">{{ t('quotes') }}</span>
        <span class="text-xl font-bold text-[#ff7a00]">{{ stats.quotes }}</span>
        <div v-if="drawData.loading.value" class="mt-1 text-[11px] text-[#71767b] flex items-center gap-1">
          <svg class="animate-spin h-3 w-3 text-[#ff7a00]" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          <span>{{ drawData.quoteProgress.value }}</span>
        </div>
      </div>
      <div class="flex flex-col items-center py-3">
        <span class="text-xs text-[#71767b]">{{ t('followingMe') }}</span>
        <span class="text-xl font-bold text-[#1d9bf0]">{{ stats.followers }}</span>
      </div>
    </div>

    <!-- Toolbar: Tabs + Actions -->
    <div class="flex items-center justify-between px-5 py-3 border-b border-[#38444d] shrink-0">
      <div class="xd-tab-group">
        <button
          v-for="tab in (['all', 'retweet', 'like', 'quote', 'followed_by'] as const)"
          :key="tab"
          class="xd-tab"
          :class="{ active: activeFilter === tab }"
          @click="activeFilter = tab"
        >
          {{ tab === 'all' ? t('total') : tab === 'retweet' ? t('retweets') : tab === 'like' ? t('likes') : tab === 'quote' ? t('quotes') : t('followingMe') }}
          <span class="ml-1 opacity-60 text-[11px]">
            {{ tab === 'all' ? stats.total : tab === 'retweet' ? stats.retweets : tab === 'like' ? stats.likes : tab === 'quote' ? stats.quotes : stats.followers }}
          </span>
        </button>
      </div>
      <div class="flex items-center gap-2">
        <button class="xd-btn xd-btn-primary text-sm" @click="handleDraw">{{ t('startDraw') }}</button>
        <button class="xd-btn xd-btn-secondary text-sm" @click="handleExport">{{ t('export') }}</button>
      </div>
    </div>

    <!-- Table -->
    <div class="flex-1 overflow-auto min-h-0">
      <table class="w-full text-sm border-collapse">
        <thead class="sticky top-0 bg-[#15202b] z-[1]">
          <tr class="text-left border-b border-[#38444d]">
            <th class="w-14 px-4 py-2.5 text-[#71767b] font-medium">#</th>
            <th class="xd-th px-4 py-2.5" @click="toggleSort('username')">
              {{ t('username') }} <span class="text-xs opacity-50">{{ getSortIcon('username') }}</span>
            </th>
            <th class="xd-th w-40 px-4 py-2.5" @click="toggleSort('handle')">
              {{ t('handle') }} <span class="text-xs opacity-50">{{ getSortIcon('handle') }}</span>
            </th>
            <th class="xd-th w-20 px-4 py-2.5 text-center" @click="toggleSort('retweet')">
              <span class="inline-flex items-center justify-center gap-1"><svg viewBox="0 0 24 24" class="w-4 h-4 text-[#00ba7c]" fill="currentColor"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"/></svg><span class="text-xs opacity-50">{{ getSortIcon('retweet') }}</span></span>
            </th>
            <th class="xd-th w-20 px-4 py-2.5 text-center" @click="toggleSort('like')">
              <span class="inline-flex items-center justify-center gap-1"><svg viewBox="0 0 24 24" class="w-4 h-4" fill="currentColor"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/></svg><span class="text-xs opacity-50">{{ getSortIcon('like') }}</span></span>
            </th>
            <th class="xd-th w-20 px-4 py-2.5 text-center" @click="toggleSort('quote')">
              <span class="inline-flex items-center justify-center gap-1"><svg viewBox="0 0 24 24" class="w-4 h-4" fill="currentColor"><path d="M14.23 2.854c.98-.977 2.56-.977 3.54 0l3.38 3.378c.97.977.97 2.559 0 3.536L9.91 21H3v-6.914L14.23 2.854zm2.12 1.414c-.19-.195-.51-.195-.7 0L4.41 15.51V19h3.49l11.24-11.242c.2-.195.2-.513 0-.707l-3.38-3.378-.41.595zm-1.42 1.42l3.38 3.378-1.42 1.414-3.38-3.378 1.42-1.414z"/></svg><span class="text-xs opacity-50">{{ getSortIcon('quote') }}</span></span>
            </th>
            <th class="xd-th w-20 px-4 py-2.5 text-center" @click="toggleSort('followed_by')">
              <span class="inline-flex items-center justify-center gap-1"><svg viewBox="0 0 24 24" class="w-4 h-4" fill="currentColor"><path d="M12 11.816c1.355 0 2.872-.15 3.84-1.256.814-.93 1.078-2.368.806-4.392-.38-2.825-2.117-4.512-4.646-4.512S7.734 3.343 7.354 6.168c-.272 2.024-.008 3.462.806 4.392.968 1.107 2.485 1.256 3.84 1.256zm-3.16-5.448c.162-1.2.787-3.212 3.16-3.212s2.998 2.013 3.16 3.212c.207 1.55.057 2.627-.45 3.205-.455.52-1.266.743-2.71.743s-2.255-.223-2.71-.743c-.507-.578-.657-1.656-.45-3.205zm11.44 12.868c-.877-3.526-4.282-5.99-8.28-5.99s-7.403 2.464-8.28 5.99c-.172.692-.028 1.4.395 1.94.408.52 1.04.82 1.733.82h12.304c.693 0 1.325-.3 1.733-.82.424-.54.567-1.247.394-1.94zm-1.576 1.016c-.126.16-.316.246-.552.246H5.848c-.235 0-.426-.086-.552-.246-.137-.174-.18-.412-.12-.654.71-2.855 3.517-4.85 6.824-4.85s6.114 1.994 6.824 4.85c.06.242.017.48-.12.654z"/></svg><span class="text-xs opacity-50">{{ getSortIcon('followed_by') }}</span></span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(user, i) in paginatedUsers"
            :key="user.handle"
            class="border-b border-[#38444d]/30 hover:bg-white/[0.03] transition-colors h-12"
          >
            <td class="w-14 px-4 text-[#71767b]">{{ pageOffset + i + 1 }}</td>
            <td class="px-4" @mouseenter="onRowEnter(user, $event)" @mouseleave="hoveredUser = null">
              <div class="flex items-center gap-3">
                <img :src="user.avatarUrl" :alt="user.username" class="w-8 h-8 rounded-full shrink-0" />
                <span class="font-medium text-[#1d9bf0] truncate max-w-[240px] cursor-pointer hover:underline" @click="openProfile(user.handle)">{{ user.username }}</span>
              </div>
            </td>
            <td class="w-40 px-4 text-[#71767b] truncate">@{{ user.handle }}</td>
            <td class="w-20 px-4 text-center">
              <span v-if="user.hasRetweet" class="xd-badge xd-badge-green"><svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="currentColor"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"/></svg></span>
              <span v-else class="text-[#38444d]">—</span>
            </td>
            <td class="w-20 px-4 text-center">
              <span v-if="user.hasLike" class="xd-badge xd-badge-pink"><svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="currentColor"><path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/></svg></span>
              <span v-else class="text-[#38444d]">—</span>
            </td>
            <td class="w-20 px-4 text-center">
              <span v-if="user.hasQuote" class="xd-badge xd-badge-orange"><svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="currentColor"><path d="M14.23 2.854c.98-.977 2.56-.977 3.54 0l3.38 3.378c.97.977.97 2.559 0 3.536L9.91 21H3v-6.914L14.23 2.854zm2.12 1.414c-.19-.195-.51-.195-.7 0L4.41 15.51V19h3.49l11.24-11.242c.2-.195.2-.513 0-.707l-3.38-3.378-.41.595zm-1.42 1.42l3.38 3.378-1.42 1.414-3.38-3.378 1.42-1.414z"/></svg></span>
              <span v-else class="text-[#38444d]">—</span>
            </td>
            <td class="w-20 px-4 text-center">
              <span v-if="user.followed_by" class="xd-badge xd-badge-blue"><svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="currentColor"><path d="M12 11.816c1.355 0 2.872-.15 3.84-1.256.814-.93 1.078-2.368.806-4.392-.38-2.825-2.117-4.512-4.646-4.512S7.734 3.343 7.354 6.168c-.272 2.024-.008 3.462.806 4.392.968 1.107 2.485 1.256 3.84 1.256zm-3.16-5.448c.162-1.2.787-3.212 3.16-3.212s2.998 2.013 3.16 3.212c.207 1.55.057 2.627-.45 3.205-.455.52-1.266.743-2.71.743s-2.255-.223-2.71-.743c-.507-.578-.657-1.656-.45-3.205zm11.44 12.868c-.877-3.526-4.282-5.99-8.28-5.99s-7.403 2.464-8.28 5.99c-.172.692-.028 1.4.395 1.94.408.52 1.04.82 1.733.82h12.304c.693 0 1.325-.3 1.733-.82.424-.54.567-1.247.394-1.94zm-1.576 1.016c-.126.16-.316.246-.552.246H5.848c-.235 0-.426-.086-.552-.246-.137-.174-.18-.412-.12-.654.71-2.855 3.517-4.85 6.824-4.85s6.114 1.994 6.824 4.85c.06.242.017.48-.12.654z"/></svg></span>
              <span v-else class="text-[#38444d]">—</span>
            </td>
          </tr>
          <tr v-if="sortedUsers.length === 0">
            <td colspan="7" class="text-center py-12 text-[#71767b]">{{ t('noUsers') }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-center px-5 py-2.5 border-t border-[#38444d] shrink-0">
      <div class="flex items-center gap-1">
        <button
          class="xd-btn-icon"
          :style="{ opacity: currentPage <= 1 ? 0.3 : 1, pointerEvents: currentPage <= 1 ? 'none' : 'auto' }"
          @click="currentPage--"
        >«</button>
        <template v-for="p in visiblePages" :key="p">
          <span v-if="p === '...'" class="px-1 text-[#71767b]">…</span>
          <button
            v-else
            class="xd-tab"
            :class="{ active: currentPage === p }"
            @click="currentPage = p as number"
          >{{ p }}</button>
        </template>
        <button
          class="xd-btn-icon"
          :style="{ opacity: currentPage >= totalPages ? 0.3 : 1, pointerEvents: currentPage >= totalPages ? 'none' : 'auto' }"
          @click="currentPage++"
        >»</button>
      </div>
    </div>

    <template #footer>
      <div class="px-5 py-2 text-center text-xs text-[#71767b]">
        {{ t('madeWith') }}
        <a href="https://github.com/yueby" target="_blank" class="text-[#1d9bf0] hover:underline">Yueby</a>
      </div>
    </template>
  </Modal>

  <!-- Draw Settings Modal -->
  <DrawSettings v-if="showSettings" @close="showSettings = false" @draw="onDrawResult" />

  <!-- Draw Result Modal -->
  <DrawResult v-if="showResult" :winners="winners" @close="showResult = false" />

  <!-- User Tooltip (fixed position to avoid overflow clipping) -->
  <div
    v-if="hoveredUser"
    class="fixed z-[10000] w-72 bg-[#1e2d3d] border border-[#38444d] rounded-xl shadow-xl p-4 pointer-events-none"
    :style="{ left: tooltipPos.x + 'px', top: (tooltipPos.y - 8) + 'px', transform: 'translateY(-100%)' }"
  >
    <div class="flex items-start gap-3 mb-2">
      <img :src="hoveredUser.avatarUrl" :alt="hoveredUser.username" class="w-12 h-12 rounded-full shrink-0" />
      <div class="min-w-0">
        <div class="text-white font-bold truncate">{{ hoveredUser.username }}</div>
        <div class="text-[#71767b] text-sm">@{{ hoveredUser.handle }}</div>
      </div>
    </div>
    <p v-if="hoveredUser.bio" class="text-[#e7e9ea] text-sm leading-relaxed">{{ hoveredUser.bio }}</p>
    <p v-else class="text-[#71767b] text-sm italic">{{ t('noBio') }}</p>
    <div class="flex gap-2 mt-2 flex-wrap">
      <span v-if="hoveredUser.hasRetweet" class="xd-badge xd-badge-green"><svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="currentColor"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"/></svg>{{ t('retweetType') }}</span>
      <span v-if="hoveredUser.hasLike" class="xd-badge xd-badge-pink"><svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="currentColor"><path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/></svg>{{ t('likeType') }}</span>
      <span v-if="hoveredUser.hasQuote" class="xd-badge xd-badge-orange"><svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="currentColor"><path d="M14.23 2.854c.98-.977 2.56-.977 3.54 0l3.38 3.378c.97.977.97 2.559 0 3.536L9.91 21H3v-6.914L14.23 2.854zm2.12 1.414c-.19-.195-.51-.195-.7 0L4.41 15.51V19h3.49l11.24-11.242c.2-.195.2-.513 0-.707l-3.38-3.378-.41.595zm-1.42 1.42l3.38 3.378-1.42 1.414-3.38-3.378 1.42-1.414z"/></svg>{{ t('quoteType') }}</span>
      <span v-if="hoveredUser.followed_by" class="xd-badge xd-badge-blue"><svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="currentColor"><path d="M12 11.816c1.355 0 2.872-.15 3.84-1.256.814-.93 1.078-2.368.806-4.392-.38-2.825-2.117-4.512-4.646-4.512S7.734 3.343 7.354 6.168c-.272 2.024-.008 3.462.806 4.392.968 1.107 2.485 1.256 3.84 1.256zm-3.16-5.448c.162-1.2.787-3.212 3.16-3.212s2.998 2.013 3.16 3.212c.207 1.55.057 2.627-.45 3.205-.455.52-1.266.743-2.71.743s-2.255-.223-2.71-.743c-.507-.578-.657-1.656-.45-3.205zm11.44 12.868c-.877-3.526-4.282-5.99-8.28-5.99s-7.403 2.464-8.28 5.99c-.172.692-.028 1.4.395 1.94.408.52 1.04.82 1.733.82h12.304c.693 0 1.325-.3 1.733-.82.424-.54.567-1.247.394-1.94zm-1.576 1.016c-.126.16-.316.246-.552.246H5.848c-.235 0-.426-.086-.552-.246-.137-.174-.18-.412-.12-.654.71-2.855 3.517-4.85 6.824-4.85s6.114 1.994 6.824 4.85c.06.242.017.48-.12.654z"/></svg>{{ t('followingYou') }}</span>
    </div>
  </div>
</template>
