// ==UserScript==
// @name               X Draw Helper
// @name:zh-CN         X(推特) 抽奖助手
// @name:ja            X 抽選ツール
// @namespace          yueby.x-draw-helper
// @version            0.1.0
// @author             Yueby
// @description        A userscript for conducting draws on X (Twitter) posts
// @description:zh-CN  X(推特) 推文抽奖助手，支持转发/点赞用户筛选、随机抽奖、结果通知
// @description:ja     X(Twitter)の投稿で抽選を行うためのユーザースクリプト
// @match              https://x.com/*
// @match              https://twitter.com/*
// @require            https://cdn.jsdelivr.net/npm/vue@3.5.31/dist/vue.global.prod.js
// @connect            https://raw.githubusercontent.com
// @grant              GM_addStyle
// @grant              GM_deleteValue
// @grant              GM_getValue
// @grant              GM_listValues
// @grant              GM_openInTab
// @grant              GM_setValue
// @grant              GM_xmlhttpRequest
// @grant              unsafeWindow
// @run-at             document-start
// ==/UserScript==

(function (vue) {
  'use strict';

  const d=new Set;const importCSS = async e=>{d.has(e)||(d.add(e),(t=>{typeof GM_addStyle=="function"?GM_addStyle(t):document.head.appendChild(document.createElement("style")).append(t);})(e));};

  importCSS(" .toast-enter-active[data-v-82edf3f7],.toast-leave-active[data-v-82edf3f7]{transition:all .3s ease}.toast-enter-from[data-v-82edf3f7],.toast-leave-to[data-v-82edf3f7]{opacity:0;transform:translateY(-12px)} ");

  const _sfc_main$b = vue.defineComponent({
    __name: "TriggerButton",
    emits: ["click"],
    setup(__props) {
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("div", {
          class: "flex items-center justify-center cursor-pointer px-1",
          role: "button",
          tabindex: "0",
          onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("click"))
        }, [..._cache[1] || (_cache[1] = [
          vue.createElementVNode("div", { class: "flex items-center justify-center w-[34.75px] h-[34.75px] rounded-full transition-colors hover:bg-[#1d9bf0]/10 group" }, [
            vue.createElementVNode("svg", {
              viewBox: "0 0 24 24",
              class: "w-[18.75px] h-[18.75px] text-[#71767b] transition-colors group-hover:text-[#1d9bf0]"
            }, [
              vue.createElementVNode("path", {
                d: "M20 7h-1.18C19.23 6.36 19.5 5.6 19.5 4.78 19.5 3.24 18.26 2 16.72 2c-1.22 0-2.44.66-3.28 1.8L12 5.96l-1.44-2.16C9.72 2.66 8.5 2 7.28 2 5.74 2 4.5 3.24 4.5 4.78c0 .82.27 1.58.68 2.22H4c-1.1 0-2 .9-2 2v3c0 .55.45 1 1 1v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7c.55 0 1-.45 1-1V9c0-1.1-.9-2-2-2zm-8 13H5v-7h7v7zm0-9H4V9h8v2zm1-3.08L14.42 5.8c.56-.84 1.42-1.3 2.3-1.3.86 0 1.78.7 1.78 1.78 0 .56-.19 1.08-.51 1.48l-.71.82H13v-.66zM11 7.58l-.71-.82C9.97 6.36 9.78 5.84 9.78 5.28 9.78 4.42 10.14 4 11 4c.88 0 1.74.46 2.3 1.3L11 7.58zM20 11h-7V9h7v2zm-1 9h-6v-7h7v7h-1z",
                fill: "currentColor"
              })
            ])
          ], -1)
        ])]);
      };
    }
  });
  const STORAGE_KEYS = {
    TWEET_CACHE_PREFIX: "x-draw-tweet-",
    DRAW_HISTORY: "x-draw-history",
    LANGUAGE: "x-draw-helper-lang",
    DM_TEMPLATE: "x-draw-dm-template",
    CUSTOM_ENDPOINTS: "x-draw-endpoints"
  };
  const LIMITS = {
    MAX_HISTORY_ENTRIES: 100,
    PAGE_SIZE: 20
  };
  const TIMING = {
    TOAST_DURATION: 3e3,
    CACHE_AGE_INTERVAL: 3e4,
    CONFIRM_TIMEOUT: 3e3,
    DRAW_ANIMATION_SPEED: 80,
    DRAW_ANIMATION_DURATION: 2e3,
    DRAW_ANIMATION_REVEAL_DELAY: 600
  };
  var _GM_getValue = (() => typeof GM_getValue != "undefined" ? GM_getValue : void 0)();
  var _GM_setValue = (() => typeof GM_setValue != "undefined" ? GM_setValue : void 0)();
  var _GM_xmlhttpRequest = (() => typeof GM_xmlhttpRequest != "undefined" ? GM_xmlhttpRequest : void 0)();
  const gmStorage = {
    get(key, fallback) {
      try {
        return _GM_getValue(key, fallback) ?? fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        _GM_setValue(key, value);
      } catch {
      }
    }
  };
  const LOG = "[x-draw]";
  let _origPageFetch = null;
  function pageFetch() {
    if (_origPageFetch) return _origPageFetch;
    const uw = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
    return uw.fetch.bind(uw);
  }
  const _capturedTxIds = new Map();
  function initTxIdCapture() {
    const uw = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
    _origPageFetch = uw.fetch.bind(uw);
    uw.fetch = async function(input, init) {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url.includes("/i/api/graphql/")) {
        const opMatch = url.match(/\/i\/api\/graphql\/[^/]+\/([^?]+)/);
        if (opMatch) {
          const h2 = init?.headers ?? (input instanceof Request ? input.headers : void 0);
          if (h2) {
            const txId = h2 instanceof Headers ? h2.get("x-client-transaction-id") : h2["x-client-transaction-id"];
            if (txId) _capturedTxIds.set(opMatch[1], txId);
          }
        }
      }
      return _origPageFetch(input, init);
    };
  }
  const _ON_DEMAND_RE = /(\d+):\s*["']ondemand\.s["'][\s\S]*?\}\[e\]\s*\|\|\s*e\)\s*\+\s*["']\.["']\s*\+\s*\{[\s\S]*?\b\1:\s*["']([a-zA-Z0-9_-]+)["']/s;
  const _INDICES_RE = /\(\w\[(\d{1,2})\],\s*16\)/g;
  class _ClientTransaction {
    keyBytes = [];
    defRowIdx = 0;
    defByteIndices = [];
    animKey = "";
    ready = false;
    pFetch = pageFetch();
    async init() {
      try {
        const metaKey = document.querySelector("[name='twitter-site-verification']")?.getAttribute("content");
        if (!metaKey) {
          console.warn(LOG, "txId: meta key not found");
          return false;
        }
        this.keyBytes = Array.from(atob(metaKey), (c) => c.charCodeAt(0));
        let animDoc = document;
        if (!document.querySelector("[id^='loading-x-anim']")) {
          const html = await (await this.pFetch("/")).text();
          animDoc = new DOMParser().parseFromString(html, "text/html");
        }
        const onDemandUrl = this._getOnDemandUrl();
        if (!onDemandUrl) {
          console.warn(LOG, "txId: ondemand URL not found");
          return false;
        }
        const text = await (await this.pFetch(onDemandUrl)).text();
        const indices = [];
        _INDICES_RE.lastIndex = 0;
        let m;
        while ((m = _INDICES_RE.exec(text)) !== null) indices.push(parseInt(m[1], 10));
        if (!indices.length) {
          console.warn(LOG, "txId: no indices in ondemand script");
          return false;
        }
        this.defRowIdx = indices[0];
        this.defByteIndices = indices.slice(1);
        this.animKey = this._buildAnimKey(animDoc);
        this.ready = !!this.animKey;
        if (!this.ready) console.warn(LOG, "txId: animKey empty");
        return this.ready;
      } catch (e) {
        console.warn(LOG, "txId init failed:", e);
        return false;
      }
    }
    _getOnDemandUrl() {
      const scripts = Array.from(document.querySelectorAll("script"));
      for (const s of scripts) {
        const t2 = s.textContent ?? "";
        if (!t2.includes("ondemand.s")) continue;
        const m2 = _ON_DEMAND_RE.exec(t2);
        if (m2) return `https://abs.twimg.com/responsive-web/client-web/ondemand.s.${m2[2]}a.js`;
      }
      const m = _ON_DEMAND_RE.exec(document.documentElement.outerHTML);
      if (m) return `https://abs.twimg.com/responsive-web/client-web/ondemand.s.${m[2]}a.js`;
      return null;
    }
    _buildAnimKey(doc = document) {
      const frames = Array.from(doc.querySelectorAll("[id^='loading-x-anim']"));
      if (!frames.length) return "";
      const kb = this.keyBytes;
      const rowIdx = kb[this.defRowIdx] % 16;
      let frameTime = this.defByteIndices.reduce((a, i) => a * (kb[i] % 16), 1);
      frameTime = Math.round(frameTime / 10) * 10;
      const arr = this._get2dArr(frames, kb);
      if (!arr[rowIdx]?.length) return "";
      return this._animate(arr[rowIdx], frameTime / 4096);
    }
    _get2dArr(frames, kb) {
      const frame = frames[kb[5] % 4];
      const d = frame?.children[0]?.children[1]?.getAttribute("d");
      if (!d) return [[]];
      return d.substring(9).split("C").map((s) => {
        const c = s.replace(/[^\d]+/g, " ").trim();
        return c ? c.split(/\s+/).map(Number) : [];
      });
    }
    _solve(v, min, max, floor) {
      const r = v * (max - min) / 255 + min;
      return floor ? Math.floor(r) : Math.round(r * 100) / 100;
    }
    _animate(row, t2) {
      const isOdd = (n) => n % 2 ? -1 : 0;
      const lerp = (a, b, f) => a.map((v, i) => v * (1 - f) + b[i] * f);
      const rotMat = (deg) => {
        const r = deg * Math.PI / 180;
        return [Math.cos(r), -Math.sin(r), Math.sin(r), Math.cos(r)];
      };
      const floatHex = (x) => {
        const res = [];
        let q = Math.floor(x);
        let frac = x - q;
        while (q > 0) {
          const nq = Math.floor(q / 16);
          const rem = q - nq * 16;
          res.unshift(rem > 9 ? String.fromCharCode(rem + 55) : rem.toString());
          q = nq;
        }
        if (!frac) return res.join("");
        res.push(".");
        for (let f2 = frac; f2 > 0; ) {
          f2 *= 16;
          const int = Math.floor(f2);
          f2 -= int;
          res.push(int > 9 ? String.fromCharCode(int + 55) : int.toString());
        }
        return res.join("");
      };
      const cubicVal = (curves2, tv) => {
        const calc = (a, b, m) => 3 * a * (1 - m) * (1 - m) * m + 3 * b * (1 - m) * m * m + m * m * m;
        if (tv <= 0)
          return (curves2[0] > 0 ? curves2[1] / curves2[0] : curves2[1] === 0 && curves2[2] > 0 ? curves2[3] / curves2[2] : 0) * tv;
        if (tv >= 1)
          return 1 + (curves2[2] < 1 ? (curves2[3] - 1) / (curves2[2] - 1) : curves2[2] === 1 && curves2[0] < 1 ? (curves2[1] - 1) / (curves2[0] - 1) : 0) * (tv - 1);
        let [s, e, mid] = [0, 1, 0];
        for (let iter = 0; iter < 100 && s < e; iter++) {
          mid = (s + e) / 2;
          const x = calc(curves2[0], curves2[2], mid);
          if (Math.abs(tv - x) < 1e-5) return calc(curves2[1], curves2[3], mid);
          if (x < tv) s = mid;
          else e = mid;
        }
        return calc(curves2[1], curves2[3], mid);
      };
      const from = [...row.slice(0, 3), 1];
      const to = [...row.slice(3, 6), 1];
      const fromR = [0];
      const toR = [this._solve(row[6], 60, 360, true)];
      const curves = row.slice(7).map((v, i) => this._solve(v, isOdd(i), 1, false));
      const val = cubicVal(curves, t2);
      const col = lerp(from, to, val).map((v) => v > 0 ? v : 0);
      const rot = lerp(fromR, toR, val);
      const mat = rotMat(rot[0]);
      const parts = col.slice(0, -1).map((v) => Math.round(v).toString(16));
      for (const v of mat) {
        let rv = Math.round(v * 100) / 100;
        if (rv < 0) rv = -rv;
        const h2 = floatHex(rv);
        parts.push((h2.startsWith(".") ? "0" + h2 : h2 || "0").toLowerCase());
      }
      parts.push("0", "0");
      return parts.join("").replace(/[.-]/g, "");
    }
    async generateId(method, path) {
      if (!this.ready) return null;
      const now = Math.floor((Date.now() - 16829244e5) / 1e3);
      const tBytes = [now & 255, now >> 8 & 255, now >> 16 & 255, now >> 24 & 255];
      const data = `${method}!${path}!${now}obfiowerehiring${this.animKey}`;
      const hash = Array.from(
        new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data)))
      );
      const rn = Math.floor(Math.random() * 256);
      const bytes = [...this.keyBytes, ...tBytes, ...hash.slice(0, 16), 3];
      const out = new Uint8Array([rn, ...bytes.map((b) => b ^ rn)]);
      return btoa(String.fromCharCode(...out)).replace(/=/g, "");
    }
  }
  let _txnInstance = null;
  let _txnInitPromise = null;
  async function _initTxn() {
    const txn = new _ClientTransaction();
    return await txn.init() ? txn : null;
  }
  async function getTxId(method, path) {
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
  const BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";
  const API_DOC_URL = "https://raw.githubusercontent.com/fa0311/TwitterInternalAPIDocument/master/docs/json/API.json";
  const ENDPOINT_MAP = {
    retweeters: "Retweeters",
    favoriters: "Favoriters",
    searchTimeline: "SearchTimeline"
  };
  const DEFAULT_ENDPOINTS = {
    retweeters: "",
    favoriters: "",
    searchTimeline: ""
  };
  const ENDPOINTS = { ...DEFAULT_ENDPOINTS };
  let GRAPHQL_FEATURES = {};
  function setEndpoint(key, value) {
    ENDPOINTS[key] = value;
  }
  function updateEndpoints(custom) {
    for (const [k, v] of Object.entries(custom)) {
      if (!v || !(k in ENDPOINTS)) continue;
      const opName = v.includes("/") ? v.split("/").pop() : ENDPOINT_MAP[k] ?? k;
      setEndpoint(k, v.includes("/") ? v : `${v}/${opName}`);
    }
  }
  function loadCustomEndpoints() {
    const saved = gmStorage.get(STORAGE_KEYS.CUSTOM_ENDPOINTS, {});
    if (saved && typeof saved === "object") updateEndpoints(saved);
  }
  loadCustomEndpoints();
  function _gmFetch(url) {
    return new Promise((resolve, reject) => {
      _GM_xmlhttpRequest({
        method: "GET",
        url,
        onload: (res) => res.status >= 200 && res.status < 300 ? resolve(res.responseText) : reject(new Error(`HTTP ${res.status}`)),
        onerror: () => reject(new Error("network error"))
      });
    });
  }
  async function _resolveFromApiDoc() {
    try {
      const text = await _gmFetch(API_DOC_URL);
      const data = JSON.parse(text);
      const graphql = data?.graphql;
      if (!graphql || typeof graphql !== "object") return false;
      let featuresSet = false;
      for (const [key, opName] of Object.entries(ENDPOINT_MAP)) {
        const entry = graphql[opName];
        if (entry?.queryId) {
          setEndpoint(key, `${entry.queryId}/${opName}`);
        }
        if (!featuresSet && entry?.features && typeof entry.features === "object") {
          GRAPHQL_FEATURES = { ...entry.features };
          featuresSet = true;
        }
      }
      return true;
    } catch {
      return false;
    }
  }
  async function _discoverFromPageScripts() {
    const pFetch = pageFetch();
    const scripts = Array.from(document.querySelectorAll("script[src]")).map((s) => s.src).filter((src) => src.endsWith(".js"));
    const targets = Object.entries(ENDPOINT_MAP);
    const found = new Set();
    for (const url of scripts) {
      if (found.size === targets.length) break;
      try {
        const text = await (await pFetch(url)).text();
        for (const [key, opName] of targets) {
          if (found.has(key)) continue;
          const m = text.match(new RegExp(`queryId:"([^"]+)"[^}]{0,80}operationName:"${opName}"`)) ?? text.match(new RegExp(`operationName:"${opName}"[^}]{0,80}queryId:"([^"]+)"`));
          if (m) {
            setEndpoint(key, `${m[1]}/${opName}`);
            found.add(key);
          }
        }
      } catch {
        continue;
      }
    }
  }
  let _endpointsPromise = null;
  async function initEndpoints() {
    if (_endpointsPromise) return _endpointsPromise;
    _endpointsPromise = (async () => {
      const ok = await _resolveFromApiDoc();
      if (!ok) await _discoverFromPageScripts();
      loadCustomEndpoints();
    })().catch(() => {
      _endpointsPromise = null;
    });
    return _endpointsPromise;
  }
  function getCsrfToken() {
    return document.cookie.split("; ").find((row) => row.startsWith("ct0="))?.split("=")[1] ?? null;
  }
  function getLoggedInUserId() {
    const raw = document.cookie.split("; ").find((row) => row.startsWith("twid="))?.split("=").slice(1).join("=");
    if (!raw) return null;
    const decoded = decodeURIComponent(raw);
    return decoded.startsWith("u=") ? decoded.slice(2) : null;
  }
  function getTweetIdFromUrl() {
    const match = window.location.href.match(/\/status\/(\d+)/);
    return match?.[1] ?? null;
  }
  function userFromResult(result, legacy, core, perspectives, fallbackId = "") {
    const avatar = result.avatar;
    const profileBio = result.profile_bio;
    return {
      id: result.rest_id || fallbackId,
      username: legacy.name || core.name || "",
      handle: legacy.screen_name || core.screen_name || result.rest_id || "",
      avatarUrl: legacy.profile_image_url_https || avatar?.image_url || "",
      bio: legacy.description || profileBio?.description || "",
      following: Boolean(perspectives.following ?? legacy.following),
      followed_by: Boolean(perspectives.followed_by ?? legacy.followed_by),
      followersCount: Number(legacy.followers_count ?? 0),
      followingCount: Number(legacy.friends_count ?? 0)
    };
  }
  function extractInstructions(data, ...path) {
    let node = data;
    for (const key of path) {
      node = node?.[key];
    }
    return Array.isArray(node) ? node : [];
  }
  function getAddEntries(instructions) {
    const inst = instructions.find((i) => i?.type === "TimelineAddEntries");
    const entries = inst?.entries;
    return entries && Array.isArray(entries) ? { entries } : null;
  }
  function isTerminated(instructions) {
    return instructions.some((i) => i?.type === "TimelineTerminateTimeline");
  }
  function getBottomCursor(entries) {
    const cursor = entries.find((e) => e?.content && e.content?.cursorType === "Bottom");
    return cursor?.content?.value ?? null;
  }
  const RETRY_BACKOFF_MS = 2e3;
  const MAX_RETRIES_DEFAULT = 3;
  async function paginateUsers(config, onProgress, filterUser) {
    const { buildUrl, parsePage, fetchFn, headers, maxRetries, signal, extraHeaders } = config;
    const result = [];
    const seen = new Set();
    async function fetchWithRetry(cursor) {
      for (let retry = 0; retry < maxRetries; retry++) {
        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
        try {
          const extra = extraHeaders ? await extraHeaders(cursor) : {};
          const response = await fetchFn(buildUrl(cursor), { headers: { ...headers, ...extra }, signal });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return await response.json();
        } catch (error) {
          if (error.name === "AbortError") throw error;
          if (retry === maxRetries - 1) return null;
          await new Promise((r) => setTimeout(r, RETRY_BACKOFF_MS * (retry + 1)));
        }
      }
      return null;
    }
    let currentCursor = null;
    let pendingFetch = fetchWithRetry(null);
    while (pendingFetch) {
      const data = await pendingFetch;
      if (!data) break;
      const { users, nextCursor } = parsePage(data);
      const filtered = filterUser ? users.filter(filterUser) : users;
      if (nextCursor && nextCursor !== currentCursor) {
        currentCursor = nextCursor;
        pendingFetch = fetchWithRetry(currentCursor);
      } else {
        pendingFetch = null;
      }
      for (const u of filtered) {
        const key = u.id || u.handle;
        if (!seen.has(key)) {
          seen.add(key);
          result.push(u);
        }
      }
      onProgress?.(result.length);
    }
    return result;
  }
  function parseRetweeterTimeline(data) {
    const instructions = extractInstructions(data, "data", "retweeters_timeline", "timeline", "instructions");
    return parseUserTimeline(instructions);
  }
  function parseFavoriterTimeline(data) {
    const instructions = extractInstructions(data, "data", "favoriters_timeline", "timeline", "instructions");
    return parseUserTimeline(instructions);
  }
  function parseUserTimeline(instructions) {
    if (isTerminated(instructions)) return { users: [], nextCursor: null };
    const addEntries = getAddEntries(instructions);
    if (!addEntries) return { users: [], nextCursor: null };
    const nextCursor = getBottomCursor(addEntries.entries);
    const users = addEntries.entries.filter((e) => String(e.entryId ?? "").startsWith("user-")).map((entry) => {
      const e = entry;
      const r = e.content?.itemContent?.user_results;
      const result = r?.result;
      if (!result) return null;
      const legacy = result.legacy ?? {};
      const core = result.core ?? {};
      const perspectives = result.relationship_perspectives ?? {};
      const entryId = String(e.entryId ?? "");
      const fallbackId = entryId.startsWith("user-") ? entryId.slice(5) : "";
      return userFromResult(result, legacy, core, perspectives, fallbackId);
    }).filter((u) => u !== null && u.handle !== "");
    return { users, nextCursor };
  }
  function parseSearchTimeline(data) {
    const instructions = extractInstructions(data, "data", "search_by_raw_query", "search_timeline", "timeline", "instructions");
    if (isTerminated(instructions)) return { users: [], nextCursor: null };
    const addEntries = getAddEntries(instructions);
    if (!addEntries) return { users: [], nextCursor: null };
    const nextCursor = getBottomCursor(addEntries.entries);
    const users = addEntries.entries.filter((e) => String(e.entryId ?? "").startsWith("tweet-")).map((entry) => {
      const e = entry;
      const tweetResult = e.content?.itemContent?.tweet_results;
      const raw = tweetResult?.result;
      const tweet = (raw?.__typename === "TweetWithVisibilityResults" ? raw.tweet : raw) ?? {};
      const userResults = tweet.core?.user_results?.result;
      if (!userResults) return null;
      const legacy = userResults.legacy ?? {};
      const core = userResults.core ?? {};
      const perspectives = userResults.relationship_perspectives ?? {};
      return userFromResult(userResults, legacy, core, perspectives);
    }).filter((u) => u !== null && u.handle !== "");
    return { users, nextCursor };
  }
  function baseHeaders(csrfToken) {
    return {
      authorization: `Bearer ${BEARER_TOKEN}`,
      "x-csrf-token": csrfToken,
      "x-twitter-auth-type": "OAuth2Session",
      "x-twitter-active-user": "yes",
      "content-type": "application/json"
    };
  }
  function buildGraphqlUrl(endpoint, variables) {
    return `https://x.com/i/api/graphql/${endpoint}?variables=${encodeURIComponent(JSON.stringify(variables))}&features=${encodeURIComponent(JSON.stringify(GRAPHQL_FEATURES))}`;
  }
  async function fetchRetweeters(tweetId, csrfToken, options = {}) {
    return paginateUsers({
      buildUrl: (cursor) => buildGraphqlUrl(ENDPOINTS.retweeters, {
        tweetId,
        count: LIMITS.PAGE_SIZE,
        includePromotedContent: true,
        ...cursor && { cursor }
      }),
      parsePage: parseRetweeterTimeline,
      fetchFn: pageFetch(),
      headers: baseHeaders(csrfToken),
      maxRetries: options.maxRetries ?? MAX_RETRIES_DEFAULT,
      signal: options.signal
    }, options.onProgress);
  }
  async function fetchFavoriters(tweetId, csrfToken, options = {}) {
    return paginateUsers({
      buildUrl: (cursor) => buildGraphqlUrl(ENDPOINTS.favoriters, {
        tweetId,
        count: LIMITS.PAGE_SIZE,
        includePromotedContent: true,
        ...cursor && { cursor }
      }),
      parsePage: parseFavoriterTimeline,
      fetchFn: pageFetch(),
      headers: baseHeaders(csrfToken),
      maxRetries: options.maxRetries ?? MAX_RETRIES_DEFAULT,
      signal: options.signal
    }, options.onProgress);
  }
  async function fetchQuoteTweeters(tweetId, csrfToken, options = {}) {
    const endpoint = ENDPOINTS.searchTimeline;
    const path = `/i/api/graphql/${endpoint}`;
    const selfId = getLoggedInUserId();
    return paginateUsers({
      buildUrl: (cursor) => buildGraphqlUrl(endpoint, {
        rawQuery: `quoted_tweet_id:${tweetId}`,
        count: LIMITS.PAGE_SIZE,
        querySource: "tdqt",
        product: "Top",
        ...cursor && { cursor }
      }),
      parsePage: parseSearchTimeline,
      fetchFn: pageFetch(),
      headers: baseHeaders(csrfToken),
      maxRetries: options.maxRetries ?? MAX_RETRIES_DEFAULT,
      signal: options.signal,
      extraHeaders: async () => {
        const txId = await getTxId("GET", path);
        return txId ? { "x-client-transaction-id": txId } : {};
      }
    }, options.onProgress, selfId ? (u) => u.id !== selfId : void 0);
  }
  function loadCache(tweetId) {
    return gmStorage.get(`${STORAGE_KEYS.TWEET_CACHE_PREFIX}${tweetId}`, null);
  }
  function saveCache(tweetId, retweets2, likes2, quotes2) {
    gmStorage.set(`${STORAGE_KEYS.TWEET_CACHE_PREFIX}${tweetId}`, { retweets: retweets2, likes: likes2, quotes: quotes2, fetchedAt: Date.now() });
  }
  const retweets = vue.ref([]);
  const likes = vue.ref([]);
  const quotes = vue.ref([]);
  const filters = vue.ref({
    followed_by: false,
    retweet: false,
    like: false,
    quote: false
  });
  const drawCount = vue.ref(1);
  const loading = vue.ref(false);
  const retweetProgress = vue.ref(0);
  const likeProgress = vue.ref(0);
  const quoteProgress = vue.ref(0);
  const lastTweetId = vue.ref(null);
  const fetchedAt = vue.ref(null);
  let abortController = null;
  function useDrawData() {
    const mergedUsers = vue.computed(() => {
      const map = new Map();
      for (const user of retweets.value) {
        map.set(user.handle, { ...user, hasRetweet: true });
      }
      for (const user of likes.value) {
        const existing = map.get(user.handle);
        if (existing) {
          existing.hasLike = true;
        } else {
          map.set(user.handle, { ...user, hasLike: true });
        }
      }
      for (const user of quotes.value) {
        const existing = map.get(user.handle);
        if (existing) {
          existing.hasQuote = true;
        } else {
          map.set(user.handle, { ...user, hasQuote: true });
        }
      }
      return Array.from(map.values());
    });
    const qualifiedUsers = vue.computed(() => {
      const hasActive = Object.values(filters.value).some(Boolean);
      if (!hasActive) return mergedUsers.value;
      return mergedUsers.value.filter((user) => {
        if (filters.value.followed_by && !user.followed_by) return false;
        if (filters.value.like && !user.hasLike) return false;
        if (filters.value.retweet && filters.value.quote) {
          if (!user.hasRetweet && !user.hasQuote) return false;
        } else {
          if (filters.value.retweet && !user.hasRetweet) return false;
          if (filters.value.quote && !user.hasQuote) return false;
        }
        return true;
      });
    });
    function toggleFilter(key) {
      filters.value[key] = !filters.value[key];
    }
    function performDraw(options) {
      const count = Math.max(1, Math.floor(drawCount.value) || 1);
      drawCount.value = count;
      let users = qualifiedUsers.value;
      if (options?.excludeHandles?.size) {
        users = users.filter((u) => !options.excludeHandles.has(u.handle));
      }
      if (users.length === 0) {
        return { success: false, message: "noQualifiedUsers" };
      }
      if (count > users.length) {
        return { success: false, message: "notEnoughUsers", count: users.length };
      }
      const temp = [...users];
      const winners = [];
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * temp.length);
        winners.push(temp[idx]);
        temp.splice(idx, 1);
      }
      return { success: true, winners };
    }
    async function fetchInteractionData() {
      if (abortController) {
        abortController.abort();
      }
      abortController = new AbortController();
      const tweetId = getTweetIdFromUrl();
      if (!tweetId) throw new Error("invalidTweetUrl");
      const csrfToken = getCsrfToken();
      if (!csrfToken) throw new Error("loginRequired");
      if (lastTweetId.value !== tweetId) {
        retweets.value = [];
        likes.value = [];
        quotes.value = [];
        lastTweetId.value = tweetId;
      }
      const cached = loadCache(tweetId);
      if (cached) {
        retweets.value = cached.retweets;
        likes.value = cached.likes;
        quotes.value = cached.quotes || [];
        fetchedAt.value = cached.fetchedAt;
      }
      loading.value = true;
      retweetProgress.value = 0;
      likeProgress.value = 0;
      quoteProgress.value = 0;
      try {
        await initEndpoints();
        const results = await Promise.allSettled([
          fetchRetweeters(tweetId, csrfToken, {
            signal: abortController.signal,
            onProgress: (count) => {
              retweetProgress.value = count;
            }
          }),
          fetchFavoriters(tweetId, csrfToken, {
            signal: abortController.signal,
            onProgress: (count) => {
              likeProgress.value = count;
            }
          }),
          fetchQuoteTweeters(tweetId, csrfToken, {
            signal: abortController.signal,
            onProgress: (count) => {
              quoteProgress.value = count;
            }
          })
        ]);
        const settled = (r, fallback) => r.status === "fulfilled" ? r.value : fallback;
        const retweetData = settled(results[0], retweets.value);
        const likeData = settled(results[1], likes.value);
        const quoteData = settled(results[2], quotes.value);
        retweets.value = retweetData;
        likes.value = likeData;
        quotes.value = quoteData;
        fetchedAt.value = Date.now();
        saveCache(tweetId, retweetData, likeData, quoteData);
        return { retweets: retweetData, likes: likeData, quotes: quoteData };
      } finally {
        loading.value = false;
      }
    }
    function restoreFromCache() {
      const tweetId = getTweetIdFromUrl();
      if (!tweetId) return false;
      lastTweetId.value = tweetId;
      const cached = loadCache(tweetId);
      if (!cached) return false;
      retweets.value = cached.retweets;
      likes.value = cached.likes;
      quotes.value = cached.quotes || [];
      fetchedAt.value = cached.fetchedAt;
      return true;
    }
    function cancelFetch() {
      abortController?.abort();
      loading.value = false;
    }
    function reset() {
      retweets.value = [];
      likes.value = [];
      quotes.value = [];
      filters.value = { followed_by: false, retweet: false, like: false, quote: false };
      drawCount.value = 1;
      retweetProgress.value = 0;
      likeProgress.value = 0;
      quoteProgress.value = 0;
      lastTweetId.value = null;
      fetchedAt.value = null;
    }
    return {
      retweets,
      likes,
      quotes,
      filters,
      drawCount,
      loading,
      retweetProgress,
      likeProgress,
      quoteProgress,
      lastTweetId,
      fetchedAt,
      mergedUsers,
      qualifiedUsers,
      toggleFilter,
      performDraw,
      fetchInteractionData,
      restoreFromCache,
      cancelFetch,
      reset
    };
  }
  function loadHistory() {
    const raw = gmStorage.get(STORAGE_KEYS.DRAW_HISTORY, []);
    return raw.map((e) => ({ ...e, confirmed: e.confirmed ?? true }));
  }
  function persistHistory(entries) {
    gmStorage.set(STORAGE_KEYS.DRAW_HISTORY, entries);
  }
  const history = vue.ref(loadHistory());
  function useDrawHistory() {
    function addEntry(params) {
      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        tweetId: params.tweetId,
        tweetUrl: window.location.href,
        winners: params.winners,
        filters: { ...params.filters },
        totalParticipants: params.totalParticipants,
        timestamp: Date.now(),
        confirmed: true
      };
      history.value = [entry, ...history.value].slice(0, LIMITS.MAX_HISTORY_ENTRIES);
      persistHistory(history.value);
      return entry;
    }
    function removeEntry(id) {
      history.value = history.value.filter((e) => e.id !== id);
      persistHistory(history.value);
    }
    function toggleConfirm(id) {
      const entry = history.value.find((e) => e.id === id);
      if (entry) {
        entry.confirmed = !entry.confirmed;
        persistHistory(history.value);
      }
    }
    function clearHistory() {
      history.value = [];
      persistHistory([]);
    }
    const winCountMap = vue.computed(() => {
      const map = new Map();
      for (const entry of history.value) {
        if (!entry.confirmed) continue;
        for (const w of entry.winners) {
          map.set(w.handle, (map.get(w.handle) ?? 0) + 1);
        }
      }
      return map;
    });
    function getWinCount(handle) {
      return winCountMap.value.get(handle) ?? 0;
    }
    return {
      history,
      addEntry,
      removeEntry,
      toggleConfirm,
      clearHistory,
      winCountMap,
      getWinCount
    };
  }
  const pad = (n) => n.toString().padStart(2, "0");
  function formatDateTime(ts) {
    const d = new Date(ts);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  function formatFileTimestamp(ts = Date.now()) {
    const d = new Date(ts);
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  }
  const LANGUAGES = {
    en: {
      drawHelper: "Draw Helper",
      total: "Total",
      loading: "Loading...",
      loadingRetweets: "Loading retweets...",
      loadingLikes: "Loading likes...",
      loadingQuotes: "Loading quotes...",
      loginRequired: "Failed to get data. Please make sure you are logged in and refresh the page!",
      useOnTweet: "Please use Draw Helper on a tweet page!",
      retweets: "Retweets",
      likes: "Likes",
      quotes: "Quotes",
      draw: "Draw",
      export: "Export",
      close: "Close",
      notify: "Notify",
      filters: "Filters",
      followingMe: "Following me",
      hasRetweeted: "Has retweeted",
      hasLiked: "Has liked",
      hasQuoted: "Has quoted",
      qualifiedUsers: "Qualified Users",
      selectFilters: "Please select filters",
      noQualifiedUsers: "No qualified users",
      people: "people",
      startDraw: "Start Draw",
      noUsers: "No users found",
      notEnoughUsers: "Only ${count} qualified users!",
      drawResult: "Draw Result",
      congratulations: "Congratulations to the following users:",
      following: "Following",
      followingYou: "Follows you",
      interactionType: "Interaction Type",
      username: "Username",
      handle: "Handle",
      avatarUrl: "Avatar URL",
      bio: "Bio",
      yes: "Yes",
      no: "No",
      retweetType: "Retweet",
      likeType: "Like",
      quoteType: "Quote",
      madeWith: "Made with ❤️ by",
      winnerNotice: "Congratulations to the following winners:\n",
      noBio: "No bio",
      followers: "Followers",
      followingLabel: "Following",
      screenshot: "Screenshot",
      openChats: "Open Chats",
      popupBlocked: "Some chat tabs were blocked. Please allow pop-ups for x.com and try again.",
      history: "History",
      drawHistory: "Draw History",
      noHistory: "No draw history yet",
      clearHistory: "Clear All",
      confirmClear: "Clear all draw history?",
      participants: "Participants",
      winnersLabel: "Winners",
      viewTweet: "View Tweet",
      lastFetched: "Last fetched",
      lastResult: "Last Result",
      confirmed: "Confirmed",
      testDraw: "Test",
      winCount: "Wins",
      search: "Search users...",
      excludePastWinners: "Exclude past winners",
      copied: "Copied!",
      copyHandles: "Copy @",
      minutesAgo: "${count} min ago",
      justNow: "Just now",
      refresh: "Refresh",
      dmTemplate: "DM Template",
      dmPlaceholder: "Hi @{winner}, congratulations on winning! 🎉",
      dmCopied: "DM text copied, opening chats...",
      drawing: "Drawing...",
      settings: "Settings",
      apiEndpoints: "API Endpoints",
      apiEndpointsDesc: "Override auto-detected queryIds. Leave empty for automatic detection.",
      autoDetected: "Auto-detected",
      retweetersEndpoint: "Retweeters queryId",
      favoritersEndpoint: "Favoriters queryId",
      searchEndpoint: "SearchTimeline queryId",
      dataManagement: "Data Management",
      clearCache: "Clear Tweet Cache",
      cacheCleared: "Cache cleared",
      historyCleared: "History cleared",
      save: "Save",
      saved: "Saved!",
      reset: "Reset to Default",
      langName: "English"
    },
    zh: {
      drawHelper: "抽奖助手",
      total: "总计",
      loading: "加载中...",
      loadingRetweets: "正在获取转发数据...",
      loadingLikes: "正在获取点赞数据...",
      loadingQuotes: "正在获取引用数据...",
      loginRequired: "获取数据失败，请登录后刷新页面！",
      useOnTweet: "请在推文页面使用抽奖助手！",
      retweets: "转发",
      likes: "点赞",
      quotes: "引用",
      draw: "抽奖",
      export: "导出",
      close: "关闭",
      notify: "通知",
      filters: "筛选条件",
      followingMe: "已关注我",
      hasRetweeted: "已转发",
      hasLiked: "已点赞",
      hasQuoted: "已引用",
      qualifiedUsers: "符合条件的用户",
      selectFilters: "请选择筛选条件",
      noQualifiedUsers: "暂无符合条件的用户",
      people: "人",
      startDraw: "开始抽奖",
      noUsers: "暂无用户数据",
      notEnoughUsers: "仅有 ${count} 位符合条件的用户",
      drawResult: "抽奖结果",
      congratulations: "恭喜以下用户中奖：",
      following: "已关注",
      followingYou: "关注了你",
      interactionType: "互动类型",
      username: "用户名",
      handle: "用户ID",
      avatarUrl: "头像链接",
      bio: "个人简介",
      yes: "是",
      no: "否",
      retweetType: "转发",
      likeType: "点赞",
      quoteType: "引用",
      madeWith: "开发者：❤️",
      winnerNotice: "恭喜以下用户获奖：\n",
      noBio: "暂无简介",
      followers: "粉丝",
      followingLabel: "正在关注",
      screenshot: "截图",
      openChats: "打开聊天",
      popupBlocked: "部分聊天标签页被浏览器拦截，请允许 x.com 弹窗后重试。",
      history: "历史记录",
      drawHistory: "抽奖历史",
      noHistory: "暂无抽奖记录",
      clearHistory: "清空全部",
      confirmClear: "确定清空所有抽奖记录？",
      participants: "参与者",
      winnersLabel: "中奖者",
      viewTweet: "查看推文",
      lastFetched: "上次获取",
      lastResult: "上次结果",
      confirmed: "已确认",
      testDraw: "测试",
      winCount: "中奖次数",
      search: "搜索用户...",
      excludePastWinners: "排除往期中奖者",
      copied: "已复制！",
      copyHandles: "复制 @",
      minutesAgo: "${count} 分钟前",
      justNow: "刚刚",
      refresh: "刷新",
      dmTemplate: "私信模板",
      dmPlaceholder: "你好 @{winner}，恭喜中奖！🎉",
      dmCopied: "私信内容已复制，正在打开聊天...",
      drawing: "抽奖中...",
      settings: "设置",
      apiEndpoints: "API 端点",
      apiEndpointsDesc: "覆盖自动检测的 queryId。留空则自动检测。",
      autoDetected: "自动检测",
      retweetersEndpoint: "Retweeters queryId",
      favoritersEndpoint: "Favoriters queryId",
      searchEndpoint: "SearchTimeline queryId",
      dataManagement: "数据管理",
      clearCache: "清除推文缓存",
      cacheCleared: "缓存已清除",
      historyCleared: "历史记录已清除",
      save: "保存",
      saved: "已保存！",
      reset: "恢复默认",
      langName: "中文"
    },
    ja: {
      drawHelper: "抽選ツール",
      total: "合計",
      loading: "読み込み中...",
      loadingRetweets: "リツイートデータを取得中...",
      loadingLikes: "いいねデータを取得中...",
      loadingQuotes: "引用ツイートを取得中...",
      loginRequired: "データの取得に失敗しました。ログインして再度お試しください。",
      useOnTweet: "ツイート画面で使用してください。",
      retweets: "リツイート",
      likes: "いいね",
      quotes: "引用",
      draw: "抽選",
      export: "エクスポート",
      close: "閉じる",
      notify: "通知",
      filters: "フィルター",
      followingMe: "フォロワー",
      hasRetweeted: "リツイート済",
      hasLiked: "いいね済",
      hasQuoted: "引用済",
      qualifiedUsers: "対象ユーザー",
      selectFilters: "フィルターを選択",
      noQualifiedUsers: "対象ユーザーがいません",
      people: "名",
      startDraw: "抽選開始",
      noUsers: "ユーザーがいません",
      notEnoughUsers: "対象ユーザーは${count}名のみです",
      drawResult: "抽選結果",
      congratulations: "当選者は以下の通りです：",
      following: "フォロー中",
      followingYou: "フォローされています",
      interactionType: "アクション",
      username: "ユーザー名",
      handle: "アカウントID",
      avatarUrl: "アイコンURL",
      bio: "プロフィール",
      yes: "はい",
      no: "いいえ",
      retweetType: "リツイート",
      likeType: "いいね",
      quoteType: "引用",
      madeWith: "開発者：❤️",
      winnerNotice: "当選者は以下の通りです：\n",
      noBio: "プロフィールなし",
      followers: "フォロワー",
      followingLabel: "フォロー中",
      screenshot: "スクリーンショット",
      openChats: "チャットを開く",
      popupBlocked: "一部のチャットタブがブロックされました。x.com のポップアップを許可して再試行してください。",
      history: "履歴",
      drawHistory: "抽選履歴",
      noHistory: "抽選履歴はまだありません",
      clearHistory: "すべて削除",
      confirmClear: "すべての抽選履歴を削除しますか？",
      participants: "参加者",
      winnersLabel: "当選者",
      viewTweet: "ツイートを見る",
      lastFetched: "最終取得",
      lastResult: "前回の結果",
      confirmed: "確定済み",
      testDraw: "テスト",
      winCount: "当選回数",
      search: "ユーザー検索...",
      excludePastWinners: "過去の当選者を除外",
      copied: "コピーしました！",
      copyHandles: "@ コピー",
      minutesAgo: "${count} 分前",
      justNow: "たった今",
      refresh: "更新",
      dmTemplate: "DMテンプレート",
      dmPlaceholder: "こんにちは @{winner}さん、当選おめでとうございます！🎉",
      dmCopied: "DMテキストをコピーしました。チャットを開いています...",
      drawing: "抽選中...",
      settings: "設定",
      apiEndpoints: "APIエンドポイント",
      apiEndpointsDesc: "自動検出されたqueryIdを上書きします。空欄のままで自動検出。",
      autoDetected: "自動検出",
      retweetersEndpoint: "Retweeters queryId",
      favoritersEndpoint: "Favoriters queryId",
      searchEndpoint: "SearchTimeline queryId",
      dataManagement: "データ管理",
      clearCache: "ツイートキャッシュを削除",
      cacheCleared: "キャッシュを削除しました",
      historyCleared: "履歴を削除しました",
      save: "保存",
      saved: "保存しました！",
      reset: "デフォルトに戻す",
      langName: "日本語"
    }
  };
  const AVAILABLE_LANGS = ["en", "zh", "ja"];
  function getInitialLang() {
    const stored = gmStorage.get(STORAGE_KEYS.LANGUAGE, "");
    return AVAILABLE_LANGS.includes(stored) ? stored : "en";
  }
  const currentLang = vue.ref(getInitialLang());
  function t(key, params = {}) {
    const text = LANGUAGES[currentLang.value][key] || LANGUAGES.en[key] || key;
    return text.replace(/\$\{(\w+)\}/g, (_, p) => String(params[p] ?? ""));
  }
  function setLang(lang) {
    currentLang.value = lang;
    gmStorage.set(STORAGE_KEYS.LANGUAGE, lang);
  }
  function useI18n() {
    return {
      t,
      currentLang,
      setLang,
      availableLangs: AVAILABLE_LANGS,
      getLangName: (lang) => LANGUAGES[lang].langName
    };
  }
  function useExport() {
    const { t: t2 } = useI18n();
    function exportCsv(data) {
      const rows = [
        [
          t2("interactionType"),
          t2("username"),
          t2("handle"),
          t2("avatarUrl"),
          t2("bio"),
          t2("following"),
          t2("followingYou"),
          t2("followers"),
          t2("followingLabel")
        ]
      ];
      const userRow = (type, user) => [
        type,
        user.username,
        user.handle,
        user.avatarUrl,
        user.bio,
        user.following ? t2("yes") : t2("no"),
        user.followed_by ? t2("yes") : t2("no"),
        String(user.followersCount),
        String(user.followingCount)
      ];
      for (const user of data.retweets) rows.push(userRow(t2("retweetType"), user));
      for (const user of data.likes) rows.push(userRow(t2("likeType"), user));
      for (const user of data.quotes) rows.push(userRow(t2("quoteType"), user));
      const csvContent = "\uFEFF" + rows.map(
        (row) => row.map(
          (cell) => typeof cell === "string" ? `"${cell.replace(/"/g, '""')}"` : cell
        ).join(",")
      ).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `x_draw_data_${formatFileTimestamp()}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    }
    return { exportCsv };
  }
  const toasts = vue.ref([]);
  let nextId = 0;
  function useToast() {
    function show(message, type = "info", duration = TIMING.TOAST_DURATION) {
      const id = nextId++;
      toasts.value.push({ id, message, type });
      setTimeout(() => {
        toasts.value = toasts.value.filter((t2) => t2.id !== id);
      }, duration);
    }
    return { toasts, show };
  }
  const _hoisted_1$8 = { style: { "display": "flex", "align-items": "center", "justify-content": "space-between", "padding": "16px 24px", "border-bottom": "1px solid #38444d", "flex-shrink": "0" } };
  const _hoisted_2$6 = { style: { "font-size": "18px", "font-weight": "700", "color": "#fff", "overflow": "hidden", "text-overflow": "ellipsis", "white-space": "nowrap", "margin": "0" } };
  const _hoisted_3$6 = { style: { "display": "flex", "align-items": "center", "gap": "12px", "flex-shrink": "0" } };
  const _hoisted_4$6 = { style: { "flex": "1", "min-height": "0", "display": "flex", "flex-direction": "column" } };
  const _hoisted_5$6 = {
    key: 0,
    style: { "border-top": "1px solid #38444d", "flex-shrink": "0" }
  };
  const modalStack = [];
  function globalKeydown(e) {
    if (e.key === "Escape" && modalStack.length > 0) {
      modalStack[modalStack.length - 1]();
    }
  }
  if (typeof window !== "undefined") {
    window.addEventListener("keydown", globalKeydown);
  }
  const _sfc_main$a = vue.defineComponent({
    __name: "Modal",
    props: {
      title: {},
      maxWidth: {},
      maxHeight: {},
      zIndex: {}
    },
    emits: ["close"],
    setup(__props, { emit: __emit }) {
      const props = __props;
      const emit = __emit;
      const closeHandler = () => emit("close");
      vue.onMounted(() => modalStack.push(closeHandler));
      vue.onUnmounted(() => {
        const idx = modalStack.indexOf(closeHandler);
        if (idx !== -1) modalStack.splice(idx, 1);
      });
      const panelStyle = vue.computed(() => ({
        width: "95vw",
        maxWidth: props.maxWidth ?? "480px",
        height: props.maxHeight ? `min(${props.maxHeight}, 90vh)` : void 0,
        maxHeight: props.maxHeight ? void 0 : "90vh"
      }));
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("div", {
          class: "fixed inset-0 flex items-center justify-center",
          style: vue.normalizeStyle({ zIndex: __props.zIndex ?? 9999, background: "rgba(0,0,0,0.6)" }),
          onClick: _cache[1] || (_cache[1] = vue.withModifiers(($event) => emit("close"), ["self"]))
        }, [
          vue.createElementVNode("div", {
            style: vue.normalizeStyle([panelStyle.value, { "background": "#15202b", "border-radius": "16px", "border": "1px solid #38444d", "display": "flex", "flex-direction": "column", "overflow": "hidden", "box-shadow": "0 25px 50px -12px rgba(0,0,0,0.5)" }])
          }, [
            vue.createElementVNode("div", _hoisted_1$8, [
              vue.createElementVNode("h2", _hoisted_2$6, vue.toDisplayString(__props.title), 1),
              vue.createElementVNode("div", _hoisted_3$6, [
                vue.renderSlot(_ctx.$slots, "header-controls"),
                vue.createElementVNode("button", {
                  class: "xd-btn-icon",
                  onClick: _cache[0] || (_cache[0] = ($event) => emit("close"))
                }, "×")
              ])
            ]),
            vue.createElementVNode("div", _hoisted_4$6, [
              vue.renderSlot(_ctx.$slots, "default")
            ]),
            _ctx.$slots.footer ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_5$6, [
              vue.renderSlot(_ctx.$slots, "footer")
            ])) : vue.createCommentVNode("", true)
          ], 4)
        ], 4);
      };
    }
  });
  const _hoisted_1$7 = { class: "p-8 flex flex-col items-center gap-6" };
  const _hoisted_2$5 = { class: "flex gap-4 justify-center flex-wrap" };
  const _hoisted_3$5 = ["src", "alt"];
  const _hoisted_4$5 = { class: "text-xs text-white truncate w-full text-center font-medium" };
  const _hoisted_5$5 = { class: "text-[10px] text-[#71767b] truncate w-full text-center" };
  const _hoisted_6$5 = { class: "flex items-center gap-2" };
  const _hoisted_7$5 = { class: "text-[#71767b] text-sm" };
  const _sfc_main$9 = vue.defineComponent({
    __name: "DrawAnimation",
    props: {
      pool: {},
      winners: {}
    },
    emits: ["done"],
    setup(__props, { emit: __emit }) {
      const props = __props;
      const emit = __emit;
      const { t: t2 } = useI18n();
      const slots = vue.ref(props.winners.map(() => randomUser()));
      let intervalId = null;
      let timeoutId = null;
      function randomUser() {
        if (props.pool.length === 0) return props.winners[0];
        return props.pool[Math.floor(Math.random() * props.pool.length)];
      }
      vue.onMounted(() => {
        const { DRAW_ANIMATION_SPEED: speed, DRAW_ANIMATION_DURATION: duration, DRAW_ANIMATION_REVEAL_DELAY: revealDelay } = TIMING;
        let elapsed = 0;
        function tick() {
          elapsed += speed;
          if (elapsed >= duration) {
            slots.value = [...props.winners];
            if (intervalId) clearInterval(intervalId);
            timeoutId = setTimeout(() => emit("done"), revealDelay);
            return;
          }
          slots.value = props.winners.map((w, i) => {
            const remaining = duration - elapsed;
            if (remaining < 400 * (props.winners.length - i)) return w;
            return randomUser();
          });
        }
        intervalId = setInterval(tick, speed);
      });
      vue.onUnmounted(() => {
        if (intervalId) clearInterval(intervalId);
        if (timeoutId) clearTimeout(timeoutId);
      });
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createBlock(_sfc_main$a, {
          title: vue.unref(t2)("drawing"),
          "max-width": "500px",
          "z-index": 10002,
          onClose: _cache[0] || (_cache[0] = ($event) => emit("done"))
        }, {
          default: vue.withCtx(() => [
            vue.createElementVNode("div", _hoisted_1$7, [
              vue.createElementVNode("div", _hoisted_2$5, [
                (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(slots.value, (slot, i) => {
                  return vue.openBlock(), vue.createElementBlock("div", {
                    key: i,
                    class: "flex flex-col items-center gap-2 p-3 bg-[#273340] rounded-xl w-24 transition-all duration-150"
                  }, [
                    vue.createElementVNode("img", {
                      src: slot.avatarUrl,
                      alt: slot.username,
                      class: "w-14 h-14 rounded-full"
                    }, null, 8, _hoisted_3$5),
                    vue.createElementVNode("div", _hoisted_4$5, vue.toDisplayString(slot.username), 1),
                    vue.createElementVNode("div", _hoisted_5$5, "@" + vue.toDisplayString(slot.handle), 1)
                  ]);
                }), 128))
              ]),
              vue.createElementVNode("div", _hoisted_6$5, [
                _cache[1] || (_cache[1] = vue.createElementVNode("svg", {
                  class: "animate-spin h-5 w-5 text-[#1d9bf0]",
                  viewBox: "0 0 24 24",
                  fill: "none"
                }, [
                  vue.createElementVNode("circle", {
                    class: "opacity-25",
                    cx: "12",
                    cy: "12",
                    r: "10",
                    stroke: "currentColor",
                    "stroke-width": "4"
                  }),
                  vue.createElementVNode("path", {
                    class: "opacity-75",
                    fill: "currentColor",
                    d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  })
                ], -1)),
                vue.createElementVNode("span", _hoisted_7$5, vue.toDisplayString(vue.unref(t2)("drawing")), 1)
              ])
            ])
          ]),
          _: 1
        }, 8, ["title"]);
      };
    }
  });
  const _hoisted_1$6 = { class: "flex-1 overflow-auto min-h-0 p-4" };
  const _hoisted_2$4 = {
    key: 0,
    class: "flex items-center justify-center h-full text-[#71767b]"
  };
  const _hoisted_3$4 = {
    key: 1,
    class: "flex flex-col gap-3"
  };
  const _hoisted_4$4 = { class: "flex items-center justify-between mb-3" };
  const _hoisted_5$4 = { class: "flex items-center gap-3 text-sm" };
  const _hoisted_6$4 = ["onClick"];
  const _hoisted_7$4 = { class: "text-[#71767b]" };
  const _hoisted_8$4 = { class: "text-[#71767b]" };
  const _hoisted_9$4 = { class: "flex items-center gap-2" };
  const _hoisted_10$3 = ["href"];
  const _hoisted_11$3 = ["onClick"];
  const _hoisted_12$3 = { class: "flex gap-1.5 mb-3 flex-wrap" };
  const _hoisted_13$3 = {
    key: 0,
    class: "xd-badge xd-badge-green"
  };
  const _hoisted_14$3 = {
    key: 1,
    class: "xd-badge xd-badge-pink"
  };
  const _hoisted_15$2 = {
    key: 2,
    class: "xd-badge xd-badge-orange"
  };
  const _hoisted_16$1 = {
    key: 3,
    class: "xd-badge xd-badge-blue"
  };
  const _hoisted_17$1 = { class: "text-xs text-[#71767b] mb-2" };
  const _hoisted_18$1 = { class: "flex flex-wrap gap-2" };
  const _hoisted_19$1 = ["href"];
  const _hoisted_20$1 = ["src", "alt"];
  const _hoisted_21$1 = { class: "text-sm text-[#e7e9ea]" };
  const _sfc_main$8 = vue.defineComponent({
    __name: "DrawHistory",
    emits: ["close"],
    setup(__props, { emit: __emit }) {
      const emit = __emit;
      const { t: t2 } = useI18n();
      const { history: history2, removeEntry, toggleConfirm, clearHistory } = useDrawHistory();
      function handleClear() {
        if (confirm(t2("confirmClear"))) clearHistory();
      }
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createBlock(_sfc_main$a, {
          title: vue.unref(t2)("drawHistory"),
          "max-width": "700px",
          "max-height": "600px",
          "z-index": 10001,
          onClose: _cache[0] || (_cache[0] = ($event) => emit("close"))
        }, {
          "header-controls": vue.withCtx(() => [
            vue.unref(history2).length ? (vue.openBlock(), vue.createElementBlock("button", {
              key: 0,
              class: "xd-btn xd-btn-ghost text-sm text-[#f4212e]",
              onClick: handleClear
            }, vue.toDisplayString(vue.unref(t2)("clearHistory")), 1)) : vue.createCommentVNode("", true)
          ]),
          default: vue.withCtx(() => [
            vue.createElementVNode("div", _hoisted_1$6, [
              vue.unref(history2).length === 0 ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_2$4, vue.toDisplayString(vue.unref(t2)("noHistory")), 1)) : (vue.openBlock(), vue.createElementBlock("div", _hoisted_3$4, [
                (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(vue.unref(history2), (entry) => {
                  return vue.openBlock(), vue.createElementBlock("div", {
                    key: entry.id,
                    class: vue.normalizeClass(["rounded-xl border p-4", entry.confirmed ? "bg-[#1e2d3d] border-[#38444d]" : "bg-[#1e2d3d]/50 border-[#38444d]/50 opacity-70"])
                  }, [
                    vue.createElementVNode("div", _hoisted_4$4, [
                      vue.createElementVNode("div", _hoisted_5$4, [
                        vue.createElementVNode("button", {
                          class: vue.normalizeClass(["xd-btn text-xs px-2 py-0.5", entry.confirmed ? "xd-btn-success" : "xd-btn-secondary"]),
                          onClick: ($event) => vue.unref(toggleConfirm)(entry.id)
                        }, vue.toDisplayString(entry.confirmed ? vue.unref(t2)("confirmed") : vue.unref(t2)("testDraw")), 11, _hoisted_6$4),
                        vue.createElementVNode("span", _hoisted_7$4, vue.toDisplayString(vue.unref(formatDateTime)(entry.timestamp)), 1),
                        _cache[1] || (_cache[1] = vue.createElementVNode("span", { class: "text-[#71767b]" }, "·", -1)),
                        vue.createElementVNode("span", _hoisted_8$4, vue.toDisplayString(vue.unref(t2)("participants")) + ": " + vue.toDisplayString(entry.totalParticipants), 1)
                      ]),
                      vue.createElementVNode("div", _hoisted_9$4, [
                        vue.createElementVNode("a", {
                          href: entry.tweetUrl,
                          target: "_blank",
                          class: "text-[#1d9bf0] text-sm hover:underline"
                        }, vue.toDisplayString(vue.unref(t2)("viewTweet")), 9, _hoisted_10$3),
                        vue.createElementVNode("button", {
                          class: "xd-btn-icon text-sm",
                          onClick: ($event) => vue.unref(removeEntry)(entry.id)
                        }, "×", 8, _hoisted_11$3)
                      ])
                    ]),
                    vue.createElementVNode("div", _hoisted_12$3, [
                      entry.filters.retweet ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_13$3, vue.toDisplayString(vue.unref(t2)("hasRetweeted")), 1)) : vue.createCommentVNode("", true),
                      entry.filters.like ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_14$3, vue.toDisplayString(vue.unref(t2)("hasLiked")), 1)) : vue.createCommentVNode("", true),
                      entry.filters.quote ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_15$2, vue.toDisplayString(vue.unref(t2)("hasQuoted")), 1)) : vue.createCommentVNode("", true),
                      entry.filters.followed_by ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_16$1, vue.toDisplayString(vue.unref(t2)("followingMe")), 1)) : vue.createCommentVNode("", true)
                    ]),
                    vue.createElementVNode("div", _hoisted_17$1, vue.toDisplayString(vue.unref(t2)("winnersLabel")) + " (" + vue.toDisplayString(entry.winners.length) + ")", 1),
                    vue.createElementVNode("div", _hoisted_18$1, [
                      (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(entry.winners, (winner) => {
                        return vue.openBlock(), vue.createElementBlock("a", {
                          key: winner.handle,
                          href: `https://x.com/${winner.handle}`,
                          target: "_blank",
                          class: "flex items-center gap-2 bg-[#273340] rounded-lg px-3 py-1.5 hover:bg-[#38444d] transition-colors"
                        }, [
                          vue.createElementVNode("img", {
                            src: winner.avatarUrl,
                            alt: winner.username,
                            class: "w-6 h-6 rounded-full"
                          }, null, 8, _hoisted_20$1),
                          vue.createElementVNode("span", _hoisted_21$1, "@" + vue.toDisplayString(winner.handle), 1)
                        ], 8, _hoisted_19$1);
                      }), 128))
                    ])
                  ], 2);
                }), 128))
              ]))
            ])
          ]),
          _: 1
        }, 8, ["title"]);
      };
    }
  });
  function resolveUrl(url, baseUrl) {
    if (url.match(/^[a-z]+:\/\//i)) {
      return url;
    }
    if (url.match(/^\/\//)) {
      return window.location.protocol + url;
    }
    if (url.match(/^[a-z]+:/i)) {
      return url;
    }
    const doc = document.implementation.createHTMLDocument();
    const base = doc.createElement("base");
    const a = doc.createElement("a");
    doc.head.appendChild(base);
    doc.body.appendChild(a);
    if (baseUrl) {
      base.href = baseUrl;
    }
    a.href = url;
    return a.href;
  }
  const uuid = (() => {
    let counter = 0;
    const random = () => (
`0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4)
    );
    return () => {
      counter += 1;
      return `u${random()}${counter}`;
    };
  })();
  function toArray(arrayLike) {
    const arr = [];
    for (let i = 0, l = arrayLike.length; i < l; i++) {
      arr.push(arrayLike[i]);
    }
    return arr;
  }
  let styleProps = null;
  function getStyleProperties(options = {}) {
    if (styleProps) {
      return styleProps;
    }
    if (options.includeStyleProperties) {
      styleProps = options.includeStyleProperties;
      return styleProps;
    }
    styleProps = toArray(window.getComputedStyle(document.documentElement));
    return styleProps;
  }
  function px(node, styleProperty) {
    const win = node.ownerDocument.defaultView || window;
    const val = win.getComputedStyle(node).getPropertyValue(styleProperty);
    return val ? parseFloat(val.replace("px", "")) : 0;
  }
  function getNodeWidth(node) {
    const leftBorder = px(node, "border-left-width");
    const rightBorder = px(node, "border-right-width");
    return node.clientWidth + leftBorder + rightBorder;
  }
  function getNodeHeight(node) {
    const topBorder = px(node, "border-top-width");
    const bottomBorder = px(node, "border-bottom-width");
    return node.clientHeight + topBorder + bottomBorder;
  }
  function getImageSize(targetNode, options = {}) {
    const width = options.width || getNodeWidth(targetNode);
    const height = options.height || getNodeHeight(targetNode);
    return { width, height };
  }
  function getPixelRatio() {
    let ratio;
    let FINAL_PROCESS;
    try {
      FINAL_PROCESS = process;
    } catch (e) {
    }
    const val = FINAL_PROCESS && FINAL_PROCESS.env ? FINAL_PROCESS.env.devicePixelRatio : null;
    if (val) {
      ratio = parseInt(val, 10);
      if (Number.isNaN(ratio)) {
        ratio = 1;
      }
    }
    return ratio || window.devicePixelRatio || 1;
  }
  const canvasDimensionLimit = 16384;
  function checkCanvasDimensions(canvas) {
    if (canvas.width > canvasDimensionLimit || canvas.height > canvasDimensionLimit) {
      if (canvas.width > canvasDimensionLimit && canvas.height > canvasDimensionLimit) {
        if (canvas.width > canvas.height) {
          canvas.height *= canvasDimensionLimit / canvas.width;
          canvas.width = canvasDimensionLimit;
        } else {
          canvas.width *= canvasDimensionLimit / canvas.height;
          canvas.height = canvasDimensionLimit;
        }
      } else if (canvas.width > canvasDimensionLimit) {
        canvas.height *= canvasDimensionLimit / canvas.width;
        canvas.width = canvasDimensionLimit;
      } else {
        canvas.width *= canvasDimensionLimit / canvas.height;
        canvas.height = canvasDimensionLimit;
      }
    }
  }
  function createImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        img.decode().then(() => {
          requestAnimationFrame(() => resolve(img));
        });
      };
      img.onerror = reject;
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.src = url;
    });
  }
  async function svgToDataURL(svg) {
    return Promise.resolve().then(() => new XMLSerializer().serializeToString(svg)).then(encodeURIComponent).then((html) => `data:image/svg+xml;charset=utf-8,${html}`);
  }
  async function nodeToDataURL(node, width, height) {
    const xmlns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(xmlns, "svg");
    const foreignObject = document.createElementNS(xmlns, "foreignObject");
    svg.setAttribute("width", `${width}`);
    svg.setAttribute("height", `${height}`);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    foreignObject.setAttribute("width", "100%");
    foreignObject.setAttribute("height", "100%");
    foreignObject.setAttribute("x", "0");
    foreignObject.setAttribute("y", "0");
    foreignObject.setAttribute("externalResourcesRequired", "true");
    svg.appendChild(foreignObject);
    foreignObject.appendChild(node);
    return svgToDataURL(svg);
  }
  const isInstanceOfElement = (node, instance) => {
    if (node instanceof instance)
      return true;
    const nodePrototype = Object.getPrototypeOf(node);
    if (nodePrototype === null)
      return false;
    return nodePrototype.constructor.name === instance.name || isInstanceOfElement(nodePrototype, instance);
  };
  function formatCSSText(style) {
    const content = style.getPropertyValue("content");
    return `${style.cssText} content: '${content.replace(/'|"/g, "")}';`;
  }
  function formatCSSProperties(style, options) {
    return getStyleProperties(options).map((name) => {
      const value = style.getPropertyValue(name);
      const priority = style.getPropertyPriority(name);
      return `${name}: ${value}${priority ? " !important" : ""};`;
    }).join(" ");
  }
  function getPseudoElementStyle(className, pseudo, style, options) {
    const selector = `.${className}:${pseudo}`;
    const cssText = style.cssText ? formatCSSText(style) : formatCSSProperties(style, options);
    return document.createTextNode(`${selector}{${cssText}}`);
  }
  function clonePseudoElement(nativeNode, clonedNode, pseudo, options) {
    const style = window.getComputedStyle(nativeNode, pseudo);
    const content = style.getPropertyValue("content");
    if (content === "" || content === "none") {
      return;
    }
    const className = uuid();
    try {
      clonedNode.className = `${clonedNode.className} ${className}`;
    } catch (err) {
      return;
    }
    const styleElement = document.createElement("style");
    styleElement.appendChild(getPseudoElementStyle(className, pseudo, style, options));
    clonedNode.appendChild(styleElement);
  }
  function clonePseudoElements(nativeNode, clonedNode, options) {
    clonePseudoElement(nativeNode, clonedNode, ":before", options);
    clonePseudoElement(nativeNode, clonedNode, ":after", options);
  }
  const WOFF = "application/font-woff";
  const JPEG = "image/jpeg";
  const mimes = {
    woff: WOFF,
    woff2: WOFF,
    ttf: "application/font-truetype",
    eot: "application/vnd.ms-fontobject",
    png: "image/png",
    jpg: JPEG,
    jpeg: JPEG,
    gif: "image/gif",
    tiff: "image/tiff",
    svg: "image/svg+xml",
    webp: "image/webp"
  };
  function getExtension(url) {
    const match = /\.([^./]*?)$/g.exec(url);
    return match ? match[1] : "";
  }
  function getMimeType(url) {
    const extension = getExtension(url).toLowerCase();
    return mimes[extension] || "";
  }
  function getContentFromDataUrl(dataURL) {
    return dataURL.split(/,/)[1];
  }
  function isDataUrl(url) {
    return url.search(/^(data:)/) !== -1;
  }
  function makeDataUrl(content, mimeType) {
    return `data:${mimeType};base64,${content}`;
  }
  async function fetchAsDataURL(url, init, process2) {
    const res = await fetch(url, init);
    if (res.status === 404) {
      throw new Error(`Resource "${res.url}" not found`);
    }
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onloadend = () => {
        try {
          resolve(process2({ res, result: reader.result }));
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsDataURL(blob);
    });
  }
  const cache = {};
  function getCacheKey(url, contentType, includeQueryParams) {
    let key = url.replace(/\?.*/, "");
    if (includeQueryParams) {
      key = url;
    }
    if (/ttf|otf|eot|woff2?/i.test(key)) {
      key = key.replace(/.*\//, "");
    }
    return contentType ? `[${contentType}]${key}` : key;
  }
  async function resourceToDataURL(resourceUrl, contentType, options) {
    const cacheKey = getCacheKey(resourceUrl, contentType, options.includeQueryParams);
    if (cache[cacheKey] != null) {
      return cache[cacheKey];
    }
    if (options.cacheBust) {
      resourceUrl += (/\?/.test(resourceUrl) ? "&" : "?") + ( new Date()).getTime();
    }
    let dataURL;
    try {
      const content = await fetchAsDataURL(resourceUrl, options.fetchRequestInit, ({ res, result }) => {
        if (!contentType) {
          contentType = res.headers.get("Content-Type") || "";
        }
        return getContentFromDataUrl(result);
      });
      dataURL = makeDataUrl(content, contentType);
    } catch (error) {
      dataURL = options.imagePlaceholder || "";
      let msg = `Failed to fetch resource: ${resourceUrl}`;
      if (error) {
        msg = typeof error === "string" ? error : error.message;
      }
      if (msg) {
        console.warn(msg);
      }
    }
    cache[cacheKey] = dataURL;
    return dataURL;
  }
  async function cloneCanvasElement(canvas) {
    const dataURL = canvas.toDataURL();
    if (dataURL === "data:,") {
      return canvas.cloneNode(false);
    }
    return createImage(dataURL);
  }
  async function cloneVideoElement(video, options) {
    if (video.currentSrc) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = video.clientWidth;
      canvas.height = video.clientHeight;
      ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataURL2 = canvas.toDataURL();
      return createImage(dataURL2);
    }
    const poster = video.poster;
    const contentType = getMimeType(poster);
    const dataURL = await resourceToDataURL(poster, contentType, options);
    return createImage(dataURL);
  }
  async function cloneIFrameElement(iframe, options) {
    var _a;
    try {
      if ((_a = iframe === null || iframe === void 0 ? void 0 : iframe.contentDocument) === null || _a === void 0 ? void 0 : _a.body) {
        return await cloneNode(iframe.contentDocument.body, options, true);
      }
    } catch (_b) {
    }
    return iframe.cloneNode(false);
  }
  async function cloneSingleNode(node, options) {
    if (isInstanceOfElement(node, HTMLCanvasElement)) {
      return cloneCanvasElement(node);
    }
    if (isInstanceOfElement(node, HTMLVideoElement)) {
      return cloneVideoElement(node, options);
    }
    if (isInstanceOfElement(node, HTMLIFrameElement)) {
      return cloneIFrameElement(node, options);
    }
    return node.cloneNode(isSVGElement(node));
  }
  const isSlotElement = (node) => node.tagName != null && node.tagName.toUpperCase() === "SLOT";
  const isSVGElement = (node) => node.tagName != null && node.tagName.toUpperCase() === "SVG";
  async function cloneChildren(nativeNode, clonedNode, options) {
    var _a, _b;
    if (isSVGElement(clonedNode)) {
      return clonedNode;
    }
    let children = [];
    if (isSlotElement(nativeNode) && nativeNode.assignedNodes) {
      children = toArray(nativeNode.assignedNodes());
    } else if (isInstanceOfElement(nativeNode, HTMLIFrameElement) && ((_a = nativeNode.contentDocument) === null || _a === void 0 ? void 0 : _a.body)) {
      children = toArray(nativeNode.contentDocument.body.childNodes);
    } else {
      children = toArray(((_b = nativeNode.shadowRoot) !== null && _b !== void 0 ? _b : nativeNode).childNodes);
    }
    if (children.length === 0 || isInstanceOfElement(nativeNode, HTMLVideoElement)) {
      return clonedNode;
    }
    await children.reduce((deferred, child) => deferred.then(() => cloneNode(child, options)).then((clonedChild) => {
      if (clonedChild) {
        clonedNode.appendChild(clonedChild);
      }
    }), Promise.resolve());
    return clonedNode;
  }
  function cloneCSSStyle(nativeNode, clonedNode, options) {
    const targetStyle = clonedNode.style;
    if (!targetStyle) {
      return;
    }
    const sourceStyle = window.getComputedStyle(nativeNode);
    if (sourceStyle.cssText) {
      targetStyle.cssText = sourceStyle.cssText;
      targetStyle.transformOrigin = sourceStyle.transformOrigin;
    } else {
      getStyleProperties(options).forEach((name) => {
        let value = sourceStyle.getPropertyValue(name);
        if (name === "font-size" && value.endsWith("px")) {
          const reducedFont = Math.floor(parseFloat(value.substring(0, value.length - 2))) - 0.1;
          value = `${reducedFont}px`;
        }
        if (isInstanceOfElement(nativeNode, HTMLIFrameElement) && name === "display" && value === "inline") {
          value = "block";
        }
        if (name === "d" && clonedNode.getAttribute("d")) {
          value = `path(${clonedNode.getAttribute("d")})`;
        }
        targetStyle.setProperty(name, value, sourceStyle.getPropertyPriority(name));
      });
    }
  }
  function cloneInputValue(nativeNode, clonedNode) {
    if (isInstanceOfElement(nativeNode, HTMLTextAreaElement)) {
      clonedNode.innerHTML = nativeNode.value;
    }
    if (isInstanceOfElement(nativeNode, HTMLInputElement)) {
      clonedNode.setAttribute("value", nativeNode.value);
    }
  }
  function cloneSelectValue(nativeNode, clonedNode) {
    if (isInstanceOfElement(nativeNode, HTMLSelectElement)) {
      const clonedSelect = clonedNode;
      const selectedOption = Array.from(clonedSelect.children).find((child) => nativeNode.value === child.getAttribute("value"));
      if (selectedOption) {
        selectedOption.setAttribute("selected", "");
      }
    }
  }
  function decorate(nativeNode, clonedNode, options) {
    if (isInstanceOfElement(clonedNode, Element)) {
      cloneCSSStyle(nativeNode, clonedNode, options);
      clonePseudoElements(nativeNode, clonedNode, options);
      cloneInputValue(nativeNode, clonedNode);
      cloneSelectValue(nativeNode, clonedNode);
    }
    return clonedNode;
  }
  async function ensureSVGSymbols(clone, options) {
    const uses = clone.querySelectorAll ? clone.querySelectorAll("use") : [];
    if (uses.length === 0) {
      return clone;
    }
    const processedDefs = {};
    for (let i = 0; i < uses.length; i++) {
      const use = uses[i];
      const id = use.getAttribute("xlink:href");
      if (id) {
        const exist = clone.querySelector(id);
        const definition = document.querySelector(id);
        if (!exist && definition && !processedDefs[id]) {
          processedDefs[id] = await cloneNode(definition, options, true);
        }
      }
    }
    const nodes = Object.values(processedDefs);
    if (nodes.length) {
      const ns = "http://www.w3.org/1999/xhtml";
      const svg = document.createElementNS(ns, "svg");
      svg.setAttribute("xmlns", ns);
      svg.style.position = "absolute";
      svg.style.width = "0";
      svg.style.height = "0";
      svg.style.overflow = "hidden";
      svg.style.display = "none";
      const defs = document.createElementNS(ns, "defs");
      svg.appendChild(defs);
      for (let i = 0; i < nodes.length; i++) {
        defs.appendChild(nodes[i]);
      }
      clone.appendChild(svg);
    }
    return clone;
  }
  async function cloneNode(node, options, isRoot) {
    if (!isRoot && options.filter && !options.filter(node)) {
      return null;
    }
    return Promise.resolve(node).then((clonedNode) => cloneSingleNode(clonedNode, options)).then((clonedNode) => cloneChildren(node, clonedNode, options)).then((clonedNode) => decorate(node, clonedNode, options)).then((clonedNode) => ensureSVGSymbols(clonedNode, options));
  }
  const URL_REGEX = /url\((['"]?)([^'"]+?)\1\)/g;
  const URL_WITH_FORMAT_REGEX = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g;
  const FONT_SRC_REGEX = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
  function toRegex(url) {
    const escaped = url.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
    return new RegExp(`(url\\(['"]?)(${escaped})(['"]?\\))`, "g");
  }
  function parseURLs(cssText) {
    const urls = [];
    cssText.replace(URL_REGEX, (raw, quotation, url) => {
      urls.push(url);
      return raw;
    });
    return urls.filter((url) => !isDataUrl(url));
  }
  async function embed(cssText, resourceURL, baseURL, options, getContentFromUrl) {
    try {
      const resolvedURL = baseURL ? resolveUrl(resourceURL, baseURL) : resourceURL;
      const contentType = getMimeType(resourceURL);
      let dataURL;
      if (getContentFromUrl) ;
      else {
        dataURL = await resourceToDataURL(resolvedURL, contentType, options);
      }
      return cssText.replace(toRegex(resourceURL), `$1${dataURL}$3`);
    } catch (error) {
    }
    return cssText;
  }
  function filterPreferredFontFormat(str, { preferredFontFormat }) {
    return !preferredFontFormat ? str : str.replace(FONT_SRC_REGEX, (match) => {
      while (true) {
        const [src, , format] = URL_WITH_FORMAT_REGEX.exec(match) || [];
        if (!format) {
          return "";
        }
        if (format === preferredFontFormat) {
          return `src: ${src};`;
        }
      }
    });
  }
  function shouldEmbed(url) {
    return url.search(URL_REGEX) !== -1;
  }
  async function embedResources(cssText, baseUrl, options) {
    if (!shouldEmbed(cssText)) {
      return cssText;
    }
    const filteredCSSText = filterPreferredFontFormat(cssText, options);
    const urls = parseURLs(filteredCSSText);
    return urls.reduce((deferred, url) => deferred.then((css) => embed(css, url, baseUrl, options)), Promise.resolve(filteredCSSText));
  }
  async function embedProp(propName, node, options) {
    var _a;
    const propValue = (_a = node.style) === null || _a === void 0 ? void 0 : _a.getPropertyValue(propName);
    if (propValue) {
      const cssString = await embedResources(propValue, null, options);
      node.style.setProperty(propName, cssString, node.style.getPropertyPriority(propName));
      return true;
    }
    return false;
  }
  async function embedBackground(clonedNode, options) {
    await embedProp("background", clonedNode, options) || await embedProp("background-image", clonedNode, options);
    await embedProp("mask", clonedNode, options) || await embedProp("-webkit-mask", clonedNode, options) || await embedProp("mask-image", clonedNode, options) || await embedProp("-webkit-mask-image", clonedNode, options);
  }
  async function embedImageNode(clonedNode, options) {
    const isImageElement = isInstanceOfElement(clonedNode, HTMLImageElement);
    if (!(isImageElement && !isDataUrl(clonedNode.src)) && !(isInstanceOfElement(clonedNode, SVGImageElement) && !isDataUrl(clonedNode.href.baseVal))) {
      return;
    }
    const url = isImageElement ? clonedNode.src : clonedNode.href.baseVal;
    const dataURL = await resourceToDataURL(url, getMimeType(url), options);
    await new Promise((resolve, reject) => {
      clonedNode.onload = resolve;
      clonedNode.onerror = options.onImageErrorHandler ? (...attributes) => {
        try {
          resolve(options.onImageErrorHandler(...attributes));
        } catch (error) {
          reject(error);
        }
      } : reject;
      const image = clonedNode;
      if (image.decode) {
        image.decode = resolve;
      }
      if (image.loading === "lazy") {
        image.loading = "eager";
      }
      if (isImageElement) {
        clonedNode.srcset = "";
        clonedNode.src = dataURL;
      } else {
        clonedNode.href.baseVal = dataURL;
      }
    });
  }
  async function embedChildren(clonedNode, options) {
    const children = toArray(clonedNode.childNodes);
    const deferreds = children.map((child) => embedImages(child, options));
    await Promise.all(deferreds).then(() => clonedNode);
  }
  async function embedImages(clonedNode, options) {
    if (isInstanceOfElement(clonedNode, Element)) {
      await embedBackground(clonedNode, options);
      await embedImageNode(clonedNode, options);
      await embedChildren(clonedNode, options);
    }
  }
  function applyStyle(node, options) {
    const { style } = node;
    if (options.backgroundColor) {
      style.backgroundColor = options.backgroundColor;
    }
    if (options.width) {
      style.width = `${options.width}px`;
    }
    if (options.height) {
      style.height = `${options.height}px`;
    }
    const manual = options.style;
    if (manual != null) {
      Object.keys(manual).forEach((key) => {
        style[key] = manual[key];
      });
    }
    return node;
  }
  const cssFetchCache = {};
  async function fetchCSS(url) {
    let cache2 = cssFetchCache[url];
    if (cache2 != null) {
      return cache2;
    }
    const res = await fetch(url);
    const cssText = await res.text();
    cache2 = { url, cssText };
    cssFetchCache[url] = cache2;
    return cache2;
  }
  async function embedFonts(data, options) {
    let cssText = data.cssText;
    const regexUrl = /url\(["']?([^"')]+)["']?\)/g;
    const fontLocs = cssText.match(/url\([^)]+\)/g) || [];
    const loadFonts = fontLocs.map(async (loc) => {
      let url = loc.replace(regexUrl, "$1");
      if (!url.startsWith("https://")) {
        url = new URL(url, data.url).href;
      }
      return fetchAsDataURL(url, options.fetchRequestInit, ({ result }) => {
        cssText = cssText.replace(loc, `url(${result})`);
        return [loc, result];
      });
    });
    return Promise.all(loadFonts).then(() => cssText);
  }
  function parseCSS(source) {
    if (source == null) {
      return [];
    }
    const result = [];
    const commentsRegex = /(\/\*[\s\S]*?\*\/)/gi;
    let cssText = source.replace(commentsRegex, "");
    const keyframesRegex = new RegExp("((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})", "gi");
    while (true) {
      const matches = keyframesRegex.exec(cssText);
      if (matches === null) {
        break;
      }
      result.push(matches[0]);
    }
    cssText = cssText.replace(keyframesRegex, "");
    const importRegex = /@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi;
    const combinedCSSRegex = "((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})";
    const unifiedRegex = new RegExp(combinedCSSRegex, "gi");
    while (true) {
      let matches = importRegex.exec(cssText);
      if (matches === null) {
        matches = unifiedRegex.exec(cssText);
        if (matches === null) {
          break;
        } else {
          importRegex.lastIndex = unifiedRegex.lastIndex;
        }
      } else {
        unifiedRegex.lastIndex = importRegex.lastIndex;
      }
      result.push(matches[0]);
    }
    return result;
  }
  async function getCSSRules(styleSheets, options) {
    const ret = [];
    const deferreds = [];
    styleSheets.forEach((sheet) => {
      if ("cssRules" in sheet) {
        try {
          toArray(sheet.cssRules || []).forEach((item, index) => {
            if (item.type === CSSRule.IMPORT_RULE) {
              let importIndex = index + 1;
              const url = item.href;
              const deferred = fetchCSS(url).then((metadata) => embedFonts(metadata, options)).then((cssText) => parseCSS(cssText).forEach((rule) => {
                try {
                  sheet.insertRule(rule, rule.startsWith("@import") ? importIndex += 1 : sheet.cssRules.length);
                } catch (error) {
                  console.error("Error inserting rule from remote css", {
                    rule,
                    error
                  });
                }
              })).catch((e) => {
                console.error("Error loading remote css", e.toString());
              });
              deferreds.push(deferred);
            }
          });
        } catch (e) {
          const inline = styleSheets.find((a) => a.href == null) || document.styleSheets[0];
          if (sheet.href != null) {
            deferreds.push(fetchCSS(sheet.href).then((metadata) => embedFonts(metadata, options)).then((cssText) => parseCSS(cssText).forEach((rule) => {
              inline.insertRule(rule, inline.cssRules.length);
            })).catch((err) => {
              console.error("Error loading remote stylesheet", err);
            }));
          }
          console.error("Error inlining remote css file", e);
        }
      }
    });
    return Promise.all(deferreds).then(() => {
      styleSheets.forEach((sheet) => {
        if ("cssRules" in sheet) {
          try {
            toArray(sheet.cssRules || []).forEach((item) => {
              ret.push(item);
            });
          } catch (e) {
            console.error(`Error while reading CSS rules from ${sheet.href}`, e);
          }
        }
      });
      return ret;
    });
  }
  function getWebFontRules(cssRules) {
    return cssRules.filter((rule) => rule.type === CSSRule.FONT_FACE_RULE).filter((rule) => shouldEmbed(rule.style.getPropertyValue("src")));
  }
  async function parseWebFontRules(node, options) {
    if (node.ownerDocument == null) {
      throw new Error("Provided element is not within a Document");
    }
    const styleSheets = toArray(node.ownerDocument.styleSheets);
    const cssRules = await getCSSRules(styleSheets, options);
    return getWebFontRules(cssRules);
  }
  function normalizeFontFamily(font) {
    return font.trim().replace(/["']/g, "");
  }
  function getUsedFonts(node) {
    const fonts = new Set();
    function traverse(node2) {
      const fontFamily = node2.style.fontFamily || getComputedStyle(node2).fontFamily;
      fontFamily.split(",").forEach((font) => {
        fonts.add(normalizeFontFamily(font));
      });
      Array.from(node2.children).forEach((child) => {
        if (child instanceof HTMLElement) {
          traverse(child);
        }
      });
    }
    traverse(node);
    return fonts;
  }
  async function getWebFontCSS(node, options) {
    const rules = await parseWebFontRules(node, options);
    const usedFonts = getUsedFonts(node);
    const cssTexts = await Promise.all(rules.filter((rule) => usedFonts.has(normalizeFontFamily(rule.style.fontFamily))).map((rule) => {
      const baseUrl = rule.parentStyleSheet ? rule.parentStyleSheet.href : null;
      return embedResources(rule.cssText, baseUrl, options);
    }));
    return cssTexts.join("\n");
  }
  async function embedWebFonts(clonedNode, options) {
    const cssText = options.fontEmbedCSS != null ? options.fontEmbedCSS : options.skipFonts ? null : await getWebFontCSS(clonedNode, options);
    if (cssText) {
      const styleNode = document.createElement("style");
      const sytleContent = document.createTextNode(cssText);
      styleNode.appendChild(sytleContent);
      if (clonedNode.firstChild) {
        clonedNode.insertBefore(styleNode, clonedNode.firstChild);
      } else {
        clonedNode.appendChild(styleNode);
      }
    }
  }
  async function toSvg(node, options = {}) {
    const { width, height } = getImageSize(node, options);
    const clonedNode = await cloneNode(node, options, true);
    await embedWebFonts(clonedNode, options);
    await embedImages(clonedNode, options);
    applyStyle(clonedNode, options);
    const datauri = await nodeToDataURL(clonedNode, width, height);
    return datauri;
  }
  async function toCanvas(node, options = {}) {
    const { width, height } = getImageSize(node, options);
    const svg = await toSvg(node, options);
    const img = await createImage(svg);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const ratio = options.pixelRatio || getPixelRatio();
    const canvasWidth = options.canvasWidth || width;
    const canvasHeight = options.canvasHeight || height;
    canvas.width = canvasWidth * ratio;
    canvas.height = canvasHeight * ratio;
    if (!options.skipAutoScale) {
      checkCanvasDimensions(canvas);
    }
    canvas.style.width = `${canvasWidth}`;
    canvas.style.height = `${canvasHeight}`;
    if (options.backgroundColor) {
      context.fillStyle = options.backgroundColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
  }
  async function toPng(node, options = {}) {
    const canvas = await toCanvas(node, options);
    return canvas.toDataURL();
  }
  const _hoisted_1$5 = ["d"];
  const _sfc_main$7 = vue.defineComponent({
    __name: "InteractionIcon",
    props: {
      type: {},
      size: {}
    },
    setup(__props) {
      const PATHS = {
        retweet: "M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z",
        like: "M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z",
        quote: "M14.23 2.854c.98-.977 2.56-.977 3.54 0l3.38 3.378c.97.977.97 2.559 0 3.536L9.91 21H3v-6.914L14.23 2.854zm2.12 1.414c-.19-.195-.51-.195-.7 0L4.41 15.51V19h3.49l11.24-11.242c.2-.195.2-.513 0-.707l-3.38-3.378-.41.595zm-1.42 1.42l3.38 3.378-1.42 1.414-3.38-3.378 1.42-1.414z",
        follow: "M12 11.816c1.355 0 2.872-.15 3.84-1.256.814-.93 1.078-2.368.806-4.392-.38-2.825-2.117-4.512-4.646-4.512S7.734 3.343 7.354 6.168c-.272 2.024-.008 3.462.806 4.392.968 1.107 2.485 1.256 3.84 1.256zm-3.16-5.448c.162-1.2.787-3.212 3.16-3.212s2.998 2.013 3.16 3.212c.207 1.55.057 2.627-.45 3.205-.455.52-1.266.743-2.71.743s-2.255-.223-2.71-.743c-.507-.578-.657-1.656-.45-3.205zm11.44 12.868c-.877-3.526-4.282-5.99-8.28-5.99s-7.403 2.464-8.28 5.99c-.172.692-.028 1.4.395 1.94.408.52 1.04.82 1.733.82h12.304c.693 0 1.325-.3 1.733-.82.424-.54.567-1.247.394-1.94zm-1.576 1.016c-.126.16-.316.246-.552.246H5.848c-.235 0-.426-.086-.552-.246-.137-.174-.18-.412-.12-.654.71-2.855 3.517-4.85 6.824-4.85s6.114 1.994 6.824 4.85c.06.242.017.48-.12.654z"
      };
      const COLORS = {
        retweet: "text-[#00ba7c]",
        like: "text-[#f91880]",
        quote: "text-[#ff7a00]",
        follow: "text-[#1d9bf0]"
      };
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("svg", {
          viewBox: "0 0 24 24",
          class: vue.normalizeClass([__props.size ?? "w-4 h-4", COLORS[__props.type]]),
          fill: "currentColor"
        }, [
          vue.createElementVNode("path", {
            d: PATHS[__props.type]
          }, null, 8, _hoisted_1$5)
        ], 2);
      };
    }
  });
  const _sfc_main$6 = vue.defineComponent({
    __name: "InteractionBadge",
    props: {
      type: {},
      label: {},
      iconSize: {}
    },
    setup(__props) {
      const BADGE_VARIANTS = {
        retweet: "xd-badge-green",
        like: "xd-badge-pink",
        quote: "xd-badge-orange",
        follow: "xd-badge-blue"
      };
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("span", {
          class: vue.normalizeClass(["xd-badge", BADGE_VARIANTS[__props.type]])
        }, [
          vue.createVNode(_sfc_main$7, {
            type: __props.type,
            size: __props.iconSize ?? "w-3.5 h-3.5"
          }, null, 8, ["type", "size"]),
          __props.label ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 0 }, [
            vue.createTextVNode(vue.toDisplayString(__props.label), 1)
          ], 64)) : vue.createCommentVNode("", true)
        ], 2);
      };
    }
  });
  const _hoisted_1$4 = { class: "flex-1 overflow-auto min-h-0" };
  const _hoisted_2$3 = { class: "p-4 text-center text-[#e7e9ea] text-sm" };
  const _hoisted_3$3 = { class: "px-4 pb-4" };
  const _hoisted_4$3 = { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "12px" } };
  const _hoisted_5$3 = ["src", "alt"];
  const _hoisted_6$3 = { class: "text-center min-w-0 w-full" };
  const _hoisted_7$3 = { class: "text-white font-medium text-sm truncate" };
  const _hoisted_8$3 = ["href"];
  const _hoisted_9$3 = { class: "text-[#71767b] text-xs mt-0.5" };
  const _hoisted_10$2 = { class: "text-[#e7e9ea] font-medium" };
  const _hoisted_11$2 = { class: "flex gap-1" };
  const _hoisted_12$2 = { class: "px-4 pb-3 shrink-0" };
  const _hoisted_13$2 = {
    key: 0,
    class: "mt-2"
  };
  const _hoisted_14$2 = ["placeholder"];
  const _hoisted_15$1 = { class: "p-4 flex justify-center gap-4" };
  const _sfc_main$5 = vue.defineComponent({
    __name: "DrawResult",
    props: {
      winners: {}
    },
    emits: ["close"],
    setup(__props, { emit: __emit }) {
      const props = __props;
      const emit = __emit;
      const { t: t2 } = useI18n();
      const { show: showToast } = useToast();
      const captureRef = vue.ref(null);
      const showDmTemplate = vue.ref(false);
      const dmTemplate = vue.ref(gmStorage.get(STORAGE_KEYS.DM_TEMPLATE, t2("dmPlaceholder")));
      function saveDmTemplate() {
        gmStorage.set(STORAGE_KEYS.DM_TEMPLATE, dmTemplate.value);
      }
      function notifyWinners(winners) {
        const tweetId = getTweetIdFromUrl();
        if (!tweetId) return;
        const winnersText = winners.map((u) => `@${u.handle}`).join(" ");
        const notifyText = t2("winnerNotice") + winnersText;
        const intentUrl = `https://x.com/intent/post?in_reply_to=${tweetId}&text=${encodeURIComponent(notifyText)}`;
        window.open(intentUrl, "_blank");
      }
      async function openAllChats(winners) {
        if (dmTemplate.value.trim()) {
          const firstWinner = winners[0]?.handle ?? "";
          const text = dmTemplate.value.replace(/\{winner\}/g, firstWinner);
          try {
            await navigator.clipboard.writeText(text);
            showToast(t2("dmCopied"), "success");
          } catch {
          }
        }
        const urls = winners.filter((user) => !!user.id).map((user) => `https://x.com/messages/compose?recipient_id=${user.id}`);
        if (typeof GM_openInTab === "function") {
          urls.forEach((url) => {
            GM_openInTab(url, false);
          });
          return;
        }
        let opened = 0;
        urls.forEach((url) => {
          const tab = window.open(url, "_blank");
          if (tab) opened++;
        });
        if (opened < urls.length) {
          showToast(t2("popupBlocked"), "error", 5e3);
        }
      }
      async function copyHandles() {
        const text = props.winners.map((u) => `@${u.handle}`).join(" ");
        try {
          await navigator.clipboard.writeText(text);
          showToast(t2("copied"), "success");
        } catch {
          showToast(text, "info", 5e3);
        }
      }
      async function takeScreenshot() {
        if (!captureRef.value) return;
        try {
          const dataUrl = await toPng(captureRef.value, { backgroundColor: "#15202b", pixelRatio: 2 });
          const link = document.createElement("a");
          link.download = `draw-result-${Date.now()}.png`;
          link.href = dataUrl;
          link.click();
        } catch {
        }
      }
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createBlock(_sfc_main$a, {
          title: vue.unref(t2)("drawResult"),
          "max-width": "700px",
          "z-index": 10001,
          onClose: _cache[4] || (_cache[4] = ($event) => emit("close"))
        }, {
          footer: vue.withCtx(() => [
            vue.createElementVNode("div", _hoisted_15$1, [
              vue.createElementVNode("button", {
                class: "xd-btn xd-btn-secondary",
                onClick: copyHandles
              }, [
                _cache[6] || (_cache[6] = vue.createElementVNode("svg", {
                  viewBox: "0 0 24 24",
                  class: "w-4 h-4",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                }, [
                  vue.createElementVNode("rect", {
                    x: "9",
                    y: "9",
                    width: "13",
                    height: "13",
                    rx: "2",
                    ry: "2"
                  }),
                  vue.createElementVNode("path", { d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" })
                ], -1)),
                vue.createTextVNode(" " + vue.toDisplayString(vue.unref(t2)("copyHandles")), 1)
              ]),
              vue.createElementVNode("button", {
                class: "xd-btn xd-btn-secondary",
                onClick: takeScreenshot
              }, [
                _cache[7] || (_cache[7] = vue.createElementVNode("svg", {
                  viewBox: "0 0 24 24",
                  class: "w-4 h-4",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                }, [
                  vue.createElementVNode("path", { d: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" }),
                  vue.createElementVNode("circle", {
                    cx: "12",
                    cy: "13",
                    r: "4"
                  })
                ], -1)),
                vue.createTextVNode(" " + vue.toDisplayString(vue.unref(t2)("screenshot")), 1)
              ]),
              vue.createElementVNode("button", {
                class: "xd-btn xd-btn-primary",
                onClick: _cache[2] || (_cache[2] = ($event) => openAllChats(__props.winners))
              }, [
                _cache[8] || (_cache[8] = vue.createElementVNode("svg", {
                  viewBox: "0 0 24 24",
                  class: "w-4 h-4",
                  fill: "currentColor"
                }, [
                  vue.createElementVNode("path", { d: "M1.998 5.5a2.5 2.5 0 0 1 2.5-2.5h15a2.5 2.5 0 0 1 2.5 2.5v9a2.5 2.5 0 0 1-2.5 2.5h-6l-3 3-3-3h-3a2.5 2.5 0 0 1-2.5-2.5v-9z" })
                ], -1)),
                vue.createTextVNode(" " + vue.toDisplayString(vue.unref(t2)("openChats")), 1)
              ]),
              vue.createElementVNode("button", {
                class: "xd-btn xd-btn-success",
                onClick: _cache[3] || (_cache[3] = ($event) => notifyWinners(__props.winners))
              }, vue.toDisplayString(vue.unref(t2)("notify")), 1)
            ])
          ]),
          default: vue.withCtx(() => [
            vue.createElementVNode("div", _hoisted_1$4, [
              vue.createElementVNode("div", {
                ref_key: "captureRef",
                ref: captureRef
              }, [
                vue.createElementVNode("div", _hoisted_2$3, vue.toDisplayString(vue.unref(t2)("congratulations")), 1),
                vue.createElementVNode("div", _hoisted_3$3, [
                  vue.createElementVNode("div", _hoisted_4$3, [
                    (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(__props.winners, (user) => {
                      return vue.openBlock(), vue.createElementBlock("div", {
                        key: user.handle,
                        class: "flex flex-col items-center gap-2 p-3 bg-[#273340] rounded-xl"
                      }, [
                        vue.createElementVNode("img", {
                          src: user.avatarUrl,
                          alt: user.username,
                          class: "w-12 h-12 rounded-full shrink-0"
                        }, null, 8, _hoisted_5$3),
                        vue.createElementVNode("div", _hoisted_6$3, [
                          vue.createElementVNode("div", _hoisted_7$3, vue.toDisplayString(user.username), 1),
                          vue.createElementVNode("a", {
                            href: user.id ? `https://x.com/messages/compose?recipient_id=${user.id}` : `https://x.com/${user.handle}`,
                            target: "_blank",
                            class: "text-[#71767b] text-xs truncate hover:underline"
                          }, "@" + vue.toDisplayString(user.handle), 9, _hoisted_8$3),
                          vue.createElementVNode("div", _hoisted_9$3, [
                            vue.createElementVNode("span", _hoisted_10$2, vue.toDisplayString(user.followersCount.toLocaleString()), 1),
                            vue.createTextVNode(" " + vue.toDisplayString(vue.unref(t2)("followers")), 1)
                          ])
                        ]),
                        vue.createElementVNode("div", _hoisted_11$2, [
                          user.hasRetweet ? (vue.openBlock(), vue.createBlock(_sfc_main$6, {
                            key: 0,
                            type: "retweet",
                            "icon-size": "w-3 h-3"
                          })) : vue.createCommentVNode("", true),
                          user.hasLike ? (vue.openBlock(), vue.createBlock(_sfc_main$6, {
                            key: 1,
                            type: "like",
                            "icon-size": "w-3 h-3"
                          })) : vue.createCommentVNode("", true),
                          user.hasQuote ? (vue.openBlock(), vue.createBlock(_sfc_main$6, {
                            key: 2,
                            type: "quote",
                            "icon-size": "w-3 h-3"
                          })) : vue.createCommentVNode("", true),
                          user.followed_by ? (vue.openBlock(), vue.createBlock(_sfc_main$6, {
                            key: 3,
                            type: "follow",
                            "icon-size": "w-3 h-3"
                          })) : vue.createCommentVNode("", true)
                        ])
                      ]);
                    }), 128))
                  ])
                ])
              ], 512)
            ]),
            vue.createElementVNode("div", _hoisted_12$2, [
              vue.createElementVNode("button", {
                class: "text-xs text-[#71767b] hover:text-[#1d9bf0] transition-colors",
                onClick: _cache[0] || (_cache[0] = ($event) => showDmTemplate.value = !showDmTemplate.value)
              }, vue.toDisplayString(vue.unref(t2)("dmTemplate")) + " " + vue.toDisplayString(showDmTemplate.value ? "▲" : "▼"), 1),
              showDmTemplate.value ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_13$2, [
                vue.withDirectives(vue.createElementVNode("textarea", {
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => dmTemplate.value = $event),
                  class: "xd-input w-full text-sm resize-none",
                  rows: "3",
                  placeholder: vue.unref(t2)("dmPlaceholder"),
                  onBlur: saveDmTemplate
                }, null, 40, _hoisted_14$2), [
                  [vue.vModelText, dmTemplate.value]
                ]),
                _cache[5] || (_cache[5] = vue.createElementVNode("div", { class: "text-[10px] text-[#71767b] mt-1" }, "{winner} → @handle", -1))
              ])) : vue.createCommentVNode("", true)
            ])
          ]),
          _: 1
        }, 8, ["title"]);
      };
    }
  });
  const _hoisted_1$3 = { class: "p-5 space-y-3" };
  const _hoisted_2$2 = { class: "text-sm text-[#71767b] mb-2" };
  const _hoisted_3$2 = ["checked", "onChange"];
  const _hoisted_4$2 = { class: "text-[#e7e9ea] text-sm" };
  const _hoisted_5$2 = { class: "px-5 pb-2" };
  const _hoisted_6$2 = { class: "text-[#e7e9ea] text-sm" };
  const _hoisted_7$2 = { class: "px-5 pb-4 flex items-center justify-between" };
  const _hoisted_8$2 = { class: "text-sm text-[#71767b]" };
  const _hoisted_9$2 = { class: "text-white font-bold" };
  const _hoisted_10$1 = { class: "flex items-center gap-2" };
  const _hoisted_11$1 = { class: "text-sm text-[#71767b]" };
  const _hoisted_12$1 = { class: "text-sm text-[#71767b]" };
  const _hoisted_13$1 = { class: "px-5 py-4 flex justify-between" };
  const _hoisted_14$1 = { key: 1 };
  const _sfc_main$4 = vue.defineComponent({
    __name: "DrawSettings",
    emits: ["close", "draw"],
    setup(__props, { emit: __emit }) {
      const emit = __emit;
      const { t: t2 } = useI18n();
      const drawData = useDrawData();
      const { history: history2, winCountMap } = useDrawHistory();
      const { show: showToast } = useToast();
      const excludePastWinners = vue.ref(false);
      const showLastResult = vue.ref(false);
      const lastEntry = vue.computed(() => {
        const tweetId = drawData.lastTweetId.value;
        if (!tweetId) return null;
        return history2.value.find((e) => e.tweetId === tweetId) ?? null;
      });
      const lastWinners = vue.computed(() => lastEntry.value?.winners ?? []);
      const filterOptions = [
        { key: "retweet", icon: "retweet" },
        { key: "like", icon: "like" },
        { key: "quote", icon: "quote" },
        { key: "followed_by", icon: "follow" }
      ];
      function getFilterLabel(key) {
        if (key === "retweet") return t2("hasRetweeted");
        if (key === "like") return t2("hasLiked");
        if (key === "quote") return t2("hasQuoted");
        return t2("followingMe");
      }
      const qualifiedCount = vue.computed(() => drawData.qualifiedUsers.value.length);
      function handleDraw() {
        const exclude = excludePastWinners.value ? new Set(winCountMap.value.keys()) : void 0;
        const result = drawData.performDraw({ excludeHandles: exclude });
        if (!result.success) {
          if (result.message === "notEnoughUsers") {
            showToast(t2("notEnoughUsers", { count: String(result.count) }), "error");
          } else {
            showToast(t2(result.message || "noQualifiedUsers"), "error");
          }
          return;
        }
        emit("draw", result.winners);
      }
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock(vue.Fragment, null, [
          vue.createVNode(_sfc_main$a, {
            title: vue.unref(t2)("startDraw"),
            "max-width": "400px",
            "z-index": 10001,
            onClose: _cache[3] || (_cache[3] = ($event) => emit("close"))
          }, {
            footer: vue.withCtx(() => [
              vue.createElementVNode("div", _hoisted_13$1, [
                lastWinners.value.length ? (vue.openBlock(), vue.createElementBlock("button", {
                  key: 0,
                  class: "xd-btn xd-btn-secondary text-sm",
                  onClick: _cache[2] || (_cache[2] = ($event) => showLastResult.value = true)
                }, vue.toDisplayString(vue.unref(t2)("lastResult")), 1)) : (vue.openBlock(), vue.createElementBlock("div", _hoisted_14$1)),
                vue.createElementVNode("button", {
                  class: "xd-btn xd-btn-primary text-sm",
                  style: vue.normalizeStyle({ opacity: qualifiedCount.value === 0 ? 0.5 : 1 }),
                  onClick: handleDraw
                }, vue.toDisplayString(vue.unref(t2)("startDraw")), 5)
              ])
            ]),
            default: vue.withCtx(() => [
              vue.createElementVNode("div", _hoisted_1$3, [
                vue.createElementVNode("div", _hoisted_2$2, vue.toDisplayString(vue.unref(t2)("selectFilters")), 1),
                (vue.openBlock(), vue.createElementBlock(vue.Fragment, null, vue.renderList(filterOptions, (opt) => {
                  return vue.createElementVNode("label", {
                    key: opt.key,
                    class: vue.normalizeClass(["flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors", vue.unref(drawData).filters.value[opt.key] ? "bg-[#273340]" : "hover:bg-[#273340]/50"])
                  }, [
                    vue.createElementVNode("input", {
                      type: "checkbox",
                      checked: vue.unref(drawData).filters.value[opt.key],
                      class: "xd-checkbox",
                      onChange: ($event) => vue.unref(drawData).toggleFilter(opt.key)
                    }, null, 40, _hoisted_3$2),
                    vue.createVNode(_sfc_main$7, {
                      type: opt.icon
                    }, null, 8, ["type"]),
                    vue.createElementVNode("span", _hoisted_4$2, vue.toDisplayString(getFilterLabel(opt.key)), 1)
                  ], 2);
                }), 64))
              ]),
              vue.createElementVNode("div", _hoisted_5$2, [
                vue.createElementVNode("label", {
                  class: vue.normalizeClass(["flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors", excludePastWinners.value ? "bg-[#3d1f00]" : "hover:bg-[#273340]/50"])
                }, [
                  vue.withDirectives(vue.createElementVNode("input", {
                    type: "checkbox",
                    "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => excludePastWinners.value = $event),
                    class: "xd-checkbox"
                  }, null, 512), [
                    [vue.vModelCheckbox, excludePastWinners.value]
                  ]),
                  _cache[5] || (_cache[5] = vue.createElementVNode("svg", {
                    viewBox: "0 0 24 24",
                    class: "w-4 h-4 text-[#ffd700]",
                    fill: "currentColor"
                  }, [
                    vue.createElementVNode("path", { d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" })
                  ], -1)),
                  vue.createElementVNode("span", _hoisted_6$2, vue.toDisplayString(vue.unref(t2)("excludePastWinners")), 1)
                ], 2)
              ]),
              vue.createElementVNode("div", _hoisted_7$2, [
                vue.createElementVNode("div", _hoisted_8$2, [
                  vue.createTextVNode(vue.toDisplayString(vue.unref(t2)("qualifiedUsers")) + "：", 1),
                  vue.createElementVNode("span", _hoisted_9$2, vue.toDisplayString(qualifiedCount.value), 1),
                  vue.createTextVNode(" " + vue.toDisplayString(vue.unref(t2)("people")), 1)
                ]),
                vue.createElementVNode("div", _hoisted_10$1, [
                  vue.createElementVNode("span", _hoisted_11$1, vue.toDisplayString(vue.unref(t2)("draw")), 1),
                  vue.withDirectives(vue.createElementVNode("input", {
                    type: "number",
                    "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => vue.unref(drawData).drawCount.value = $event),
                    min: "1",
                    class: "xd-input w-16 text-center"
                  }, null, 512), [
                    [
                      vue.vModelText,
                      vue.unref(drawData).drawCount.value,
                      void 0,
                      { number: true }
                    ]
                  ]),
                  vue.createElementVNode("span", _hoisted_12$1, vue.toDisplayString(vue.unref(t2)("people")), 1)
                ])
              ])
            ]),
            _: 1
          }, 8, ["title"]),
          showLastResult.value ? (vue.openBlock(), vue.createBlock(_sfc_main$5, {
            key: 0,
            winners: lastWinners.value,
            onClose: _cache[4] || (_cache[4] = ($event) => showLastResult.value = false)
          }, null, 8, ["winners"])) : vue.createCommentVNode("", true)
        ], 64);
      };
    }
  });
  const _hoisted_1$2 = { class: "flex-1 overflow-auto min-h-0 p-5 space-y-6" };
  const _hoisted_2$1 = { style: { color: "#e7e9ea", fontWeight: 700, fontSize: "14px", marginBottom: "4px" } };
  const _hoisted_3$1 = { style: { color: "#71767b", fontSize: "12px", marginBottom: "12px", lineHeight: "1.4" } };
  const _hoisted_4$1 = { class: "space-y-3" };
  const _hoisted_5$1 = { style: { color: "#71767b", fontSize: "12px", display: "block", marginBottom: "4px" } };
  const _hoisted_6$1 = ["onUpdate:modelValue", "placeholder"];
  const _hoisted_7$1 = { style: { display: "flex", gap: "8px", marginTop: "12px" } };
  const _hoisted_8$1 = { style: { color: "#e7e9ea", fontWeight: 700, fontSize: "14px", marginBottom: "12px" } };
  const _hoisted_9$1 = { style: { display: "flex", gap: "8px" } };
  const _sfc_main$3 = vue.defineComponent({
    __name: "Settings",
    emits: ["close"],
    setup(__props, { emit: __emit }) {
      const emit = __emit;
      const { t: t2 } = useI18n();
      const { clearHistory } = useDrawHistory();
      const { show: showToast } = useToast();
      const saved = gmStorage.get(STORAGE_KEYS.CUSTOM_ENDPOINTS, {});
      const endpoints = vue.ref({
        retweeters: extractQueryId(saved.retweeters ?? ""),
        favoriters: extractQueryId(saved.favoriters ?? ""),
        searchTimeline: extractQueryId(saved.searchTimeline ?? "")
      });
      function extractQueryId(endpoint) {
        return endpoint.includes("/") ? endpoint.split("/")[0] : endpoint;
      }
      function handleSave() {
        const custom = {};
        for (const [k, v] of Object.entries(endpoints.value)) {
          if (v.trim()) custom[k] = v.trim();
        }
        gmStorage.set(STORAGE_KEYS.CUSTOM_ENDPOINTS, custom);
        updateEndpoints(custom);
        showToast(t2("saved"), "success");
      }
      function handleReset() {
        endpoints.value = { retweeters: "", favoriters: "", searchTimeline: "" };
        gmStorage.set(STORAGE_KEYS.CUSTOM_ENDPOINTS, {});
        showToast(t2("saved"), "success");
      }
      function handleClearCache() {
        const keys = GM_listValues?.() ?? [];
        let count = 0;
        for (const key of keys) {
          if (typeof key === "string" && key.startsWith(STORAGE_KEYS.TWEET_CACHE_PREFIX)) {
            GM_deleteValue?.(key);
            count++;
          }
        }
        showToast(`${t2("cacheCleared")} (${count})`, "success");
      }
      const confirmingClearHistory = vue.ref(false);
      function handleClearHistory() {
        if (!confirmingClearHistory.value) {
          confirmingClearHistory.value = true;
          setTimeout(() => {
            confirmingClearHistory.value = false;
          }, TIMING.CONFIRM_TIMEOUT);
          return;
        }
        confirmingClearHistory.value = false;
        clearHistory();
        showToast(t2("historyCleared"), "success");
      }
      const ENDPOINT_FIELDS = [
        { key: "retweeters", label: "retweetersEndpoint" },
        { key: "favoriters", label: "favoritersEndpoint" },
        { key: "searchTimeline", label: "searchEndpoint" }
      ];
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createBlock(_sfc_main$a, {
          title: vue.unref(t2)("settings"),
          "max-width": "480px",
          "z-index": 10001,
          onClose: _cache[0] || (_cache[0] = ($event) => emit("close"))
        }, {
          default: vue.withCtx(() => [
            vue.createElementVNode("div", _hoisted_1$2, [
              vue.createElementVNode("div", null, [
                vue.createElementVNode("h3", _hoisted_2$1, vue.toDisplayString(vue.unref(t2)("apiEndpoints")), 1),
                vue.createElementVNode("p", _hoisted_3$1, vue.toDisplayString(vue.unref(t2)("apiEndpointsDesc")), 1),
                vue.createElementVNode("div", _hoisted_4$1, [
                  (vue.openBlock(), vue.createElementBlock(vue.Fragment, null, vue.renderList(ENDPOINT_FIELDS, (field) => {
                    return vue.createElementVNode("div", {
                      key: field.key
                    }, [
                      vue.createElementVNode("label", _hoisted_5$1, vue.toDisplayString(vue.unref(t2)(field.label)), 1),
                      vue.withDirectives(vue.createElementVNode("input", {
                        "onUpdate:modelValue": ($event) => endpoints.value[field.key] = $event,
                        type: "text",
                        class: "xd-input w-full text-sm",
                        placeholder: vue.unref(t2)("autoDetected")
                      }, null, 8, _hoisted_6$1), [
                        [vue.vModelText, endpoints.value[field.key]]
                      ])
                    ]);
                  }), 64))
                ]),
                vue.createElementVNode("div", _hoisted_7$1, [
                  vue.createElementVNode("button", {
                    class: "xd-btn xd-btn-primary text-sm",
                    onClick: handleSave
                  }, vue.toDisplayString(vue.unref(t2)("save")), 1),
                  vue.createElementVNode("button", {
                    class: "xd-btn xd-btn-ghost text-sm",
                    onClick: handleReset
                  }, vue.toDisplayString(vue.unref(t2)("reset")), 1)
                ])
              ]),
              vue.createElementVNode("div", null, [
                vue.createElementVNode("h3", _hoisted_8$1, vue.toDisplayString(vue.unref(t2)("dataManagement")), 1),
                vue.createElementVNode("div", _hoisted_9$1, [
                  vue.createElementVNode("button", {
                    class: "xd-btn xd-btn-secondary text-sm",
                    onClick: handleClearCache
                  }, vue.toDisplayString(vue.unref(t2)("clearCache")), 1),
                  vue.createElementVNode("button", {
                    class: vue.normalizeClass(["xd-btn text-sm", confirmingClearHistory.value ? "xd-btn-primary" : "xd-btn-secondary"]),
                    style: vue.normalizeStyle(confirmingClearHistory.value ? { background: "#f4212e" } : { color: "#f4212e" }),
                    onClick: handleClearHistory
                  }, vue.toDisplayString(confirmingClearHistory.value ? vue.unref(t2)("confirmClear") : vue.unref(t2)("clearHistory")), 7)
                ])
              ])
            ])
          ]),
          _: 1
        }, 8, ["title"]);
      };
    }
  });
  const _hoisted_1$1 = { class: "fixed top-4 left-1/2 -translate-x-1/2 z-[99999] flex flex-col gap-2 pointer-events-none" };
  const _sfc_main$2 = vue.defineComponent({
    __name: "Toast",
    setup(__props) {
      const { toasts: toasts2 } = useToast();
      const COLORS = {
        success: "bg-[#00ba7c] text-white",
        error: "bg-[#f4212e] text-white",
        info: "bg-[#1d9bf0] text-white"
      };
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createBlock(vue.Teleport, { to: "body" }, [
          vue.createElementVNode("div", _hoisted_1$1, [
            vue.createVNode(vue.TransitionGroup, { name: "toast" }, {
              default: vue.withCtx(() => [
                (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(vue.unref(toasts2), (toast) => {
                  return vue.openBlock(), vue.createElementBlock("div", {
                    key: toast.id,
                    class: vue.normalizeClass(["px-4 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap", COLORS[toast.type]])
                  }, vue.toDisplayString(toast.message), 3);
                }), 128))
              ]),
              _: 1
            })
          ])
        ]);
      };
    }
  });
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const Toast = _export_sfc(_sfc_main$2, [["__scopeId", "data-v-82edf3f7"]]);
  const _hoisted_1 = ["value"];
  const _hoisted_2 = ["value"];
  const _hoisted_3 = ["title"];
  const _hoisted_4 = { style: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", borderBottom: "1px solid #38444d", flexShrink: 0, overflowX: "auto" } };
  const _hoisted_5 = { class: "flex flex-col items-center py-3 border-r border-[#38444d]" };
  const _hoisted_6 = { class: "text-xs text-[#71767b]" };
  const _hoisted_7 = { class: "text-xl font-bold text-white" };
  const _hoisted_8 = { class: "flex flex-col items-center py-3 border-r border-[#38444d]" };
  const _hoisted_9 = { class: "text-xs text-[#71767b]" };
  const _hoisted_10 = { class: "text-xl font-bold text-[#00ba7c]" };
  const _hoisted_11 = {
    key: 0,
    class: "mt-1 text-[11px] text-[#71767b] flex items-center gap-1"
  };
  const _hoisted_12 = { class: "flex flex-col items-center py-3 border-r border-[#38444d]" };
  const _hoisted_13 = { class: "text-xs text-[#71767b]" };
  const _hoisted_14 = { class: "text-xl font-bold text-[#f91880]" };
  const _hoisted_15 = {
    key: 0,
    class: "mt-1 text-[11px] text-[#71767b] flex items-center gap-1"
  };
  const _hoisted_16 = { class: "flex flex-col items-center py-3 border-r border-[#38444d]" };
  const _hoisted_17 = { class: "text-xs text-[#71767b]" };
  const _hoisted_18 = { class: "text-xl font-bold text-[#ff7a00]" };
  const _hoisted_19 = {
    key: 0,
    class: "mt-1 text-[11px] text-[#71767b] flex items-center gap-1"
  };
  const _hoisted_20 = { class: "flex flex-col items-center py-3" };
  const _hoisted_21 = { class: "text-xs text-[#71767b]" };
  const _hoisted_22 = { class: "text-xl font-bold text-[#1d9bf0]" };
  const _hoisted_23 = { class: "px-5 py-2.5 border-b border-[#38444d] shrink-0 flex flex-col gap-2" };
  const _hoisted_24 = { class: "flex items-center justify-between" };
  const _hoisted_25 = { class: "xd-tab-group" };
  const _hoisted_26 = ["onClick"];
  const _hoisted_27 = { class: "ml-1 opacity-60 text-[11px]" };
  const _hoisted_28 = { class: "flex items-center gap-2" };
  const _hoisted_29 = { class: "flex items-center gap-2" };
  const _hoisted_30 = {
    class: "flex items-center flex-1",
    style: { background: "#273340", border: "1px solid #38444d", borderRadius: "9999px", padding: "0 12px", gap: "8px" }
  };
  const _hoisted_31 = {
    class: "w-4 h-4 shrink-0",
    style: { color: "#71767b" },
    viewBox: "0 0 24 24",
    fill: "currentColor"
  };
  const _hoisted_32 = ["placeholder"];
  const _hoisted_33 = ["title"];
  const _hoisted_34 = { key: 0 };
  const _hoisted_35 = { class: "flex-1 overflow-auto min-h-0" };
  const _hoisted_36 = { class: "w-full text-sm border-collapse" };
  const _hoisted_37 = { class: "sticky top-0 bg-[#15202b] z-[1]" };
  const _hoisted_38 = { class: "text-left border-b border-[#38444d]" };
  const _hoisted_39 = { class: "text-xs opacity-50" };
  const _hoisted_40 = { class: "text-xs opacity-50" };
  const _hoisted_41 = { class: "inline-flex items-center justify-center gap-1" };
  const _hoisted_42 = { class: "text-xs opacity-50" };
  const _hoisted_43 = { class: "inline-flex items-center justify-center gap-1" };
  const _hoisted_44 = { class: "text-xs opacity-50" };
  const _hoisted_45 = { class: "inline-flex items-center justify-center gap-1" };
  const _hoisted_46 = { class: "text-xs opacity-50" };
  const _hoisted_47 = { class: "inline-flex items-center justify-center gap-1" };
  const _hoisted_48 = { class: "text-xs opacity-50" };
  const _hoisted_49 = { class: "inline-flex items-center justify-center gap-1 text-xs text-[#71767b] font-medium" };
  const _hoisted_50 = { class: "opacity-50" };
  const _hoisted_51 = { class: "w-16 px-4 py-2.5 text-center text-[#71767b] font-medium text-xs" };
  const _hoisted_52 = { class: "w-14 px-4 text-[#71767b]" };
  const _hoisted_53 = { class: "px-4" };
  const _hoisted_54 = { class: "flex items-center gap-3" };
  const _hoisted_55 = ["src", "alt", "onMouseenter"];
  const _hoisted_56 = ["onClick"];
  const _hoisted_57 = { class: "w-40 px-4 text-[#71767b] truncate" };
  const _hoisted_58 = { class: "w-20 px-4 text-center" };
  const _hoisted_59 = {
    key: 1,
    class: "text-[#38444d]"
  };
  const _hoisted_60 = { class: "w-20 px-4 text-center" };
  const _hoisted_61 = {
    key: 1,
    class: "text-[#38444d]"
  };
  const _hoisted_62 = { class: "w-20 px-4 text-center" };
  const _hoisted_63 = {
    key: 1,
    class: "text-[#38444d]"
  };
  const _hoisted_64 = { class: "w-20 px-4 text-center" };
  const _hoisted_65 = {
    key: 1,
    class: "text-[#38444d]"
  };
  const _hoisted_66 = { class: "w-24 px-4 text-center text-[#71767b] text-xs" };
  const _hoisted_67 = { class: "w-16 px-4 text-center" };
  const _hoisted_68 = {
    key: 0,
    class: "text-[#ffd700] font-bold text-sm"
  };
  const _hoisted_69 = {
    key: 1,
    class: "text-[#38444d]"
  };
  const _hoisted_70 = { key: 1 };
  const _hoisted_71 = {
    colspan: "9",
    class: "text-center py-12 text-[#71767b]"
  };
  const _hoisted_72 = {
    key: 0,
    class: "flex items-center justify-center px-5 py-2.5 border-t border-[#38444d] shrink-0"
  };
  const _hoisted_73 = { class: "flex items-center gap-1" };
  const _hoisted_74 = {
    key: 0,
    class: "px-1 text-[#71767b]"
  };
  const _hoisted_75 = ["onClick"];
  const _hoisted_76 = { class: "px-5 py-2 text-center text-xs text-[#71767b]" };
  const _hoisted_77 = { class: "flex items-start gap-3 mb-2" };
  const _hoisted_78 = ["src", "alt"];
  const _hoisted_79 = { class: "min-w-0" };
  const _hoisted_80 = { class: "text-white font-bold truncate" };
  const _hoisted_81 = { class: "text-[#71767b] text-sm" };
  const _hoisted_82 = { class: "flex gap-4 text-sm text-[#71767b]" };
  const _hoisted_83 = { class: "text-white font-bold" };
  const _hoisted_84 = { class: "text-white font-bold" };
  const _hoisted_85 = {
    key: 0,
    class: "text-[#e7e9ea] text-sm leading-relaxed mt-1"
  };
  const _hoisted_86 = {
    key: 1,
    class: "text-[#71767b] text-sm italic mt-1"
  };
  const _hoisted_87 = { class: "flex gap-2 mt-2 flex-wrap" };
  const _sfc_main$1 = vue.defineComponent({
    __name: "DrawPanel",
    emits: ["close"],
    setup(__props, { emit: __emit }) {
      const emit = __emit;
      const { t: t2, currentLang: currentLang2, setLang: setLang2, availableLangs, getLangName } = useI18n();
      const drawData = useDrawData();
      const { addEntry, getWinCount } = useDrawHistory();
      const { exportCsv } = useExport();
      const { show: showToast } = useToast();
      const TAB_CONFIG = [
        { key: "all", labelKey: "total", statKey: "total" },
        { key: "retweet", labelKey: "retweets", statKey: "retweets" },
        { key: "like", labelKey: "likes", statKey: "likes" },
        { key: "quote", labelKey: "quotes", statKey: "quotes" },
        { key: "followed_by", labelKey: "followingMe", statKey: "followers" }
      ];
      const activeFilter = vue.ref("all");
      const searchQuery = vue.ref("");
      const showResult = vue.ref(false);
      const showSettings = vue.ref(false);
      const showHistory = vue.ref(false);
      const showAnimation = vue.ref(false);
      const showSettingsPanel = vue.ref(false);
      const winners = vue.ref([]);
      const hoveredUser = vue.ref(null);
      const tooltipPos = vue.ref({ x: 0, y: 0 });
      const sortKey = vue.ref(null);
      const sortDir = vue.ref("asc");
      const PAGE_SIZE = LIMITS.PAGE_SIZE;
      const currentPage = vue.ref(1);
      drawData.restoreFromCache();
      const filteredUsers = vue.computed(() => {
        const users = drawData.mergedUsers.value;
        if (activeFilter.value === "all") return users;
        if (activeFilter.value === "retweet") return users.filter((u) => u.hasRetweet);
        if (activeFilter.value === "like") return users.filter((u) => u.hasLike);
        if (activeFilter.value === "quote") return users.filter((u) => u.hasQuote);
        if (activeFilter.value === "followed_by") return users.filter((u) => u.followed_by);
        return users;
      });
      const searchedUsers = vue.computed(() => {
        const q = searchQuery.value.trim().toLowerCase();
        if (!q) return filteredUsers.value;
        return filteredUsers.value.filter(
          (u) => u.username.toLowerCase().includes(q) || u.handle.toLowerCase().includes(q)
        );
      });
      const sortedUsers = vue.computed(() => {
        const users = [...searchedUsers.value];
        if (!sortKey.value) return users;
        const key = sortKey.value;
        const dir = sortDir.value === "asc" ? 1 : -1;
        return users.sort((a, b) => {
          if (key === "username") return dir * a.username.localeCompare(b.username);
          if (key === "handle") return dir * a.handle.localeCompare(b.handle);
          if (key === "followersCount") return dir * (a.followersCount - b.followersCount);
          if (key === "retweet") return dir * (Number(!!b.hasRetweet) - Number(!!a.hasRetweet));
          if (key === "like") return dir * (Number(!!b.hasLike) - Number(!!a.hasLike));
          if (key === "quote") return dir * (Number(!!b.hasQuote) - Number(!!a.hasQuote));
          if (key === "followed_by") return dir * (Number(!!b.followed_by) - Number(!!a.followed_by));
          return 0;
        });
      });
      const totalPages = vue.computed(() => Math.max(1, Math.ceil(sortedUsers.value.length / PAGE_SIZE)));
      const paginatedUsers = vue.computed(() => {
        const start = (currentPage.value - 1) * PAGE_SIZE;
        return sortedUsers.value.slice(start, start + PAGE_SIZE);
      });
      const pageOffset = vue.computed(() => (currentPage.value - 1) * PAGE_SIZE);
      vue.watch([activeFilter, sortKey, sortDir, searchQuery], () => {
        currentPage.value = 1;
      });
      vue.watch(totalPages, (tp) => {
        if (currentPage.value > tp) currentPage.value = tp;
      });
      const visiblePages = vue.computed(() => {
        const total = totalPages.value;
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        const cur = currentPage.value;
        const pages = [1];
        if (cur > 3) pages.push("..L");
        for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
        if (cur < total - 2) pages.push("..R");
        pages.push(total);
        return pages;
      });
      function toggleSort(key) {
        if (sortKey.value === key) {
          sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
        } else {
          sortKey.value = key;
          sortDir.value = "asc";
        }
      }
      function getSortIcon(key) {
        if (sortKey.value !== key) return "↕";
        return sortDir.value === "asc" ? "↑" : "↓";
      }
      const stats = vue.computed(() => ({
        total: drawData.mergedUsers.value.length,
        retweets: drawData.retweets.value.length,
        likes: drawData.likes.value.length,
        quotes: drawData.quotes.value.length,
        followers: drawData.mergedUsers.value.filter((u) => u.followed_by).length
      }));
      const now = vue.ref(Date.now());
      const cacheAgeTimer = setInterval(() => {
        now.value = Date.now();
      }, TIMING.CACHE_AGE_INTERVAL);
      vue.onUnmounted(() => clearInterval(cacheAgeTimer));
      const cacheAge = vue.computed(() => {
        if (!drawData.fetchedAt.value) return "";
        const mins = Math.floor((now.value - drawData.fetchedAt.value) / 6e4);
        return mins < 1 ? t2("justNow") : t2("minutesAgo", { count: mins });
      });
      function handleRefresh() {
        drawData.fetchInteractionData().catch((err) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          showToast(t2(err.message || "loginRequired"), "error", TIMING.TOAST_DURATION * 2);
        });
      }
      function handleDraw() {
        showSettings.value = true;
      }
      function onDrawResult(picked) {
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
      function saveDraw(picked) {
        const tweetId = drawData.lastTweetId.value;
        if (tweetId) {
          addEntry({
            tweetId,
            winners: picked,
            filters: { ...drawData.filters.value },
            totalParticipants: drawData.qualifiedUsers.value.length
          });
        }
      }
      function handleExport() {
        exportCsv({
          retweets: drawData.retweets.value,
          likes: drawData.likes.value,
          quotes: drawData.quotes.value
        });
      }
      function handleLangChange(e) {
        setLang2(e.target.value);
      }
      function onRowEnter(user, e) {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        tooltipPos.value = { x: rect.left + rect.width / 2, y: rect.top };
        hoveredUser.value = user;
      }
      function openProfile(handle) {
        window.open(`https://x.com/${handle}`, "_blank");
      }
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock(vue.Fragment, null, [
          vue.createVNode(_sfc_main$a, {
            title: vue.unref(t2)("drawHelper"),
            "max-width": "1080px",
            "max-height": "700px",
            onClose: _cache[13] || (_cache[13] = ($event) => emit("close"))
          }, {
            "header-controls": vue.withCtx(() => [
              vue.createElementVNode("select", {
                class: "xd-select text-sm",
                value: vue.unref(currentLang2),
                onChange: handleLangChange
              }, [
                (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(vue.unref(availableLangs), (lang) => {
                  return vue.openBlock(), vue.createElementBlock("option", {
                    key: lang,
                    value: lang
                  }, vue.toDisplayString(vue.unref(getLangName)(lang)), 9, _hoisted_2);
                }), 128))
              ], 40, _hoisted_1),
              vue.createElementVNode("button", {
                class: "xd-btn-icon",
                title: vue.unref(t2)("settings"),
                onClick: _cache[0] || (_cache[0] = ($event) => showSettingsPanel.value = true)
              }, [..._cache[18] || (_cache[18] = [
                vue.createElementVNode("svg", {
                  viewBox: "0 0 24 24",
                  class: "w-4 h-4",
                  fill: "currentColor"
                }, [
                  vue.createElementVNode("path", { d: "M10.54 1.75h2.92l1.57 2.36c.11.17.32.25.53.21l2.53-.59 2.17 2.17-.59 2.53c-.04.21.04.42.21.53l2.36 1.57v2.92l-2.36 1.57c-.17.11-.25.32-.21.53l.59 2.53-2.17 2.17-2.53-.59c-.21-.04-.42.04-.53.21l-1.57 2.36h-2.92l-1.57-2.36c-.11-.17-.32-.25-.53-.21l-2.53.59-2.17-2.17.59-2.53c.04-.21-.04-.42-.21-.53L1.75 13.46v-2.92l2.36-1.57c.17-.11.25-.32.21-.53l-.59-2.53 2.17-2.17 2.53.59c.21.04.42-.04.53-.21L10.54 1.75zM12 15.5c1.93 0 3.5-1.57 3.5-3.5S13.93 8.5 12 8.5 8.5 10.07 8.5 12s1.57 3.5 3.5 3.5z" })
                ], -1)
              ])], 8, _hoisted_3)
            ]),
            footer: vue.withCtx(() => [
              vue.createElementVNode("div", _hoisted_76, [
                vue.createTextVNode(vue.toDisplayString(vue.unref(t2)("madeWith")) + " ", 1),
                _cache[26] || (_cache[26] = vue.createElementVNode("a", {
                  href: "https://github.com/yueby",
                  target: "_blank",
                  class: "text-[#1d9bf0] hover:underline"
                }, "Yueby", -1))
              ])
            ]),
            default: vue.withCtx(() => [
              vue.createElementVNode("div", _hoisted_4, [
                vue.createElementVNode("div", _hoisted_5, [
                  vue.createElementVNode("span", _hoisted_6, vue.toDisplayString(vue.unref(t2)("total")), 1),
                  vue.createElementVNode("span", _hoisted_7, vue.toDisplayString(stats.value.total), 1)
                ]),
                vue.createElementVNode("div", _hoisted_8, [
                  vue.createElementVNode("span", _hoisted_9, vue.toDisplayString(vue.unref(t2)("retweets")), 1),
                  vue.createElementVNode("span", _hoisted_10, vue.toDisplayString(stats.value.retweets), 1),
                  vue.unref(drawData).loading.value ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_11, [
                    _cache[19] || (_cache[19] = vue.createElementVNode("svg", {
                      class: "animate-spin h-3 w-3 text-[#00ba7c]",
                      viewBox: "0 0 24 24",
                      fill: "none"
                    }, [
                      vue.createElementVNode("circle", {
                        class: "opacity-25",
                        cx: "12",
                        cy: "12",
                        r: "10",
                        stroke: "currentColor",
                        "stroke-width": "4"
                      }),
                      vue.createElementVNode("path", {
                        class: "opacity-75",
                        fill: "currentColor",
                        d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      })
                    ], -1)),
                    vue.createElementVNode("span", null, vue.toDisplayString(vue.unref(drawData).retweetProgress.value), 1)
                  ])) : vue.createCommentVNode("", true)
                ]),
                vue.createElementVNode("div", _hoisted_12, [
                  vue.createElementVNode("span", _hoisted_13, vue.toDisplayString(vue.unref(t2)("likes")), 1),
                  vue.createElementVNode("span", _hoisted_14, vue.toDisplayString(stats.value.likes), 1),
                  vue.unref(drawData).loading.value ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_15, [
                    _cache[20] || (_cache[20] = vue.createElementVNode("svg", {
                      class: "animate-spin h-3 w-3 text-[#f91880]",
                      viewBox: "0 0 24 24",
                      fill: "none"
                    }, [
                      vue.createElementVNode("circle", {
                        class: "opacity-25",
                        cx: "12",
                        cy: "12",
                        r: "10",
                        stroke: "currentColor",
                        "stroke-width": "4"
                      }),
                      vue.createElementVNode("path", {
                        class: "opacity-75",
                        fill: "currentColor",
                        d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      })
                    ], -1)),
                    vue.createElementVNode("span", null, vue.toDisplayString(vue.unref(drawData).likeProgress.value), 1)
                  ])) : vue.createCommentVNode("", true)
                ]),
                vue.createElementVNode("div", _hoisted_16, [
                  vue.createElementVNode("span", _hoisted_17, vue.toDisplayString(vue.unref(t2)("quotes")), 1),
                  vue.createElementVNode("span", _hoisted_18, vue.toDisplayString(stats.value.quotes), 1),
                  vue.unref(drawData).loading.value ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_19, [
                    _cache[21] || (_cache[21] = vue.createElementVNode("svg", {
                      class: "animate-spin h-3 w-3 text-[#ff7a00]",
                      viewBox: "0 0 24 24",
                      fill: "none"
                    }, [
                      vue.createElementVNode("circle", {
                        class: "opacity-25",
                        cx: "12",
                        cy: "12",
                        r: "10",
                        stroke: "currentColor",
                        "stroke-width": "4"
                      }),
                      vue.createElementVNode("path", {
                        class: "opacity-75",
                        fill: "currentColor",
                        d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      })
                    ], -1)),
                    vue.createElementVNode("span", null, vue.toDisplayString(vue.unref(drawData).quoteProgress.value), 1)
                  ])) : vue.createCommentVNode("", true)
                ]),
                vue.createElementVNode("div", _hoisted_20, [
                  vue.createElementVNode("span", _hoisted_21, vue.toDisplayString(vue.unref(t2)("followingMe")), 1),
                  vue.createElementVNode("span", _hoisted_22, vue.toDisplayString(stats.value.followers), 1)
                ])
              ]),
              vue.createElementVNode("div", _hoisted_23, [
                vue.createElementVNode("div", _hoisted_24, [
                  vue.createElementVNode("div", _hoisted_25, [
                    (vue.openBlock(), vue.createElementBlock(vue.Fragment, null, vue.renderList(TAB_CONFIG, (tab) => {
                      return vue.createElementVNode("button", {
                        key: tab.key,
                        class: vue.normalizeClass(["xd-tab", { active: activeFilter.value === tab.key }]),
                        onClick: ($event) => activeFilter.value = tab.key
                      }, [
                        vue.createTextVNode(vue.toDisplayString(vue.unref(t2)(tab.labelKey)) + " ", 1),
                        vue.createElementVNode("span", _hoisted_27, vue.toDisplayString(stats.value[tab.statKey]), 1)
                      ], 10, _hoisted_26);
                    }), 64))
                  ]),
                  vue.createElementVNode("div", _hoisted_28, [
                    vue.createElementVNode("button", {
                      class: "xd-btn xd-btn-primary text-sm",
                      onClick: handleDraw
                    }, vue.toDisplayString(vue.unref(t2)("startDraw")), 1),
                    vue.createElementVNode("button", {
                      class: "xd-btn xd-btn-secondary text-sm",
                      onClick: _cache[1] || (_cache[1] = ($event) => showHistory.value = true)
                    }, vue.toDisplayString(vue.unref(t2)("history")), 1),
                    vue.createElementVNode("button", {
                      class: "xd-btn xd-btn-secondary text-sm",
                      onClick: handleExport
                    }, vue.toDisplayString(vue.unref(t2)("export")), 1)
                  ])
                ]),
                vue.createElementVNode("div", _hoisted_29, [
                  vue.createElementVNode("div", _hoisted_30, [
                    (vue.openBlock(), vue.createElementBlock("svg", _hoisted_31, [..._cache[22] || (_cache[22] = [
                      vue.createElementVNode("path", { d: "M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z" }, null, -1)
                    ])])),
                    vue.withDirectives(vue.createElementVNode("input", {
                      "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => searchQuery.value = $event),
                      type: "text",
                      placeholder: vue.unref(t2)("search"),
                      style: { flex: "1", background: "transparent", border: "none", color: "#fff", fontSize: "14px", padding: "6px 0", outline: "none", appearance: "none" }
                    }, null, 8, _hoisted_32), [
                      [vue.vModelText, searchQuery.value]
                    ])
                  ]),
                  vue.createElementVNode("button", {
                    class: "xd-btn xd-btn-secondary shrink-0",
                    style: { fontSize: "11px", padding: "4px 10px" },
                    title: vue.unref(t2)("refresh"),
                    onClick: handleRefresh
                  }, [
                    (vue.openBlock(), vue.createElementBlock("svg", {
                      viewBox: "0 0 24 24",
                      class: vue.normalizeClass(["w-3.5 h-3.5", { "animate-spin": vue.unref(drawData).loading.value }]),
                      fill: "currentColor"
                    }, [..._cache[23] || (_cache[23] = [
                      vue.createElementVNode("path", { d: "M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" }, null, -1)
                    ])], 2)),
                    cacheAge.value ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_34, vue.toDisplayString(cacheAge.value), 1)) : vue.createCommentVNode("", true)
                  ], 8, _hoisted_33)
                ])
              ]),
              vue.createElementVNode("div", _hoisted_35, [
                vue.createElementVNode("table", _hoisted_36, [
                  vue.createElementVNode("thead", _hoisted_37, [
                    vue.createElementVNode("tr", _hoisted_38, [
                      _cache[24] || (_cache[24] = vue.createElementVNode("th", { class: "w-14 px-4 py-2.5 text-[#71767b] font-medium" }, "#", -1)),
                      vue.createElementVNode("th", {
                        class: "xd-th px-4 py-2.5",
                        onClick: _cache[3] || (_cache[3] = ($event) => toggleSort("username"))
                      }, [
                        vue.createTextVNode(vue.toDisplayString(vue.unref(t2)("username")) + " ", 1),
                        vue.createElementVNode("span", _hoisted_39, vue.toDisplayString(getSortIcon("username")), 1)
                      ]),
                      vue.createElementVNode("th", {
                        class: "xd-th w-40 px-4 py-2.5",
                        onClick: _cache[4] || (_cache[4] = ($event) => toggleSort("handle"))
                      }, [
                        vue.createTextVNode(vue.toDisplayString(vue.unref(t2)("handle")) + " ", 1),
                        vue.createElementVNode("span", _hoisted_40, vue.toDisplayString(getSortIcon("handle")), 1)
                      ]),
                      vue.createElementVNode("th", {
                        class: "xd-th w-20 px-4 py-2.5 text-center",
                        onClick: _cache[5] || (_cache[5] = ($event) => toggleSort("retweet"))
                      }, [
                        vue.createElementVNode("span", _hoisted_41, [
                          vue.createVNode(_sfc_main$7, { type: "retweet" }),
                          vue.createElementVNode("span", _hoisted_42, vue.toDisplayString(getSortIcon("retweet")), 1)
                        ])
                      ]),
                      vue.createElementVNode("th", {
                        class: "xd-th w-20 px-4 py-2.5 text-center",
                        onClick: _cache[6] || (_cache[6] = ($event) => toggleSort("like"))
                      }, [
                        vue.createElementVNode("span", _hoisted_43, [
                          vue.createVNode(_sfc_main$7, { type: "like" }),
                          vue.createElementVNode("span", _hoisted_44, vue.toDisplayString(getSortIcon("like")), 1)
                        ])
                      ]),
                      vue.createElementVNode("th", {
                        class: "xd-th w-20 px-4 py-2.5 text-center",
                        onClick: _cache[7] || (_cache[7] = ($event) => toggleSort("quote"))
                      }, [
                        vue.createElementVNode("span", _hoisted_45, [
                          vue.createVNode(_sfc_main$7, { type: "quote" }),
                          vue.createElementVNode("span", _hoisted_46, vue.toDisplayString(getSortIcon("quote")), 1)
                        ])
                      ]),
                      vue.createElementVNode("th", {
                        class: "xd-th w-20 px-4 py-2.5 text-center",
                        onClick: _cache[8] || (_cache[8] = ($event) => toggleSort("followed_by"))
                      }, [
                        vue.createElementVNode("span", _hoisted_47, [
                          vue.createVNode(_sfc_main$7, { type: "follow" }),
                          vue.createElementVNode("span", _hoisted_48, vue.toDisplayString(getSortIcon("followed_by")), 1)
                        ])
                      ]),
                      vue.createElementVNode("th", {
                        class: "xd-th w-24 px-4 py-2.5 text-center",
                        onClick: _cache[9] || (_cache[9] = ($event) => toggleSort("followersCount"))
                      }, [
                        vue.createElementVNode("span", _hoisted_49, [
                          vue.createTextVNode(vue.toDisplayString(vue.unref(t2)("followers")) + " ", 1),
                          vue.createElementVNode("span", _hoisted_50, vue.toDisplayString(getSortIcon("followersCount")), 1)
                        ])
                      ]),
                      vue.createElementVNode("th", _hoisted_51, vue.toDisplayString(vue.unref(t2)("winCount")), 1)
                    ])
                  ]),
                  vue.createElementVNode("tbody", null, [
                    (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(paginatedUsers.value, (user, i) => {
                      return vue.openBlock(), vue.createElementBlock("tr", {
                        key: user.handle,
                        class: "border-b border-[#38444d]/30 hover:bg-white/[0.03] transition-colors h-12"
                      }, [
                        vue.createElementVNode("td", _hoisted_52, vue.toDisplayString(pageOffset.value + i + 1), 1),
                        vue.createElementVNode("td", _hoisted_53, [
                          vue.createElementVNode("div", _hoisted_54, [
                            vue.createElementVNode("img", {
                              src: user.avatarUrl,
                              alt: user.username,
                              class: "w-8 h-8 rounded-full shrink-0 cursor-pointer",
                              onMouseenter: ($event) => onRowEnter(user, $event),
                              onMouseleave: _cache[10] || (_cache[10] = ($event) => hoveredUser.value = null)
                            }, null, 40, _hoisted_55),
                            vue.createElementVNode("span", {
                              class: "font-medium text-[#1d9bf0] truncate max-w-[240px] cursor-pointer hover:underline",
                              onClick: ($event) => openProfile(user.handle)
                            }, vue.toDisplayString(user.username), 9, _hoisted_56)
                          ])
                        ]),
                        vue.createElementVNode("td", _hoisted_57, "@" + vue.toDisplayString(user.handle), 1),
                        vue.createElementVNode("td", _hoisted_58, [
                          user.hasRetweet ? (vue.openBlock(), vue.createBlock(_sfc_main$6, {
                            key: 0,
                            type: "retweet"
                          })) : (vue.openBlock(), vue.createElementBlock("span", _hoisted_59, "—"))
                        ]),
                        vue.createElementVNode("td", _hoisted_60, [
                          user.hasLike ? (vue.openBlock(), vue.createBlock(_sfc_main$6, {
                            key: 0,
                            type: "like"
                          })) : (vue.openBlock(), vue.createElementBlock("span", _hoisted_61, "—"))
                        ]),
                        vue.createElementVNode("td", _hoisted_62, [
                          user.hasQuote ? (vue.openBlock(), vue.createBlock(_sfc_main$6, {
                            key: 0,
                            type: "quote"
                          })) : (vue.openBlock(), vue.createElementBlock("span", _hoisted_63, "—"))
                        ]),
                        vue.createElementVNode("td", _hoisted_64, [
                          user.followed_by ? (vue.openBlock(), vue.createBlock(_sfc_main$6, {
                            key: 0,
                            type: "follow"
                          })) : (vue.openBlock(), vue.createElementBlock("span", _hoisted_65, "—"))
                        ]),
                        vue.createElementVNode("td", _hoisted_66, vue.toDisplayString(user.followersCount.toLocaleString()), 1),
                        vue.createElementVNode("td", _hoisted_67, [
                          vue.unref(getWinCount)(user.handle) ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_68, vue.toDisplayString(vue.unref(getWinCount)(user.handle)), 1)) : (vue.openBlock(), vue.createElementBlock("span", _hoisted_69, "—"))
                        ])
                      ]);
                    }), 128)),
                    sortedUsers.value.length === 0 && vue.unref(drawData).loading.value ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 0 }, vue.renderList(8, (i) => {
                      return vue.createElementVNode("tr", {
                        key: "sk-" + i,
                        class: "border-b border-[#38444d]/30 h-12"
                      }, [..._cache[25] || (_cache[25] = [
                        vue.createElementVNode("td", { class: "w-14 px-4" }, [
                          vue.createElementVNode("div", { class: "h-3 w-6 bg-[#38444d]/50 rounded animate-pulse" })
                        ], -1),
                        vue.createElementVNode("td", { class: "px-4" }, [
                          vue.createElementVNode("div", { class: "flex items-center gap-3" }, [
                            vue.createElementVNode("div", { class: "w-8 h-8 bg-[#38444d]/50 rounded-full animate-pulse" }),
                            vue.createElementVNode("div", { class: "h-3 w-24 bg-[#38444d]/50 rounded animate-pulse" })
                          ])
                        ], -1),
                        vue.createElementVNode("td", { class: "w-40 px-4" }, [
                          vue.createElementVNode("div", { class: "h-3 w-20 bg-[#38444d]/50 rounded animate-pulse" })
                        ], -1),
                        vue.createElementVNode("td", { class: "w-20 px-4" }, [
                          vue.createElementVNode("div", { class: "h-3 w-8 mx-auto bg-[#38444d]/50 rounded animate-pulse" })
                        ], -1),
                        vue.createElementVNode("td", { class: "w-20 px-4" }, [
                          vue.createElementVNode("div", { class: "h-3 w-8 mx-auto bg-[#38444d]/50 rounded animate-pulse" })
                        ], -1),
                        vue.createElementVNode("td", { class: "w-20 px-4" }, [
                          vue.createElementVNode("div", { class: "h-3 w-8 mx-auto bg-[#38444d]/50 rounded animate-pulse" })
                        ], -1),
                        vue.createElementVNode("td", { class: "w-20 px-4" }, [
                          vue.createElementVNode("div", { class: "h-3 w-8 mx-auto bg-[#38444d]/50 rounded animate-pulse" })
                        ], -1),
                        vue.createElementVNode("td", { class: "w-24 px-4" }, [
                          vue.createElementVNode("div", { class: "h-3 w-12 mx-auto bg-[#38444d]/50 rounded animate-pulse" })
                        ], -1),
                        vue.createElementVNode("td", { class: "w-16 px-4" }, [
                          vue.createElementVNode("div", { class: "h-3 w-6 mx-auto bg-[#38444d]/50 rounded animate-pulse" })
                        ], -1)
                      ])]);
                    }), 64)) : sortedUsers.value.length === 0 ? (vue.openBlock(), vue.createElementBlock("tr", _hoisted_70, [
                      vue.createElementVNode("td", _hoisted_71, vue.toDisplayString(vue.unref(t2)("noUsers")), 1)
                    ])) : vue.createCommentVNode("", true)
                  ])
                ])
              ]),
              totalPages.value > 1 ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_72, [
                vue.createElementVNode("div", _hoisted_73, [
                  vue.createElementVNode("button", {
                    class: "xd-btn-icon",
                    style: vue.normalizeStyle({ opacity: currentPage.value <= 1 ? 0.3 : 1, pointerEvents: currentPage.value <= 1 ? "none" : "auto" }),
                    onClick: _cache[11] || (_cache[11] = ($event) => currentPage.value--)
                  }, "«", 4),
                  (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(visiblePages.value, (p) => {
                    return vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: p }, [
                      typeof p === "string" ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_74, "…")) : (vue.openBlock(), vue.createElementBlock("button", {
                        key: 1,
                        class: vue.normalizeClass(["xd-tab", { active: currentPage.value === p }]),
                        onClick: ($event) => currentPage.value = p
                      }, vue.toDisplayString(p), 11, _hoisted_75))
                    ], 64);
                  }), 128)),
                  vue.createElementVNode("button", {
                    class: "xd-btn-icon",
                    style: vue.normalizeStyle({ opacity: currentPage.value >= totalPages.value ? 0.3 : 1, pointerEvents: currentPage.value >= totalPages.value ? "none" : "auto" }),
                    onClick: _cache[12] || (_cache[12] = ($event) => currentPage.value++)
                  }, "»", 4)
                ])
              ])) : vue.createCommentVNode("", true)
            ]),
            _: 1
          }, 8, ["title"]),
          showSettings.value ? (vue.openBlock(), vue.createBlock(_sfc_main$4, {
            key: 0,
            onClose: _cache[14] || (_cache[14] = ($event) => showSettings.value = false),
            onDraw: onDrawResult
          })) : vue.createCommentVNode("", true),
          showAnimation.value ? (vue.openBlock(), vue.createBlock(_sfc_main$9, {
            key: 1,
            pool: vue.unref(drawData).mergedUsers.value,
            winners: winners.value,
            onDone: onAnimationDone
          }, null, 8, ["pool", "winners"])) : vue.createCommentVNode("", true),
          showResult.value ? (vue.openBlock(), vue.createBlock(_sfc_main$5, {
            key: 2,
            winners: winners.value,
            onClose: _cache[15] || (_cache[15] = ($event) => showResult.value = false)
          }, null, 8, ["winners"])) : vue.createCommentVNode("", true),
          showHistory.value ? (vue.openBlock(), vue.createBlock(_sfc_main$8, {
            key: 3,
            onClose: _cache[16] || (_cache[16] = ($event) => showHistory.value = false)
          })) : vue.createCommentVNode("", true),
          showSettingsPanel.value ? (vue.openBlock(), vue.createBlock(_sfc_main$3, {
            key: 4,
            onClose: _cache[17] || (_cache[17] = ($event) => showSettingsPanel.value = false)
          })) : vue.createCommentVNode("", true),
          vue.createVNode(Toast),
          hoveredUser.value ? (vue.openBlock(), vue.createElementBlock("div", {
            key: 5,
            class: "fixed z-[10000] w-72 bg-[#1e2d3d] border border-[#38444d] rounded-xl shadow-xl p-4 pointer-events-none",
            style: vue.normalizeStyle({ left: tooltipPos.value.x + "px", top: tooltipPos.value.y - 8 + "px", transform: "translateY(-100%)" })
          }, [
            vue.createElementVNode("div", _hoisted_77, [
              vue.createElementVNode("img", {
                src: hoveredUser.value.avatarUrl,
                alt: hoveredUser.value.username,
                class: "w-12 h-12 rounded-full shrink-0"
              }, null, 8, _hoisted_78),
              vue.createElementVNode("div", _hoisted_79, [
                vue.createElementVNode("div", _hoisted_80, vue.toDisplayString(hoveredUser.value.username), 1),
                vue.createElementVNode("div", _hoisted_81, "@" + vue.toDisplayString(hoveredUser.value.handle), 1)
              ])
            ]),
            vue.createElementVNode("div", _hoisted_82, [
              vue.createElementVNode("span", null, [
                vue.createElementVNode("span", _hoisted_83, vue.toDisplayString(hoveredUser.value.followingCount.toLocaleString()), 1),
                vue.createTextVNode(" " + vue.toDisplayString(vue.unref(t2)("followingLabel")), 1)
              ]),
              vue.createElementVNode("span", null, [
                vue.createElementVNode("span", _hoisted_84, vue.toDisplayString(hoveredUser.value.followersCount.toLocaleString()), 1),
                vue.createTextVNode(" " + vue.toDisplayString(vue.unref(t2)("followers")), 1)
              ])
            ]),
            hoveredUser.value.bio ? (vue.openBlock(), vue.createElementBlock("p", _hoisted_85, vue.toDisplayString(hoveredUser.value.bio), 1)) : (vue.openBlock(), vue.createElementBlock("p", _hoisted_86, vue.toDisplayString(vue.unref(t2)("noBio")), 1)),
            vue.createElementVNode("div", _hoisted_87, [
              hoveredUser.value.hasRetweet ? (vue.openBlock(), vue.createBlock(_sfc_main$6, {
                key: 0,
                type: "retweet",
                label: vue.unref(t2)("retweetType")
              }, null, 8, ["label"])) : vue.createCommentVNode("", true),
              hoveredUser.value.hasLike ? (vue.openBlock(), vue.createBlock(_sfc_main$6, {
                key: 1,
                type: "like",
                label: vue.unref(t2)("likeType")
              }, null, 8, ["label"])) : vue.createCommentVNode("", true),
              hoveredUser.value.hasQuote ? (vue.openBlock(), vue.createBlock(_sfc_main$6, {
                key: 2,
                type: "quote",
                label: vue.unref(t2)("quoteType")
              }, null, 8, ["label"])) : vue.createCommentVNode("", true),
              hoveredUser.value.followed_by ? (vue.openBlock(), vue.createBlock(_sfc_main$6, {
                key: 3,
                type: "follow",
                label: vue.unref(t2)("followingYou")
              }, null, 8, ["label"])) : vue.createCommentVNode("", true)
            ])
          ], 4)) : vue.createCommentVNode("", true)
        ], 64);
      };
    }
  });
  const ACTION_BAR_SELECTOR = 'article[data-testid="tweet"] div[role="group"]';
  const TRIGGER_ID = "x-draw-helper-trigger";
  const _sfc_main = vue.defineComponent({
    __name: "App",
    setup(__props) {
      const TWEET_URL_PATTERN = /https:\/\/x\.com\/[^/]+\/status\/\d+/;
      const isValidPage = vue.ref(false);
      const showPanel = vue.ref(false);
      let triggerContainer = null;
      let triggerApp = null;
      let observer = null;
      let lastUrl = "";
      function injectTrigger() {
        removeTrigger();
        const actionBar = document.querySelector(ACTION_BAR_SELECTOR);
        if (!actionBar) return;
        triggerContainer = document.createElement("div");
        triggerContainer.id = TRIGGER_ID;
        triggerContainer.style.display = "flex";
        triggerContainer.style.alignItems = "center";
        actionBar.appendChild(triggerContainer);
        triggerApp = vue.createApp({
          render: () => vue.h(_sfc_main$b, {
            onClick: () => {
              showPanel.value = true;
            }
          })
        });
        triggerApp.mount(triggerContainer);
      }
      function removeTrigger() {
        if (triggerApp) {
          triggerApp.unmount();
          triggerApp = null;
        }
        const existing = document.getElementById(TRIGGER_ID);
        if (existing) existing.remove();
        triggerContainer = null;
      }
      function checkUrl() {
        const valid = TWEET_URL_PATTERN.test(window.location.href);
        isValidPage.value = valid;
        if (!valid) {
          showPanel.value = false;
          removeTrigger();
        } else {
          vue.nextTick(() => {
            setTimeout(injectTrigger, 500);
          });
        }
      }
      vue.onMounted(() => {
        lastUrl = window.location.href;
        checkUrl();
        observer = new MutationObserver(() => {
          if (window.location.href !== lastUrl) {
            lastUrl = window.location.href;
            checkUrl();
          }
          if (isValidPage.value && !document.getElementById(TRIGGER_ID)) {
            injectTrigger();
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
      });
      vue.onUnmounted(() => {
        observer?.disconnect();
        removeTrigger();
      });
      function closePanel() {
        showPanel.value = false;
      }
      return (_ctx, _cache) => {
        return showPanel.value ? (vue.openBlock(), vue.createBlock(_sfc_main$1, {
          key: 0,
          onClose: closePanel
        })) : vue.createCommentVNode("", true);
      };
    }
  });
  const styleCss = `/*! tailwindcss v4.2.2 | MIT License | https://tailwindcss.com */@layer properties{@supports (((-webkit-hyphens:none)) and (not (margin-trim:inline))) or ((-moz-orient:inline) and (not (color:rgb(from red r g b)))){*,:before,:after,::backdrop{--tw-translate-x:0;--tw-translate-y:0;--tw-translate-z:0;--tw-rotate-x:initial;--tw-rotate-y:initial;--tw-rotate-z:initial;--tw-skew-x:initial;--tw-skew-y:initial;--tw-space-y-reverse:0;--tw-border-style:solid;--tw-leading:initial;--tw-font-weight:initial;--tw-shadow:0 0 #0000;--tw-shadow-color:initial;--tw-shadow-alpha:100%;--tw-inset-shadow:0 0 #0000;--tw-inset-shadow-color:initial;--tw-inset-shadow-alpha:100%;--tw-ring-color:initial;--tw-ring-shadow:0 0 #0000;--tw-inset-ring-color:initial;--tw-inset-ring-shadow:0 0 #0000;--tw-ring-inset:initial;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-offset-shadow:0 0 #0000;--tw-outline-style:solid;--tw-duration:initial}}}@layer theme{:root,:host{--font-sans:ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";--font-mono:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;--color-white:#fff;--spacing:.25rem;--text-xs:.75rem;--text-xs--line-height:calc(1 / .75);--text-sm:.875rem;--text-sm--line-height:calc(1.25 / .875);--text-xl:1.25rem;--text-xl--line-height:calc(1.75 / 1.25);--font-weight-medium:500;--font-weight-bold:700;--leading-relaxed:1.625;--radius-lg:.5rem;--radius-xl:.75rem;--animate-spin:spin 1s linear infinite;--animate-pulse:pulse 2s cubic-bezier(.4, 0, .6, 1) infinite;--default-transition-duration:.15s;--default-transition-timing-function:cubic-bezier(.4, 0, .2, 1);--default-font-family:var(--font-sans);--default-mono-font-family:var(--font-mono)}}@layer base{*,:after,:before,::backdrop{box-sizing:border-box;border:0 solid;margin:0;padding:0}::file-selector-button{box-sizing:border-box;border:0 solid;margin:0;padding:0}html,:host{-webkit-text-size-adjust:100%;tab-size:4;line-height:1.5;font-family:var(--default-font-family,ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji");font-feature-settings:var(--default-font-feature-settings,normal);font-variation-settings:var(--default-font-variation-settings,normal);-webkit-tap-highlight-color:transparent}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;-webkit-text-decoration:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:var(--default-mono-font-family,ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace);font-feature-settings:var(--default-mono-font-feature-settings,normal);font-variation-settings:var(--default-mono-font-variation-settings,normal);font-size:1em}small{font-size:80%}sub,sup{vertical-align:baseline;font-size:75%;line-height:0;position:relative}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}:-moz-focusring{outline:auto}progress{vertical-align:baseline}summary{display:list-item}ol,ul,menu{list-style:none}img,svg,video,canvas,audio,iframe,embed,object{vertical-align:middle;display:block}img,video{max-width:100%;height:auto}button,input,select,optgroup,textarea{font:inherit;font-feature-settings:inherit;font-variation-settings:inherit;letter-spacing:inherit;color:inherit;opacity:1;background-color:#0000;border-radius:0}::file-selector-button{font:inherit;font-feature-settings:inherit;font-variation-settings:inherit;letter-spacing:inherit;color:inherit;opacity:1;background-color:#0000;border-radius:0}:where(select:is([multiple],[size])) optgroup{font-weight:bolder}:where(select:is([multiple],[size])) optgroup option{padding-inline-start:20px}::file-selector-button{margin-inline-end:4px}::placeholder{opacity:1}@supports (not ((-webkit-appearance:-apple-pay-button))) or (contain-intrinsic-size:1px){::placeholder{color:currentColor}@supports (color:color-mix(in lab,red,red)){::placeholder{color:color-mix(in oklab,currentcolor 50%,transparent)}}}textarea{resize:vertical}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-date-and-time-value{min-height:1lh;text-align:inherit}::-webkit-datetime-edit{display:inline-flex}::-webkit-datetime-edit-fields-wrapper{padding:0}::-webkit-datetime-edit{padding-block:0}::-webkit-datetime-edit-year-field{padding-block:0}::-webkit-datetime-edit-month-field{padding-block:0}::-webkit-datetime-edit-day-field{padding-block:0}::-webkit-datetime-edit-hour-field{padding-block:0}::-webkit-datetime-edit-minute-field{padding-block:0}::-webkit-datetime-edit-second-field{padding-block:0}::-webkit-datetime-edit-millisecond-field{padding-block:0}::-webkit-datetime-edit-meridiem-field{padding-block:0}::-webkit-calendar-picker-indicator{line-height:1}:-moz-ui-invalid{box-shadow:none}button,input:where([type=button],[type=reset],[type=submit]){appearance:button}::file-selector-button{appearance:button}::-webkit-inner-spin-button{height:auto}::-webkit-outer-spin-button{height:auto}[hidden]:where(:not([hidden=until-found])){display:none!important}}@layer components;@layer utilities{.pointer-events-none{pointer-events:none}.fixed{position:fixed}.sticky{position:sticky}.inset-0{inset:calc(var(--spacing) * 0)}.start{inset-inline-start:var(--spacing)}.top-0{top:calc(var(--spacing) * 0)}.top-4{top:calc(var(--spacing) * 4)}.left-1\\/2{left:50%}.z-\\[1\\]{z-index:1}.z-\\[10000\\]{z-index:10000}.z-\\[99999\\]{z-index:99999}.mx-auto{margin-inline:auto}.mt-0\\.5{margin-top:calc(var(--spacing) * .5)}.mt-1{margin-top:calc(var(--spacing) * 1)}.mt-2{margin-top:calc(var(--spacing) * 2)}.mb-2{margin-bottom:calc(var(--spacing) * 2)}.mb-3{margin-bottom:calc(var(--spacing) * 3)}.ml-1{margin-left:calc(var(--spacing) * 1)}.block{display:block}.flex{display:flex}.grid{display:grid}.inline-flex{display:inline-flex}.h-3{height:calc(var(--spacing) * 3)}.h-3\\.5{height:calc(var(--spacing) * 3.5)}.h-4{height:calc(var(--spacing) * 4)}.h-5{height:calc(var(--spacing) * 5)}.h-6{height:calc(var(--spacing) * 6)}.h-8{height:calc(var(--spacing) * 8)}.h-12{height:calc(var(--spacing) * 12)}.h-14{height:calc(var(--spacing) * 14)}.h-\\[18\\.75px\\]{height:18.75px}.h-\\[34\\.75px\\]{height:34.75px}.h-full{height:100%}.min-h-0{min-height:calc(var(--spacing) * 0)}.w-3{width:calc(var(--spacing) * 3)}.w-3\\.5{width:calc(var(--spacing) * 3.5)}.w-4{width:calc(var(--spacing) * 4)}.w-5{width:calc(var(--spacing) * 5)}.w-6{width:calc(var(--spacing) * 6)}.w-8{width:calc(var(--spacing) * 8)}.w-12{width:calc(var(--spacing) * 12)}.w-14{width:calc(var(--spacing) * 14)}.w-16{width:calc(var(--spacing) * 16)}.w-20{width:calc(var(--spacing) * 20)}.w-24{width:calc(var(--spacing) * 24)}.w-40{width:calc(var(--spacing) * 40)}.w-72{width:calc(var(--spacing) * 72)}.w-\\[18\\.75px\\]{width:18.75px}.w-\\[34\\.75px\\]{width:34.75px}.w-full{width:100%}.max-w-\\[240px\\]{max-width:240px}.min-w-0{min-width:calc(var(--spacing) * 0)}.flex-1{flex:1}.flex-shrink{flex-shrink:1}.shrink-0{flex-shrink:0}.border-collapse{border-collapse:collapse}.-translate-x-1\\/2{--tw-translate-x: -50% ;translate:var(--tw-translate-x) var(--tw-translate-y)}.transform{transform:var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,)}.animate-pulse{animation:var(--animate-pulse)}.animate-spin{animation:var(--animate-spin)}.cursor-pointer{cursor:pointer}.resize-none{resize:none}.flex-col{flex-direction:column}.flex-wrap{flex-wrap:wrap}.items-center{align-items:center}.items-start{align-items:flex-start}.justify-between{justify-content:space-between}.justify-center{justify-content:center}.gap-1{gap:calc(var(--spacing) * 1)}.gap-1\\.5{gap:calc(var(--spacing) * 1.5)}.gap-2{gap:calc(var(--spacing) * 2)}.gap-3{gap:calc(var(--spacing) * 3)}.gap-4{gap:calc(var(--spacing) * 4)}.gap-6{gap:calc(var(--spacing) * 6)}:where(.space-y-3>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(calc(var(--spacing) * 3) * var(--tw-space-y-reverse));margin-block-end:calc(calc(var(--spacing) * 3) * calc(1 - var(--tw-space-y-reverse)))}:where(.space-y-6>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(calc(var(--spacing) * 6) * var(--tw-space-y-reverse));margin-block-end:calc(calc(var(--spacing) * 6) * calc(1 - var(--tw-space-y-reverse)))}.truncate{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.overflow-auto{overflow:auto}.rounded{border-radius:.25rem}.rounded-full{border-radius:3.40282e38px}.rounded-lg{border-radius:var(--radius-lg)}.rounded-xl{border-radius:var(--radius-xl)}.border{border-style:var(--tw-border-style);border-width:1px}.border-t{border-top-style:var(--tw-border-style);border-top-width:1px}.border-r{border-right-style:var(--tw-border-style);border-right-width:1px}.border-b{border-bottom-style:var(--tw-border-style);border-bottom-width:1px}.border-\\[\\#38444d\\]{border-color:#38444d}.border-\\[\\#38444d\\]\\/30{border-color:#38444d4d}.border-\\[\\#38444d\\]\\/50{border-color:#38444d80}.bg-\\[\\#00ba7c\\]{background-color:#00ba7c}.bg-\\[\\#1d9bf0\\]{background-color:#1d9bf0}.bg-\\[\\#1e2d3d\\]{background-color:#1e2d3d}.bg-\\[\\#1e2d3d\\]\\/50{background-color:#1e2d3d80}.bg-\\[\\#3d1f00\\]{background-color:#3d1f00}.bg-\\[\\#15202b\\]{background-color:#15202b}.bg-\\[\\#38444d\\]\\/50{background-color:#38444d80}.bg-\\[\\#273340\\]{background-color:#273340}.bg-\\[\\#f4212e\\]{background-color:#f4212e}.p-3{padding:calc(var(--spacing) * 3)}.p-4{padding:calc(var(--spacing) * 4)}.p-5{padding:calc(var(--spacing) * 5)}.p-8{padding:calc(var(--spacing) * 8)}.px-1{padding-inline:calc(var(--spacing) * 1)}.px-2{padding-inline:calc(var(--spacing) * 2)}.px-3{padding-inline:calc(var(--spacing) * 3)}.px-4{padding-inline:calc(var(--spacing) * 4)}.px-5{padding-inline:calc(var(--spacing) * 5)}.py-0\\.5{padding-block:calc(var(--spacing) * .5)}.py-1\\.5{padding-block:calc(var(--spacing) * 1.5)}.py-2{padding-block:calc(var(--spacing) * 2)}.py-2\\.5{padding-block:calc(var(--spacing) * 2.5)}.py-3{padding-block:calc(var(--spacing) * 3)}.py-4{padding-block:calc(var(--spacing) * 4)}.py-12{padding-block:calc(var(--spacing) * 12)}.pb-2{padding-bottom:calc(var(--spacing) * 2)}.pb-3{padding-bottom:calc(var(--spacing) * 3)}.pb-4{padding-bottom:calc(var(--spacing) * 4)}.text-center{text-align:center}.text-left{text-align:left}.text-sm{font-size:var(--text-sm);line-height:var(--tw-leading,var(--text-sm--line-height))}.text-xl{font-size:var(--text-xl);line-height:var(--tw-leading,var(--text-xl--line-height))}.text-xs{font-size:var(--text-xs);line-height:var(--tw-leading,var(--text-xs--line-height))}.text-\\[10px\\]{font-size:10px}.text-\\[11px\\]{font-size:11px}.leading-relaxed{--tw-leading:var(--leading-relaxed);line-height:var(--leading-relaxed)}.font-bold{--tw-font-weight:var(--font-weight-bold);font-weight:var(--font-weight-bold)}.font-medium{--tw-font-weight:var(--font-weight-medium);font-weight:var(--font-weight-medium)}.whitespace-nowrap{white-space:nowrap}.text-\\[\\#00ba7c\\]{color:#00ba7c}.text-\\[\\#1d9bf0\\]{color:#1d9bf0}.text-\\[\\#38444d\\]{color:#38444d}.text-\\[\\#71767b\\]{color:#71767b}.text-\\[\\#e7e9ea\\]{color:#e7e9ea}.text-\\[\\#f4212e\\]{color:#f4212e}.text-\\[\\#f91880\\]{color:#f91880}.text-\\[\\#ff7a00\\]{color:#ff7a00}.text-\\[\\#ffd700\\]{color:gold}.text-white{color:var(--color-white)}.italic{font-style:italic}.opacity-25{opacity:.25}.opacity-50{opacity:.5}.opacity-60{opacity:.6}.opacity-70{opacity:.7}.opacity-75{opacity:.75}.shadow-lg{--tw-shadow:0 10px 15px -3px var(--tw-shadow-color,#0000001a), 0 4px 6px -4px var(--tw-shadow-color,#0000001a);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.shadow-xl{--tw-shadow:0 20px 25px -5px var(--tw-shadow-color,#0000001a), 0 8px 10px -6px var(--tw-shadow-color,#0000001a);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.outline{outline-style:var(--tw-outline-style);outline-width:1px}.transition{transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to,opacity,box-shadow,transform,translate,scale,rotate,filter,-webkit-backdrop-filter,backdrop-filter,display,content-visibility,overlay,pointer-events;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-all{transition-property:all;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-colors{transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.duration-150{--tw-duration:.15s;transition-duration:.15s}@media (hover:hover){.group-hover\\:text-\\[\\#1d9bf0\\]:is(:where(.group):hover *){color:#1d9bf0}.hover\\:bg-\\[\\#1d9bf0\\]\\/10:hover{background-color:#1d9bf01a}.hover\\:bg-\\[\\#38444d\\]:hover{background-color:#38444d}.hover\\:bg-\\[\\#273340\\]\\/50:hover{background-color:#27334080}.hover\\:bg-white\\/\\[0\\.03\\]:hover{background-color:#ffffff08}@supports (color:color-mix(in lab,red,red)){.hover\\:bg-white\\/\\[0\\.03\\]:hover{background-color:color-mix(in oklab,var(--color-white) 3%,transparent)}}.hover\\:text-\\[\\#1d9bf0\\]:hover{color:#1d9bf0}.hover\\:underline:hover{text-decoration-line:underline}}}#x-draw-helper{--xd-bg:#15202b;--xd-bg-elevated:#1e2d3d;--xd-bg-secondary:#273340;--xd-border:#38444d;--xd-text:#e7e9ea;--xd-text-muted:#71767b;--xd-blue:#1d9bf0;--xd-blue-hover:#1a8cd8;--xd-green:#00ba7c;--xd-green-hover:#00a36d;--xd-pink:#f91880;--xd-pink-hover:#e0167a;color:var(--xd-text);font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif}#x-draw-helper .xd-btn{cursor:pointer;white-space:nowrap;box-sizing:border-box;appearance:none;border:none;border-radius:9999px;outline:none;justify-content:center;align-items:center;gap:6px;padding:6px 16px;font-size:14px;font-weight:700;line-height:20px;text-decoration:none;transition:background-color .2s,opacity .2s;display:inline-flex}#x-draw-helper .xd-btn-primary{background-color:var(--xd-blue);color:#fff}#x-draw-helper .xd-btn-primary:hover{background-color:var(--xd-blue-hover)}#x-draw-helper .xd-btn-success{background-color:var(--xd-green);color:#fff}#x-draw-helper .xd-btn-success:hover{background-color:var(--xd-green-hover)}#x-draw-helper .xd-btn-ghost{color:var(--xd-text);background-color:#0000}#x-draw-helper .xd-btn-ghost:hover{background-color:#ffffff1a}#x-draw-helper .xd-btn-secondary{background-color:var(--xd-bg-secondary);color:var(--xd-text)}#x-draw-helper .xd-btn-secondary:hover{background-color:var(--xd-border)}#x-draw-helper .xd-btn-icon{width:32px;height:32px;color:var(--xd-text-muted);cursor:pointer;appearance:none;background:0 0;border:none;border-radius:50%;justify-content:center;align-items:center;padding:0;font-size:18px;line-height:1;transition:background-color .2s,color .2s;display:inline-flex}#x-draw-helper .xd-btn-icon:hover{color:#fff;background-color:#ffffff1a}#x-draw-helper .xd-input{background-color:var(--xd-bg-secondary);border:1px solid var(--xd-border);color:#fff;box-sizing:border-box;-webkit-appearance:none;appearance:textfield;border-radius:6px;outline:none;padding:6px 10px;font-size:14px;line-height:20px;transition:border-color .2s}#x-draw-helper .xd-input::-webkit-inner-spin-button{opacity:1}#x-draw-helper .xd-input::-webkit-outer-spin-button{opacity:1}#x-draw-helper .xd-input:focus{border-color:var(--xd-blue)}#x-draw-helper .xd-select{background-color:var(--xd-bg-secondary);border:1px solid var(--xd-border);color:#fff;cursor:pointer;box-sizing:border-box;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371767b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");background-position:right 8px center;background-repeat:no-repeat;border-radius:6px;outline:none;padding:6px 28px 6px 10px;font-size:14px;line-height:20px;transition:border-color .2s}#x-draw-helper .xd-select:focus{border-color:var(--xd-blue)}#x-draw-helper .xd-select option{background-color:var(--xd-bg-secondary);color:#fff}#x-draw-helper .xd-tab-group{background-color:var(--xd-bg-secondary);border-radius:8px;gap:2px;padding:3px;display:inline-flex}#x-draw-helper .xd-tab{color:var(--xd-text);cursor:pointer;white-space:nowrap;appearance:none;background:0 0;border:none;border-radius:6px;padding:6px 12px;font-size:12px;line-height:16px;transition:background-color .2s,color .2s}#x-draw-helper .xd-tab:hover:not(.active){background-color:#ffffff0d}#x-draw-helper .xd-tab.active{background-color:var(--xd-blue);color:#fff}#x-draw-helper .xd-badge{border-radius:9999px;justify-content:center;align-items:center;gap:4px;padding:3px 8px;font-size:12px;font-weight:500;line-height:16px;display:inline-flex}#x-draw-helper .xd-badge-green{color:var(--xd-green);background-color:#00ba7c26}#x-draw-helper .xd-badge-pink{color:var(--xd-pink);background-color:#f9188026}#x-draw-helper .xd-badge-blue{color:var(--xd-blue);background-color:#1d9bf026}#x-draw-helper .xd-badge-orange{color:#ff7a00;background-color:#ff7a0026}#x-draw-helper .xd-th{cursor:pointer;-webkit-user-select:none;user-select:none;color:var(--xd-text-muted);font-weight:500;transition:color .2s}#x-draw-helper .xd-th:hover{color:#fff}#x-draw-helper .xd-checkbox{border:2px solid var(--xd-border);cursor:pointer;appearance:none;background:0 0;border-radius:4px;flex-shrink:0;width:18px;height:18px;transition:background-color .2s,border-color .2s;position:relative}#x-draw-helper .xd-checkbox:checked{background-color:var(--xd-blue);border-color:var(--xd-blue)}#x-draw-helper .xd-checkbox:checked:after{content:"";border:2px solid #fff;border-width:0 2px 2px 0;width:6px;height:10px;position:absolute;top:1px;left:4px;transform:rotate(45deg)}#x-draw-helper ::-webkit-scrollbar{width:6px}#x-draw-helper ::-webkit-scrollbar-track{background:0 0}#x-draw-helper ::-webkit-scrollbar-thumb{background-color:var(--xd-border);border-radius:3px}#x-draw-helper ::-webkit-scrollbar-thumb:hover{background-color:var(--xd-text-muted)}@property --tw-translate-x{syntax:"*";inherits:false;initial-value:0}@property --tw-translate-y{syntax:"*";inherits:false;initial-value:0}@property --tw-translate-z{syntax:"*";inherits:false;initial-value:0}@property --tw-rotate-x{syntax:"*";inherits:false}@property --tw-rotate-y{syntax:"*";inherits:false}@property --tw-rotate-z{syntax:"*";inherits:false}@property --tw-skew-x{syntax:"*";inherits:false}@property --tw-skew-y{syntax:"*";inherits:false}@property --tw-space-y-reverse{syntax:"*";inherits:false;initial-value:0}@property --tw-border-style{syntax:"*";inherits:false;initial-value:solid}@property --tw-leading{syntax:"*";inherits:false}@property --tw-font-weight{syntax:"*";inherits:false}@property --tw-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-shadow-color{syntax:"*";inherits:false}@property --tw-shadow-alpha{syntax:"<percentage>";inherits:false;initial-value:100%}@property --tw-inset-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-inset-shadow-color{syntax:"*";inherits:false}@property --tw-inset-shadow-alpha{syntax:"<percentage>";inherits:false;initial-value:100%}@property --tw-ring-color{syntax:"*";inherits:false}@property --tw-ring-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-inset-ring-color{syntax:"*";inherits:false}@property --tw-inset-ring-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-ring-inset{syntax:"*";inherits:false}@property --tw-ring-offset-width{syntax:"<length>";inherits:false;initial-value:0}@property --tw-ring-offset-color{syntax:"*";inherits:false;initial-value:#fff}@property --tw-ring-offset-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-outline-style{syntax:"*";inherits:false;initial-value:solid}@property --tw-duration{syntax:"*";inherits:false}@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{50%{opacity:.5}}`;
  importCSS(styleCss);
  initTxIdCapture();
  function initApp() {
    vue.createApp(_sfc_main).mount(
      (() => {
        const app = document.createElement("div");
        app.id = "x-draw-helper";
        document.body.append(app);
        return app;
      })()
    );
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }

})(Vue);