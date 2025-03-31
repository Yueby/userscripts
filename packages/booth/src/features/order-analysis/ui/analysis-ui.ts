import { OrderData, OrderStats } from '../types';
import { OrderService } from '../services/order-service';
import { UIUtils } from './ui-utils';

/**
 * 订单分析UI管理器
 * 负责创建和管理订单分析界面的UI元素
 */
export class AnalysisUI {
    private container: HTMLElement | null = null;
    private contentContainer: HTMLElement | null = null;
    private loadingElement: HTMLElement | null = null;

    /**
     * 显示订单分析界面
     */
    public show(): void {
        // 如果已经存在容器，则显示
        if (this.container) {
            this.container.style.display = 'block';
            return;
        }

        // 创建容器
        this.container = document.createElement('div');
        this.container.id = 'booth-order-analysis';
        this.container.style.cssText = `
            z-index: 9999; 
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        // 创建内容容器
        this.contentContainer = document.createElement('div');
        this.contentContainer.style.cssText = `
            width: 80%;
            max-width: 1000px;
            max-height: 90%;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            overflow: auto;
            padding: 20px;
            position: relative;
        `;

        // 添加关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
        `;
        closeButton.addEventListener('click', () => this.hide());
        this.contentContainer.appendChild(closeButton);

        // 添加标题
        const title = document.createElement('h2');
        title.textContent = '订单分析';
        title.style.cssText = `
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 20px;
            color: #333;
        `;
        this.contentContainer.appendChild(title);

        // 添加加载提示
        this.loadingElement = document.createElement('div');
        this.loadingElement.textContent = '正在加载订单数据...';
        this.loadingElement.style.cssText = `
            text-align: center;
            padding: 20px;
            color: #666;
        `;
        this.contentContainer.appendChild(this.loadingElement);

        // 添加到页面
        this.container.appendChild(this.contentContainer);
        document.body.appendChild(this.container);

        // 添加ESC键监听
        document.addEventListener('keydown', this.handleEscKey);
    }

    /**
     * 隐藏订单分析界面
     */
    public hide(): void {
        if (this.container) {
            document.body.removeChild(this.container);
            this.container = null;
            this.contentContainer = null;
            this.loadingElement = null;
            
            // 移除ESC键监听
            document.removeEventListener('keydown', this.handleEscKey);
        }
    }

    /**
     * 显示无数据提示
     */
    public showNoData(): void {
        if (!this.contentContainer || !this.loadingElement) return;
        
        // 移除加载提示
        this.contentContainer.removeChild(this.loadingElement);
        this.loadingElement = null;
        
        // 显示无数据提示
        const noDataElement = document.createElement('div');
        noDataElement.textContent = '没有找到订单数据';
        noDataElement.style.cssText = `
            text-align: center;
            padding: 20px;
            color: #666;
        `;
        this.contentContainer.appendChild(noDataElement);
    }

    /**
     * 显示错误信息
     */
    public showError(error: any): void {
        if (!this.contentContainer || !this.loadingElement) return;
        
        // 移除加载提示
        this.contentContainer.removeChild(this.loadingElement);
        this.loadingElement = null;
        
        // 显示错误信息
        const errorElement = document.createElement('div');
        errorElement.textContent = `加载订单数据失败: ${error}`;
        errorElement.style.cssText = `
            text-align: center;
            padding: 20px;
            color: #f56c6c;
        `;
        this.contentContainer.appendChild(errorElement);
    }

    /**
     * 更新内容
     */
    public updateContent(orders: OrderData[], stats: OrderStats): void {
        if (!this.contentContainer || !this.loadingElement) return;
        
        // 移除加载提示
        this.contentContainer.removeChild(this.loadingElement);
        this.loadingElement = null;
        
        // 添加统计面板
        this.createStatsPanel(stats);
        
        // 添加导出按钮
        this.createExportButtons(orders);
        
        // 添加订单表格
        this.createOrderTable(orders);
    }

    /**
     * 创建统计面板
     */
    private createStatsPanel(stats: OrderStats): void {
        if (!this.contentContainer) return;
        
        const statsPanel = document.createElement('div');
        statsPanel.style.cssText = `
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            flex-wrap: wrap;
        `;

        // 添加统计卡片
        statsPanel.appendChild(UIUtils.createStatCard('订单总数', stats.totalOrders, '#409EFF'));
        statsPanel.appendChild(UIUtils.createStatCard('总销售额', `¥ ${UIUtils.formatPrice(stats.totalSales)}`, '#67C23A'));
        statsPanel.appendChild(UIUtils.createStatCard('平均订单价值', `¥ ${UIUtils.formatPrice(stats.averageOrderValue)}`, '#E6A23C'));
        statsPanel.appendChild(UIUtils.createStatCard('总商品数量', stats.totalItems, '#F56C6C'));

        this.contentContainer.appendChild(statsPanel);
    }

    /**
     * 创建导出按钮
     */
    private createExportButtons(orders: OrderData[]): void {
        if (!this.contentContainer) return;
        
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            justify-content: flex-end;
            margin-bottom: 20px;
            gap: 10px;
        `;

        // 导出CSV按钮
        const exportCsvButton = UIUtils.createButton('导出CSV', () => {
            UIUtils.downloadFile('booth_orders.csv', OrderService.exportOrdersToCsv(orders), 'text/csv');
        });
        buttonContainer.appendChild(exportCsvButton);

        // 导出JSON按钮
        const exportJsonButton = UIUtils.createButton('导出JSON', () => {
            UIUtils.downloadFile('booth_orders.json', OrderService.exportOrdersToJson(orders), 'application/json');
        });
        buttonContainer.appendChild(exportJsonButton);

        // 刷新按钮
        const refreshButton = UIUtils.createButton('刷新数据', async () => {
            try {
                // 显示加载提示
                const loadingElement = document.createElement('div');
                loadingElement.textContent = '正在刷新数据...';
                loadingElement.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(255, 255, 255, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10;
                `;
                if (this.contentContainer) {
                    this.contentContainer.appendChild(loadingElement);
                }

                // 强制刷新数据
                const updatedOrders = await OrderService.getOrders(true);
                
                // 重新加载页面
                this.hide();
                this.show();
                
                // 更新内容
                const stats = OrderService.calculateOrderStats(updatedOrders);
                this.updateContent(updatedOrders, stats);
            } catch (error) {
                console.error('刷新数据失败:', error);
                alert(`刷新数据失败: ${error}`);
            }
        }, true);
        buttonContainer.appendChild(refreshButton);

        this.contentContainer.appendChild(buttonContainer);
    }

    /**
     * 创建订单表格
     */
    private createOrderTable(orders: OrderData[]): void {
        if (!this.contentContainer) return;
        
        const tableContainer = document.createElement('div');
        tableContainer.style.cssText = `
            overflow: auto;
            max-height: 500px;
            border: 1px solid #ebeef5;
            border-radius: 4px;
        `;

        const table = document.createElement('table');
        table.style.cssText = `
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        `;

        // 创建表头
        const thead = document.createElement('thead');
        thead.style.cssText = `
            background-color: #f5f7fa;
            color: #606266;
            position: sticky;
            top: 0;
            z-index: 1;
        `;

        const headerRow = document.createElement('tr');
        const headers = ['订单号', '创建时间', '状态', '支付方式', '金额', '商品信息'];
        
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            th.style.cssText = `
                padding: 10px;
                text-align: left;
                font-weight: bold;
                border-bottom: 1px solid #ebeef5;
            `;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // 创建表体
        const tbody = document.createElement('tbody');
        
        orders.forEach((order, index) => {
            const row = document.createElement('tr');
            row.style.cssText = `
                ${index % 2 === 0 ? 'background-color: #fafafa;' : ''}
            `;
            row.addEventListener('mouseover', () => {
                row.style.backgroundColor = '#f5f7fa';
            });
            row.addEventListener('mouseout', () => {
                row.style.backgroundColor = index % 2 === 0 ? '#fafafa' : '';
            });

            // 订单号
            const orderNumberCell = document.createElement('td');
            orderNumberCell.textContent = order.orderNumber;
            orderNumberCell.style.cssText = 'padding: 8px 10px; border-bottom: 1px solid #ebeef5;';
            row.appendChild(orderNumberCell);

            // 创建时间
            const createdAtCell = document.createElement('td');
            createdAtCell.textContent = UIUtils.formatDate(order.createdAt);
            createdAtCell.style.cssText = 'padding: 8px 10px; border-bottom: 1px solid #ebeef5;';
            row.appendChild(createdAtCell);

            // 状态
            const stateCell = document.createElement('td');
            const stateSpan = document.createElement('span');
            stateSpan.textContent = UIUtils.getStatusText(order.state);
            stateSpan.style.cssText = `
                display: inline-block;
                padding: 2px 6px;
                font-size: 12px;
                border-radius: 4px;
                ${UIUtils.getStatusStyle(order.state)}
            `;
            stateCell.appendChild(stateSpan);
            stateCell.style.cssText = 'padding: 8px 10px; border-bottom: 1px solid #ebeef5;';
            row.appendChild(stateCell);

            // 支付方式
            const paymentMethodCell = document.createElement('td');
            paymentMethodCell.textContent = order.paymentMethod || '-';
            paymentMethodCell.style.cssText = 'padding: 8px 10px; border-bottom: 1px solid #ebeef5;';
            row.appendChild(paymentMethodCell);

            // 金额
            const totalPriceCell = document.createElement('td');
            totalPriceCell.textContent = `¥ ${UIUtils.formatPrice(order.totalPrice)}`;
            totalPriceCell.style.cssText = 'padding: 8px 10px; border-bottom: 1px solid #ebeef5; font-weight: bold;';
            row.appendChild(totalPriceCell);

            // 商品信息
            const itemsCell = document.createElement('td');
            if (order.items && order.items.length > 0) {
                const itemsList = document.createElement('div');
                
                // 只显示前两个商品
                order.items.slice(0, 2).forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.style.cssText = `
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 4px;
                    `;
                    
                    const nameSpan = document.createElement('span');
                    nameSpan.textContent = item.name || '未知商品';
                    nameSpan.style.cssText = `
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        max-width: 200px;
                    `;
                    
                    const quantitySpan = document.createElement('span');
                    quantitySpan.textContent = `x${item.quantity || 1}`;
                    quantitySpan.style.cssText = 'font-weight: bold; margin-left: 8px;';
                    
                    itemDiv.appendChild(nameSpan);
                    itemDiv.appendChild(quantitySpan);
                    itemsList.appendChild(itemDiv);
                });
                
                // 如果有更多商品，显示提示
                if (order.items.length > 2) {
                    const moreItemsDiv = document.createElement('div');
                    moreItemsDiv.textContent = `还有 ${order.items.length - 2} 个商品...`;
                    moreItemsDiv.style.cssText = 'color: #909399; font-size: 12px;';
                    itemsList.appendChild(moreItemsDiv);
                }
                
                itemsCell.appendChild(itemsList);
            } else {
                itemsCell.textContent = '无商品信息';
                itemsCell.style.cssText = 'color: #909399; font-style: italic;';
            }
            
            itemsCell.style.cssText += 'padding: 8px 10px; border-bottom: 1px solid #ebeef5;';
            row.appendChild(itemsCell);

            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        tableContainer.appendChild(table);
        this.contentContainer.appendChild(tableContainer);
    }

    /**
     * 处理ESC键按下事件
     */
    private handleEscKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            this.hide();
        }
    };
} 