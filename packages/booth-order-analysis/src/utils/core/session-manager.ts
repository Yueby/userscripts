import { GM_xmlhttpRequest } from '$';
import { logger } from './logger';

export interface SessionInfo {
    _plaza_session_nktz7u: string;
    updated_at: string;
    expires_at: string | null;
}

/**
 * Session 管理器
 * 负责管理 Booth 网站的认证 Session 信息
 * 提供 Session 的获取、验证、刷新等功能
 */
export class SessionManager {
    private static instance: SessionManager;
    private sessionInfo: SessionInfo | null = null;

    private constructor() { }

    /**
     * 获取单例实例
     */
    static getInstance(): SessionManager {
        if (!SessionManager.instance) {
            SessionManager.instance = new SessionManager();
        }
        return SessionManager.instance;
    }

    /**
     * 获取有效的 Session
     * 如果已有 Session 且未过期，直接返回
     * 否则尝试获取新的 Session
     */
    async getValidSession(): Promise<string | null> {
        if (this.sessionInfo && this.isSessionValid()) {
            return this.sessionInfo._plaza_session_nktz7u;
        }

        try {
            const newSession = await this.fetchSession();
            if (newSession) {
                this.sessionInfo = newSession;
                return newSession._plaza_session_nktz7u;
            }
        } catch (error) {
            logger.warn('获取 Session 失败:', error);
        }

        return null;
    }

    /**
     * 检查 Session 是否有效
     * 如果没有过期时间，认为有效
     * 提前5分钟认为过期，避免边界情况
     */
    private isSessionValid(): boolean {
        if (!this.sessionInfo) return false;
        
        // 如果没有过期时间，认为有效
        if (!this.sessionInfo.expires_at) return true;
        
        // 检查是否过期（提前5分钟认为过期）
        const expiresTime = new Date(this.sessionInfo.expires_at).getTime();
        const currentTime = Date.now();
        const bufferTime = 5 * 60 * 1000; // 5分钟缓冲
        
        return currentTime < (expiresTime - bufferTime);
    }

    /**
     * 获取 Session 信息
     * 通过访问 Booth 订单页面获取认证 Cookie
     */
    private async fetchSession(): Promise<SessionInfo | null> {
        return new Promise((resolve) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: 'https://manage.booth.pm/orders',
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8'
                },
                onload: (response) => {
                    const cookieInfo = this.extractCookieInfo(response.responseHeaders);

                    if (cookieInfo) {
                        const sessionData: SessionInfo = {
                            _plaza_session_nktz7u: cookieInfo.value,
                            updated_at: new Date().toISOString(),
                            expires_at: cookieInfo.expires
                        };
                        
                        logger.info('成功获取 Session');
                        resolve(sessionData);
                    } else {
                        logger.warn('未找到有效的 Session');
                        resolve(null);
                    }
                },
                onerror: (error) => {
                    logger.error('获取 Session 请求失败:', error);
                    resolve(null);
                },
                ontimeout: () => {
                    logger.warn('获取 Session 请求超时');
                    resolve(null);
                }
            });
        });
    }

    /**
     * 从响应头提取 Cookie 信息
     * 查找包含 _plaza_session_nktz7u 的 Set-Cookie 头
     */
    private extractCookieInfo(headers: string): { value: string; expires: string | null } | null {
        const cookieHeader = headers.split('\n')
            .find(line => line.toLowerCase().startsWith('set-cookie:') &&
                line.includes('_plaza_session_nktz7u='));

        if (!cookieHeader) return null;

        const value = cookieHeader.split(';')[0].split('=').slice(1).join('=').trim();
        const expires = cookieHeader.match(/expires=([^;]+)/i)?.[1]?.trim();

        return {
            value,
            expires: expires ? new Date(expires).toISOString() : null
        };
    }

    /**
     * 手动刷新 Session
     * 强制获取新的 Session 信息
     */
    async refreshSession(): Promise<boolean> {
        try {
            const newSession = await this.fetchSession();
            if (newSession) {
                this.sessionInfo = newSession;
                logger.info('Session 刷新成功');
                return true;
            }
            return false;
        } catch (error) {
            logger.error('刷新 Session 失败:', error);
            return false;
        }
    }

    /**
     * 获取当前 Session 状态
     * 返回 Session 的存在性、有效性和过期时间
     */
    getSessionStatus(): { hasSession: boolean; isValid: boolean; expiresAt?: string } {
        return {
            hasSession: !!this.sessionInfo,
            isValid: this.isSessionValid(),
            expiresAt: this.sessionInfo?.expires_at || undefined
        };
    }

    /**
     * 清除 Session
     * 用于登出或 Session 失效时
     */
    clearSession(): void {
        this.sessionInfo = null;
        logger.info('Session 已清除');
    }

    /**
     * 检查是否需要重新认证
     * 基于 Session 状态判断
     */
    needsReauthentication(): boolean {
        return !this.sessionInfo || !this.isSessionValid();
    }

    /**
     * 获取 Session 的最后更新时间
     */
    getLastUpdateTime(): string | null {
        return this.sessionInfo?.updated_at || null;
    }

    /**
     * 获取 Session 的过期时间
     */
    getExpirationTime(): string | null {
        return this.sessionInfo?.expires_at || null;
    }
}
