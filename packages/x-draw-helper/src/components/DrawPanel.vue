<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { useDrawData } from '../composables/useDrawData';
import { useDrawHistory } from '../composables/useDrawHistory';
import { useExport } from '../composables/useExport';
import { useI18n } from '../composables/useI18n';
import { useToast } from '../composables/useToast';
import { LIMITS, TIMING } from '../constants';
import type { DrawUser, LangKey } from '../types';
import DrawAnimation from './DrawAnimation.vue';
import DrawHistory from './DrawHistory.vue';
import DrawResult from './DrawResult.vue';
import DrawSettings from './DrawSettings.vue';
import InteractionBadge from './InteractionBadge.vue';
import InteractionIcon from './InteractionIcon.vue';
import Modal from './Modal.vue';
import Settings from './Settings.vue';
import Toast from './Toast.vue';

const emit = defineEmits<{
  close: [];
}>();

const { t, currentLang, setLang, availableLangs, getLangName } = useI18n();
const drawData = useDrawData();
const { addEntry, getWinCount } = useDrawHistory();
const { exportCsv } = useExport();
const { show: showToast } = useToast();

type TabFilter = 'all' | 'retweet' | 'like' | 'quote' | 'followed_by';
type SortKey = 'username' | 'handle' | 'retweet' | 'like' | 'quote' | 'followed_by' | 'followersCount';
type SortDir = 'asc' | 'desc';

const TAB_CONFIG: { key: TabFilter; labelKey: string; statKey: string }[] = [
  { key: 'all', labelKey: 'total', statKey: 'total' },
  { key: 'retweet', labelKey: 'retweets', statKey: 'retweets' },
  { key: 'like', labelKey: 'likes', statKey: 'likes' },
  { key: 'quote', labelKey: 'quotes', statKey: 'quotes' },
  { key: 'followed_by', labelKey: 'followingMe', statKey: 'followers' },
];

const activeFilter = ref<TabFilter>('all');
const searchQuery = ref('');
const showResult = ref(false);
const showSettings = ref(false);
const showHistory = ref(false);
const showAnimation = ref(false);
const showSettingsPanel = ref(false);
const winners = ref<DrawUser[]>([]);
const hoveredUser = ref<DrawUser | null>(null);
const tooltipPos = ref({ x: 0, y: 0 });
const sortKey = ref<SortKey | null>(null);
const sortDir = ref<SortDir>('asc');

// Pagination
const PAGE_SIZE = LIMITS.PAGE_SIZE;
const currentPage = ref(1);

// Always fetch fresh data on mount (stale data remains visible during loading)
drawData.fetchInteractionData().catch((err) => {
  if (err instanceof DOMException && err.name === 'AbortError') return;
  showToast(t(err.message || 'loginRequired'), 'error', TIMING.TOAST_DURATION * 2);
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

const searchedUsers = computed<DrawUser[]>(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return filteredUsers.value;
  return filteredUsers.value.filter(
    (u) => u.username.toLowerCase().includes(q) || u.handle.toLowerCase().includes(q),
  );
});

const sortedUsers = computed<DrawUser[]>(() => {
  const users = [...searchedUsers.value];
  if (!sortKey.value) return users;

  const key = sortKey.value;
  const dir = sortDir.value === 'asc' ? 1 : -1;

  return users.sort((a, b) => {
    if (key === 'username') return dir * a.username.localeCompare(b.username);
    if (key === 'handle') return dir * a.handle.localeCompare(b.handle);
    if (key === 'followersCount') return dir * (a.followersCount - b.followersCount);
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
watch([activeFilter, sortKey, sortDir, searchQuery], () => {
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
  const pages: (number | string)[] = [1];
  if (cur > 3) pages.push('..L');
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
  if (cur < total - 2) pages.push('..R');
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

const now = ref(Date.now());
const cacheAgeTimer = setInterval(() => { now.value = Date.now(); }, TIMING.CACHE_AGE_INTERVAL);
onUnmounted(() => clearInterval(cacheAgeTimer));

const cacheAge = computed(() => {
  if (!drawData.fetchedAt.value) return '';
  const mins = Math.floor((now.value - drawData.fetchedAt.value) / 60000);
  return mins < 1 ? t('justNow') : t('minutesAgo', { count: mins });
});

function handleRefresh() {
  drawData.fetchInteractionData().catch((err) => {
    if (err instanceof DOMException && err.name === 'AbortError') return;
    showToast(t(err.message || 'loginRequired'), 'error', TIMING.TOAST_DURATION * 2);
  });
}

function handleDraw() {
  showSettings.value = true;
}

function onDrawResult(picked: DrawUser[]) {
  winners.value = picked;
  showSettings.value = false;

  if (drawData.mergedUsers.value.length >= 3) {
    showAnimation.value = true;
  } else {
    showResult.value = true;
    saveDraw(picked);
  }
}

function onAnimationDone() {
  showAnimation.value = false;
  showResult.value = true;
  saveDraw(winners.value);
}

function saveDraw(picked: DrawUser[]) {
  const tweetId = drawData.lastTweetId.value;
  if (tweetId) {
    addEntry({
      tweetId,
      winners: picked,
      filters: { ...drawData.filters.value },
      totalParticipants: drawData.qualifiedUsers.value.length,
    });
  }
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
  const el = e.currentTarget as HTMLElement;
  const rect = el.getBoundingClientRect();
  tooltipPos.value = { x: rect.left + rect.width / 2, y: rect.top };
  hoveredUser.value = user;
}

function openProfile(handle: string) {
  window.open(`https://x.com/${handle}`, '_blank');
}
</script>

<template>
  <Modal :title="t('drawHelper')" max-width="1080px" max-height="700px" @close="emit('close')">
    <template #header-controls>
      <select class="xd-select text-sm" :value="currentLang" @change="handleLangChange">
        <option v-for="lang in availableLangs" :key="lang" :value="lang">{{ getLangName(lang) }}</option>
      </select>
      <button class="xd-btn-icon" :title="t('settings')" @click="showSettingsPanel = true">
        <svg viewBox="0 0 24 24" class="w-4 h-4" fill="currentColor"><path d="M10.54 1.75h2.92l1.57 2.36c.11.17.32.25.53.21l2.53-.59 2.17 2.17-.59 2.53c-.04.21.04.42.21.53l2.36 1.57v2.92l-2.36 1.57c-.17.11-.25.32-.21.53l.59 2.53-2.17 2.17-2.53-.59c-.21-.04-.42.04-.53.21l-1.57 2.36h-2.92l-1.57-2.36c-.11-.17-.32-.25-.53-.21l-2.53.59-2.17-2.17.59-2.53c.04-.21-.04-.42-.21-.53L1.75 13.46v-2.92l2.36-1.57c.17-.11.25-.32.21-.53l-.59-2.53 2.17-2.17 2.53.59c.21.04.42-.04.53-.21L10.54 1.75zM12 15.5c1.93 0 3.5-1.57 3.5-3.5S13.93 8.5 12 8.5 8.5 10.07 8.5 12s1.57 3.5 3.5 3.5z"/></svg>
      </button>
    </template>

    <!-- Stats -->
    <div :style="{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', borderBottom: '1px solid #38444d', flexShrink: 0, overflowX: 'auto' }">
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

    <!-- Toolbar -->
    <div class="px-5 py-2.5 border-b border-[#38444d] shrink-0 flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <div class="xd-tab-group">
          <button
            v-for="tab in TAB_CONFIG"
            :key="tab.key"
            class="xd-tab"
            :class="{ active: activeFilter === tab.key }"
            @click="activeFilter = tab.key"
          >
            {{ t(tab.labelKey) }}
            <span class="ml-1 opacity-60 text-[11px]">{{ (stats as any)[tab.statKey] }}</span>
          </button>
        </div>
        <div class="flex items-center gap-2">
          <button class="xd-btn xd-btn-primary text-sm" @click="handleDraw">{{ t('startDraw') }}</button>
          <button class="xd-btn xd-btn-secondary text-sm" @click="showHistory = true">{{ t('history') }}</button>
          <button class="xd-btn xd-btn-secondary text-sm" @click="handleExport">{{ t('export') }}</button>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex items-center flex-1" :style="{ background: '#273340', border: '1px solid #38444d', borderRadius: '9999px', padding: '0 12px', gap: '8px' }">
          <svg class="w-4 h-4 shrink-0" :style="{ color: '#71767b' }" viewBox="0 0 24 24" fill="currentColor"><path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z" /></svg>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('search')"
            :style="{ flex: '1', background: 'transparent', border: 'none', color: '#fff', fontSize: '14px', padding: '6px 0', outline: 'none', appearance: 'none' }"
          />
        </div>
        <button
          class="xd-btn xd-btn-secondary shrink-0"
          :style="{ fontSize: '11px', padding: '4px 10px' }"
          :title="t('refresh')"
          @click="handleRefresh"
        >
          <svg viewBox="0 0 24 24" class="w-3.5 h-3.5" :class="{ 'animate-spin': drawData.loading.value }" fill="currentColor"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
          <span v-if="cacheAge">{{ cacheAge }}</span>
        </button>
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
              <span class="inline-flex items-center justify-center gap-1"><InteractionIcon type="retweet" /><span class="text-xs opacity-50">{{ getSortIcon('retweet') }}</span></span>
            </th>
            <th class="xd-th w-20 px-4 py-2.5 text-center" @click="toggleSort('like')">
              <span class="inline-flex items-center justify-center gap-1"><InteractionIcon type="like" /><span class="text-xs opacity-50">{{ getSortIcon('like') }}</span></span>
            </th>
            <th class="xd-th w-20 px-4 py-2.5 text-center" @click="toggleSort('quote')">
              <span class="inline-flex items-center justify-center gap-1"><InteractionIcon type="quote" /><span class="text-xs opacity-50">{{ getSortIcon('quote') }}</span></span>
            </th>
            <th class="xd-th w-20 px-4 py-2.5 text-center" @click="toggleSort('followed_by')">
              <span class="inline-flex items-center justify-center gap-1"><InteractionIcon type="follow" /><span class="text-xs opacity-50">{{ getSortIcon('followed_by') }}</span></span>
            </th>
            <th class="xd-th w-24 px-4 py-2.5 text-center" @click="toggleSort('followersCount')">
              <span class="inline-flex items-center justify-center gap-1 text-xs text-[#71767b] font-medium">{{ t('followers') }} <span class="opacity-50">{{ getSortIcon('followersCount') }}</span></span>
            </th>
            <th class="w-16 px-4 py-2.5 text-center text-[#71767b] font-medium text-xs">{{ t('winCount') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(user, i) in paginatedUsers"
            :key="user.handle"
            class="border-b border-[#38444d]/30 hover:bg-white/[0.03] transition-colors h-12"
          >
            <td class="w-14 px-4 text-[#71767b]">{{ pageOffset + i + 1 }}</td>
            <td class="px-4">
              <div class="flex items-center gap-3">
                <img :src="user.avatarUrl" :alt="user.username" class="w-8 h-8 rounded-full shrink-0 cursor-pointer" @mouseenter="onRowEnter(user, $event)" @mouseleave="hoveredUser = null" />
                <span class="font-medium text-[#1d9bf0] truncate max-w-[240px] cursor-pointer hover:underline" @click="openProfile(user.handle)">{{ user.username }}</span>
              </div>
            </td>
            <td class="w-40 px-4 text-[#71767b] truncate">@{{ user.handle }}</td>
            <td class="w-20 px-4 text-center">
              <InteractionBadge v-if="user.hasRetweet" type="retweet" />
              <span v-else class="text-[#38444d]">—</span>
            </td>
            <td class="w-20 px-4 text-center">
              <InteractionBadge v-if="user.hasLike" type="like" />
              <span v-else class="text-[#38444d]">—</span>
            </td>
            <td class="w-20 px-4 text-center">
              <InteractionBadge v-if="user.hasQuote" type="quote" />
              <span v-else class="text-[#38444d]">—</span>
            </td>
            <td class="w-20 px-4 text-center">
              <InteractionBadge v-if="user.followed_by" type="follow" />
              <span v-else class="text-[#38444d]">—</span>
            </td>
            <td class="w-24 px-4 text-center text-[#71767b] text-xs">
              {{ user.followersCount.toLocaleString() }}
            </td>
            <td class="w-16 px-4 text-center">
              <span v-if="getWinCount(user.handle)" class="text-[#ffd700] font-bold text-sm">{{ getWinCount(user.handle) }}</span>
              <span v-else class="text-[#38444d]">—</span>
            </td>
          </tr>
          <template v-if="sortedUsers.length === 0 && drawData.loading.value">
            <tr v-for="i in 8" :key="'sk-' + i" class="border-b border-[#38444d]/30 h-12">
              <td class="w-14 px-4"><div class="h-3 w-6 bg-[#38444d]/50 rounded animate-pulse" /></td>
              <td class="px-4"><div class="flex items-center gap-3"><div class="w-8 h-8 bg-[#38444d]/50 rounded-full animate-pulse" /><div class="h-3 w-24 bg-[#38444d]/50 rounded animate-pulse" /></div></td>
              <td class="w-40 px-4"><div class="h-3 w-20 bg-[#38444d]/50 rounded animate-pulse" /></td>
              <td class="w-20 px-4"><div class="h-3 w-8 mx-auto bg-[#38444d]/50 rounded animate-pulse" /></td>
              <td class="w-20 px-4"><div class="h-3 w-8 mx-auto bg-[#38444d]/50 rounded animate-pulse" /></td>
              <td class="w-20 px-4"><div class="h-3 w-8 mx-auto bg-[#38444d]/50 rounded animate-pulse" /></td>
              <td class="w-20 px-4"><div class="h-3 w-8 mx-auto bg-[#38444d]/50 rounded animate-pulse" /></td>
              <td class="w-24 px-4"><div class="h-3 w-12 mx-auto bg-[#38444d]/50 rounded animate-pulse" /></td>
              <td class="w-16 px-4"><div class="h-3 w-6 mx-auto bg-[#38444d]/50 rounded animate-pulse" /></td>
            </tr>
          </template>
          <tr v-else-if="sortedUsers.length === 0">
            <td colspan="9" class="text-center py-12 text-[#71767b]">{{ t('noUsers') }}</td>
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
          <span v-if="typeof p === 'string'" class="px-1 text-[#71767b]">…</span>
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

  <!-- Draw Animation -->
  <DrawAnimation
    v-if="showAnimation"
    :pool="drawData.mergedUsers.value"
    :winners="winners"
    @done="onAnimationDone"
  />

  <!-- Draw Result Modal -->
  <DrawResult v-if="showResult" :winners="winners" @close="showResult = false" />

  <!-- Draw History Modal -->
  <DrawHistory v-if="showHistory" @close="showHistory = false" />

  <!-- Settings Modal -->
  <Settings v-if="showSettingsPanel" @close="showSettingsPanel = false" />

  <Toast />

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
    <div class="flex gap-4 text-sm text-[#71767b]">
      <span><span class="text-white font-bold">{{ hoveredUser.followingCount.toLocaleString() }}</span> {{ t('followingLabel') }}</span>
      <span><span class="text-white font-bold">{{ hoveredUser.followersCount.toLocaleString() }}</span> {{ t('followers') }}</span>
    </div>
    <p v-if="hoveredUser.bio" class="text-[#e7e9ea] text-sm leading-relaxed mt-1">{{ hoveredUser.bio }}</p>
    <p v-else class="text-[#71767b] text-sm italic mt-1">{{ t('noBio') }}</p>
    <div class="flex gap-2 mt-2 flex-wrap">
      <InteractionBadge v-if="hoveredUser.hasRetweet" type="retweet" :label="t('retweetType')" />
      <InteractionBadge v-if="hoveredUser.hasLike" type="like" :label="t('likeType')" />
      <InteractionBadge v-if="hoveredUser.hasQuote" type="quote" :label="t('quoteType')" />
      <InteractionBadge v-if="hoveredUser.followed_by" type="follow" :label="t('followingYou')" />
    </div>
  </div>
</template>
