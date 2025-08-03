import Papa from 'papaparse';
import type { Order, OrderItem, CSVParseResult } from '../../types/order';
import { DataMappings } from '../mappings/data-mappings';
import { logger } from './logger';

// 使用papaparse的CSV解析器
export class CSVParser {
    static parse(csvText: string): CSVParseResult {
        try {
            // 使用papaparse解析CSV
            const result = Papa.parse(csvText, {
                header: true,           // 第一行作为表头
                skipEmptyLines: true,   // 跳过空行
                transformHeader: (header: string) => header.trim(), // 清理表头空格
                transform: (value: string) => value.trim() // 清理数据空格
            });

            if (result.errors.length > 0) {
                logger.error('CSV解析错误:', result.errors);
                return {
                    success: false,
                    error: `CSV解析错误: ${result.errors.map((e: Papa.ParseError) => e.message).join(', ')}`
                };
            }

            if (!result.data || result.data.length === 0) {
                return { success: false, error: 'CSV文件为空或格式错误' };
            }

            // 获取表头
            const headers = result.meta.fields || [];
            if (headers.length === 0) {
                return { success: false, error: 'CSV文件缺少表头' };
            }

            // 解析数据行
            const orders: Order[] = [];
            let successCount = 0;
            let errorCount = 0;

            for (const row of result.data) {
                const order = this.parseOrderRow(headers, row as Record<string, string>);
                if (order) {
                    orders.push(order);
                    successCount++;
                } else {
                    errorCount++;
                }
            }

            if (orders.length === 0) {
                return { success: false, error: '没有成功解析任何订单数据' };
            }

            return { success: true, data: orders };
        } catch (error) {
            logger.error('CSV解析失败:', error);
            return { success: false, error: `解析CSV失败: ${error}` };
        }
    }

    private static parseOrderRow(headers: string[], row: Record<string, string>): Order | null {
        try {
            // 使用多语言表头映射查找字段
            const orderNumber = DataMappings.findHeaderField(headers, 'orderNumber');
            const identificationCode = DataMappings.findHeaderField(headers, 'identificationCode');
            const paymentMethod = DataMappings.findHeaderField(headers, 'paymentMethod');
            const state = DataMappings.findHeaderField(headers, 'state');
            const createdAt = DataMappings.findHeaderField(headers, 'createdAt');
            const paidAt = DataMappings.findHeaderField(headers, 'paidAt');
            const completedAt = DataMappings.findHeaderField(headers, 'completedAt');
            const totalPrice = DataMappings.findHeaderField(headers, 'totalPrice');
            const postalCode = DataMappings.findHeaderField(headers, 'postalCode');
            const prefecture = DataMappings.findHeaderField(headers, 'prefecture');
            const city = DataMappings.findHeaderField(headers, 'city');
            const building = DataMappings.findHeaderField(headers, 'building');
            const customerName = DataMappings.findHeaderField(headers, 'customerName');
            const phoneNumber = DataMappings.findHeaderField(headers, 'phoneNumber');
            const itemsField = DataMappings.findHeaderField(headers, 'items');

            // 解析商品信息
            const items = itemsField ? DataMappings.parseItemsMultiLanguage(row[itemsField] || '') : [];
            
            // 解析价格，处理可能的货币符号和逗号
            const priceValue = totalPrice ? row[totalPrice] || '0' : '0';
            const cleanPrice = priceValue.replace(/[^\d.-]/g, ''); // 移除货币符号和逗号
            const parsedPrice = parseFloat(cleanPrice) || 0;

            // 解析订单状态
            const rawState = state ? row[state] || '' : '';
            const normalizedState = DataMappings.normalizeOrderState(rawState);

            return {
                orderNumber: orderNumber ? row[orderNumber] || '' : '',
                identificationCode: identificationCode ? row[identificationCode] || '' : '',
                paymentMethod: paymentMethod ? row[paymentMethod] as any : '',
                state: normalizedState,
                createdAt: createdAt ? row[createdAt] || '' : '',
                paidAt: paidAt ? row[paidAt] || '' : '',
                completedAt: completedAt ? row[completedAt] || '' : '',
                totalPrice: parsedPrice,
                postalCode: postalCode ? row[postalCode] || '' : '',
                prefecture: prefecture ? row[prefecture] || '' : '',
                city: city ? row[city] || '' : '',
                building: building ? row[building] || '' : '',
                customerName: customerName ? row[customerName] || '' : '',
                phoneNumber: phoneNumber ? row[phoneNumber] || '' : '',
                items
            };
        } catch (error) {
            logger.error('解析订单行失败:', error);
            return null;
        }
    }

    /**
     * 流式解析CSV（用于大数据量）
     */
    static parseStream(csvText: string, onChunk: (orders: Order[]) => void, onComplete: () => void, onError: (error: string) => void): void {
        try {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                transformHeader: (header: string) => header.trim(),
                transform: (value: string) => value.trim(),
                chunk: (results: Papa.ParseResult<Record<string, string>>) => {
                    const orders: Order[] = [];

                    for (const row of results.data) {
                        const order = this.parseOrderRow(results.meta.fields || [], row as Record<string, string>);
                        if (order) {
                            orders.push(order);
                        }
                    }

                    if (orders.length > 0) {
                        onChunk(orders);
                    }
                },
                complete: () => {
                    onComplete();
                },
                error: (error: Papa.ParseError) => {
                    logger.error('流式解析错误:', error);
                    onError(error.message);
                }
            } as any);
        } catch (error) {
            logger.error('流式解析失败:', error);
            onError(`流式解析失败: ${error}`);
        }
    }
} 