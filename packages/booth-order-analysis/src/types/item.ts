// Booth API 原始数据结构
export interface BoothImageSize {
    url: string;
}

export interface BoothPrimaryImage {
    url: string;
    base_resized: BoothImageSize;
    base_square: BoothImageSize;
    c_72x72: BoothImageSize;
    c_288x384: BoothImageSize;
    c_512x683: BoothImageSize;
    f_150x150: BoothImageSize;
    c_300: BoothImageSize;
    f_620: BoothImageSize;
    p_1200x630: BoothImageSize;
}

export interface APIParsedItem {
    id: number;
    state: string;
    url: string;
    name: string;
    primary_image: BoothPrimaryImage;
    state_label: string;
    variants: string[]; // 商品变体列表
    iconUrl?: string; // 商品图标URL（可选，用于内部存储）
}

export interface BoothApiMetadata {
    page: number;
    per_page: number;
    next_page: number | null;
    prev_page: number | null;
    total_count: number;
    total_pages: number;
}

export interface BoothApiResponse {
    metadata: BoothApiMetadata;
    items: APIParsedItem[];
}

// 从HTML元素中解析的商品数据结构
export interface HTMLParsedItem {
    name: string;                  // 商品名称
    url: string;                   // 商品链接
    favorites: number;             // 收藏数
    variants: HTMLParsedVariant[];  // 商品变体列表
}

// 商品变体数据结构
export interface HTMLParsedVariant {
    name: string;                  // 变体名称
    price: number;                 // 变体价格
}

// 统一的商品数据结构
export interface BoothItem {
    id: number; // 来自APIParsedItem
    name: string; // 来自APIParsedItem
    state: string; // 来自APIParsedItem
    url: string; // 来自APIParsedItem
    iconUrl?: string; // 来自APIParsedItem
    favorites: number; // 来自HTMLParsedItem
    variants: HTMLParsedVariant[]; // 来自HTMLParsedItem
} 