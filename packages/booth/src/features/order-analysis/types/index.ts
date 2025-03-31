/**
 * 订单数据接口
 */
export interface OrderData {
    orderNumber: string;
    identificationCode: string;
    paymentMethod: string;
    state: string;
    createdAt: string;
    paidAt: string;
    completedAt: string;
    totalPrice: number;
    postalCode?: string;
    prefecture?: string;
    cityAddress?: string;
    buildingRoom?: string;
    customerName?: string;
    phoneNumber?: string;
    itemDetails: string;
    items: OrderItem[];
    // 其他可能的字段
    [key: string]: any;
}

/**
 * 订单商品项接口
 */
export interface OrderItem {
    itemId: string;
    quantity: number;
    name: string;
}

/**
 * CSV解析选项
 */
export interface CsvParseOptions {
    delimiter?: string;
    skipHeader?: boolean;
    encoding?: string;
}

/**
 * 订单统计数据
 */
export interface OrderStats {
    totalOrders: number;
    totalSales: number;
    averageOrderValue: number;
    totalItems: number;
}