import { GM_getValue, GM_setValue } from '$';
import type { UserSettings } from '../../types/settings';
import { DEFAULT_SETTINGS } from '../../types/settings';
import { logger } from '../core/logger';

// 设置管理器
export class SettingsManager {
    private static readonly SETTINGS_KEY = 'booth_order_analysis_settings';

    /**
     * 获取用户设置
     */
    static getSettings(): UserSettings {
        try {
            const savedSettings = GM_getValue(this.SETTINGS_KEY, null);
            if (savedSettings && typeof savedSettings === 'object') {
                return { ...DEFAULT_SETTINGS, ...(savedSettings as Partial<UserSettings>) };
            }
        } catch (error) {
            logger.error('读取设置失败:', error);
        }
        return { ...DEFAULT_SETTINGS };
    }

    /**
     * 保存用户设置
     */
    static saveSettings(settings: UserSettings): void {
        try {
            GM_setValue(this.SETTINGS_KEY, settings);
            logger.info('设置已保存');
        } catch (error) {
            logger.error('保存设置失败:', error);
        }
    }

    /**
     * 更新部分设置
     */
    static updateSettings(partialSettings: Partial<UserSettings>): void {
        const currentSettings = this.getSettings();
        const newSettings = { ...currentSettings, ...partialSettings };
        this.saveSettings(newSettings);
    }

    /**
     * 重置为默认设置
     */
    static resetSettings(): void {
        this.saveSettings(DEFAULT_SETTINGS);
        logger.info('设置已重置为默认值');
    }
} 