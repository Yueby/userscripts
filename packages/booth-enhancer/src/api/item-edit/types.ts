/**
 * Section 元素（单个章节/分段）
 */
export interface ItemEditSectionElement {
    /** section li 元素 */
    element: HTMLElement;
    /** 所属的 ul 容器 */
    container: HTMLElement;
    /** 标题输入框 */
    headlineInput: HTMLInputElement | null;
    /** 正文文本域 */
    bodyTextarea: HTMLTextAreaElement | null;
}

/**
 * Variation 变体元素（单个变体）
 */
export interface ItemEditVariationElement {
    /** variation li 元素 */
    element: HTMLElement;
    /** 所属的 ul 容器 */
    container: HTMLElement;
    /** 变体名称输入框 */
    nameInput: HTMLInputElement | null;
    /** 价格输入框（数字商品） */
    priceInput: HTMLInputElement | null;
}

/**
 * 标签元素信息
 */
export interface TagElements {
    /** 标签容器 (#item_tag) */
    container: HTMLElement;
    /** 标签输入框 */
    input: HTMLInputElement;
    /** 输入框容器 */
    inputContainer: HTMLElement;
}

/**
 * 标签数据
 */
export interface TagData {
    /** 标签文本 */
    text: string;
    /** 标签元素 */
    element: HTMLElement;
}


/**
 * 完整的商品编辑数据结构
 */
export interface ItemEditData {
    /** 商品名称输入框 */
    nameInput: HTMLInputElement | null;
    /** 商品描述文本域 */
    descriptionTextarea: HTMLTextAreaElement | null;
    /** Section 元素数组（所有 section li 元素） */
    sections: ItemEditSectionElement[];
    /** Variation 变体元素数组（所有 variation li 元素） */
    variations: ItemEditVariationElement[];
    /** 标签列表 */
    tags: TagData[];
    /** 标签相关元素 */
    tagElements: TagElements | null;
}

