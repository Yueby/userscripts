import { GM_info, GM_xmlhttpRequest } from '$';
import { ref } from 'vue';

const REMOTE_URL =
  'https://raw.githubusercontent.com/Yueby/userscripts/main/dist/x-draw-helper.user.js';
const INSTALL_URL =
  'https://github.com/Yueby/userscripts/raw/main/dist/x-draw-helper.user.js';

function getCurrentVersion(): string {
  try {
    return GM_info.script.version;
  } catch {
    return '0.0.0';
  }
}

function parseVersion(v: string): number[] {
  return v.replace(/[^0-9.]/g, '').split('.').map(Number);
}

function isNewer(remote: string, local: string): boolean {
  const r = parseVersion(remote);
  const l = parseVersion(local);
  for (let i = 0; i < Math.max(r.length, l.length); i++) {
    const rv = r[i] ?? 0;
    const lv = l[i] ?? 0;
    if (rv > lv) return true;
    if (rv < lv) return false;
  }
  return false;
}

function fetchRemoteVersion(): Promise<string | null> {
  return new Promise((resolve) => {
    GM_xmlhttpRequest({
      method: 'GET',
      url: REMOTE_URL,
      headers: { Range: 'bytes=0-1024' },
      onload: (res) => {
        const m = res.responseText.match(/@version\s+(\S+)/);
        resolve(m?.[1] ?? null);
      },
      onerror: () => resolve(null),
    });
  });
}

const currentVersion = ref(getCurrentVersion());
const latestVersion = ref<string | null>(null);
const hasUpdate = ref(false);
const checking = ref(false);

async function checkUpdate() {
  if (checking.value) return;
  checking.value = true;
  try {
    const remote = await fetchRemoteVersion();
    latestVersion.value = remote;
    hasUpdate.value = remote ? isNewer(remote, currentVersion.value) : false;
  } finally {
    checking.value = false;
  }
}

function openInstallPage() {
  window.open(INSTALL_URL, '_blank');
}

export function useVersionCheck() {
  return {
    currentVersion,
    latestVersion,
    hasUpdate,
    checking,
    checkUpdate,
    openInstallPage,
  };
}
