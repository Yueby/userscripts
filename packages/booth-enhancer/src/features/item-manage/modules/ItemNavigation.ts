import { handleError } from "../../../utils/error";

/**
 * 商品导航栏模块
 * 在页面右侧提供商品导航功能
 */
export class ItemNavigation {
    private navigationContainer: HTMLElement | null = null;
    private items: HTMLElement[] = [];
    private isExpanded = false;
    private searchInput: HTMLInputElement | null = null;
    private filteredItems: HTMLElement[] = [];
    private isScrolling = false;
    private scrollTimeout: number | null = null;

    /**
     * 创建商品导航栏
     */
    createNavigation(): void {
        try {
            // 检查是否已经创建过导航栏
            if (document.querySelector('.item-navigation')) return;

            this.collectItems();
            if (this.items.length === 0) return;

            this.createNavigationContainer();
            this.createNavigationItems();
            this.setupScrollListener();
        } catch (error) {
            handleError(error);
        }
    }

    /**
     * 收集所有商品元素
     */
    private collectItems(): void {
        this.items = Array.from(document.querySelectorAll('.item-wrapper')) as HTMLElement[];
    }

    /**
     * 创建导航栏容器
     */
    private createNavigationContainer(): void {
        // 创建主容器
        this.navigationContainer = document.createElement('div');
        this.navigationContainer.className = 'item-navigation';
        this.navigationContainer.style.cssText = `
            position: fixed;
            top: 50%;
            right: 0;
            transform: translateY(-50%);
            width: 400px;
            height: 80vh;
            max-height: 80vh;
            z-index: 1000;
            transition: transform 0.3s ease;
            transform: translateY(-50%) translateX(400px);
        `;

        // 创建左侧悬停区域
        this.createHoverArea();
        this.createContentContainer();
        document.body.appendChild(this.navigationContainer);
    }

    /**
     * 创建左侧按钮区域
     */
    private createHoverArea(): void {
        const buttonArea = document.createElement('div');
        buttonArea.className = 'navigation-button-area';
        buttonArea.style.cssText = `
            position: absolute;
            left: -30px;
            top: 0;
            width: 30px;
            height: 100%;
            background: transparent;
            cursor: pointer;
            z-index: 1001;
        `;
        
        // 创建切换按钮
        const toggleButton = document.createElement('div');
        toggleButton.innerHTML = '◀';
        toggleButton.style.cssText = `
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            font-size: 10px;
            color: #666;
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid #e0e0e0;
            border-right: none;
            border-radius: 8px 0 0 8px;
            width: 16px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        
        // 添加悬停效果
        toggleButton.onmouseenter = () => {
            toggleButton.style.backgroundColor = '#f8f9fa';
            toggleButton.style.boxShadow = '-2px 0 6px rgba(0, 0, 0, 0.15)';
        };
        toggleButton.onmouseleave = () => {
            toggleButton.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            toggleButton.style.boxShadow = '-2px 0 4px rgba(0, 0, 0, 0.1)';
        };
        
        buttonArea.appendChild(toggleButton);
        buttonArea.onclick = () => this.toggleNavigation();
        this.navigationContainer!.appendChild(buttonArea);
    }

    /**
     * 创建内容容器
     */
    private createContentContainer(): void {
        const contentContainer = document.createElement('div');
        contentContainer.className = 'navigation-content';
        contentContainer.style.cssText = `
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.98);
            border: 1px solid #e0e0e0;
            border-radius: 12px 0 0 12px;
            box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
        `;

        // 创建头部
        const header = document.createElement('div');
        header.className = 'navigation-header';
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            border-bottom: 1px solid #e0e0e0;
            background: #f8f9fa;
            flex-shrink: 0;
        `;

        const title = document.createElement('div');
        title.textContent = `商品导航 (${this.items.length})`;
        title.style.cssText = `
            font-weight: 600;
            color: #333;
            font-size: 14px;
        `;
        header.appendChild(title);

        // 创建搜索栏
        const searchContainer = document.createElement('div');
        searchContainer.className = 'navigation-search';
        searchContainer.style.cssText = `
            padding: 12px 16px;
            border-bottom: 1px solid #e0e0e0;
            background: #fff;
            flex-shrink: 0;
        `;

        this.searchInput = document.createElement('input');
        this.searchInput.type = 'text';
        this.searchInput.placeholder = '搜索商品...';
        this.searchInput.style.cssText = `
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 12px;
            outline: none;
            transition: border-color 0.2s;
        `;
        this.searchInput.onfocus = () => this.searchInput!.style.borderColor = '#2196f3';
        this.searchInput.onblur = () => this.searchInput!.style.borderColor = '#ddd';
        this.searchInput.oninput = () => this.filterItems();
        searchContainer.appendChild(this.searchInput);

        // 创建商品列表容器
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'navigation-items-container';
        itemsContainer.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 4px;
            min-height: 0;
            scrollbar-width: thin;
            scrollbar-color: #ccc #f5f5f5;
        `;
        
        // 添加自定义滚动条样式（避免重复添加）
        if (!document.querySelector('#navigation-scrollbar-style')) {
            const style = document.createElement('style');
            style.id = 'navigation-scrollbar-style';
            style.textContent = `
                .navigation-items-container::-webkit-scrollbar {
                    width: 6px;
                }
                .navigation-items-container::-webkit-scrollbar-track {
                    background: #f5f5f5;
                    border-radius: 3px;
                }
                .navigation-items-container::-webkit-scrollbar-thumb {
                    background: #ccc;
                    border-radius: 3px;
                }
                .navigation-items-container::-webkit-scrollbar-thumb:hover {
                    background: #999;
                }
            `;
            document.head.appendChild(style);
        }

        // 组装内容容器
        contentContainer.appendChild(header);
        contentContainer.appendChild(searchContainer);
        contentContainer.appendChild(itemsContainer);

        this.navigationContainer!.appendChild(contentContainer);
    }

    /**
     * 切换导航栏状态
     */
    private toggleNavigation(): void {
        if (!this.navigationContainer) return;
        
        this.isExpanded = !this.isExpanded;
        
        if (this.isExpanded) {
            this.expandNavigation();
        } else {
            this.collapseNavigation();
        }
        
        // 更新按钮图标
        this.updateButtonIcon();
    }

    /**
     * 展开导航栏
     */
    private expandNavigation(): void {
        if (!this.navigationContainer) return;
        this.navigationContainer.style.transform = 'translateY(-50%) translateX(0)';
    }

    /**
     * 收缩导航栏
     */
    private collapseNavigation(): void {
        if (!this.navigationContainer) return;
        const currentWidth = this.navigationContainer.offsetWidth;
        this.navigationContainer.style.transform = `translateY(-50%) translateX(${currentWidth}px)`;
    }

    /**
     * 更新按钮图标
     */
    private updateButtonIcon(): void {
        if (!this.navigationContainer) return;
        
        const toggleButton = this.navigationContainer.querySelector('.navigation-button-area div');
        if (toggleButton) {
            toggleButton.innerHTML = this.isExpanded ? '▶' : '◀';
        }
    }

    /**
     * 动态调整导航栏宽度
     */
    private adjustNavigationWidth(items: HTMLElement[]): void {
        if (!this.navigationContainer || items.length === 0) return;

        // 先创建导航项，然后测量实际宽度
        const itemsContainer = this.navigationContainer.querySelector('.navigation-items-container');
        if (!itemsContainer) return;

        // 临时显示导航栏以便测量
        const originalTransform = this.navigationContainer.style.transform;
        this.navigationContainer.style.transform = 'translateY(-50%) translateX(0)';
        this.navigationContainer.style.width = 'auto';

        // 创建临时导航项进行测量
        const tempItems: HTMLElement[] = [];
        items.forEach((item, index) => {
            const itemId = item.getAttribute('data-id');
            const itemName = this.getItemName(item);
            const variationCount = item.querySelectorAll('.dashboard-items-variation .row').length;
            const salesCount = this.getTotalSales(item);

            const navItem = document.createElement('div');
            navItem.className = 'navigation-item';
            navItem.setAttribute('data-item-id', itemId || '');
            navItem.style.cssText = `
                padding: 6px 8px;
                margin-bottom: 1px;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
                border-left: 2px solid transparent;
                background: #fff;
                border: 1px solid transparent;
                width: max-content;
            `;

            // 创建商品信息
            const itemInfo = document.createElement('div');
            itemInfo.style.cssText = 'display: flex; flex-direction: column; gap: 2px;';

            const nameRow = document.createElement('div');
            nameRow.style.cssText = 'display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;';

            const nameSpan = document.createElement('span');
            nameSpan.textContent = itemName;
            nameSpan.style.cssText = 'flex: 1; margin-right: 6px; font-weight: 500; font-size: 11px; line-height: 1.3; word-wrap: break-word;';

            const countSpan = document.createElement('span');
            countSpan.textContent = `${variationCount}变体`;
            countSpan.style.cssText = 'color: #666; font-size: 9px; flex-shrink: 0; background: #f0f0f0; padding: 1px 4px; border-radius: 8px;';

            nameRow.appendChild(nameSpan);
            nameRow.appendChild(countSpan);

            // 添加销量信息
            const salesRow = document.createElement('div');
            salesRow.style.cssText = 'display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #666;';
            
            const salesSpan = document.createElement('span');
            salesSpan.textContent = `销量: ${salesCount}`;
            salesSpan.style.cssText = salesCount > 0 ? 'color: #28a745; font-weight: 500;' : 'color: #999; font-weight: 500;';

            const indexSpan = document.createElement('span');
            indexSpan.textContent = `#${index + 1}`;
            indexSpan.style.cssText = 'color: #999; font-size: 9px;';

            salesRow.appendChild(salesSpan);
            salesRow.appendChild(indexSpan);
            itemInfo.appendChild(salesRow);

            itemInfo.appendChild(nameRow);
            navItem.appendChild(itemInfo);
            itemsContainer.appendChild(navItem);
            tempItems.push(navItem);
        });

        // 测量所有导航项的最大宽度
        let maxWidth = 0;
        tempItems.forEach(navItem => {
            const width = navItem.offsetWidth;
            maxWidth = Math.max(maxWidth, width);
        });

        // 清理临时元素
        tempItems.forEach(navItem => navItem.remove());

        // 恢复原始状态
        this.navigationContainer.style.transform = originalTransform;

        // 计算最终宽度：最大商品宽度 + 搜索框宽度 + 边距
        const searchWidth = 32; // 搜索框和头部区域额外宽度
        const padding = 16; // 左右边距
        const finalWidth = Math.min(Math.max(maxWidth + searchWidth + padding, 300), 500);

        // 更新导航栏宽度
        this.navigationContainer.style.width = `${finalWidth}px`;
        this.navigationContainer.style.transform = this.isExpanded 
            ? 'translateY(-50%) translateX(0)' 
            : `translateY(-50%) translateX(${finalWidth}px)`;
    }

    /**
     * 创建导航项
     */
    private createNavigationItems(): void {
        if (!this.navigationContainer) return;

        const itemsContainer = this.navigationContainer.querySelector('.navigation-items-container');
        if (!itemsContainer) return;

        // 清空现有内容
        itemsContainer.innerHTML = '';

        const itemsToShow = this.filteredItems.length > 0 ? this.filteredItems : this.items;

        // 动态调整导航栏宽度
        this.adjustNavigationWidth(itemsToShow);

        if (itemsToShow.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.textContent = this.searchInput?.value ? '未找到匹配的商品' : '暂无商品';
            emptyState.style.cssText = `
                text-align: center;
                color: #666;
                padding: 20px;
                font-style: italic;
            `;
            itemsContainer.appendChild(emptyState);
            return;
        }

        itemsToShow.forEach((item, index) => {
            const itemId = item.getAttribute('data-id');
            const itemName = this.getItemName(item);
            const variationCount = item.querySelectorAll('.dashboard-items-variation .row').length;
            const salesCount = this.getTotalSales(item);

            const navItem = document.createElement('div');
            navItem.className = 'navigation-item';
            navItem.setAttribute('data-item-id', itemId || '');
            navItem.style.cssText = `
                padding: 6px 8px;
                margin-bottom: 1px;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
                border-left: 2px solid transparent;
                background: #fff;
                border: 1px solid transparent;
            `;

            // 创建商品信息
            const itemInfo = document.createElement('div');
            itemInfo.style.cssText = 'display: flex; flex-direction: column; gap: 2px;';

            const nameRow = document.createElement('div');
            nameRow.style.cssText = 'display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;';

            const nameSpan = document.createElement('span');
            nameSpan.textContent = itemName;
            nameSpan.style.cssText = 'flex: 1; margin-right: 6px; font-weight: 500; font-size: 11px; line-height: 1.3; word-wrap: break-word;';

            const countSpan = document.createElement('span');
            countSpan.textContent = `${variationCount}变体`;
            countSpan.style.cssText = 'color: #666; font-size: 9px; flex-shrink: 0; background: #f0f0f0; padding: 1px 4px; border-radius: 8px;';

            nameRow.appendChild(nameSpan);
            nameRow.appendChild(countSpan);

            // 添加销量信息（始终显示，包括0销量）
            const salesRow = document.createElement('div');
            salesRow.style.cssText = 'display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #666;';
            
            const salesSpan = document.createElement('span');
            salesSpan.textContent = `销量: ${salesCount}`;
            salesSpan.style.cssText = salesCount > 0 ? 'color: #28a745; font-weight: 500;' : 'color: #999; font-weight: 500;';

            const indexSpan = document.createElement('span');
            indexSpan.textContent = `#${index + 1}`;
            indexSpan.style.cssText = 'color: #999; font-size: 9px;';

            salesRow.appendChild(salesSpan);
            salesRow.appendChild(indexSpan);
            itemInfo.appendChild(salesRow);

            itemInfo.appendChild(nameRow);
            navItem.appendChild(itemInfo);

            // 添加点击事件
            navItem.onclick = () => this.scrollToItem(item, navItem);

            // 添加悬停效果
            navItem.onmouseenter = () => {
                if (!navItem.classList.contains('active')) {
                    navItem.style.backgroundColor = '#f8f9fa';
                    navItem.style.borderColor = '#e9ecef';
                }
            };
            navItem.onmouseleave = () => {
                if (!navItem.classList.contains('active')) {
                    navItem.style.backgroundColor = '#fff';
                    navItem.style.borderColor = 'transparent';
                }
            };

            itemsContainer.appendChild(navItem);
        });
    }

    /**
     * 获取商品名称
     */
    private getItemName(item: HTMLElement): string {
        const nameElement = item.querySelector('.nav');
        if (nameElement) {
            return nameElement.textContent?.trim() || `商品 #${item.getAttribute('data-id')}`;
        }
        return `商品 #${item.getAttribute('data-id')}`;
    }

    /**
     * 获取商品总销量
     */
    private getTotalSales(item: HTMLElement): number {
        let totalSales = 0;
        item.querySelectorAll('.dashboard-items-variation .row').forEach(variation => {
            const salesCount = variation.querySelector('.sales_quantity .count')?.textContent;
            if (salesCount) {
                totalSales += parseInt(salesCount, 10) || 0;
            }
        });
        return totalSales;
    }

    /**
     * 过滤商品
     */
    private filterItems(): void {
        if (!this.searchInput) return;

        const searchTerm = this.searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            this.filteredItems = [];
        } else {
            this.filteredItems = this.items.filter(item => {
                const itemName = this.getItemName(item).toLowerCase();
                const itemId = item.getAttribute('data-id') || '';
                return itemName.includes(searchTerm) || itemId.includes(searchTerm);
            });
        }

        this.createNavigationItems();
    }

    /**
     * 滚动到指定商品
     */
    private scrollToItem(item: HTMLElement, navItem: HTMLElement): void {
        try {
            // 清除之前的滚动超时
            if (this.scrollTimeout) {
                clearTimeout(this.scrollTimeout);
            }

            this.setActiveItem(navItem);
            this.isScrolling = true; // 标记正在滚动

            // 如果导航栏是收缩状态，点击后自动展开
            if (!this.isExpanded) {
                this.expandNavigation();
                this.isExpanded = true;
                this.updateButtonIcon();
            }

            // 滚动到商品位置（居中显示）
            item.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });

            // 等待滚动完成后再高亮商品和更新选中状态
            this.scrollTimeout = window.setTimeout(() => {
                this.highlightItem(item);
                // 确保导航栏选中状态正确
                this.setActiveItem(navItem);
                this.isScrolling = false; // 滚动完成
                this.scrollTimeout = null;
            }, 800);
        } catch (error) {
            handleError(error);
        }
    }

    /**
     * 设置活跃商品
     */
    private setActiveItem(activeNavItem: HTMLElement): void {
        // 移除其他活跃状态
        this.navigationContainer?.querySelectorAll('.navigation-item').forEach(el => {
            el.classList.remove('active');
            (el as HTMLElement).style.backgroundColor = '#fff';
            (el as HTMLElement).style.borderLeftColor = 'transparent';
            (el as HTMLElement).style.borderColor = 'transparent';
        });

        // 设置当前活跃状态
        activeNavItem.classList.add('active');
        activeNavItem.style.backgroundColor = '#e3f2fd';
        activeNavItem.style.borderLeftColor = '#2196f3';
        activeNavItem.style.borderColor = '#bbdefb';
    }

    /**
     * 高亮商品
     */
    private highlightItem(item: HTMLElement): void {
        // 添加高亮效果
        item.style.outline = '2px solid #2196f3';
        item.style.outlineOffset = '2px';
        item.style.transition = 'outline 0.3s ease';

        // 3秒后移除高亮
        setTimeout(() => {
            item.style.outline = '';
            item.style.outlineOffset = '';
        }, 3000);
    }

    /**
     * 设置滚动监听
     */
    private setupScrollListener(): void {
        let ticking = false;

        const updateActiveItem = () => {
            if (!this.navigationContainer || this.isScrolling) return;

            const windowHeight = window.innerHeight;

            let activeItem: HTMLElement | null = null;
            let minDistance = Infinity;

            // 获取所有商品元素
            const currentItems = Array.from(document.querySelectorAll('.item-wrapper')) as HTMLElement[];
            
            currentItems.forEach(item => {
                const rect = item.getBoundingClientRect();
                
                // 检查商品是否在视口内
                if (rect.top < windowHeight && rect.bottom > 0) {
                    // 计算商品中心到屏幕中心的距离
                    const itemCenter = rect.top + rect.height / 2;
                    const screenCenter = windowHeight / 2;
                    const distance = Math.abs(itemCenter - screenCenter);

                    // 选择距离屏幕中心最近的商品
                    if (distance < minDistance) {
                        minDistance = distance;
                        activeItem = item;
                    }
                }
            });

            // 更新导航栏中的活跃状态
            if (activeItem) {
                const itemId = (activeItem as HTMLElement).getAttribute('data-id');
                if (itemId) {
                    const activeNavItem = this.navigationContainer.querySelector(`[data-item-id="${itemId}"]`);
                    if (activeNavItem instanceof HTMLElement) {
                        this.setActiveItem(activeNavItem);
                    }
                }
            }

            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(updateActiveItem);
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll);
        this.setupKeyboardShortcuts();
        
        // 保存监听器以便清理
        (this as any).scrollListener = onScroll;
    }

    /**
     * 设置键盘快捷键
     */
    private setupKeyboardShortcuts(): void {
        const onKeyDown = (e: KeyboardEvent) => {
            // 只在导航栏可见时响应快捷键
            if (!this.navigationContainer || this.navigationContainer.style.display === 'none') return;

            // Ctrl/Cmd + K: 聚焦搜索框
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.searchInput?.focus();
                return;
            }

            // Escape: 收缩导航栏
            if (e.key === 'Escape') {
                this.collapseNavigation();
                return;
            }

            // 上下箭头: 导航商品
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateWithKeyboard(e.key === 'ArrowUp' ? -1 : 1);
            }

            // Enter: 跳转到当前活跃商品
            if (e.key === 'Enter') {
                const activeNavItem = this.navigationContainer?.querySelector('.navigation-item.active');
                if (activeNavItem) {
                    const itemId = activeNavItem.getAttribute('data-item-id');
                    const item = this.items.find(item => item.getAttribute('data-id') === itemId);
                    if (item) {
                        this.scrollToItem(item, activeNavItem as HTMLElement);
                    }
                }
            }
        };

        document.addEventListener('keydown', onKeyDown);
        (this as any).keyboardListener = onKeyDown;
    }

    /**
     * 键盘导航
     */
    private navigateWithKeyboard(direction: number): void {
        const navItems = Array.from(this.navigationContainer?.querySelectorAll('.navigation-item') || []);
        const currentIndex = navItems.findIndex(item => item.classList.contains('active'));
        
        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = navItems.length - 1;
        if (newIndex >= navItems.length) newIndex = 0;

        const newActiveItem = navItems[newIndex] as HTMLElement;
        if (newActiveItem) {
            this.setActiveItem(newActiveItem);
            // 滚动到可见区域
            newActiveItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    /**
     * 隐藏导航栏
     */
    hideNavigation(): void {
        if (this.navigationContainer) {
            this.navigationContainer.style.display = 'none';
        }
    }

    /**
     * 显示导航栏
     */
    showNavigation(): void {
        if (this.navigationContainer) {
            this.navigationContainer.style.display = 'block';
        }
    }

    /**
     * 更新导航栏（当商品列表变化时）
     */
    updateNavigation(): void {
        this.cleanup();
        this.createNavigation();
    }

    /**
     * 清理导航栏
     */
    cleanup(): void {
        if (this.navigationContainer) {
            this.navigationContainer.remove();
            this.navigationContainer = null;
        }

        // 清理滚动监听器
        const scrollListener = (this as any).scrollListener;
        if (scrollListener) {
            window.removeEventListener('scroll', scrollListener);
            delete (this as any).scrollListener;
        }

        // 清理键盘监听器
        const keyboardListener = (this as any).keyboardListener;
        if (keyboardListener) {
            document.removeEventListener('keydown', keyboardListener);
            delete (this as any).keyboardListener;
        }

        // 清理滚动超时
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = null;
        }

        this.items = [];
        this.filteredItems = [];
        this.searchInput = null;
        this.isExpanded = false;
        this.isScrolling = false;
    }
}
