import { handleError } from "../../../utils/error";
import { Utils } from "../../../utils/utils";

/**
 * 商品操作功能模块
 * 提供删除商品、复制标签等操作功能
 */
export class ItemActions {

    /**
     * 为商品添加操作按钮
     * @param item 商品元素
     */
    addToItem(item: HTMLElement): void {
        try {
            // 检查是否已经添加过按钮
            if (item.querySelector('.tag-copy-btn') || item.querySelector('.item-delete-btn')) return;

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

        const deleteBtn = document.createElement('a');
        deleteBtn.className = 'btn danger small item-delete-btn';
        deleteBtn.style.cssText = 'position: absolute; top: 20px; right: 20px; z-index: 10;';
        deleteBtn.innerHTML = '删除';
        deleteBtn.onclick = async (e) => {
            e.preventDefault();
            await this.handleDeleteItem(item, itemId);
        };

        // 确保父元素有相对定位
        if (getComputedStyle(item).position === 'static') {
            item.style.position = 'relative';
        }
        item.appendChild(deleteBtn);
    }

    /**
     * 添加复制标签按钮
     */
    private addCopyTagsButton(item: HTMLElement): void {
        const tagList = item.querySelector('.dashboard-items-tags');
        const footerActions = item.querySelector('.dashboard-item-footer-actions');
        if (tagList && footerActions) {
            const copyBtn = document.createElement('a');
            copyBtn.className = 'btn calm small tag-copy-btn mr-8';
            copyBtn.innerHTML = '复制标签';
            copyBtn.onclick = (e) => {
                e.preventDefault();
                this.copyItemTags(tagList);
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

    /**
     * 复制商品标签
     */
    private copyItemTags(tagList: Element): void {
        try {
            const tags = Array.from(tagList.querySelectorAll('.tag-text'))
                .map(tag => tag.textContent)
                .filter(Boolean);

            if (tags.length === 0) {
                alert('没有找到标签');
                return;
            }

            navigator.clipboard.writeText(JSON.stringify(tags)).then(() => {
                const copyBtn = tagList.closest('.item-wrapper')?.querySelector('.tag-copy-btn');
                if (copyBtn instanceof HTMLElement) {
                    Utils.updateButtonState(copyBtn, true, copyBtn.innerHTML);
                }
            });
        } catch (error) {
            handleError(error);
        }
    }

    /**
     * 清理操作按钮
     */
    cleanup(): void {
        document.querySelectorAll('.tag-copy-btn, .item-delete-btn').forEach(el => el.remove());
    }
}
