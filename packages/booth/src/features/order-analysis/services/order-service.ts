import { OrderData, OrderStats, OrderItem } from "../types";
import { GM_xmlhttpRequest } from '$';
import Papa from "papaparse";

// 本地存储键名
const ORDERS_STORAGE_KEY = 'booth_enhancer_orders';
const ORDERS_LAST_UPDATE_KEY = 'booth_enhancer_orders_last_update';

// CSV字段映射
// const CSV_FIELD_MAPPING = {
//     // 基本信息
//     orderNumber: 'Order Number',
//     identificationCode: 'Identification Code',
//     paymentMethod: '支付方式',
//     state: 'State',
//     createdAt: 'Created At',
//     paidAt: 'Paid At',
//     completedAt: 'Completed At',
//     totalPrice: 'Total Price',
    
//     // 收货信息
//     postalCode: '邮编',
//     prefecture: '都道府县',
//     cityAddress: '市区町村、丁目、番地',
//     buildingRoom: '公寓、建筑物名、房间号',
//     customerName: '姓名',
//     phoneNumber: '电话号码',
    
//     // 商品信息
//     itemDetails: 'Item ID / Quantity / Name'
// };

/**
 * 订单服务工具类
 * 负责处理订单数据的获取和分析
 */
export class OrderService {

    /**
     * 解析商品详情字符串
     * @param itemDetails 商品详情字符串
     * @returns 解析后的商品信息数组
     */
    private static parseItemDetails(itemDetails: string): OrderItem[] {
        if (!itemDetails) return [];

        // 处理商品信息
        const normalizedItemDetails = itemDetails.trim();
        
        // 尝试解析单个商品项
        const item = this.parseSingleItemLine(normalizedItemDetails);
        return item ? [item] : [];
    }
    
    /**
     * 解析单行商品信息
     * @param line 单行商品信息
     * @returns 解析后的商品信息
     */
    private static parseSingleItemLine(line: string): OrderItem | null {
        if (!line || !line.trim()) return null;
        
        // 标准格式: "Item ID : 6029380 / Quantity : 1 / Rurune（ルルネ）🌸 Ribbon Ring"
        const parts = line.split('/').map(part => part.trim());
        
        const item: OrderItem = {
            itemId: '',
            quantity: 1,
            name: ''
        };
        
        // 提取商品ID
        const idPart = parts[0];
        const idMatch = idPart.match(/Item ID\s*:\s*(\d+)/i);
        if (idMatch) {
            item.itemId = idMatch[1];
        }
        
        // 提取数量
        if (parts.length > 1) {
            const quantityPart = parts[1];
            const quantityMatch = quantityPart.match(/Quantity\s*:\s*(\d+)/i);
            if (quantityMatch) {
                item.quantity = parseInt(quantityMatch[1], 10) || 1;
            }
        }
        
        // 提取商品名称（最后一部分）
        if (parts.length > 2) {
            item.name = parts[2].trim();
        }
        
        // 验证必要字段
        if (!item.itemId || !item.name) {
            console.warn('商品信息不完整:', { line, item });
            return null;
        }
        
        return item;
    }

    /**
     * 获取订单CSV数据
     * @returns 订单CSV数据
     */
    public static async fetchOrdersCsv(): Promise<string> {
        // 尝试从本地文件获取CSV数据
        try {
            // 使用GM_xmlhttpRequest获取本地CSV文件
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: "file:///E:/Github/userscripts/booth_orders_20250302004356.csv",
                    onload: function(response) {
                        if (response.status === 200) {
                            console.log('成功从本地文件获取CSV数据');
                            resolve(response.responseText);
                        } else {
                            console.error('从本地文件获取CSV数据失败:', response.status, response.statusText);
                            reject(new Error(`获取本地CSV数据失败: ${response.status} ${response.statusText}`));
                        }
                    },
                    onerror: function(error) {
                        console.error('从本地文件获取CSV数据失败:', error);
                        reject(new Error(`获取本地CSV数据失败: ${error}`));
                    }
                });
            });
        } catch (error) {
            console.error('尝试从本地文件获取CSV数据失败，将从网络获取:', error);
            
            // 如果从本地文件获取失败，则从网络获取
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: "https://manage.booth.pm/orders/csv",
                    headers: {
                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6,ru;q=0.5",
                        "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Microsoft Edge\";v=\"133\", \"Chromium\";v=\"133\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-platform": "\"Windows\"",
                        "sec-fetch-dest": "document",
                        "sec-fetch-mode": "navigate",
                        "sec-fetch-site": "same-origin",
                        "sec-fetch-user": "?1",
                        "upgrade-insecure-requests": "1",
                        "referer": "https://manage.booth.pm/orders"
                    },
                    onload: function(response) {
                        if (response.status === 200) {
                            console.log('成功从网络获取CSV数据');
                            resolve(response.responseText);
                        } else {
                            reject(new Error(`获取订单数据失败: ${response.status} ${response.statusText}`));
                        }
                    },
                    onerror: function(error) {
                        reject(new Error(`网络错误: ${error}`));
                    }
                });
            });
        }
    }

    /**
     * 解析订单CSV数据
     * @param csvData CSV数据字符串
     * @returns 解析后的订单数据数组
     */
    public static parseOrdersCsv(csvData: string): OrderData[] {
        if (!csvData) {
            console.error('CSV数据为空');
            return [];
        }

        // 使用PapaParse解析CSV
        const parseResult = Papa.parse(csvData, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim(),
            transform: (value) => value.trim()
        });

        if (!parseResult.data || !Array.isArray(parseResult.data)) {
            console.error('CSV解析失败:', parseResult);
            return [];
        }

        // 转换为OrderData对象
        const orders = parseResult.data.map((row: any, index: number) => {
            try {
                const orderData: OrderData = {
                    orderNumber: row['Order Number'] || '',
                    identificationCode: row['Identification Code'] || '',
                    paymentMethod: row['支付方式'] || '',
                    state: row['State'] || '',
                    createdAt: row['Created At'] || '',
                    paidAt: row['Paid At'] || '',
                    completedAt: row['Completed At'] || '',
                    totalPrice: parseInt(row['Total Price'] || '0', 10),
                    postalCode: row['邮编'] || '',
                    prefecture: row['都道府县'] || '',
                    cityAddress: row['市区町村、丁目、番地'] || '',
                    buildingRoom: row['公寓、建筑物名、房间号'] || '',
                    customerName: row['姓名'] || '',
                    phoneNumber: row['电话号码'] || '',
                    itemDetails: row['Item ID / Quantity / Name'] || '',
                    items: []
                };

                // 解析商品详情
                if (orderData.itemDetails) {
                    orderData.items = this.parseItemDetails(orderData.itemDetails);
                }

                // 验证必要字段
                if (!orderData.orderNumber || !orderData.state) {
                    console.warn(`订单 #${index + 1} 缺少必要字段:`, orderData);
                    return null;
                }

                return orderData;
            } catch (error) {
                console.error(`解析订单数据行 #${index + 1} 失败:`, error);
                return null;
            }
        }).filter(Boolean) as OrderData[];

        console.log(`成功解析 ${orders.length} 条订单数据`);
        return orders;
    }

    /**
     * 计算订单统计数据
     * @param orders 订单数据数组
     * @returns 订单统计数据
     */
    public static calculateOrderStats(orders: OrderData[]): OrderStats {
        if (!orders || orders.length === 0) {
            return {
                totalOrders: 0,
                totalSales: 0,
                averageOrderValue: 0,
                totalItems: 0
            };
        }

        // 计算总订单数
        const totalOrders = orders.length;

        // 计算总销售额
        const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);

        // 计算平均订单价值（四舍五入到2位小数）
        const averageOrderValue = Math.round((totalSales / totalOrders) * 100) / 100;

        // 计算总商品数量
        const totalItems = orders.reduce((sum, order) => {
            return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);

        return {
            totalOrders,
            totalSales,
            averageOrderValue,
            totalItems
        };
    }

    /**
     * 按状态过滤订单
     * @param orders 订单数据数组
     * @param status 状态值
     * @returns 过滤后的订单数组
     */
    public static filterOrdersByStatus(orders: OrderData[], status: string): OrderData[] {
        return orders.filter(order => order.state.toLowerCase().includes(status.toLowerCase()));
    }

    /**
     * 按日期范围过滤订单
     * @param orders 订单数据数组
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @returns 过滤后的订单数组
     */
    public static filterOrdersByDateRange(orders: OrderData[], startDate: Date, endDate: Date): OrderData[] {
        return orders.filter(order => {
            try {
            const orderDate = new Date(order.createdAt);
            return orderDate >= startDate && orderDate <= endDate;
            } catch (error) {
                console.error('日期解析错误:', error, order.createdAt);
                return false;
            }
        });
    }

    /**
     * 按商品名称搜索订单
     * @param orders 订单数据数组
     * @param productName 商品名称关键词
     * @returns 过滤后的订单数组
     */
    public static searchOrdersByProduct(orders: OrderData[], productName: string): OrderData[] {
        const keyword = productName.toLowerCase();
        return orders.filter(order => {
            // 搜索商品详情
            if (order.itemDetails && order.itemDetails.toLowerCase().includes(keyword)) {
                return true;
            }
            
            // 搜索解析后的商品名称
            if (order.items && order.items.some(item => item.name.toLowerCase().includes(keyword))) {
                return true;
            }
            
            return false;
        });
    }

    /**
     * 保存订单数据到本地存储
     * @param orders 订单数据
     */
    public static saveOrdersToLocalStorage(orders: OrderData[]): void {
        try {
            localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
            localStorage.setItem(ORDERS_LAST_UPDATE_KEY, new Date().toISOString());
        } catch (error) {
            console.error('保存订单数据到本地存储失败:', error);
        }
    }

    /**
     * 从本地存储获取订单数据
     * @returns 订单数据数组，如果没有则返回空数组
     */
    public static getOrdersFromLocalStorage(): OrderData[] {
        try {
            const ordersJson = localStorage.getItem(ORDERS_STORAGE_KEY);
            if (!ordersJson) return [];
            
            return JSON.parse(ordersJson);
        } catch (error) {
            console.error('从本地存储获取订单数据失败:', error);
            return [];
        }
    }

    /**
     * 获取上次更新时间
     * @returns 上次更新时间，如果没有则返回null
     */
    public static getLastUpdateTime(): Date | null {
        try {
            const lastUpdateStr = localStorage.getItem(ORDERS_LAST_UPDATE_KEY);
            if (!lastUpdateStr) return null;
            
            return new Date(lastUpdateStr);
        } catch (error) {
            console.error('获取上次更新时间失败:', error);
            return null;
        }
    }

    /**
     * 检查是否需要更新数据
     * @param intervalHours 更新间隔（小时）
     * @returns 是否需要更新
     */
    public static needsUpdate(intervalHours: number = 24): boolean {
        const lastUpdate = this.getLastUpdateTime();
        if (!lastUpdate) return true;
        
        const now = new Date();
        const hoursSinceLastUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
        
        return hoursSinceLastUpdate >= intervalHours;
    }

    /**
     * 获取订单数据
     * 如果本地没有数据或数据过期，则从服务器获取并更新本地存储
     * @param forceUpdate 是否强制更新
     * @returns 订单数据数组
     */
    public static async getOrders(forceUpdate: boolean = false): Promise<OrderData[]> {
        try {
            // 如果不是强制更新且不需要更新，则直接返回本地数据
            if (!forceUpdate && !this.needsUpdate()) {
                return this.getOrdersFromLocalStorage();
            }
            
            // 从服务器获取数据
            const csvData = await this.fetchOrdersCsv();
            const orders = this.parseOrdersCsv(csvData);
            
            // 保存到本地存储
            this.saveOrdersToLocalStorage(orders);
            
            return orders;
        } catch (error) {
            console.error('获取订单数据失败:', error);
            // 如果获取失败，返回本地数据
            return this.getOrdersFromLocalStorage();
        }
    }

    /**
     * 导出订单数据为CSV
     * @param orders 订单数据
     * @returns CSV字符串
     */
    public static exportOrdersToCsv(orders: OrderData[]): string {
        return Papa.unparse(orders);
    }

    /**
     * 导出订单数据为JSON
     * @param orders 订单数据
     * @returns JSON字符串
     */
    public static exportOrdersToJson(orders: OrderData[]): string {
        return JSON.stringify(orders, null, 2);
    }
}