// x-client-transaction-id generation and page fetch utilities
// Transaction algorithm based on Lqm1/x-client-transaction-id (Apache 2.0)

const LOG = '[x-draw]';

let _origPageFetch: typeof fetch | null = null;

/**
 * Returns the page-context fetch (bypasses userscript sandbox).
 * After `initTxIdCapture()` runs, returns the *original* (unwrapped) page fetch.
 */
export function pageFetch(): typeof fetch {
  if (_origPageFetch) return _origPageFetch;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uw: any = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
  return uw.fetch.bind(uw);
}

// Captured txIds keyed by GraphQL operation name (e.g. "SearchTimeline")
const _capturedTxIds = new Map<string, string>();

export function initTxIdCapture(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uw: any = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
  _origPageFetch = uw.fetch.bind(uw);
  uw.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
    if (url.includes('/i/api/graphql/')) {
      const opMatch = url.match(/\/i\/api\/graphql\/[^/]+\/([^?]+)/);
      if (opMatch) {
        const h = init?.headers ?? (input instanceof Request ? input.headers : undefined);
        if (h) {
          const txId = h instanceof Headers
            ? h.get('x-client-transaction-id')
            : (h as Record<string, string>)['x-client-transaction-id'];
          if (txId) _capturedTxIds.set(opMatch[1], txId);
        }
      }
    }
    return _origPageFetch!(input as RequestInfo | URL, init);
  };
}

// ---------------------------------------------------------------------------
// _ClientTransaction — generates x-client-transaction-id locally
// ---------------------------------------------------------------------------

const _ON_DEMAND_RE =
  /(\d+):\s*["']ondemand\.s["'][\s\S]*?\}\[e\]\s*\|\|\s*e\)\s*\+\s*["']\.["']\s*\+\s*\{[\s\S]*?\b\1:\s*["']([a-zA-Z0-9_-]+)["']/s;
const _INDICES_RE = /\(\w\[(\d{1,2})\],\s*16\)/g;

class _ClientTransaction {
  private keyBytes: number[] = [];
  private defRowIdx = 0;
  private defByteIndices: number[] = [];
  private animKey = '';
  private ready = false;
  private pFetch = pageFetch();

  async init(): Promise<boolean> {
    try {
      const metaKey = document
        .querySelector("[name='twitter-site-verification']")
        ?.getAttribute('content');
      if (!metaKey) {
        console.warn(LOG, 'txId: meta key not found');
        return false;
      }
      this.keyBytes = Array.from(atob(metaKey), (c) => c.charCodeAt(0));

      let animDoc: Document = document;
      if (!document.querySelector("[id^='loading-x-anim']")) {
        const html = await (await this.pFetch('/')).text();
        animDoc = new DOMParser().parseFromString(html, 'text/html');
      }

      const onDemandUrl = this._getOnDemandUrl();
      if (!onDemandUrl) {
        console.warn(LOG, 'txId: ondemand URL not found');
        return false;
      }

      const text = await (await this.pFetch(onDemandUrl)).text();
      const indices: number[] = [];
      _INDICES_RE.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = _INDICES_RE.exec(text)) !== null) indices.push(parseInt(m[1], 10));
      if (!indices.length) {
        console.warn(LOG, 'txId: no indices in ondemand script');
        return false;
      }

      this.defRowIdx = indices[0];
      this.defByteIndices = indices.slice(1);
      this.animKey = this._buildAnimKey(animDoc);
      this.ready = !!this.animKey;
      if (!this.ready) console.warn(LOG, 'txId: animKey empty');
      return this.ready;
    } catch (e) {
      console.warn(LOG, 'txId init failed:', e);
      return false;
    }
  }

  private _getOnDemandUrl(): string | null {
    const scripts = Array.from(document.querySelectorAll<HTMLScriptElement>('script'));
    for (const s of scripts) {
      const t = s.textContent ?? '';
      if (!t.includes('ondemand.s')) continue;
      const m = _ON_DEMAND_RE.exec(t);
      if (m) return `https://abs.twimg.com/responsive-web/client-web/ondemand.s.${m[2]}a.js`;
    }
    const m = _ON_DEMAND_RE.exec(document.documentElement.outerHTML);
    if (m) return `https://abs.twimg.com/responsive-web/client-web/ondemand.s.${m[2]}a.js`;
    return null;
  }

  private _buildAnimKey(doc: Document = document): string {
    const frames = Array.from(doc.querySelectorAll<Element>("[id^='loading-x-anim']"));
    if (!frames.length) return '';
    const kb = this.keyBytes;
    const rowIdx = kb[this.defRowIdx] % 16;
    let frameTime = this.defByteIndices.reduce((a, i) => a * (kb[i] % 16), 1);
    frameTime = Math.round(frameTime / 10) * 10;
    const arr = this._get2dArr(frames, kb);
    if (!arr[rowIdx]?.length) return '';
    return this._animate(arr[rowIdx], frameTime / 4096);
  }

  private _get2dArr(frames: Element[], kb: number[]): number[][] {
    const frame = frames[kb[5] % 4];
    const d = frame?.children[0]?.children[1]?.getAttribute('d');
    if (!d) return [[]];
    return d
      .substring(9)
      .split('C')
      .map((s) => {
        const c = s.replace(/[^\d]+/g, ' ').trim();
        return c ? c.split(/\s+/).map(Number) : [];
      });
  }

  private _solve(v: number, min: number, max: number, floor: boolean): number {
    const r = (v * (max - min)) / 255 + min;
    return floor ? Math.floor(r) : Math.round(r * 100) / 100;
  }

  private _animate(row: number[], t: number): string {
    const isOdd = (n: number) => (n % 2 ? -1 : 0);
    const lerp = (a: number[], b: number[], f: number) =>
      a.map((v, i) => v * (1 - f) + b[i] * f);
    const rotMat = (deg: number) => {
      const r = (deg * Math.PI) / 180;
      return [Math.cos(r), -Math.sin(r), Math.sin(r), Math.cos(r)];
    };
    const floatHex = (x: number): string => {
      const res: string[] = [];
      let q = Math.floor(x);
      let frac = x - q;
      while (q > 0) {
        const nq = Math.floor(q / 16);
        const rem = q - nq * 16;
        res.unshift(rem > 9 ? String.fromCharCode(rem + 55) : rem.toString());
        q = nq;
      }
      if (!frac) return res.join('');
      res.push('.');
      for (let f2 = frac; f2 > 0; ) {
        f2 *= 16;
        const int = Math.floor(f2);
        f2 -= int;
        res.push(int > 9 ? String.fromCharCode(int + 55) : int.toString());
      }
      return res.join('');
    };
    const cubicVal = (curves: number[], tv: number): number => {
      const calc = (a: number, b: number, m: number) =>
        3 * a * (1 - m) * (1 - m) * m + 3 * b * (1 - m) * m * m + m * m * m;
      if (tv <= 0)
        return (
          (curves[0] > 0
            ? curves[1] / curves[0]
            : curves[1] === 0 && curves[2] > 0
              ? curves[3] / curves[2]
              : 0) * tv
        );
      if (tv >= 1)
        return (
          1 +
          (curves[2] < 1
            ? (curves[3] - 1) / (curves[2] - 1)
            : curves[2] === 1 && curves[0] < 1
              ? (curves[1] - 1) / (curves[0] - 1)
              : 0) *
            (tv - 1)
        );
      let [s, e, mid] = [0, 1, 0];
      for (let iter = 0; iter < 100 && s < e; iter++) {
        mid = (s + e) / 2;
        const x = calc(curves[0], curves[2], mid);
        if (Math.abs(tv - x) < 0.00001) return calc(curves[1], curves[3], mid);
        if (x < tv) s = mid;
        else e = mid;
      }
      return calc(curves[1], curves[3], mid);
    };

    const from = [...row.slice(0, 3), 1];
    const to = [...row.slice(3, 6), 1];
    const fromR = [0];
    const toR = [this._solve(row[6], 60, 360, true)];
    const curves = row.slice(7).map((v, i) => this._solve(v, isOdd(i), 1, false));
    const val = cubicVal(curves, t);
    const col = lerp(from, to, val).map((v) => (v > 0 ? v : 0));
    const rot = lerp(fromR, toR, val);
    const mat = rotMat(rot[0]);
    const parts = col.slice(0, -1).map((v) => Math.round(v).toString(16));
    for (const v of mat) {
      let rv = Math.round(v * 100) / 100;
      if (rv < 0) rv = -rv;
      const h = floatHex(rv);
      parts.push((h.startsWith('.') ? '0' + h : h || '0').toLowerCase());
    }
    parts.push('0', '0');
    return parts.join('').replace(/[.-]/g, '');
  }

  async generateId(method: string, path: string): Promise<string | null> {
    if (!this.ready) return null;
    const now = Math.floor((Date.now() - 1682924400000) / 1000);
    const tBytes = [now & 0xff, (now >> 8) & 0xff, (now >> 16) & 0xff, (now >> 24) & 0xff];
    const data = `${method}!${path}!${now}obfiowerehiring${this.animKey}`;
    const hash = Array.from(
      new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data))),
    );
    const rn = Math.floor(Math.random() * 256);
    const bytes = [...this.keyBytes, ...tBytes, ...hash.slice(0, 16), 3];
    const out = new Uint8Array([rn, ...bytes.map((b) => b ^ rn)]);
    return btoa(String.fromCharCode(...out)).replace(/=/g, '');
  }
}

// ---------------------------------------------------------------------------
// Public getTxId — tries local generation, falls back to captured
// ---------------------------------------------------------------------------

let _txnInstance: _ClientTransaction | null = null;
let _txnInitPromise: Promise<_ClientTransaction | null> | null = null;

async function _initTxn(): Promise<_ClientTransaction | null> {
  const txn = new _ClientTransaction();
  return (await txn.init()) ? txn : null;
}

export async function getTxId(method: string, path: string): Promise<string | null> {
  if (!_txnInitPromise || !_txnInstance) {
    _txnInitPromise = _initTxn();
    _txnInstance = await _txnInitPromise;
    if (!_txnInstance) _txnInitPromise = null;
  }
  if (_txnInstance) {
    const id = await _txnInstance.generateId(method, path);
    if (id) return id;
  }
  const opMatch = path.match(/\/i\/api\/graphql\/[^/]+\/([^?]+)/);
  return (opMatch ? _capturedTxIds.get(opMatch[1]) : null) ?? null;
}
