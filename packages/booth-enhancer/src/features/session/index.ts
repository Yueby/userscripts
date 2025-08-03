import { GM_notification, GM_registerMenuCommand, GM_setClipboard, GM_xmlhttpRequest } from '$';
import { Feature } from "../base";

/**
 * Booth网站会话管理页面
 * 提供获取和管理会话信息的功能
 */
export class SessionFeature extends Feature {
    shouldExecute(): boolean {
        return true;
    }

    async execute(): Promise<void> {
        await super.execute();
        GM_registerMenuCommand("获取Booth Session", () => this.getSession());
    }

    private extractCookieInfo(headers: string) {
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

    private getSession() {
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
                    const cookieData = {
                        _plaza_session_nktz7u: cookieInfo.value,
                        updated_at: new Date().toISOString(),
                        expires_at: cookieInfo.expires
                    };

                    GM_setClipboard(JSON.stringify(cookieData, null, 2), 'Booth Session');

                    GM_notification({
                        text: cookieInfo.expires
                            ? `Session已复制\n过期时间: ${new Date(cookieInfo.expires).toLocaleString()}`
                            : 'Session已复制到剪贴板',
                        title: '获取成功',
                        timeout: 3000
                    });
                } else {
                    GM_notification({
                        text: '未找到有效的 Session',
                        title: '获取失败',
                        timeout: 3000
                    });
                }
            },
            onerror: () => {
                GM_notification({
                    text: '请求出错，请检查网络连接',
                    title: '错误',
                    timeout: 3000
                });
            }
        });
    }
} 