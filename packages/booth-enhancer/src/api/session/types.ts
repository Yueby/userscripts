/**
 * Session Cookie 信息
 */
export interface SessionCookieInfo {
    value: string;
    expires: string | null;
}

/**
 * Session 数据
 */
export interface SessionData {
    _plaza_session_nktz7u: string;
    updated_at: string;
    expires_at: string | null;
}

/**
 * Session 获取结果
 */
export interface SessionResult {
    success: boolean;
    data?: SessionData;
    error?: string;
}


