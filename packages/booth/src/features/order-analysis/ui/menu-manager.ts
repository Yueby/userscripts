/**
 * 菜单管理器
 * 负责在Booth网站的下拉菜单中添加订单分析按钮
 */
export class MenuManager {
    private observer: MutationObserver | null = null;
    private clickHandler: () => void;

    /**
     * 构造函数
     * @param clickHandler 点击订单分析按钮时的回调函数
     */
    constructor(clickHandler: () => void) {
        this.clickHandler = clickHandler;
    }

    /**
     * 开始观察下拉菜单的DOM变化
     */
    public observe(): void {
        // 创建一个观察器实例
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // 查找下拉菜单
                    const dropdownMenu = document.querySelector('div.transform.overflow-y-auto.hide-scrollbar');
                    if (dropdownMenu && !document.getElementById('booth-enhancer-menu-btn')) {
                        this.addButtonToDropdownMenu(dropdownMenu);
                    }
                }
            });
        });

        // 配置观察选项
        const config = { childList: true, subtree: true };
        
        // 开始观察文档主体
        this.observer.observe(document.body, config);
        
        // 立即检查一次，以防下拉菜单已经存在
        const dropdownMenu = document.querySelector('div.transform.overflow-y-auto.hide-scrollbar');
        if (dropdownMenu && !document.getElementById('booth-enhancer-menu-btn')) {
            this.addButtonToDropdownMenu(dropdownMenu);
        }
    }

    /**
     * 清理资源
     */
    public cleanup(): void {
        // 移除下拉菜单中的按钮
        const menuButton = document.getElementById('booth-enhancer-menu-btn');
        if (menuButton) {
            menuButton.remove();
        }
        
        // 停止观察
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }

    /**
     * 创建菜单按钮
     */
    private createMenuButton(): HTMLAnchorElement {
        const menuButton = document.createElement('a');
        menuButton.id = 'booth-enhancer-menu-btn';
        menuButton.href = 'javascript:void(0);';
        menuButton.className = 'block no-underline transition-none px-24 hover:!text-secondary800 typography-14 !leading-9 !text-ui-label';
        menuButton.textContent = '订单分析';
        menuButton.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 调用点击处理函数
            this.clickHandler();
            
            // 关闭下拉菜单
            const dropdownMenu = document.querySelector('div.transform.overflow-y-auto.hide-scrollbar');
            if (dropdownMenu) {
                (dropdownMenu as HTMLElement).style.display = 'none';
            }
        });
        return menuButton;
    }

    /**
     * 向下拉菜单添加按钮
     */
    private addButtonToDropdownMenu(dropdownMenu: Element): void {
        // 查找包含"订单"链接的区域
        const orderLink = dropdownMenu.querySelector('a[href="https://manage.booth.pm/orders"]');
        
        if (orderLink) {
            // 找到了订单链接，在其后面添加我们的按钮
            const parentSection = orderLink.parentElement;
            
            if (parentSection) {
                const menuButton = this.createMenuButton();
                
                // 将按钮插入到订单链接后面
                if (orderLink.nextSibling) {
                    parentSection.insertBefore(menuButton, orderLink.nextSibling);
                } else {
                    parentSection.appendChild(menuButton);
                }
                
                console.log('已添加订单分析按钮到订单链接后面');
                return;
            }
        }
        
        // 如果找不到订单链接，尝试找到最合适的位置
        const targetSection = this.findTargetSection(dropdownMenu);
        const menuButton = this.createMenuButton();
        
        // 添加到目标区域
        targetSection.appendChild(menuButton);
        console.log('已添加订单分析按钮到下拉菜单');
    }

    /**
     * 查找最合适的按钮插入位置
     */
    private findTargetSection(dropdownMenu: Element): Element {
        // 查找所有分区
        const sections = dropdownMenu.querySelectorAll('div');
        if (sections.length === 0) return dropdownMenu;
        
        // 查找包含多个链接的区域作为目标（可能是店铺管理区域）
        let targetSection: Element | null = null;
        let maxLinks = 0;
        
        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            const linkCount = section.querySelectorAll('a').length;
            
            // 找到链接数量最多的区域
            if (linkCount > maxLinks) {
                maxLinks = linkCount;
                targetSection = section;
            }
        }
        
        // 如果没有找到合适的区域，使用第一个区域
        if (!targetSection && sections.length > 0) {
            targetSection = sections[0];
        }
        
        // 如果仍然没有找到区域，直接返回下拉菜单
        return targetSection || dropdownMenu;
    }
} 