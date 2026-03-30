import { ref, computed } from 'vue';
import { STORAGE_KEYS } from '../constants';
import { gmStorage } from '../utils/storage';

export interface Template {
  id: string;
  name: string;
  dm: string;
  notify: string;
}

interface TemplateStore {
  templates: Template[];
  activeId: string;
}

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'en',
    name: 'English',
    dm: 'Hi {winner}, congratulations on winning! 🎉\n{tweet}',
    notify: 'Congratulations to the winners:\n{winners}',
  },
  {
    id: 'zh',
    name: '中文',
    dm: '你好 {winner}，恭喜中奖！🎉\n{tweet}',
    notify: '恭喜以下用户获奖：\n{winners}',
  },
  {
    id: 'ja',
    name: '日本語',
    dm: 'こんにちは {winner}さん、当選おめでとうございます！🎉\n{tweet}',
    notify: '当選者は以下の通りです：\n{winners}',
  },
];

function loadStore(): TemplateStore {
  const saved = gmStorage.get<TemplateStore | null>(STORAGE_KEYS.DM_TEMPLATE, null);
  if (saved?.templates?.length) return saved;
  return { templates: [...DEFAULT_TEMPLATES], activeId: DEFAULT_TEMPLATES[0].id };
}

function persist(store: TemplateStore) {
  gmStorage.set(STORAGE_KEYS.DM_TEMPLATE, store);
}

const store = ref<TemplateStore>(loadStore());

function genId(): string {
  return `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function useTemplates() {
  const templates = computed(() => store.value.templates);
  const activeId = computed(() => store.value.activeId);

  const active = computed(() =>
    store.value.templates.find((t) => t.id === store.value.activeId) ?? store.value.templates[0],
  );

  function setActive(id: string) {
    store.value = { ...store.value, activeId: id };
    persist(store.value);
  }

  function add(name: string) {
    const tpl: Template = { id: genId(), name, dm: '', notify: '' };
    store.value = {
      templates: [...store.value.templates, tpl],
      activeId: tpl.id,
    };
    persist(store.value);
    return tpl;
  }

  function remove(id: string) {
    const remaining = store.value.templates.filter((t) => t.id !== id);
    if (!remaining.length) return;
    const newActiveId = store.value.activeId === id ? remaining[0].id : store.value.activeId;
    store.value = { templates: remaining, activeId: newActiveId };
    persist(store.value);
  }

  function update(id: string, patch: Partial<Pick<Template, 'name' | 'dm' | 'notify'>>) {
    store.value = {
      ...store.value,
      templates: store.value.templates.map((t) =>
        t.id === id ? { ...t, ...patch } : t,
      ),
    };
    persist(store.value);
  }

  return { templates, activeId, active, setActive, add, remove, update };
}
