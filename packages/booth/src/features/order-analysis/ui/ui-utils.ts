/**
 * UI工具类
 * 提供UI相关的工具方法
 */
export class UIUtils {
    /**
     * 创建统计卡片
     */
    public static createStatCard(title: string, value: string | number, color: string): HTMLElement {
        const card = document.createElement('div');
        card.style.cssText = `
            background-color: #fff;
            border-radius: 4px;
            padding: 15px;
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
            flex: 1;
            min-width: 200px;
            margin: 0 10px 10px 0;
        `;

        const titleElement = document.createElement('div');
        titleElement.textContent = title;
        titleElement.style.cssText = `
            font-size: 14px;
            color: #909399;
            margin-bottom: 10px;
        `;

        const valueElement = document.createElement('div');
        valueElement.textContent = value.toString();
        valueElement.style.cssText = `
            font-size: 24px;
            font-weight: bold;
            color: ${color};
        `;

        card.appendChild(titleElement);
        card.appendChild(valueElement);
        return card;
    }

    /**
     * 创建按钮
     */
    public static createButton(text: string, onClick: () => void, primary: boolean = false): HTMLElement {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.cssText = `
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            ${primary 
                ? 'background-color: #409EFF; color: #fff; border: 1px solid #409EFF;' 
                : 'background-color: #fff; color: #606266; border: 1px solid #dcdfe6;'}
        `;
        button.addEventListener('click', onClick);
        return button;
    }

    /**
     * 下载文件
     */
    public static downloadFile(filename: string, content: string, contentType: string): void {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    /**
     * 格式化日期
     */
    public static formatDate(dateStr: string): string {
        if (!dateStr) return '-';
        
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('日期格式化错误:', error, dateStr);
            return dateStr;
        }
    }

    /**
     * 格式化价格
     */
    public static formatPrice(price: number): string {
        if (price === undefined || price === null || isNaN(price)) {
            return '0';
        }
        
        try {
            return price.toLocaleString('ja-JP', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
        } catch (error) {
            console.error('价格格式化错误:', error, price);
            return price.toString();
        }
    }

    /**
     * 获取状态文本
     */
    public static getStatusText(status: string): string {
        const statusLower = status.toLowerCase();
        if (statusLower.includes('completed')) {
            return '已完成';
        } else if (statusLower.includes('paid')) {
            return '已付款';
        } else if (statusLower.includes('pending')) {
            return '待付款';
        } else if (statusLower.includes('cancelled')) {
            return '已取消';
        } else if (statusLower.includes('refunded')) {
            return '已退款';
        }
        return status;
    }

    /**
     * 获取状态样式
     */
    public static getStatusStyle(status: string): string {
        const statusLower = status.toLowerCase();
        if (statusLower.includes('completed')) {
            return 'background-color: #f0f9eb; color: #67c23a; border: 1px solid #e1f3d8;';
        } else if (statusLower.includes('paid')) {
            return 'background-color: #fdf6ec; color: #e6a23c; border: 1px solid #faecd8;';
        } else if (statusLower.includes('pending')) {
            return 'background-color: #ecf5ff; color: #409eff; border: 1px solid #d9ecff;';
        } else if (statusLower.includes('cancelled') || statusLower.includes('refunded')) {
            return 'background-color: #fef0f0; color: #f56c6c; border: 1px solid #fde2e2;';
        }
        return 'background-color: #f4f4f5; color: #909399; border: 1px solid #e9e9eb;';
    }
} 