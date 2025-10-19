import { handleError } from "../../../utils/error";

/**
 * 商品统计功能模块
 * 提供销量和收益统计功能
 */
export class ItemStats {

    /**
     * 为商品添加统计功能
     * @param item 商品元素
     */
    addToItem(item: HTMLElement): void {
        try {
            const variations = item.querySelectorAll('.dashboard-items-variation .row');
            if (!variations.length) return;

            this.addVariationCheckboxes(item, variations);
            this.createStatsElement(item);
            this.updateStats(item);
        } catch (error) {
            handleError(error);
        }
    }

    /**
     * 为变体添加复选框
     */
    private addVariationCheckboxes(item: HTMLElement, variations: NodeListOf<Element>): void {
        variations.forEach(variation => {
            const labelArea = variation.querySelector('.dashboard-items-variation-label');
            if (!labelArea || labelArea.querySelector('.variation-checkbox')) return;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'variation-checkbox';
            checkbox.checked = true;
            checkbox.style.cssText = `
                margin: 0 4px;
                cursor: pointer;
                display: none;
            `;
            checkbox.onchange = () => this.updateStats(item);
            labelArea.insertBefore(checkbox, labelArea.firstChild);
        });
    }

    /**
     * 创建统计信息元素
     */
    private createStatsElement(item: HTMLElement): void {
        const itemLabel: HTMLElement | null = item.querySelector('.cell.item-label');
        if (!itemLabel) return;

        // 检查是否已经创建过统计元素
        let statsElement: HTMLElement | null = item.querySelector('.total-stats');
        if (statsElement) return;

        statsElement = document.createElement('div');
        statsElement.className = 'total-stats';
        statsElement.style.cssText = `
            position: absolute;
            bottom: 8px;
            right: 8px;
            padding: 2px 6px;
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 12px;
            color: #666;
            z-index: 2;
            display: flex;
            align-items: center;
            gap: 8px;
        `;

        this.createToggleContainer(statsElement);
        this.createStatsInfo(statsElement);
        this.setupToggleEvents(item, statsElement);

        itemLabel.style.position = 'relative';
        itemLabel.appendChild(statsElement);
    }

    /**
     * 创建开关容器
     */
    private createToggleContainer(statsElement: HTMLElement): void {
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'stats-toggle-container';
        toggleContainer.style.cssText = `
            display: inline-flex;
            align-items: center;
            gap: 4px;
        `;

        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.className = 'stats-toggle';
        toggle.style.cssText = `
            margin: 0;
            cursor: pointer;
            vertical-align: middle;
        `;

        const label = document.createElement('label');
        label.textContent = '过滤模式';
        label.style.cssText = `
            cursor: pointer;
            font-size: 12px;
            color: #666;
            user-select: none;
            vertical-align: middle;
        `;

        toggleContainer.appendChild(toggle);
        toggleContainer.appendChild(label);
        statsElement.appendChild(toggleContainer);
    }

    /**
     * 创建统计信息容器
     */
    private createStatsInfo(statsElement: HTMLElement): void {
        const statsInfo = document.createElement('div');
        statsInfo.className = 'stats-info';
        statsElement.appendChild(statsInfo);
    }

    /**
     * 设置开关事件
     */
    private setupToggleEvents(item: HTMLElement, statsElement: HTMLElement): void {
        const toggle = statsElement.querySelector('.stats-toggle') as HTMLInputElement;
        if (!toggle) return;

        toggle.onchange = () => {
            const checkboxes = item.querySelectorAll('.variation-checkbox') as NodeListOf<HTMLInputElement>;
            checkboxes.forEach(checkbox => {
                checkbox.style.display = toggle.checked ? 'inline-block' : 'none';
                // 关闭开关时自动勾选所有复选框
                if (!toggle.checked) {
                    checkbox.checked = true;
                }
            });
            // 更新统计信息
            this.updateStats(item);
        };
    }

    /**
     * 更新统计信息
     */
    updateStats(item: HTMLElement): void {
        let totalSales = 0;
        let totalRevenue = 0;

        // 只统计勾选的 variation
        item.querySelectorAll('.dashboard-items-variation .row').forEach(variation => {
            const checkbox = variation.querySelector('.variation-checkbox') as HTMLInputElement;
            if (!checkbox || !checkbox.checked) return;

            // 获取销量
            const salesCount = variation.querySelector('.sales_quantity .count')?.textContent;
            if (salesCount) {
                totalSales += parseInt(salesCount, 10) || 0;
            }

            // 获取收益
            const revenue = variation.querySelector('.sales_subtotal')?.textContent;
            if (revenue) {
                const revenueNum = parseInt(revenue.replace(/[^\d]/g, ''), 10) || 0;
                totalRevenue += revenueNum;
            }
        });

        // 更新统计信息显示
        const statsInfo = item.querySelector('.total-stats .stats-info');
        if (statsInfo) {
            statsInfo.innerHTML = `
                总销量: <strong>${totalSales}</strong> | 
                总收益: <strong>${totalRevenue.toLocaleString()}</strong> JPY
            `;
        }
    }

    /**
     * 清理统计功能
     */
    cleanup(): void {
        document.querySelectorAll('.variation-checkbox, .total-stats, .stats-toggle-container').forEach(el => el.remove());
    }
}
