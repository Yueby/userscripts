import { GM_xmlhttpRequest } from '$';
import { BaseAPI } from '../BaseAPI';
import { SessionCookieInfo, SessionData, SessionResult } from './types';

/**
 * Session API
 * 提供获取和管理 Booth Session 的功能
 */
export class SessionAPI extends BaseAPI<SessionAPI> {
    
    constructor() {
        super();
    }

    /**
     * 判断是否应该在当前页面激活
     * Session API 在所有页面都可用
     */
    protected shouldActivate(): boolean {
        return true;
    }

    /**
     * 加载数据（Session API 不需要预加载）
     */
    protected load(): void {
        // Session API 不需要预加载数据
    }

    /**
     * 从响应头中提取 Cookie 信息
     */
    private extractCookieInfo(headers: string): SessionCookieInfo | null {
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
     * 获取 Booth Session
     * @returns Promise<SessionResult> Session 数据或错误信息
     */
    public async getSession(): Promise<SessionResult> {
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
                        const sessionData: SessionData = {
                            _plaza_session_nktz7u: cookieInfo.value,
                            updated_at: new Date().toISOString(),
                            expires_at: cookieInfo.expires
                        };

                        resolve({
                            success: true,
                            data: sessionData
                        });
                    } else {
                        resolve({
                            success: false,
                            error: '未找到有效的 Session'
                        });
                    }
                },
                onerror: (error) => {
                    resolve({
                        success: false,
                        error: `请求出错: ${error.error || '网络错误'}`
                    });
                }
            });
        });
    }

    /**
     * 获取 Session 并格式化为 JSON 字符串
     * @returns Promise<string | null> JSON 格式的 Session 数据
     */
    public async getSessionJSON(): Promise<string | null> {
        const result = await this.getSession();
        if (result.success && result.data) {
            return JSON.stringify(result.data, null, 2);
        }
        return null;
    }
}

export * from './types';

