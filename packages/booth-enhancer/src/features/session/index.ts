import { GM_notification, GM_registerMenuCommand, GM_setClipboard } from '$';
import { SessionAPI } from "../../api/session";
import { FeatureContext } from "../../types";
import { PageFeature } from "../PageFeature";

/**
 * Booth网站会话管理功能
 * 提供获取和管理会话信息的功能
 */
export class SessionFeature extends PageFeature<SessionAPI> {

    constructor(context: FeatureContext) {
        super(context);
    }

    shouldExecute(): boolean {
        return true;
    }

    protected createAPI(): SessionAPI | undefined {
        return new SessionAPI();
    }

    protected async initialize(): Promise<void> {
        GM_registerMenuCommand("获取Booth Session", () => this.getSessionAndCopy());
    }

    /**
     * 获取 Session 并复制到剪贴板
     */
    private async getSessionAndCopy(): Promise<void> {
        const api = this.getAPI();
        if (!api) return;

        const result = await api.getSession();

        if (result.success && result.data) {
            const jsonData = JSON.stringify(result.data, null, 2);
            GM_setClipboard(jsonData, 'Booth Session');

            GM_notification({
                text: result.data.expires_at
                    ? `Session已复制\n过期时间: ${new Date(result.data.expires_at).toLocaleString()}`
                    : 'Session已复制到剪贴板',
                title: '获取成功',
                timeout: 3000
            });
        } else {
            GM_notification({
                text: result.error || '未找到有效的 Session',
                title: '获取失败',
                timeout: 3000
            });
        }
    }

    cleanup(): void {
        // Session 功能无需清理
    }
} 