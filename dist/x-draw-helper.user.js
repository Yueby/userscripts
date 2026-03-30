// ==UserScript==
// @name               X Draw Helper
// @name:zh-CN         X(推特) 抽奖助手
// @name:ja            X 抽選ツール
// @namespace          yueby.x-draw-helper
// @version            0.0.2
// @author             Yueby
// @description        A userscript for conducting draws on X (Twitter) posts
// @description:zh-CN  X(推特) 推文抽奖助手，支持转发/点赞用户筛选、随机抽奖、结果通知
// @description:ja     X(Twitter)の投稿で抽選を行うためのユーザースクリプト
// @match              https://x.com/*
// @match              https://twitter.com/*
// @require            https://cdn.jsdelivr.net/npm/vue@3.5.31/dist/vue.global.prod.js
// @grant              GM_addStyle
// @grant              GM_getValue
// @grant              GM_openInTab
// @grant              GM_setValue
// @grant              unsafeWindow
// @run-at             document-start
// ==/UserScript==

(function (vue) {
  'use strict';

  const d=new Set;const importCSS = async e=>{d.has(e)||(d.add(e),(t=>{typeof GM_addStyle=="function"?GM_addStyle(t):document.head.appendChild(document.createElement("style")).append(t);})(e));};

  const _sfc_main$5 = vue.defineComponent({
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
      screenshot: "Screenshot",
      openChats: "Open Chats",
      popupBlocked: "Some chat tabs were blocked. Please allow pop-ups for x.com and try again.",
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
      screenshot: "截图",
      openChats: "打开聊天",
      popupBlocked: "部分聊天标签页被浏览器拦截，请允许 x.com 弹窗后重试。",
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
      screenshot: "スクリーンショット",
      openChats: "チャットを開く",
      popupBlocked: "一部のチャットタブがブロックされました。x.com のポップアップを許可して再試行してください。",
      langName: "日本語"
    }
  };
  const STORAGE_KEY = "x-draw-helper-lang";
  const AVAILABLE_LANGS = ["en", "zh", "ja"];
  const currentLang = vue.ref(
    localStorage.getItem(STORAGE_KEY) || "en"
  );
  function t(key, params = {}) {
    const text = LANGUAGES[currentLang.value][key] || LANGUAGES.en[key] || key;
    return text.replace(/\$\{(\w+)\}/g, (_, p) => String(params[p] ?? ""));
  }
  function setLang(lang) {
    currentLang.value = lang;
    localStorage.setItem(STORAGE_KEY, lang);
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
  var _GM_getValue = (() => typeof GM_getValue != "undefined" ? GM_getValue : void 0)();
  var _GM_setValue = (() => typeof GM_setValue != "undefined" ? GM_setValue : void 0)();
  const LOG$1 = "[x-draw]";
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
          console.warn(LOG$1, "txId: meta key not found");
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
          console.warn(LOG$1, "txId: ondemand URL not found");
          return false;
        }
        const text = await (await this.pFetch(onDemandUrl)).text();
        const indices = [];
        _INDICES_RE.lastIndex = 0;
        let m;
        while ((m = _INDICES_RE.exec(text)) !== null) indices.push(parseInt(m[1], 10));
        if (!indices.length) {
          console.warn(LOG$1, "txId: no indices in ondemand script");
          return false;
        }
        this.defRowIdx = indices[0];
        this.defByteIndices = indices.slice(1);
        this.animKey = this._buildAnimKey(animDoc);
        this.ready = !!this.animKey;
        if (!this.ready) console.warn(LOG$1, "txId: animKey empty");
        return this.ready;
      } catch (e) {
        console.warn(LOG$1, "txId init failed:", e);
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
  const LOG = "[x-draw]";
  const BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";
  const SEARCH_FEATURES = {
    rweb_video_screen_enabled: false,
    profile_label_improvements_pcf_label_in_post_enabled: true,
    responsive_web_profile_redirect_enabled: false,
    rweb_tipjar_consumption_enabled: false,
    verified_phone_label_enabled: false,
    creator_subscriptions_tweet_preview_api_enabled: true,
    responsive_web_graphql_timeline_navigation_enabled: true,
    responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
    premium_content_api_read_enabled: false,
    communities_web_enable_tweet_community_results_fetch: true,
    c9s_tweet_anatomy_moderator_badge_enabled: true,
    responsive_web_grok_analyze_button_fetch_trends_enabled: false,
    responsive_web_grok_analyze_post_followups_enabled: true,
    responsive_web_jetfuel_frame: true,
    responsive_web_grok_share_attachment_enabled: true,
    responsive_web_grok_annotations_enabled: true,
    articles_preview_enabled: true,
    responsive_web_edit_tweet_api_enabled: true,
    graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
    view_counts_everywhere_api_enabled: true,
    longform_notetweets_consumption_enabled: true,
    responsive_web_twitter_article_tweet_consumption_enabled: true,
    content_disclosure_indicator_enabled: true,
    content_disclosure_ai_generated_indicator_enabled: true,
    responsive_web_grok_show_grok_translated_post: false,
    responsive_web_grok_analysis_button_from_backend: true,
    post_ctas_fetch_enabled: false,
    freedom_of_speech_not_reach_fetch_enabled: true,
    standardized_nudges_misinfo: true,
    tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
    longform_notetweets_rich_text_read_enabled: true,
    longform_notetweets_inline_media_enabled: false,
    responsive_web_grok_image_annotation_enabled: true,
    responsive_web_grok_imagine_annotation_enabled: true,
    responsive_web_grok_community_note_auto_translation_is_enabled: false,
    responsive_web_enhance_cards_enabled: false
  };
  const GRAPHQL_FEATURES = {
    profile_label_improvements_pcf_label_in_post_enabled: true,
    rweb_tipjar_consumption_enabled: true,
    responsive_web_graphql_exclude_directive_enabled: true,
    verified_phone_label_enabled: false,
    creator_subscriptions_tweet_preview_api_enabled: true,
    responsive_web_graphql_timeline_navigation_enabled: true,
    responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
    premium_content_api_read_enabled: false,
    communities_web_enable_tweet_community_results_fetch: true,
    c9s_tweet_anatomy_moderator_badge_enabled: true,
    responsive_web_grok_analyze_button_fetch_trends_enabled: false,
    responsive_web_grok_analyze_post_followups_enabled: false,
    responsive_web_jetfuel_frame: false,
    responsive_web_grok_share_attachment_enabled: true,
    articles_preview_enabled: true,
    responsive_web_edit_tweet_api_enabled: true,
    graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
    view_counts_everywhere_api_enabled: true,
    longform_notetweets_consumption_enabled: true,
    responsive_web_twitter_article_tweet_consumption_enabled: true,
    tweet_awards_web_tipping_enabled: false,
    responsive_web_grok_analysis_button_from_backend: true,
    creator_subscriptions_quote_tweet_preview_enabled: false,
    freedom_of_speech_not_reach_fetch_enabled: true,
    standardized_nudges_misinfo: true,
    tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
    rweb_video_timestamps_enabled: true,
    longform_notetweets_rich_text_read_enabled: true,
    longform_notetweets_inline_media_enabled: true,
    responsive_web_grok_image_annotation_enabled: false,
    responsive_web_enhance_cards_enabled: false
  };
  const ENDPOINTS = {
    retweeters: "niCJ2QyTuAgZWv01E7mqJQ/Retweeters",
    favoriters: "aLZ5wrqDYuDm9c_xNl667w/Favoriters",
    searchTimeline: "GcXk9vN_d1jUfHNqLacXQA/SearchTimeline"
  };
  let _endpointsPromise = null;
  async function initEndpoints() {
    if (_endpointsPromise) return _endpointsPromise;
    _endpointsPromise = _resolveEndpoints().catch(() => {
      _endpointsPromise = null;
    });
    return _endpointsPromise;
  }
  async function _resolveEndpoints() {
    const pFetch = pageFetch();
    const targets = [
      ["retweeters", "Retweeters"],
      ["favoriters", "Favoriters"],
      ["searchTimeline", "SearchTimeline"]
    ];
    const found = new Set();
    const scripts = Array.from(document.querySelectorAll("script[src]")).map((s) => s.src).filter((src) => src.endsWith(".js"));
    for (const url of scripts) {
      if (found.size === targets.length) break;
      try {
        const text = await (await pFetch(url)).text();
        for (const [key, opName] of targets) {
          if (found.has(key)) continue;
          const m = text.match(new RegExp(`queryId:"([^"]+)"[^}]{0,80}operationName:"${opName}"`)) || text.match(new RegExp(`operationName:"${opName}"[^}]{0,80}queryId:"([^"]+)"`));
          if (m) {
            ENDPOINTS[key] = `${m[1]}/${opName}`;
            found.add(key);
          }
        }
      } catch {
        continue;
      }
    }
    if (found.size < targets.length) {
      const missing = targets.filter(([k]) => !found.has(k)).map(([, op]) => op);
      console.warn(LOG, "endpoints: using hardcoded fallback for", missing.join(", "));
    }
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
  async function fetchPaginatedUsers(endpoint, tweetId, csrfToken, options = {}) {
    const { onProgress, signal, maxRetries = 3 } = options;
    const pFetch = pageFetch();
    const result = [];
    const seen = new Set();
    const headers = {
      authorization: `Bearer ${BEARER_TOKEN}`,
      "x-csrf-token": csrfToken,
      "x-twitter-auth-type": "OAuth2Session",
      "x-twitter-active-user": "yes",
      "content-type": "application/json"
    };
    function buildUrl(cursor) {
      const variables = {
        tweetId,
        count: 20,
        includePromotedContent: true
      };
      if (cursor) variables.cursor = cursor;
      return `https://x.com/i/api/graphql/${endpoint}?variables=${encodeURIComponent(JSON.stringify(variables))}&features=${encodeURIComponent(JSON.stringify(GRAPHQL_FEATURES))}`;
    }
    async function fetchWithRetry(cursor) {
      for (let retry = 0; retry < maxRetries; retry++) {
        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
        try {
          const response = await pFetch(buildUrl(cursor), { headers, signal });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return await response.json();
        } catch (error) {
          if (error.name === "AbortError") throw error;
          if (retry === maxRetries - 1) return null;
          await new Promise((r) => setTimeout(r, 2e3 * (retry + 1)));
        }
      }
      return null;
    }
    function parseTimeline(data) {
      const timeline = data?.data?.retweeters_timeline?.timeline ?? data?.data?.favoriters_timeline?.timeline;
      if (!timeline) return { users: [], nextCursor: null };
      if (timeline.instructions.some(
        (i) => i.type === "TimelineTerminateTimeline"
      )) {
        return { users: [], nextCursor: null };
      }
      const addEntries = timeline.instructions.find(
        (i) => i.type === "TimelineAddEntries"
      );
      if (!addEntries?.entries) return { users: [], nextCursor: null };
      const bottomCursor = addEntries.entries.find(
        (e) => e.content?.cursorType === "Bottom"
      );
      const nextCursor = bottomCursor?.content?.value ?? null;
      const users = addEntries.entries.filter((e) => e.entryId?.startsWith("user-")).map((entry) => {
        const r = entry.content?.itemContent?.user_results?.result;
        const legacy = r?.legacy || {};
        const core = r?.core || {};
        const perspectives = r?.relationship_perspectives || {};
        const entryId = String(entry.entryId || "");
        const entryUserId = entryId.startsWith("user-") ? entryId.slice(5) : "";
        return {
          id: r?.rest_id || entryUserId,
          username: legacy.name || core.name || "",
          handle: legacy.screen_name || core.screen_name || r?.rest_id || "",
          avatarUrl: legacy.profile_image_url_https || r?.avatar?.image_url || "",
          bio: legacy.description || r?.profile_bio?.description || "",
          following: Boolean(perspectives.following ?? legacy.following),
          followed_by: Boolean(perspectives.followed_by ?? legacy.followed_by)
        };
      }).filter((u) => u.handle !== "");
      return { users, nextCursor };
    }
    let currentCursor = null;
    let pendingFetch = fetchWithRetry(null);
    while (pendingFetch) {
      const data = await pendingFetch;
      if (!data) break;
      const { users, nextCursor } = parseTimeline(data);
      if (nextCursor && nextCursor !== currentCursor) {
        currentCursor = nextCursor;
        pendingFetch = fetchWithRetry(currentCursor);
      } else {
        pendingFetch = null;
      }
      for (const u of users) {
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
  async function fetchRetweeters(tweetId, csrfToken, options) {
    return fetchPaginatedUsers(ENDPOINTS.retweeters, tweetId, csrfToken, options);
  }
  async function fetchFavoriters(tweetId, csrfToken, options) {
    return fetchPaginatedUsers(ENDPOINTS.favoriters, tweetId, csrfToken, options);
  }
  function _parseSearchTimeline(data) {
    const instructions = data?.data?.search_by_raw_query?.search_timeline?.timeline?.instructions ?? [];
    if (instructions.some((i) => i.type === "TimelineTerminateTimeline"))
      return { users: [], nextCursor: null };
    const addEntries = instructions.find((i) => i.type === "TimelineAddEntries");
    if (!addEntries?.entries) return { users: [], nextCursor: null };
    const bottomCursor = addEntries.entries.find((e) => e.content?.cursorType === "Bottom");
    const nextCursor = bottomCursor?.content?.value ?? null;
    const users = addEntries.entries.filter((e) => String(e.entryId ?? "").startsWith("tweet-")).map((entry) => {
      const tweetResult = entry.content?.itemContent?.tweet_results?.result;
      const tweet = tweetResult?.__typename === "TweetWithVisibilityResults" ? tweetResult.tweet : tweetResult;
      const userResult = tweet?.core?.user_results?.result;
      const userCore = userResult?.core ?? {};
      const legacy = userResult?.legacy ?? {};
      const perspectives = userResult?.relationship_perspectives ?? {};
      return {
        id: userResult?.rest_id ?? "",
        username: userCore.name || legacy.name || "",
        handle: userCore.screen_name || legacy.screen_name || "",
        avatarUrl: userResult?.avatar?.image_url || legacy.profile_image_url_https || "",
        bio: userResult?.profile_bio?.description || legacy.description || "",
        following: Boolean(perspectives.following ?? legacy.following),
        followed_by: Boolean(perspectives.followed_by ?? legacy.followed_by)
      };
    }).filter((u) => u.handle !== "");
    return { users, nextCursor };
  }
  async function fetchQuoteTweeters(tweetId, csrfToken, options = {}) {
    const { onProgress, signal, maxRetries = 3 } = options;
    const pFetch = pageFetch();
    const result = [];
    const seen = new Set();
    const selfId = getLoggedInUserId();
    const endpoint = ENDPOINTS.searchTimeline;
    const path = `/i/api/graphql/${endpoint}`;
    const headers = {
      authorization: `Bearer ${BEARER_TOKEN}`,
      "x-csrf-token": csrfToken,
      "x-twitter-auth-type": "OAuth2Session",
      "x-twitter-active-user": "yes",
      "content-type": "application/json"
    };
    function buildUrl(cursor) {
      const variables = {
        rawQuery: `quoted_tweet_id:${tweetId}`,
        count: 20,
        querySource: "tdqt",
        product: "Top",
        withGrokTranslatedBio: false
      };
      if (cursor) variables.cursor = cursor;
      return `https://x.com${path}?variables=${encodeURIComponent(JSON.stringify(variables))}&features=${encodeURIComponent(JSON.stringify(SEARCH_FEATURES))}`;
    }
    async function fetchWithRetry(cursor) {
      for (let retry = 0; retry < maxRetries; retry++) {
        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
        try {
          const txId = await getTxId("GET", path);
          const reqHeaders = txId ? { ...headers, "x-client-transaction-id": txId } : headers;
          const response = await pFetch(buildUrl(cursor), { headers: reqHeaders, signal });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return await response.json();
        } catch (error) {
          if (error.name === "AbortError") throw error;
          if (retry === maxRetries - 1) return null;
          await new Promise((r) => setTimeout(r, 2e3 * (retry + 1)));
        }
      }
      return null;
    }
    let currentCursor = null;
    let pendingFetch = fetchWithRetry(null);
    while (pendingFetch) {
      const data = await pendingFetch;
      if (!data) break;
      const { users, nextCursor } = _parseSearchTimeline(data);
      const filtered = selfId ? users.filter((u) => u.id !== selfId) : users;
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
  const CACHE_KEY_PREFIX = "x-draw-cache-";
  const CACHE_TTL = 30 * 60 * 1e3;
  function loadCache(tweetId) {
    try {
      const data = _GM_getValue(`${CACHE_KEY_PREFIX}${tweetId}`, null);
      if (data && Date.now() - data.timestamp < CACHE_TTL) return data;
    } catch {
    }
    return null;
  }
  function saveCache(tweetId, retweets2, likes2, quotes2) {
    try {
      _GM_setValue(`${CACHE_KEY_PREFIX}${tweetId}`, { retweets: retweets2, likes: likes2, quotes: quotes2, timestamp: Date.now() });
    } catch {
    }
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
  const loadingStatus = vue.ref("");
  const retweetProgress = vue.ref(0);
  const likeProgress = vue.ref(0);
  const quoteProgress = vue.ref(0);
  const lastTweetId = vue.ref(null);
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
    function performDraw() {
      const users = qualifiedUsers.value;
      if (users.length === 0) {
        return { success: false, message: "noQualifiedUsers" };
      }
      if (drawCount.value > users.length) {
        return { success: false, message: "notEnoughUsers", count: users.length };
      }
      const temp = [...users];
      const winners = [];
      for (let i = 0; i < drawCount.value; i++) {
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
      }
      loading.value = true;
      retweetProgress.value = 0;
      likeProgress.value = 0;
      quoteProgress.value = 0;
      try {
        await initEndpoints();
        const [retweetData, likeData, quoteData] = await Promise.all([
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
        retweets.value = retweetData;
        likes.value = likeData;
        quotes.value = quoteData;
        saveCache(tweetId, retweetData, likeData, quoteData);
        return { retweets: retweetData, likes: likeData, quotes: quoteData };
      } finally {
        loading.value = false;
      }
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
    }
    return {
      retweets,
      likes,
      quotes,
      filters,
      drawCount,
      loading,
      loadingStatus,
      retweetProgress,
      likeProgress,
      quoteProgress,
      lastTweetId,
      mergedUsers,
      qualifiedUsers,
      toggleFilter,
      performDraw,
      fetchInteractionData,
      cancelFetch,
      reset
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
          t2("followingYou")
        ]
      ];
      for (const user of data.retweets) {
        rows.push([
          t2("retweetType"),
          user.username,
          user.handle,
          user.avatarUrl,
          user.bio,
          user.following ? t2("yes") : t2("no"),
          user.followed_by ? t2("yes") : t2("no")
        ]);
      }
      for (const user of data.likes) {
        rows.push([
          t2("likeType"),
          user.username,
          user.handle,
          user.avatarUrl,
          user.bio,
          user.following ? t2("yes") : t2("no"),
          user.followed_by ? t2("yes") : t2("no")
        ]);
      }
      for (const user of data.quotes) {
        rows.push([
          t2("quoteType"),
          user.username,
          user.handle,
          user.avatarUrl,
          user.bio,
          user.following ? t2("yes") : t2("no"),
          user.followed_by ? t2("yes") : t2("no")
        ]);
      }
      const csvContent = "\uFEFF" + rows.map(
        (row) => row.map(
          (cell) => typeof cell === "string" ? `"${cell.replace(/"/g, '""')}"` : cell
        ).join(",")
      ).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      const now = new Date();
      const pad = (n) => n.toString().padStart(2, "0");
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      link.download = `x_draw_data_${timestamp}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    }
    return { exportCsv };
  }
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
  const _hoisted_1$3 = { class: "flex items-center justify-between px-6 py-4 border-b border-[#38444d] shrink-0" };
  const _hoisted_2$3 = { class: "text-lg font-bold text-white truncate" };
  const _hoisted_3$3 = { class: "flex items-center gap-3 shrink-0" };
  const _hoisted_4$3 = { class: "flex-1 min-h-0 flex flex-col" };
  const _hoisted_5$3 = {
    key: 0,
    class: "border-t border-[#38444d] shrink-0"
  };
  const _sfc_main$4 = vue.defineComponent({
    __name: "Modal",
    props: {
      title: {},
      width: {},
      height: {},
      zIndex: {}
    },
    emits: ["close"],
    setup(__props, { emit: __emit }) {
      const emit = __emit;
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("div", {
          class: "fixed inset-0 flex items-center justify-center bg-black/60",
          style: vue.normalizeStyle({ zIndex: __props.zIndex ?? 9999 }),
          onClick: _cache[1] || (_cache[1] = vue.withModifiers(($event) => emit("close"), ["self"]))
        }, [
          vue.createElementVNode("div", {
            class: vue.normalizeClass(["bg-[#15202b] rounded-2xl shadow-2xl border border-[#38444d] flex flex-col overflow-hidden", [__props.width ?? "w-auto", __props.height ?? "max-h-[80vh]"]])
          }, [
            vue.createElementVNode("div", _hoisted_1$3, [
              vue.createElementVNode("h2", _hoisted_2$3, vue.toDisplayString(__props.title), 1),
              vue.createElementVNode("div", _hoisted_3$3, [
                vue.renderSlot(_ctx.$slots, "header-controls"),
                vue.createElementVNode("button", {
                  class: "xd-btn-icon",
                  onClick: _cache[0] || (_cache[0] = ($event) => emit("close"))
                }, "×")
              ])
            ]),
            vue.createElementVNode("div", _hoisted_4$3, [
              vue.renderSlot(_ctx.$slots, "default")
            ]),
            _ctx.$slots.footer ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_5$3, [
              vue.renderSlot(_ctx.$slots, "footer")
            ])) : vue.createCommentVNode("", true)
          ], 2)
        ], 4);
      };
    }
  });
  const _hoisted_1$2 = { class: "flex-1 overflow-auto min-h-0" };
  const _hoisted_2$2 = { class: "p-4 text-center text-[#e7e9ea] text-sm" };
  const _hoisted_3$2 = { class: "px-4 pb-4" };
  const _hoisted_4$2 = { class: "grid grid-cols-4 gap-3" };
  const _hoisted_5$2 = ["src", "alt"];
  const _hoisted_6$2 = { class: "text-center min-w-0 w-full" };
  const _hoisted_7$2 = { class: "text-white font-medium text-sm truncate" };
  const _hoisted_8$2 = ["href"];
  const _hoisted_9$2 = { class: "flex gap-1" };
  const _hoisted_10$2 = {
    key: 0,
    class: "xd-badge xd-badge-green"
  };
  const _hoisted_11$2 = {
    key: 1,
    class: "xd-badge xd-badge-pink"
  };
  const _hoisted_12$2 = {
    key: 2,
    class: "xd-badge xd-badge-orange"
  };
  const _hoisted_13$2 = {
    key: 3,
    class: "xd-badge xd-badge-blue"
  };
  const _hoisted_14$2 = { class: "p-4 flex justify-center gap-4" };
  const _sfc_main$3 = vue.defineComponent({
    __name: "DrawResult",
    props: {
      winners: {}
    },
    emits: ["close"],
    setup(__props, { emit: __emit }) {
      const emit = __emit;
      const { t: t2 } = useI18n();
      const captureRef = vue.ref(null);
      function notifyWinners(winners) {
        const tweetId = getTweetIdFromUrl();
        if (!tweetId) return;
        const winnersText = winners.map((u) => `@${u.handle}`).join(" ");
        const notifyText = t2("winnerNotice") + winnersText;
        const intentUrl = `https://x.com/intent/post?in_reply_to=${tweetId}&text=${encodeURIComponent(notifyText)}`;
        window.open(intentUrl, "_blank");
      }
      function openAllChats(winners) {
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
          alert(t2("popupBlocked"));
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
        return vue.openBlock(), vue.createBlock(_sfc_main$4, {
          title: vue.unref(t2)("drawResult"),
          width: "w-[700px]",
          "z-index": 10001,
          onClose: _cache[2] || (_cache[2] = ($event) => emit("close"))
        }, {
          footer: vue.withCtx(() => [
            vue.createElementVNode("div", _hoisted_14$2, [
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
                onClick: _cache[0] || (_cache[0] = ($event) => openAllChats(__props.winners))
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
                onClick: _cache[1] || (_cache[1] = ($event) => notifyWinners(__props.winners))
              }, vue.toDisplayString(vue.unref(t2)("notify")), 1)
            ])
          ]),
          default: vue.withCtx(() => [
            vue.createElementVNode("div", _hoisted_1$2, [
              vue.createElementVNode("div", {
                ref_key: "captureRef",
                ref: captureRef
              }, [
                vue.createElementVNode("div", _hoisted_2$2, vue.toDisplayString(vue.unref(t2)("congratulations")), 1),
                vue.createElementVNode("div", _hoisted_3$2, [
                  vue.createElementVNode("div", _hoisted_4$2, [
                    (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(__props.winners, (user) => {
                      return vue.openBlock(), vue.createElementBlock("div", {
                        key: user.handle,
                        class: "flex flex-col items-center gap-2 p-3 bg-[#273340] rounded-xl"
                      }, [
                        vue.createElementVNode("img", {
                          src: user.avatarUrl,
                          alt: user.username,
                          class: "w-12 h-12 rounded-full shrink-0"
                        }, null, 8, _hoisted_5$2),
                        vue.createElementVNode("div", _hoisted_6$2, [
                          vue.createElementVNode("div", _hoisted_7$2, vue.toDisplayString(user.username), 1),
                          vue.createElementVNode("a", {
                            href: user.id ? `https://x.com/messages/compose?recipient_id=${user.id}` : `https://x.com/${user.handle}`,
                            target: "_blank",
                            class: "text-[#71767b] text-xs truncate hover:underline"
                          }, "@" + vue.toDisplayString(user.handle), 9, _hoisted_8$2)
                        ]),
                        vue.createElementVNode("div", _hoisted_9$2, [
                          user.hasRetweet ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_10$2, [..._cache[3] || (_cache[3] = [
                            vue.createElementVNode("svg", {
                              viewBox: "0 0 24 24",
                              class: "w-3 h-3",
                              fill: "currentColor"
                            }, [
                              vue.createElementVNode("path", { d: "M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" })
                            ], -1)
                          ])])) : vue.createCommentVNode("", true),
                          user.hasLike ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_11$2, [..._cache[4] || (_cache[4] = [
                            vue.createElementVNode("svg", {
                              viewBox: "0 0 24 24",
                              class: "w-3 h-3",
                              fill: "currentColor"
                            }, [
                              vue.createElementVNode("path", { d: "M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" })
                            ], -1)
                          ])])) : vue.createCommentVNode("", true),
                          user.hasQuote ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_12$2, [..._cache[5] || (_cache[5] = [
                            vue.createElementVNode("svg", {
                              viewBox: "0 0 24 24",
                              class: "w-3 h-3",
                              fill: "currentColor"
                            }, [
                              vue.createElementVNode("path", { d: "M14.23 2.854c.98-.977 2.56-.977 3.54 0l3.38 3.378c.97.977.97 2.559 0 3.536L9.91 21H3v-6.914L14.23 2.854zm2.12 1.414c-.19-.195-.51-.195-.7 0L4.41 15.51V19h3.49l11.24-11.242c.2-.195.2-.513 0-.707l-3.38-3.378-.41.595zm-1.42 1.42l3.38 3.378-1.42 1.414-3.38-3.378 1.42-1.414z" })
                            ], -1)
                          ])])) : vue.createCommentVNode("", true),
                          user.followed_by ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_13$2, [..._cache[6] || (_cache[6] = [
                            vue.createElementVNode("svg", {
                              viewBox: "0 0 24 24",
                              class: "w-3 h-3",
                              fill: "currentColor"
                            }, [
                              vue.createElementVNode("path", { d: "M12 11.816c1.355 0 2.872-.15 3.84-1.256.814-.93 1.078-2.368.806-4.392-.38-2.825-2.117-4.512-4.646-4.512S7.734 3.343 7.354 6.168c-.272 2.024-.008 3.462.806 4.392.968 1.107 2.485 1.256 3.84 1.256zm-3.16-5.448c.162-1.2.787-3.212 3.16-3.212s2.998 2.013 3.16 3.212c.207 1.55.057 2.627-.45 3.205-.455.52-1.266.743-2.71.743s-2.255-.223-2.71-.743c-.507-.578-.657-1.656-.45-3.205zm11.44 12.868c-.877-3.526-4.282-5.99-8.28-5.99s-7.403 2.464-8.28 5.99c-.172.692-.028 1.4.395 1.94.408.52 1.04.82 1.733.82h12.304c.693 0 1.325-.3 1.733-.82.424-.54.567-1.247.394-1.94zm-1.576 1.016c-.126.16-.316.246-.552.246H5.848c-.235 0-.426-.086-.552-.246-.137-.174-.18-.412-.12-.654.71-2.855 3.517-4.85 6.824-4.85s6.114 1.994 6.824 4.85c.06.242.017.48-.12.654z" })
                            ], -1)
                          ])])) : vue.createCommentVNode("", true)
                        ])
                      ]);
                    }), 128))
                  ])
                ])
              ], 512)
            ])
          ]),
          _: 1
        }, 8, ["title"]);
      };
    }
  });
  const _hoisted_1$1 = { class: "p-5 space-y-3" };
  const _hoisted_2$1 = { class: "text-sm text-[#71767b] mb-2" };
  const _hoisted_3$1 = ["checked", "onChange"];
  const _hoisted_4$1 = {
    key: 0,
    viewBox: "0 0 24 24",
    class: "w-4 h-4 text-[#00ba7c]",
    fill: "currentColor"
  };
  const _hoisted_5$1 = {
    key: 1,
    viewBox: "0 0 24 24",
    class: "w-4 h-4 text-[#f91880]",
    fill: "currentColor"
  };
  const _hoisted_6$1 = {
    key: 2,
    viewBox: "0 0 24 24",
    class: "w-4 h-4 text-[#00ba7c]",
    fill: "currentColor"
  };
  const _hoisted_7$1 = {
    key: 3,
    viewBox: "0 0 24 24",
    class: "w-4 h-4 text-[#1d9bf0]",
    fill: "currentColor"
  };
  const _hoisted_8$1 = { class: "text-[#e7e9ea] text-sm" };
  const _hoisted_9$1 = { class: "px-5 pb-4 flex items-center justify-between" };
  const _hoisted_10$1 = { class: "text-sm text-[#71767b]" };
  const _hoisted_11$1 = { class: "text-white font-bold" };
  const _hoisted_12$1 = { class: "flex items-center gap-2" };
  const _hoisted_13$1 = { class: "text-sm text-[#71767b]" };
  const _hoisted_14$1 = { class: "text-sm text-[#71767b]" };
  const _hoisted_15$1 = { class: "px-5 py-4 flex justify-end" };
  const _sfc_main$2 = vue.defineComponent({
    __name: "DrawSettings",
    emits: ["close", "draw"],
    setup(__props, { emit: __emit }) {
      const emit = __emit;
      const { t: t2 } = useI18n();
      const drawData = useDrawData();
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
        const result = drawData.performDraw();
        if (!result.success) {
          if (result.message === "notEnoughUsers") {
            alert(t2("notEnoughUsers", { count: String(result.count) }));
          } else {
            alert(t2(result.message || "noQualifiedUsers"));
          }
          return;
        }
        emit("draw", result.winners);
      }
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createBlock(_sfc_main$4, {
          title: vue.unref(t2)("startDraw"),
          width: "w-[400px]",
          "z-index": 10001,
          onClose: _cache[1] || (_cache[1] = ($event) => emit("close"))
        }, {
          footer: vue.withCtx(() => [
            vue.createElementVNode("div", _hoisted_15$1, [
              vue.createElementVNode("button", {
                class: "xd-btn xd-btn-primary text-sm",
                style: vue.normalizeStyle({ opacity: qualifiedCount.value === 0 ? 0.5 : 1 }),
                onClick: handleDraw
              }, vue.toDisplayString(vue.unref(t2)("startDraw")), 5)
            ])
          ]),
          default: vue.withCtx(() => [
            vue.createElementVNode("div", _hoisted_1$1, [
              vue.createElementVNode("div", _hoisted_2$1, vue.toDisplayString(vue.unref(t2)("selectFilters")), 1),
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
                  }, null, 40, _hoisted_3$1),
                  opt.icon === "retweet" ? (vue.openBlock(), vue.createElementBlock("svg", _hoisted_4$1, [..._cache[2] || (_cache[2] = [
                    vue.createElementVNode("path", { d: "M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" }, null, -1)
                  ])])) : vue.createCommentVNode("", true),
                  opt.icon === "like" ? (vue.openBlock(), vue.createElementBlock("svg", _hoisted_5$1, [..._cache[3] || (_cache[3] = [
                    vue.createElementVNode("path", { d: "M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" }, null, -1)
                  ])])) : vue.createCommentVNode("", true),
                  opt.icon === "quote" ? (vue.openBlock(), vue.createElementBlock("svg", _hoisted_6$1, [..._cache[4] || (_cache[4] = [
                    vue.createElementVNode("path", { d: "M14.23 2.854c.98-.977 2.56-.977 3.54 0l3.38 3.378c.97.977.97 2.559 0 3.536L9.91 21H3v-6.914L14.23 2.854zm2.12 1.414c-.19-.195-.51-.195-.7 0L4.41 15.51V19h3.49l11.24-11.242c.2-.195.2-.513 0-.707l-3.38-3.378-.41.595zm-1.42 1.42l3.38 3.378-1.42 1.414-3.38-3.378 1.42-1.414z" }, null, -1)
                  ])])) : vue.createCommentVNode("", true),
                  opt.icon === "follow" ? (vue.openBlock(), vue.createElementBlock("svg", _hoisted_7$1, [..._cache[5] || (_cache[5] = [
                    vue.createElementVNode("path", { d: "M12 11.816c1.355 0 2.872-.15 3.84-1.256.814-.93 1.078-2.368.806-4.392-.38-2.825-2.117-4.512-4.646-4.512S7.734 3.343 7.354 6.168c-.272 2.024-.008 3.462.806 4.392.968 1.107 2.485 1.256 3.84 1.256zm-3.16-5.448c.162-1.2.787-3.212 3.16-3.212s2.998 2.013 3.16 3.212c.207 1.55.057 2.627-.45 3.205-.455.52-1.266.743-2.71.743s-2.255-.223-2.71-.743c-.507-.578-.657-1.656-.45-3.205zm11.44 12.868c-.877-3.526-4.282-5.99-8.28-5.99s-7.403 2.464-8.28 5.99c-.172.692-.028 1.4.395 1.94.408.52 1.04.82 1.733.82h12.304c.693 0 1.325-.3 1.733-.82.424-.54.567-1.247.394-1.94zm-1.576 1.016c-.126.16-.316.246-.552.246H5.848c-.235 0-.426-.086-.552-.246-.137-.174-.18-.412-.12-.654.71-2.855 3.517-4.85 6.824-4.85s6.114 1.994 6.824 4.85c.06.242.017.48-.12.654z" }, null, -1)
                  ])])) : vue.createCommentVNode("", true),
                  vue.createElementVNode("span", _hoisted_8$1, vue.toDisplayString(getFilterLabel(opt.key)), 1)
                ], 2);
              }), 64))
            ]),
            vue.createElementVNode("div", _hoisted_9$1, [
              vue.createElementVNode("div", _hoisted_10$1, [
                vue.createTextVNode(vue.toDisplayString(vue.unref(t2)("qualifiedUsers")) + "：", 1),
                vue.createElementVNode("span", _hoisted_11$1, vue.toDisplayString(qualifiedCount.value), 1),
                vue.createTextVNode(" " + vue.toDisplayString(vue.unref(t2)("people")), 1)
              ]),
              vue.createElementVNode("div", _hoisted_12$1, [
                vue.createElementVNode("span", _hoisted_13$1, vue.toDisplayString(vue.unref(t2)("draw")), 1),
                vue.withDirectives(vue.createElementVNode("input", {
                  type: "number",
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => vue.unref(drawData).drawCount.value = $event),
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
                vue.createElementVNode("span", _hoisted_14$1, vue.toDisplayString(vue.unref(t2)("people")), 1)
              ])
            ])
          ]),
          _: 1
        }, 8, ["title"]);
      };
    }
  });
  const _hoisted_1 = ["value"];
  const _hoisted_2 = ["value"];
  const _hoisted_3 = { class: "grid grid-cols-5 border-b border-[#38444d] shrink-0" };
  const _hoisted_4 = { class: "flex flex-col items-center py-3 border-r border-[#38444d]" };
  const _hoisted_5 = { class: "text-xs text-[#71767b]" };
  const _hoisted_6 = { class: "text-xl font-bold text-white" };
  const _hoisted_7 = { class: "flex flex-col items-center py-3 border-r border-[#38444d]" };
  const _hoisted_8 = { class: "text-xs text-[#71767b]" };
  const _hoisted_9 = { class: "text-xl font-bold text-[#00ba7c]" };
  const _hoisted_10 = {
    key: 0,
    class: "mt-1 text-[11px] text-[#71767b] flex items-center gap-1"
  };
  const _hoisted_11 = { class: "flex flex-col items-center py-3 border-r border-[#38444d]" };
  const _hoisted_12 = { class: "text-xs text-[#71767b]" };
  const _hoisted_13 = { class: "text-xl font-bold text-[#f91880]" };
  const _hoisted_14 = {
    key: 0,
    class: "mt-1 text-[11px] text-[#71767b] flex items-center gap-1"
  };
  const _hoisted_15 = { class: "flex flex-col items-center py-3 border-r border-[#38444d]" };
  const _hoisted_16 = { class: "text-xs text-[#71767b]" };
  const _hoisted_17 = { class: "text-xl font-bold text-[#ff7a00]" };
  const _hoisted_18 = {
    key: 0,
    class: "mt-1 text-[11px] text-[#71767b] flex items-center gap-1"
  };
  const _hoisted_19 = { class: "flex flex-col items-center py-3" };
  const _hoisted_20 = { class: "text-xs text-[#71767b]" };
  const _hoisted_21 = { class: "text-xl font-bold text-[#1d9bf0]" };
  const _hoisted_22 = { class: "flex items-center justify-between px-5 py-3 border-b border-[#38444d] shrink-0" };
  const _hoisted_23 = { class: "xd-tab-group" };
  const _hoisted_24 = ["onClick"];
  const _hoisted_25 = { class: "ml-1 opacity-60 text-[11px]" };
  const _hoisted_26 = { class: "flex items-center gap-2" };
  const _hoisted_27 = { class: "flex-1 overflow-auto min-h-0" };
  const _hoisted_28 = { class: "w-full text-sm border-collapse" };
  const _hoisted_29 = { class: "sticky top-0 bg-[#15202b] z-[1]" };
  const _hoisted_30 = { class: "text-left border-b border-[#38444d]" };
  const _hoisted_31 = { class: "text-xs opacity-50" };
  const _hoisted_32 = { class: "text-xs opacity-50" };
  const _hoisted_33 = { class: "inline-flex items-center justify-center gap-1" };
  const _hoisted_34 = { class: "text-xs opacity-50" };
  const _hoisted_35 = { class: "inline-flex items-center justify-center gap-1" };
  const _hoisted_36 = { class: "text-xs opacity-50" };
  const _hoisted_37 = { class: "inline-flex items-center justify-center gap-1" };
  const _hoisted_38 = { class: "text-xs opacity-50" };
  const _hoisted_39 = { class: "inline-flex items-center justify-center gap-1" };
  const _hoisted_40 = { class: "text-xs opacity-50" };
  const _hoisted_41 = { class: "w-14 px-4 text-[#71767b]" };
  const _hoisted_42 = ["onMouseenter"];
  const _hoisted_43 = { class: "flex items-center gap-3" };
  const _hoisted_44 = ["src", "alt"];
  const _hoisted_45 = ["onClick"];
  const _hoisted_46 = { class: "w-40 px-4 text-[#71767b] truncate" };
  const _hoisted_47 = { class: "w-20 px-4 text-center" };
  const _hoisted_48 = {
    key: 0,
    class: "xd-badge xd-badge-green"
  };
  const _hoisted_49 = {
    key: 1,
    class: "text-[#38444d]"
  };
  const _hoisted_50 = { class: "w-20 px-4 text-center" };
  const _hoisted_51 = {
    key: 0,
    class: "xd-badge xd-badge-pink"
  };
  const _hoisted_52 = {
    key: 1,
    class: "text-[#38444d]"
  };
  const _hoisted_53 = { class: "w-20 px-4 text-center" };
  const _hoisted_54 = {
    key: 0,
    class: "xd-badge xd-badge-orange"
  };
  const _hoisted_55 = {
    key: 1,
    class: "text-[#38444d]"
  };
  const _hoisted_56 = { class: "w-20 px-4 text-center" };
  const _hoisted_57 = {
    key: 0,
    class: "xd-badge xd-badge-blue"
  };
  const _hoisted_58 = {
    key: 1,
    class: "text-[#38444d]"
  };
  const _hoisted_59 = { key: 0 };
  const _hoisted_60 = {
    colspan: "7",
    class: "text-center py-12 text-[#71767b]"
  };
  const _hoisted_61 = {
    key: 0,
    class: "flex items-center justify-center px-5 py-2.5 border-t border-[#38444d] shrink-0"
  };
  const _hoisted_62 = { class: "flex items-center gap-1" };
  const _hoisted_63 = {
    key: 0,
    class: "px-1 text-[#71767b]"
  };
  const _hoisted_64 = ["onClick"];
  const _hoisted_65 = { class: "px-5 py-2 text-center text-xs text-[#71767b]" };
  const _hoisted_66 = { class: "flex items-start gap-3 mb-2" };
  const _hoisted_67 = ["src", "alt"];
  const _hoisted_68 = { class: "min-w-0" };
  const _hoisted_69 = { class: "text-white font-bold truncate" };
  const _hoisted_70 = { class: "text-[#71767b] text-sm" };
  const _hoisted_71 = {
    key: 0,
    class: "text-[#e7e9ea] text-sm leading-relaxed"
  };
  const _hoisted_72 = {
    key: 1,
    class: "text-[#71767b] text-sm italic"
  };
  const _hoisted_73 = { class: "flex gap-2 mt-2 flex-wrap" };
  const _hoisted_74 = {
    key: 0,
    class: "xd-badge xd-badge-green"
  };
  const _hoisted_75 = {
    key: 1,
    class: "xd-badge xd-badge-pink"
  };
  const _hoisted_76 = {
    key: 2,
    class: "xd-badge xd-badge-orange"
  };
  const _hoisted_77 = {
    key: 3,
    class: "xd-badge xd-badge-blue"
  };
  const PAGE_SIZE = 20;
  const _sfc_main$1 = vue.defineComponent({
    __name: "DrawPanel",
    emits: ["close"],
    setup(__props, { emit: __emit }) {
      const emit = __emit;
      const { t: t2, currentLang: currentLang2, setLang: setLang2, availableLangs, getLangName } = useI18n();
      const drawData = useDrawData();
      const { exportCsv } = useExport();
      const activeFilter = vue.ref("all");
      const showResult = vue.ref(false);
      const showSettings = vue.ref(false);
      const winners = vue.ref([]);
      const hoveredUser = vue.ref(null);
      const tooltipPos = vue.ref({ x: 0, y: 0 });
      const sortKey = vue.ref(null);
      const sortDir = vue.ref("asc");
      const currentPage = vue.ref(1);
      drawData.fetchInteractionData().catch((err) => {
        if (err.message !== "Aborted") {
          alert(t2(err.message || "loginRequired"));
        }
      });
      const filteredUsers = vue.computed(() => {
        const users = drawData.mergedUsers.value;
        if (activeFilter.value === "all") return users;
        if (activeFilter.value === "retweet") return users.filter((u) => u.hasRetweet);
        if (activeFilter.value === "like") return users.filter((u) => u.hasLike);
        if (activeFilter.value === "quote") return users.filter((u) => u.hasQuote);
        if (activeFilter.value === "followed_by") return users.filter((u) => u.followed_by);
        return users;
      });
      const sortedUsers = vue.computed(() => {
        const users = [...filteredUsers.value];
        if (!sortKey.value) return users;
        const key = sortKey.value;
        const dir = sortDir.value === "asc" ? 1 : -1;
        return users.sort((a, b) => {
          if (key === "username") return dir * a.username.localeCompare(b.username);
          if (key === "handle") return dir * a.handle.localeCompare(b.handle);
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
      vue.watch([activeFilter, sortKey, sortDir], () => {
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
        if (cur > 3) pages.push("...");
        for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
        if (cur < total - 2) pages.push("...");
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
      function handleDraw() {
        showSettings.value = true;
      }
      function onDrawResult(picked) {
        winners.value = picked;
        showSettings.value = false;
        showResult.value = true;
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
        const row = e.currentTarget;
        const rect = row.getBoundingClientRect();
        tooltipPos.value = { x: rect.left + 60, y: rect.top };
        hoveredUser.value = user;
      }
      function openProfile(handle) {
        window.open(`https://x.com/${handle}`, "_blank");
      }
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock(vue.Fragment, null, [
          vue.createVNode(_sfc_main$4, {
            title: vue.unref(t2)("drawHelper"),
            width: "w-[900px]",
            height: "h-[700px]",
            onClose: _cache[9] || (_cache[9] = ($event) => emit("close"))
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
              ], 40, _hoisted_1)
            ]),
            footer: vue.withCtx(() => [
              vue.createElementVNode("div", _hoisted_65, [
                vue.createTextVNode(vue.toDisplayString(vue.unref(t2)("madeWith")) + " ", 1),
                _cache[24] || (_cache[24] = vue.createElementVNode("a", {
                  href: "https://github.com/yueby",
                  target: "_blank",
                  class: "text-[#1d9bf0] hover:underline"
                }, "Yueby", -1))
              ])
            ]),
            default: vue.withCtx(() => [
              vue.createElementVNode("div", _hoisted_3, [
                vue.createElementVNode("div", _hoisted_4, [
                  vue.createElementVNode("span", _hoisted_5, vue.toDisplayString(vue.unref(t2)("total")), 1),
                  vue.createElementVNode("span", _hoisted_6, vue.toDisplayString(stats.value.total), 1)
                ]),
                vue.createElementVNode("div", _hoisted_7, [
                  vue.createElementVNode("span", _hoisted_8, vue.toDisplayString(vue.unref(t2)("retweets")), 1),
                  vue.createElementVNode("span", _hoisted_9, vue.toDisplayString(stats.value.retweets), 1),
                  vue.unref(drawData).loading.value ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_10, [
                    _cache[12] || (_cache[12] = vue.createElementVNode("svg", {
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
                vue.createElementVNode("div", _hoisted_11, [
                  vue.createElementVNode("span", _hoisted_12, vue.toDisplayString(vue.unref(t2)("likes")), 1),
                  vue.createElementVNode("span", _hoisted_13, vue.toDisplayString(stats.value.likes), 1),
                  vue.unref(drawData).loading.value ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_14, [
                    _cache[13] || (_cache[13] = vue.createElementVNode("svg", {
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
                vue.createElementVNode("div", _hoisted_15, [
                  vue.createElementVNode("span", _hoisted_16, vue.toDisplayString(vue.unref(t2)("quotes")), 1),
                  vue.createElementVNode("span", _hoisted_17, vue.toDisplayString(stats.value.quotes), 1),
                  vue.unref(drawData).loading.value ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_18, [
                    _cache[14] || (_cache[14] = vue.createElementVNode("svg", {
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
                vue.createElementVNode("div", _hoisted_19, [
                  vue.createElementVNode("span", _hoisted_20, vue.toDisplayString(vue.unref(t2)("followingMe")), 1),
                  vue.createElementVNode("span", _hoisted_21, vue.toDisplayString(stats.value.followers), 1)
                ])
              ]),
              vue.createElementVNode("div", _hoisted_22, [
                vue.createElementVNode("div", _hoisted_23, [
                  (vue.openBlock(), vue.createElementBlock(vue.Fragment, null, vue.renderList(["all", "retweet", "like", "quote", "followed_by"], (tab) => {
                    return vue.createElementVNode("button", {
                      key: tab,
                      class: vue.normalizeClass(["xd-tab", { active: activeFilter.value === tab }]),
                      onClick: ($event) => activeFilter.value = tab
                    }, [
                      vue.createTextVNode(vue.toDisplayString(tab === "all" ? vue.unref(t2)("total") : tab === "retweet" ? vue.unref(t2)("retweets") : tab === "like" ? vue.unref(t2)("likes") : tab === "quote" ? vue.unref(t2)("quotes") : vue.unref(t2)("followingMe")) + " ", 1),
                      vue.createElementVNode("span", _hoisted_25, vue.toDisplayString(tab === "all" ? stats.value.total : tab === "retweet" ? stats.value.retweets : tab === "like" ? stats.value.likes : tab === "quote" ? stats.value.quotes : stats.value.followers), 1)
                    ], 10, _hoisted_24);
                  }), 64))
                ]),
                vue.createElementVNode("div", _hoisted_26, [
                  vue.createElementVNode("button", {
                    class: "xd-btn xd-btn-primary text-sm",
                    onClick: handleDraw
                  }, vue.toDisplayString(vue.unref(t2)("startDraw")), 1),
                  vue.createElementVNode("button", {
                    class: "xd-btn xd-btn-secondary text-sm",
                    onClick: handleExport
                  }, vue.toDisplayString(vue.unref(t2)("export")), 1)
                ])
              ]),
              vue.createElementVNode("div", _hoisted_27, [
                vue.createElementVNode("table", _hoisted_28, [
                  vue.createElementVNode("thead", _hoisted_29, [
                    vue.createElementVNode("tr", _hoisted_30, [
                      _cache[19] || (_cache[19] = vue.createElementVNode("th", { class: "w-14 px-4 py-2.5 text-[#71767b] font-medium" }, "#", -1)),
                      vue.createElementVNode("th", {
                        class: "xd-th px-4 py-2.5",
                        onClick: _cache[0] || (_cache[0] = ($event) => toggleSort("username"))
                      }, [
                        vue.createTextVNode(vue.toDisplayString(vue.unref(t2)("username")) + " ", 1),
                        vue.createElementVNode("span", _hoisted_31, vue.toDisplayString(getSortIcon("username")), 1)
                      ]),
                      vue.createElementVNode("th", {
                        class: "xd-th w-40 px-4 py-2.5",
                        onClick: _cache[1] || (_cache[1] = ($event) => toggleSort("handle"))
                      }, [
                        vue.createTextVNode(vue.toDisplayString(vue.unref(t2)("handle")) + " ", 1),
                        vue.createElementVNode("span", _hoisted_32, vue.toDisplayString(getSortIcon("handle")), 1)
                      ]),
                      vue.createElementVNode("th", {
                        class: "xd-th w-20 px-4 py-2.5 text-center",
                        onClick: _cache[2] || (_cache[2] = ($event) => toggleSort("retweet"))
                      }, [
                        vue.createElementVNode("span", _hoisted_33, [
                          _cache[15] || (_cache[15] = vue.createElementVNode("svg", {
                            viewBox: "0 0 24 24",
                            class: "w-4 h-4 text-[#00ba7c]",
                            fill: "currentColor"
                          }, [
                            vue.createElementVNode("path", { d: "M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" })
                          ], -1)),
                          vue.createElementVNode("span", _hoisted_34, vue.toDisplayString(getSortIcon("retweet")), 1)
                        ])
                      ]),
                      vue.createElementVNode("th", {
                        class: "xd-th w-20 px-4 py-2.5 text-center",
                        onClick: _cache[3] || (_cache[3] = ($event) => toggleSort("like"))
                      }, [
                        vue.createElementVNode("span", _hoisted_35, [
                          _cache[16] || (_cache[16] = vue.createElementVNode("svg", {
                            viewBox: "0 0 24 24",
                            class: "w-4 h-4",
                            fill: "currentColor"
                          }, [
                            vue.createElementVNode("path", { d: "M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" })
                          ], -1)),
                          vue.createElementVNode("span", _hoisted_36, vue.toDisplayString(getSortIcon("like")), 1)
                        ])
                      ]),
                      vue.createElementVNode("th", {
                        class: "xd-th w-20 px-4 py-2.5 text-center",
                        onClick: _cache[4] || (_cache[4] = ($event) => toggleSort("quote"))
                      }, [
                        vue.createElementVNode("span", _hoisted_37, [
                          _cache[17] || (_cache[17] = vue.createElementVNode("svg", {
                            viewBox: "0 0 24 24",
                            class: "w-4 h-4",
                            fill: "currentColor"
                          }, [
                            vue.createElementVNode("path", { d: "M14.23 2.854c.98-.977 2.56-.977 3.54 0l3.38 3.378c.97.977.97 2.559 0 3.536L9.91 21H3v-6.914L14.23 2.854zm2.12 1.414c-.19-.195-.51-.195-.7 0L4.41 15.51V19h3.49l11.24-11.242c.2-.195.2-.513 0-.707l-3.38-3.378-.41.595zm-1.42 1.42l3.38 3.378-1.42 1.414-3.38-3.378 1.42-1.414z" })
                          ], -1)),
                          vue.createElementVNode("span", _hoisted_38, vue.toDisplayString(getSortIcon("quote")), 1)
                        ])
                      ]),
                      vue.createElementVNode("th", {
                        class: "xd-th w-20 px-4 py-2.5 text-center",
                        onClick: _cache[5] || (_cache[5] = ($event) => toggleSort("followed_by"))
                      }, [
                        vue.createElementVNode("span", _hoisted_39, [
                          _cache[18] || (_cache[18] = vue.createElementVNode("svg", {
                            viewBox: "0 0 24 24",
                            class: "w-4 h-4",
                            fill: "currentColor"
                          }, [
                            vue.createElementVNode("path", { d: "M12 11.816c1.355 0 2.872-.15 3.84-1.256.814-.93 1.078-2.368.806-4.392-.38-2.825-2.117-4.512-4.646-4.512S7.734 3.343 7.354 6.168c-.272 2.024-.008 3.462.806 4.392.968 1.107 2.485 1.256 3.84 1.256zm-3.16-5.448c.162-1.2.787-3.212 3.16-3.212s2.998 2.013 3.16 3.212c.207 1.55.057 2.627-.45 3.205-.455.52-1.266.743-2.71.743s-2.255-.223-2.71-.743c-.507-.578-.657-1.656-.45-3.205zm11.44 12.868c-.877-3.526-4.282-5.99-8.28-5.99s-7.403 2.464-8.28 5.99c-.172.692-.028 1.4.395 1.94.408.52 1.04.82 1.733.82h12.304c.693 0 1.325-.3 1.733-.82.424-.54.567-1.247.394-1.94zm-1.576 1.016c-.126.16-.316.246-.552.246H5.848c-.235 0-.426-.086-.552-.246-.137-.174-.18-.412-.12-.654.71-2.855 3.517-4.85 6.824-4.85s6.114 1.994 6.824 4.85c.06.242.017.48-.12.654z" })
                          ], -1)),
                          vue.createElementVNode("span", _hoisted_40, vue.toDisplayString(getSortIcon("followed_by")), 1)
                        ])
                      ])
                    ])
                  ]),
                  vue.createElementVNode("tbody", null, [
                    (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(paginatedUsers.value, (user, i) => {
                      return vue.openBlock(), vue.createElementBlock("tr", {
                        key: user.handle,
                        class: "border-b border-[#38444d]/30 hover:bg-white/[0.03] transition-colors h-12"
                      }, [
                        vue.createElementVNode("td", _hoisted_41, vue.toDisplayString(pageOffset.value + i + 1), 1),
                        vue.createElementVNode("td", {
                          class: "px-4",
                          onMouseenter: ($event) => onRowEnter(user, $event),
                          onMouseleave: _cache[6] || (_cache[6] = ($event) => hoveredUser.value = null)
                        }, [
                          vue.createElementVNode("div", _hoisted_43, [
                            vue.createElementVNode("img", {
                              src: user.avatarUrl,
                              alt: user.username,
                              class: "w-8 h-8 rounded-full shrink-0"
                            }, null, 8, _hoisted_44),
                            vue.createElementVNode("span", {
                              class: "font-medium text-[#1d9bf0] truncate max-w-[240px] cursor-pointer hover:underline",
                              onClick: ($event) => openProfile(user.handle)
                            }, vue.toDisplayString(user.username), 9, _hoisted_45)
                          ])
                        ], 40, _hoisted_42),
                        vue.createElementVNode("td", _hoisted_46, "@" + vue.toDisplayString(user.handle), 1),
                        vue.createElementVNode("td", _hoisted_47, [
                          user.hasRetweet ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_48, [..._cache[20] || (_cache[20] = [
                            vue.createElementVNode("svg", {
                              viewBox: "0 0 24 24",
                              class: "w-3.5 h-3.5",
                              fill: "currentColor"
                            }, [
                              vue.createElementVNode("path", { d: "M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" })
                            ], -1)
                          ])])) : (vue.openBlock(), vue.createElementBlock("span", _hoisted_49, "—"))
                        ]),
                        vue.createElementVNode("td", _hoisted_50, [
                          user.hasLike ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_51, [..._cache[21] || (_cache[21] = [
                            vue.createElementVNode("svg", {
                              viewBox: "0 0 24 24",
                              class: "w-3.5 h-3.5",
                              fill: "currentColor"
                            }, [
                              vue.createElementVNode("path", { d: "M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" })
                            ], -1)
                          ])])) : (vue.openBlock(), vue.createElementBlock("span", _hoisted_52, "—"))
                        ]),
                        vue.createElementVNode("td", _hoisted_53, [
                          user.hasQuote ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_54, [..._cache[22] || (_cache[22] = [
                            vue.createElementVNode("svg", {
                              viewBox: "0 0 24 24",
                              class: "w-3.5 h-3.5",
                              fill: "currentColor"
                            }, [
                              vue.createElementVNode("path", { d: "M14.23 2.854c.98-.977 2.56-.977 3.54 0l3.38 3.378c.97.977.97 2.559 0 3.536L9.91 21H3v-6.914L14.23 2.854zm2.12 1.414c-.19-.195-.51-.195-.7 0L4.41 15.51V19h3.49l11.24-11.242c.2-.195.2-.513 0-.707l-3.38-3.378-.41.595zm-1.42 1.42l3.38 3.378-1.42 1.414-3.38-3.378 1.42-1.414z" })
                            ], -1)
                          ])])) : (vue.openBlock(), vue.createElementBlock("span", _hoisted_55, "—"))
                        ]),
                        vue.createElementVNode("td", _hoisted_56, [
                          user.followed_by ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_57, [..._cache[23] || (_cache[23] = [
                            vue.createElementVNode("svg", {
                              viewBox: "0 0 24 24",
                              class: "w-3.5 h-3.5",
                              fill: "currentColor"
                            }, [
                              vue.createElementVNode("path", { d: "M12 11.816c1.355 0 2.872-.15 3.84-1.256.814-.93 1.078-2.368.806-4.392-.38-2.825-2.117-4.512-4.646-4.512S7.734 3.343 7.354 6.168c-.272 2.024-.008 3.462.806 4.392.968 1.107 2.485 1.256 3.84 1.256zm-3.16-5.448c.162-1.2.787-3.212 3.16-3.212s2.998 2.013 3.16 3.212c.207 1.55.057 2.627-.45 3.205-.455.52-1.266.743-2.71.743s-2.255-.223-2.71-.743c-.507-.578-.657-1.656-.45-3.205zm11.44 12.868c-.877-3.526-4.282-5.99-8.28-5.99s-7.403 2.464-8.28 5.99c-.172.692-.028 1.4.395 1.94.408.52 1.04.82 1.733.82h12.304c.693 0 1.325-.3 1.733-.82.424-.54.567-1.247.394-1.94zm-1.576 1.016c-.126.16-.316.246-.552.246H5.848c-.235 0-.426-.086-.552-.246-.137-.174-.18-.412-.12-.654.71-2.855 3.517-4.85 6.824-4.85s6.114 1.994 6.824 4.85c.06.242.017.48-.12.654z" })
                            ], -1)
                          ])])) : (vue.openBlock(), vue.createElementBlock("span", _hoisted_58, "—"))
                        ])
                      ]);
                    }), 128)),
                    sortedUsers.value.length === 0 ? (vue.openBlock(), vue.createElementBlock("tr", _hoisted_59, [
                      vue.createElementVNode("td", _hoisted_60, vue.toDisplayString(vue.unref(t2)("noUsers")), 1)
                    ])) : vue.createCommentVNode("", true)
                  ])
                ])
              ]),
              totalPages.value > 1 ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_61, [
                vue.createElementVNode("div", _hoisted_62, [
                  vue.createElementVNode("button", {
                    class: "xd-btn-icon",
                    style: vue.normalizeStyle({ opacity: currentPage.value <= 1 ? 0.3 : 1, pointerEvents: currentPage.value <= 1 ? "none" : "auto" }),
                    onClick: _cache[7] || (_cache[7] = ($event) => currentPage.value--)
                  }, "«", 4),
                  (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(visiblePages.value, (p) => {
                    return vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: p }, [
                      p === "..." ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_63, "…")) : (vue.openBlock(), vue.createElementBlock("button", {
                        key: 1,
                        class: vue.normalizeClass(["xd-tab", { active: currentPage.value === p }]),
                        onClick: ($event) => currentPage.value = p
                      }, vue.toDisplayString(p), 11, _hoisted_64))
                    ], 64);
                  }), 128)),
                  vue.createElementVNode("button", {
                    class: "xd-btn-icon",
                    style: vue.normalizeStyle({ opacity: currentPage.value >= totalPages.value ? 0.3 : 1, pointerEvents: currentPage.value >= totalPages.value ? "none" : "auto" }),
                    onClick: _cache[8] || (_cache[8] = ($event) => currentPage.value++)
                  }, "»", 4)
                ])
              ])) : vue.createCommentVNode("", true)
            ]),
            _: 1
          }, 8, ["title"]),
          showSettings.value ? (vue.openBlock(), vue.createBlock(_sfc_main$2, {
            key: 0,
            onClose: _cache[10] || (_cache[10] = ($event) => showSettings.value = false),
            onDraw: onDrawResult
          })) : vue.createCommentVNode("", true),
          showResult.value ? (vue.openBlock(), vue.createBlock(_sfc_main$3, {
            key: 1,
            winners: winners.value,
            onClose: _cache[11] || (_cache[11] = ($event) => showResult.value = false)
          }, null, 8, ["winners"])) : vue.createCommentVNode("", true),
          hoveredUser.value ? (vue.openBlock(), vue.createElementBlock("div", {
            key: 2,
            class: "fixed z-[10000] w-72 bg-[#1e2d3d] border border-[#38444d] rounded-xl shadow-xl p-4 pointer-events-none",
            style: vue.normalizeStyle({ left: tooltipPos.value.x + "px", top: tooltipPos.value.y - 8 + "px", transform: "translateY(-100%)" })
          }, [
            vue.createElementVNode("div", _hoisted_66, [
              vue.createElementVNode("img", {
                src: hoveredUser.value.avatarUrl,
                alt: hoveredUser.value.username,
                class: "w-12 h-12 rounded-full shrink-0"
              }, null, 8, _hoisted_67),
              vue.createElementVNode("div", _hoisted_68, [
                vue.createElementVNode("div", _hoisted_69, vue.toDisplayString(hoveredUser.value.username), 1),
                vue.createElementVNode("div", _hoisted_70, "@" + vue.toDisplayString(hoveredUser.value.handle), 1)
              ])
            ]),
            hoveredUser.value.bio ? (vue.openBlock(), vue.createElementBlock("p", _hoisted_71, vue.toDisplayString(hoveredUser.value.bio), 1)) : (vue.openBlock(), vue.createElementBlock("p", _hoisted_72, vue.toDisplayString(vue.unref(t2)("noBio")), 1)),
            vue.createElementVNode("div", _hoisted_73, [
              hoveredUser.value.hasRetweet ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_74, [
                _cache[25] || (_cache[25] = vue.createElementVNode("svg", {
                  viewBox: "0 0 24 24",
                  class: "w-3.5 h-3.5",
                  fill: "currentColor"
                }, [
                  vue.createElementVNode("path", { d: "M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" })
                ], -1)),
                vue.createTextVNode(vue.toDisplayString(vue.unref(t2)("retweetType")), 1)
              ])) : vue.createCommentVNode("", true),
              hoveredUser.value.hasLike ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_75, [
                _cache[26] || (_cache[26] = vue.createElementVNode("svg", {
                  viewBox: "0 0 24 24",
                  class: "w-3.5 h-3.5",
                  fill: "currentColor"
                }, [
                  vue.createElementVNode("path", { d: "M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" })
                ], -1)),
                vue.createTextVNode(vue.toDisplayString(vue.unref(t2)("likeType")), 1)
              ])) : vue.createCommentVNode("", true),
              hoveredUser.value.hasQuote ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_76, [
                _cache[27] || (_cache[27] = vue.createElementVNode("svg", {
                  viewBox: "0 0 24 24",
                  class: "w-3.5 h-3.5",
                  fill: "currentColor"
                }, [
                  vue.createElementVNode("path", { d: "M14.23 2.854c.98-.977 2.56-.977 3.54 0l3.38 3.378c.97.977.97 2.559 0 3.536L9.91 21H3v-6.914L14.23 2.854zm2.12 1.414c-.19-.195-.51-.195-.7 0L4.41 15.51V19h3.49l11.24-11.242c.2-.195.2-.513 0-.707l-3.38-3.378-.41.595zm-1.42 1.42l3.38 3.378-1.42 1.414-3.38-3.378 1.42-1.414z" })
                ], -1)),
                vue.createTextVNode(vue.toDisplayString(vue.unref(t2)("quoteType")), 1)
              ])) : vue.createCommentVNode("", true),
              hoveredUser.value.followed_by ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_77, [
                _cache[28] || (_cache[28] = vue.createElementVNode("svg", {
                  viewBox: "0 0 24 24",
                  class: "w-3.5 h-3.5",
                  fill: "currentColor"
                }, [
                  vue.createElementVNode("path", { d: "M12 11.816c1.355 0 2.872-.15 3.84-1.256.814-.93 1.078-2.368.806-4.392-.38-2.825-2.117-4.512-4.646-4.512S7.734 3.343 7.354 6.168c-.272 2.024-.008 3.462.806 4.392.968 1.107 2.485 1.256 3.84 1.256zm-3.16-5.448c.162-1.2.787-3.212 3.16-3.212s2.998 2.013 3.16 3.212c.207 1.55.057 2.627-.45 3.205-.455.52-1.266.743-2.71.743s-2.255-.223-2.71-.743c-.507-.578-.657-1.656-.45-3.205zm11.44 12.868c-.877-3.526-4.282-5.99-8.28-5.99s-7.403 2.464-8.28 5.99c-.172.692-.028 1.4.395 1.94.408.52 1.04.82 1.733.82h12.304c.693 0 1.325-.3 1.733-.82.424-.54.567-1.247.394-1.94zm-1.576 1.016c-.126.16-.316.246-.552.246H5.848c-.235 0-.426-.086-.552-.246-.137-.174-.18-.412-.12-.654.71-2.855 3.517-4.85 6.824-4.85s6.114 1.994 6.824 4.85c.06.242.017.48-.12.654z" })
                ], -1)),
                vue.createTextVNode(vue.toDisplayString(vue.unref(t2)("followingYou")), 1)
              ])) : vue.createCommentVNode("", true)
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
          render: () => vue.h(_sfc_main$5, {
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
  const styleCss = `/*! tailwindcss v4.2.2 | MIT License | https://tailwindcss.com */@layer properties{@supports (((-webkit-hyphens:none)) and (not (margin-trim:inline))) or ((-moz-orient:inline) and (not (color:rgb(from red r g b)))){*,:before,:after,::backdrop{--tw-rotate-x:initial;--tw-rotate-y:initial;--tw-rotate-z:initial;--tw-skew-x:initial;--tw-skew-y:initial;--tw-space-y-reverse:0;--tw-border-style:solid;--tw-leading:initial;--tw-font-weight:initial;--tw-shadow:0 0 #0000;--tw-shadow-color:initial;--tw-shadow-alpha:100%;--tw-inset-shadow:0 0 #0000;--tw-inset-shadow-color:initial;--tw-inset-shadow-alpha:100%;--tw-ring-color:initial;--tw-ring-shadow:0 0 #0000;--tw-inset-ring-color:initial;--tw-inset-ring-shadow:0 0 #0000;--tw-ring-inset:initial;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-offset-shadow:0 0 #0000}}}@layer theme{:root,:host{--font-sans:ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";--font-mono:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;--color-black:#000;--color-white:#fff;--spacing:.25rem;--text-xs:.75rem;--text-xs--line-height:calc(1 / .75);--text-sm:.875rem;--text-sm--line-height:calc(1.25 / .875);--text-lg:1.125rem;--text-lg--line-height:calc(1.75 / 1.125);--text-xl:1.25rem;--text-xl--line-height:calc(1.75 / 1.25);--font-weight-medium:500;--font-weight-bold:700;--leading-relaxed:1.625;--radius-lg:.5rem;--radius-xl:.75rem;--radius-2xl:1rem;--animate-spin:spin 1s linear infinite;--default-transition-duration:.15s;--default-transition-timing-function:cubic-bezier(.4, 0, .2, 1);--default-font-family:var(--font-sans);--default-mono-font-family:var(--font-mono)}}@layer base{*,:after,:before,::backdrop{box-sizing:border-box;border:0 solid;margin:0;padding:0}::file-selector-button{box-sizing:border-box;border:0 solid;margin:0;padding:0}html,:host{-webkit-text-size-adjust:100%;tab-size:4;line-height:1.5;font-family:var(--default-font-family,ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji");font-feature-settings:var(--default-font-feature-settings,normal);font-variation-settings:var(--default-font-variation-settings,normal);-webkit-tap-highlight-color:transparent}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;-webkit-text-decoration:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:var(--default-mono-font-family,ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace);font-feature-settings:var(--default-mono-font-feature-settings,normal);font-variation-settings:var(--default-mono-font-variation-settings,normal);font-size:1em}small{font-size:80%}sub,sup{vertical-align:baseline;font-size:75%;line-height:0;position:relative}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}:-moz-focusring{outline:auto}progress{vertical-align:baseline}summary{display:list-item}ol,ul,menu{list-style:none}img,svg,video,canvas,audio,iframe,embed,object{vertical-align:middle;display:block}img,video{max-width:100%;height:auto}button,input,select,optgroup,textarea{font:inherit;font-feature-settings:inherit;font-variation-settings:inherit;letter-spacing:inherit;color:inherit;opacity:1;background-color:#0000;border-radius:0}::file-selector-button{font:inherit;font-feature-settings:inherit;font-variation-settings:inherit;letter-spacing:inherit;color:inherit;opacity:1;background-color:#0000;border-radius:0}:where(select:is([multiple],[size])) optgroup{font-weight:bolder}:where(select:is([multiple],[size])) optgroup option{padding-inline-start:20px}::file-selector-button{margin-inline-end:4px}::placeholder{opacity:1}@supports (not ((-webkit-appearance:-apple-pay-button))) or (contain-intrinsic-size:1px){::placeholder{color:currentColor}@supports (color:color-mix(in lab,red,red)){::placeholder{color:color-mix(in oklab,currentcolor 50%,transparent)}}}textarea{resize:vertical}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-date-and-time-value{min-height:1lh;text-align:inherit}::-webkit-datetime-edit{display:inline-flex}::-webkit-datetime-edit-fields-wrapper{padding:0}::-webkit-datetime-edit{padding-block:0}::-webkit-datetime-edit-year-field{padding-block:0}::-webkit-datetime-edit-month-field{padding-block:0}::-webkit-datetime-edit-day-field{padding-block:0}::-webkit-datetime-edit-hour-field{padding-block:0}::-webkit-datetime-edit-minute-field{padding-block:0}::-webkit-datetime-edit-second-field{padding-block:0}::-webkit-datetime-edit-millisecond-field{padding-block:0}::-webkit-datetime-edit-meridiem-field{padding-block:0}::-webkit-calendar-picker-indicator{line-height:1}:-moz-ui-invalid{box-shadow:none}button,input:where([type=button],[type=reset],[type=submit]){appearance:button}::file-selector-button{appearance:button}::-webkit-inner-spin-button{height:auto}::-webkit-outer-spin-button{height:auto}[hidden]:where(:not([hidden=until-found])){display:none!important}}@layer components;@layer utilities{.pointer-events-none{pointer-events:none}.visible{visibility:visible}.fixed{position:fixed}.sticky{position:sticky}.inset-0{inset:calc(var(--spacing) * 0)}.start{inset-inline-start:var(--spacing)}.top-0{top:calc(var(--spacing) * 0)}.z-\\[1\\]{z-index:1}.z-\\[10000\\]{z-index:10000}.mt-1{margin-top:calc(var(--spacing) * 1)}.mt-2{margin-top:calc(var(--spacing) * 2)}.mb-2{margin-bottom:calc(var(--spacing) * 2)}.ml-1{margin-left:calc(var(--spacing) * 1)}.flex{display:flex}.grid{display:grid}.inline-flex{display:inline-flex}.h-3{height:calc(var(--spacing) * 3)}.h-3\\.5{height:calc(var(--spacing) * 3.5)}.h-4{height:calc(var(--spacing) * 4)}.h-8{height:calc(var(--spacing) * 8)}.h-12{height:calc(var(--spacing) * 12)}.h-\\[18\\.75px\\]{height:18.75px}.h-\\[34\\.75px\\]{height:34.75px}.h-\\[700px\\]{height:700px}.max-h-\\[80vh\\]{max-height:80vh}.min-h-0{min-height:calc(var(--spacing) * 0)}.w-3{width:calc(var(--spacing) * 3)}.w-3\\.5{width:calc(var(--spacing) * 3.5)}.w-4{width:calc(var(--spacing) * 4)}.w-8{width:calc(var(--spacing) * 8)}.w-12{width:calc(var(--spacing) * 12)}.w-14{width:calc(var(--spacing) * 14)}.w-16{width:calc(var(--spacing) * 16)}.w-20{width:calc(var(--spacing) * 20)}.w-40{width:calc(var(--spacing) * 40)}.w-72{width:calc(var(--spacing) * 72)}.w-\\[18\\.75px\\]{width:18.75px}.w-\\[34\\.75px\\]{width:34.75px}.w-\\[400px\\]{width:400px}.w-\\[700px\\]{width:700px}.w-\\[900px\\]{width:900px}.w-auto{width:auto}.w-full{width:100%}.max-w-\\[240px\\]{max-width:240px}.min-w-0{min-width:calc(var(--spacing) * 0)}.flex-1{flex:1}.shrink-0{flex-shrink:0}.border-collapse{border-collapse:collapse}.transform{transform:var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,)}.animate-spin{animation:var(--animate-spin)}.cursor-pointer{cursor:pointer}.grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}.grid-cols-5{grid-template-columns:repeat(5,minmax(0,1fr))}.flex-col{flex-direction:column}.flex-wrap{flex-wrap:wrap}.items-center{align-items:center}.items-start{align-items:flex-start}.justify-between{justify-content:space-between}.justify-center{justify-content:center}.justify-end{justify-content:flex-end}.gap-1{gap:calc(var(--spacing) * 1)}.gap-2{gap:calc(var(--spacing) * 2)}.gap-3{gap:calc(var(--spacing) * 3)}.gap-4{gap:calc(var(--spacing) * 4)}:where(.space-y-3>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(calc(var(--spacing) * 3) * var(--tw-space-y-reverse));margin-block-end:calc(calc(var(--spacing) * 3) * calc(1 - var(--tw-space-y-reverse)))}.truncate{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.overflow-auto{overflow:auto}.overflow-hidden{overflow:hidden}.rounded-2xl{border-radius:var(--radius-2xl)}.rounded-full{border-radius:3.40282e38px}.rounded-lg{border-radius:var(--radius-lg)}.rounded-xl{border-radius:var(--radius-xl)}.border{border-style:var(--tw-border-style);border-width:1px}.border-t{border-top-style:var(--tw-border-style);border-top-width:1px}.border-r{border-right-style:var(--tw-border-style);border-right-width:1px}.border-b{border-bottom-style:var(--tw-border-style);border-bottom-width:1px}.border-\\[\\#38444d\\]{border-color:#38444d}.border-\\[\\#38444d\\]\\/30{border-color:#38444d4d}.bg-\\[\\#1e2d3d\\]{background-color:#1e2d3d}.bg-\\[\\#15202b\\]{background-color:#15202b}.bg-\\[\\#273340\\]{background-color:#273340}.bg-black\\/60{background-color:#0009}@supports (color:color-mix(in lab,red,red)){.bg-black\\/60{background-color:color-mix(in oklab,var(--color-black) 60%,transparent)}}.p-3{padding:calc(var(--spacing) * 3)}.p-4{padding:calc(var(--spacing) * 4)}.p-5{padding:calc(var(--spacing) * 5)}.px-1{padding-inline:calc(var(--spacing) * 1)}.px-3{padding-inline:calc(var(--spacing) * 3)}.px-4{padding-inline:calc(var(--spacing) * 4)}.px-5{padding-inline:calc(var(--spacing) * 5)}.px-6{padding-inline:calc(var(--spacing) * 6)}.py-2{padding-block:calc(var(--spacing) * 2)}.py-2\\.5{padding-block:calc(var(--spacing) * 2.5)}.py-3{padding-block:calc(var(--spacing) * 3)}.py-4{padding-block:calc(var(--spacing) * 4)}.py-12{padding-block:calc(var(--spacing) * 12)}.pb-4{padding-bottom:calc(var(--spacing) * 4)}.text-center{text-align:center}.text-left{text-align:left}.text-lg{font-size:var(--text-lg);line-height:var(--tw-leading,var(--text-lg--line-height))}.text-sm{font-size:var(--text-sm);line-height:var(--tw-leading,var(--text-sm--line-height))}.text-xl{font-size:var(--text-xl);line-height:var(--tw-leading,var(--text-xl--line-height))}.text-xs{font-size:var(--text-xs);line-height:var(--tw-leading,var(--text-xs--line-height))}.text-\\[11px\\]{font-size:11px}.leading-relaxed{--tw-leading:var(--leading-relaxed);line-height:var(--leading-relaxed)}.font-bold{--tw-font-weight:var(--font-weight-bold);font-weight:var(--font-weight-bold)}.font-medium{--tw-font-weight:var(--font-weight-medium);font-weight:var(--font-weight-medium)}.text-\\[\\#00ba7c\\]{color:#00ba7c}.text-\\[\\#1d9bf0\\]{color:#1d9bf0}.text-\\[\\#38444d\\]{color:#38444d}.text-\\[\\#71767b\\]{color:#71767b}.text-\\[\\#e7e9ea\\]{color:#e7e9ea}.text-\\[\\#f91880\\]{color:#f91880}.text-\\[\\#ff7a00\\]{color:#ff7a00}.text-white{color:var(--color-white)}.italic{font-style:italic}.opacity-25{opacity:.25}.opacity-50{opacity:.5}.opacity-60{opacity:.6}.opacity-75{opacity:.75}.shadow-2xl{--tw-shadow:0 25px 50px -12px var(--tw-shadow-color,#00000040);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.shadow-xl{--tw-shadow:0 20px 25px -5px var(--tw-shadow-color,#0000001a), 0 8px 10px -6px var(--tw-shadow-color,#0000001a);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.transition-colors{transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}@media (hover:hover){.group-hover\\:text-\\[\\#1d9bf0\\]:is(:where(.group):hover *){color:#1d9bf0}.hover\\:bg-\\[\\#1d9bf0\\]\\/10:hover{background-color:#1d9bf01a}.hover\\:bg-\\[\\#273340\\]\\/50:hover{background-color:#27334080}.hover\\:bg-white\\/\\[0\\.03\\]:hover{background-color:#ffffff08}@supports (color:color-mix(in lab,red,red)){.hover\\:bg-white\\/\\[0\\.03\\]:hover{background-color:color-mix(in oklab,var(--color-white) 3%,transparent)}}.hover\\:underline:hover{text-decoration-line:underline}}}#x-draw-helper{--xd-bg:#15202b;--xd-bg-elevated:#1e2d3d;--xd-bg-secondary:#273340;--xd-border:#38444d;--xd-text:#e7e9ea;--xd-text-muted:#71767b;--xd-blue:#1d9bf0;--xd-blue-hover:#1a8cd8;--xd-green:#00ba7c;--xd-green-hover:#00a36d;--xd-pink:#f91880;--xd-pink-hover:#e0167a;color:var(--xd-text);font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif}#x-draw-helper .xd-btn{cursor:pointer;white-space:nowrap;box-sizing:border-box;appearance:none;border:none;border-radius:9999px;outline:none;justify-content:center;align-items:center;gap:6px;padding:6px 16px;font-size:14px;font-weight:700;line-height:20px;text-decoration:none;transition:background-color .2s,opacity .2s;display:inline-flex}#x-draw-helper .xd-btn-primary{background-color:var(--xd-blue);color:#fff}#x-draw-helper .xd-btn-primary:hover{background-color:var(--xd-blue-hover)}#x-draw-helper .xd-btn-success{background-color:var(--xd-green);color:#fff}#x-draw-helper .xd-btn-success:hover{background-color:var(--xd-green-hover)}#x-draw-helper .xd-btn-ghost{color:var(--xd-text);background-color:#0000}#x-draw-helper .xd-btn-ghost:hover{background-color:#ffffff1a}#x-draw-helper .xd-btn-secondary{background-color:var(--xd-bg-secondary);color:var(--xd-text)}#x-draw-helper .xd-btn-secondary:hover{background-color:var(--xd-border)}#x-draw-helper .xd-btn-icon{width:32px;height:32px;color:var(--xd-text-muted);cursor:pointer;appearance:none;background:0 0;border:none;border-radius:50%;justify-content:center;align-items:center;padding:0;font-size:18px;line-height:1;transition:background-color .2s,color .2s;display:inline-flex}#x-draw-helper .xd-btn-icon:hover{color:#fff;background-color:#ffffff1a}#x-draw-helper .xd-input{background-color:var(--xd-bg-secondary);border:1px solid var(--xd-border);color:#fff;box-sizing:border-box;-webkit-appearance:none;appearance:textfield;border-radius:6px;outline:none;padding:6px 10px;font-size:14px;line-height:20px;transition:border-color .2s}#x-draw-helper .xd-input::-webkit-inner-spin-button{opacity:1}#x-draw-helper .xd-input::-webkit-outer-spin-button{opacity:1}#x-draw-helper .xd-input:focus{border-color:var(--xd-blue)}#x-draw-helper .xd-select{background-color:var(--xd-bg-secondary);border:1px solid var(--xd-border);color:#fff;cursor:pointer;box-sizing:border-box;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371767b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");background-position:right 8px center;background-repeat:no-repeat;border-radius:6px;outline:none;padding:6px 28px 6px 10px;font-size:14px;line-height:20px;transition:border-color .2s}#x-draw-helper .xd-select:focus{border-color:var(--xd-blue)}#x-draw-helper .xd-select option{background-color:var(--xd-bg-secondary);color:#fff}#x-draw-helper .xd-tab-group{background-color:var(--xd-bg-secondary);border-radius:8px;gap:2px;padding:3px;display:inline-flex}#x-draw-helper .xd-tab{color:var(--xd-text);cursor:pointer;white-space:nowrap;appearance:none;background:0 0;border:none;border-radius:6px;padding:6px 12px;font-size:12px;line-height:16px;transition:background-color .2s,color .2s}#x-draw-helper .xd-tab:hover:not(.active){background-color:#ffffff0d}#x-draw-helper .xd-tab.active{background-color:var(--xd-blue);color:#fff}#x-draw-helper .xd-badge{border-radius:9999px;justify-content:center;align-items:center;gap:4px;padding:3px 8px;font-size:12px;font-weight:500;line-height:16px;display:inline-flex}#x-draw-helper .xd-badge-green{color:var(--xd-green);background-color:#00ba7c26}#x-draw-helper .xd-badge-pink{color:var(--xd-pink);background-color:#f9188026}#x-draw-helper .xd-badge-blue{color:var(--xd-blue);background-color:#1d9bf026}#x-draw-helper .xd-badge-orange{color:#ff7a00;background-color:#ff7a0026}#x-draw-helper .xd-th{cursor:pointer;-webkit-user-select:none;user-select:none;color:var(--xd-text-muted);font-weight:500;transition:color .2s}#x-draw-helper .xd-th:hover{color:#fff}#x-draw-helper .xd-checkbox{border:2px solid var(--xd-border);cursor:pointer;appearance:none;background:0 0;border-radius:4px;flex-shrink:0;width:18px;height:18px;transition:background-color .2s,border-color .2s;position:relative}#x-draw-helper .xd-checkbox:checked{background-color:var(--xd-blue);border-color:var(--xd-blue)}#x-draw-helper .xd-checkbox:checked:after{content:"";border:2px solid #fff;border-width:0 2px 2px 0;width:6px;height:10px;position:absolute;top:1px;left:4px;transform:rotate(45deg)}#x-draw-helper ::-webkit-scrollbar{width:6px}#x-draw-helper ::-webkit-scrollbar-track{background:0 0}#x-draw-helper ::-webkit-scrollbar-thumb{background-color:var(--xd-border);border-radius:3px}#x-draw-helper ::-webkit-scrollbar-thumb:hover{background-color:var(--xd-text-muted)}@property --tw-rotate-x{syntax:"*";inherits:false}@property --tw-rotate-y{syntax:"*";inherits:false}@property --tw-rotate-z{syntax:"*";inherits:false}@property --tw-skew-x{syntax:"*";inherits:false}@property --tw-skew-y{syntax:"*";inherits:false}@property --tw-space-y-reverse{syntax:"*";inherits:false;initial-value:0}@property --tw-border-style{syntax:"*";inherits:false;initial-value:solid}@property --tw-leading{syntax:"*";inherits:false}@property --tw-font-weight{syntax:"*";inherits:false}@property --tw-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-shadow-color{syntax:"*";inherits:false}@property --tw-shadow-alpha{syntax:"<percentage>";inherits:false;initial-value:100%}@property --tw-inset-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-inset-shadow-color{syntax:"*";inherits:false}@property --tw-inset-shadow-alpha{syntax:"<percentage>";inherits:false;initial-value:100%}@property --tw-ring-color{syntax:"*";inherits:false}@property --tw-ring-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-inset-ring-color{syntax:"*";inherits:false}@property --tw-inset-ring-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-ring-inset{syntax:"*";inherits:false}@property --tw-ring-offset-width{syntax:"<length>";inherits:false;initial-value:0}@property --tw-ring-offset-color{syntax:"*";inherits:false;initial-value:#fff}@property --tw-ring-offset-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@keyframes spin{to{transform:rotate(360deg)}}`;
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