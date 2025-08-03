// 货币类型
export type Currency = 'JPY' | 'CNY' | 'USD' | 'EUR' | 'GBP' | 'KRW' | 'HKD' | 'TWD';

// 用户设置
export interface UserSettings {
  timezone: string;        // 用户时区，如 'Asia/Shanghai'
  displayName: string;     // 时区显示名称，如 '中国标准时间'
  targetCurrency: Currency; // 目标货币，默认CNY
  privacyMode: boolean;    // 隐私模式，默认false
}

// 默认设置
export const DEFAULT_SETTINGS: UserSettings = {
  timezone: 'Asia/Shanghai',
  displayName: '中国标准时间',
  targetCurrency: 'CNY',
  privacyMode: false
};

// 常用时区选项
export const TIMEZONE_OPTIONS = [
  { value: 'Asia/Shanghai', label: '中国标准时间 (UTC+8)' },
  { value: 'Asia/Tokyo', label: '日本标准时间 (UTC+9)' },
  { value: 'America/New_York', label: '美国东部时间 (UTC-5)' },
  { value: 'America/Los_Angeles', label: '美国太平洋时间 (UTC-8)' },
  { value: 'Europe/London', label: '英国时间 (UTC+0)' },
  { value: 'Europe/Paris', label: '欧洲中部时间 (UTC+1)' },
  { value: 'Asia/Seoul', label: '韩国标准时间 (UTC+9)' },
  { value: 'Asia/Singapore', label: '新加坡时间 (UTC+8)' },
  { value: 'Australia/Sydney', label: '澳大利亚东部时间 (UTC+10)' },
  { value: 'UTC', label: '协调世界时 (UTC+0)' }
];

// 货币选项
export const CURRENCY_OPTIONS = [
  { value: 'CNY', label: '人民币 (CNY)', symbol: '¥' },
  { value: 'JPY', label: '日元 (JPY)', symbol: '¥' },
  { value: 'USD', label: '美元 (USD)', symbol: '$' },
  { value: 'EUR', label: '欧元 (EUR)', symbol: '€' },
  { value: 'GBP', label: '英镑 (GBP)', symbol: '£' },
  { value: 'KRW', label: '韩元 (KRW)', symbol: '₩' },
  { value: 'HKD', label: '港币 (HKD)', symbol: 'HK$' },
  { value: 'TWD', label: '台币 (TWD)', symbol: 'NT$' }
]; 