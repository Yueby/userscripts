/**
 * 商品变体数据（页面原始数据）
 */
export interface VariationData {
    name: string;          // 变体名称
    price: number;         // 价格（日元）
    salesCount: number;    // 销量
    revenue: number;       // 收益（日元）
}

/**
 * 商品变体（数据 + DOM元素）
 */
export interface VariationElement {
    data: VariationData;   // 变体数据
    element: HTMLElement;  // 对应的li元素
}

/**
 * 商品标签（文本 + DOM元素）
 */
export interface TagElement {
    text: string;          // 标签文本
    element: HTMLElement;  // 对应的li元素
}

/**
 * 商品数据（页面原始数据）
 */
export interface ItemData {
    id: string;                        // 商品ID
    name: string;                      // 商品名称
    url: string;                       // 商品链接
    thumbnail: string;                 // 缩略图URL
    tags: string[];                    // 标签文本列表
    variations: VariationData[];       // 变体数据列表
    favoritesCount: number;            // 点赞数
}

/**
 * 商品项（数据 + DOM元素）
 */
export interface ItemElement {
    data: ItemData | null;             // 商品数据（延迟解析，初始为 null）
    element: HTMLElement;              // 对应的商品卡片元素
    variationsUl?: HTMLElement;        // 变体列表ul元素
    tagsUl?: HTMLElement;              // 标签列表ul元素
    variations: VariationElement[];    // 变体列表（数据+元素）
    tags: TagElement[];                // 标签列表（文本+元素）
}
