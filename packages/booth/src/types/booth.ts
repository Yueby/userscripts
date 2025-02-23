// 页面类型
export type PageType = 'itemEdit' | 'dashboard' | 'other';

// 功能特性
export type Feature = 'variations' | 'tags' | 'dashboard' | 'session' | 'translate';

// 翻译相关
export interface TranslationRule {
    selector: string;
    prepend?: string;
    append?: string;
}

export interface TranslationConfig {
    translations: Record<string, string>;
    specialRules: TranslationRule[];
    selectors: {
        static: string[];
        dynamic: string[];
        exclude: string[];
        attributes: {
            translate: string[];
            observe: string[];
        };
    };
}

// Session相关
export interface CookieInfo {
    value: string;
    expires: string | null;
}

export interface SessionData {
    _plaza_session_nktz7u: string;
    updated_at: string;
    expires_at: string | null;
} 

export interface CommandContext {
    observers: Map<string, MutationObserver | IntersectionObserver>;
    cachedElements: Map<string, HTMLElement>;
}