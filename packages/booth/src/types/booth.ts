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

/**
 * 页面上下文
 * 包含页面功能所需的共享资源
 */
export interface FeatureContext {
    observers: Map<string, MutationObserver | IntersectionObserver>;
    cachedElements: Map<string, HTMLElement>;
}