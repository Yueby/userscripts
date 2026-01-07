import { ItemManageAPI } from "../../../api/item-manage";
import { handleError } from "../../../utils/error";
import { Utils } from "../../../utils/utils";
import { PageModule } from "../../PageModule";

/**
 * 商品操作功能模块
 * 提供删除商品、复制标签等操作功能
 */
export class ItemActions extends PageModule<ItemManageAPI> {

    constructor(api: ItemManageAPI) {
        super(api);
    }

    protected initialize(api: ItemManageAPI): void {
        // 为所有商品添加操作按钮
        const items = api.getItems();
        items.forEach(item => {
            this.addToItem(item.element);
        });
    }

    /**
     * 为商品添加操作按钮
     * @param item 商品元素
     */
    addToItem(item: HTMLElement): void {
        try {
            // 检查是否已经添加过按钮
            if (item.querySelector('.tag-copy-btn') || item.querySelector('.item-delete-btn-x')) return;

            this.addDeleteButton(item);
            this.addCopyTagsButton(item);
        } catch (error) {
            handleError(error);
        }
    }

    /**
     * 添加删除按钮
     */
    private addDeleteButton(item: HTMLElement): void {
        const itemId = item.getAttribute('data-id');
        if (!itemId) return;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'item-delete-btn-x';
        deleteBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        deleteBtn.title = '删除商品';
        deleteBtn.onclick = async (e) => {
            e.preventDefault();
            await this.handleDeleteItem(item, itemId);
        };

        // 确保父元素有相对定位
        if (getComputedStyle(item).position === 'static') {
            item.style.position = 'relative';
        }
        
        // 注入样式（只需要注入一次）
        this.injectDeleteButtonStyles();
        
        item.appendChild(deleteBtn);
    }

    /**
     * 注入删除按钮样式
     */
    private injectDeleteButtonStyles(): void {
        if (document.getElementById('item-delete-btn-styles')) return;

        const style = document.createElement('style');
        style.id = 'item-delete-btn-styles';
        style.textContent = `
            .item-delete-btn-x {
                position: absolute;
                top: 8px;
                right: 8px;
                z-index: 10;
                width: 28px;
                height: 28px;
                padding: 0;
                border: none;
                border-radius: 50%;
                background-color: #fff;
                color: #666;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                transition: all 0.2s ease;
            }

            .item-delete-btn-x svg {
                width: 16px;
                height: 16px;
                display: block;
            }

            .item-delete-btn-x:hover {
                background-color: #ff5252;
                color: #fff;
                box-shadow: 0 4px 8px rgba(255, 82, 82, 0.3);
                transform: scale(1.1);
            }

            .item-delete-btn-x:active {
                transform: scale(0.95);
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 添加复制标签按钮
     */
    private addCopyTagsButton(item: HTMLElement): void {
        const tagList = item.querySelector('.dashboard-items-tags');
        const footerActions = item.querySelector('.dashboard-item-footer-actions');
        const itemId = item.getAttribute('data-id');
        
        if (tagList && footerActions && itemId) {
            const copyBtn = document.createElement('a');
            copyBtn.className = 'btn calm small tag-copy-btn mr-8';
            copyBtn.innerHTML = '复制标签';
            copyBtn.onclick = async (e) => {
                e.preventDefault();
                const success = await this.api.copyItemTags(itemId);
                if (success) {
                    Utils.updateButtonState(copyBtn, true, copyBtn.innerHTML);
                }
            };

            footerActions.insertBefore(copyBtn, footerActions.firstChild);
        }
    }

    /**
     * 处理删除商品
     */
    private async handleDeleteItem(item: HTMLElement, itemId: string): Promise<void> {
        try {
            // 第一次确认
            if (!confirm('确定要删除这个商品吗？此操作不可恢复。')) return;

            // 第二次确认，显示商品ID
            const itemName = item.querySelector('.nav')?.textContent?.trim() || '未知商品';
            if (!confirm(`再次确认删除商品：\n${itemName}\nID: ${itemId}`)) return;

            // 获取CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (!csrfToken) {
                throw new Error('无法获取CSRF token');
            }

            const response = await fetch(`https://manage.booth.pm/items/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'accept': 'application/json, text/javascript, */*; q=0.01',
                    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
                    'x-requested-with': 'XMLHttpRequest',
                    'x-csrf-token': csrfToken
                },
                referrer: window.location.href,
                referrerPolicy: 'strict-origin-when-cross-origin',
                mode: 'cors',
                credentials: 'include'
            });

            if (response.ok) {
                item.remove();
            } else {
                const errorText = await response.text();
                console.log('删除失败响应:', errorText);
                throw new Error(`删除失败: ${response.status}\n${errorText}`);
            }
        } catch (error) {
            handleError(error, () => {
                alert('删除商品失败，请刷新页面重试');
            });
        }
    }

}
