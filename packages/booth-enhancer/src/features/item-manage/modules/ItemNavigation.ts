import { ItemManageAPI } from "../../../api/item-manage";
import { ItemElement } from "../../../api/item-manage/types";
import { handleError } from "../../../utils/error";
import { PageModule } from "../../PageModule";

/**
 * 商品导航栏模块
 * 在页面右侧提供商品导航功能
 */
export class ItemNavigation extends PageModule<ItemManageAPI> {
    private navigationContainer: HTMLElement | null = null;
    private toggleButton: HTMLElement | null = null;
    private items: ItemElement[] = [];
    private isExpanded = false;
    private searchInput: HTMLInputElement | null = null;
    private filteredItems: ItemElement[] = [];
    private isScrolling = false;
    private scrollTimeout: number | null = null;
    private hoverTimeout: number | null = null;

    constructor(api: ItemManageAPI) {
        super(api);
    }

    protected initialize(api: ItemManageAPI): void {
        // 从 API 获取商品数据
        this.items = api.getItems();
        
        // 注入样式
        this.injectStyles();
        
        // 延迟创建导航栏，确保DOM稳定
        setTimeout(() => {
            this.createNavigation();
        }, 1000);
    }

    /**
     * 创建商品导航栏
     */
    createNavigation(): void {
        try {
            // 检查是否已经创建过导航栏
            if (document.querySelector('.item-navigation')) return;

            if (this.items.length === 0) return;

            this.injectStyles();
            this.createToggleButton();
            this.createNavigationContainer();
            this.createNavigationItems();
            this.setupScrollListener();
        } catch (error) {
            handleError(error);
        }
    }

    /**
     * 注入样式表
     */
    private injectStyles(): void {
        if (document.querySelector('#booth-navigation-styles')) return;

        const style = document.createElement('style');
        style.id = 'booth-navigation-styles';
        style.textContent = `
            .navigation-toggle-button {
            position: fixed;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
                width: 30px;
                height: 60px;
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid #e0e0e0;
            border-right: none;
            border-radius: 8px 0 0 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
            cursor: pointer;
            transition: all 0.2s ease;
                z-index: 999;
                font-size: 12px;
                color: #666;
            }

            .navigation-toggle-button:hover {
                background: #f8f9fa;
                box-shadow: -2px 0 6px rgba(0, 0, 0, 0.15);
            }

            .item-navigation {
                position: fixed;
                top: 50%;
                right: 0;
                transform: translateY(-50%) translateX(100%);
                width: 400px;
                min-width: 300px;
                max-width: 500px;
                height: 80vh;
                max-height: 80vh;
                z-index: 1000;
                transition: transform 0.3s ease;
                pointer-events: none;
                box-sizing: border-box;
            }

            .item-navigation.expanded {
                transform: translateY(-50%) translateX(0);
            }

            .navigation-content {
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.98);
            border: 1px solid #e0e0e0;
            border-radius: 12px 0 0 12px;
            box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
                pointer-events: auto;
            }

            /* 导航项样式 */
            .navigation-item {
                padding: 6px 8px;
                margin-bottom: 1px;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
                border-left: 2px solid transparent;
                background: #fff;
                border: 1px solid transparent;
                display: flex;
                align-items: flex-start;
                gap: 8px;
            }

            /* 导航项hover效果 */
            .navigation-item:hover:not(.active) {
                background-color: #f8f9fa;
                border-color: #e9ecef;
            }

            /* 导航项active状态 */
            .navigation-item.active {
                background-color: #e3f2fd !important;
                border-left-color: #2196f3 !important;
                border-color: #bbdefb !important;
            }

            /* PC端：hover显示（通过JavaScript处理，这里只处理样式） */
            @media (hover: hover) and (pointer: fine) {
                .item-navigation:hover {
                    pointer-events: auto;
                }
            }

            /* 移动端：点击切换 */
            @media (max-width: 768px) {
                .item-navigation {
                    width: 100%;
                    max-width: 400px;
                    height: 70vh;
                    max-height: 70vh;
                }

                .navigation-toggle-button {
                    width: 40px;
                    height: 60px;
                }
            }

            /* 小屏幕移动端 */
            @media (max-width: 480px) {
                .item-navigation {
                    width: 100%;
                    height: 85vh;
                    max-height: 85vh;
                    top: 50%;
                    transform: translateY(-50%) translateX(100%);
                }

                .item-navigation.expanded {
                    transform: translateY(-50%) translateX(0);
                }
            }

            /* 头部样式 */
            .navigation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            border-bottom: 1px solid #e0e0e0;
            background: #f8f9fa;
            flex-shrink: 0;
                pointer-events: auto;
            }

            .navigation-header-title {
            font-weight: 600;
            color: #333;
            font-size: 14px;
            }

            /* 关闭按钮样式 */
            .navigation-close-button {
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: #666;
                font-size: 20px;
                line-height: 1;
                border-radius: 4px;
                transition: all 0.2s ease;
            }

            .navigation-close-button:hover {
                background-color: #e0e0e0;
                color: #333;
            }

            /* 搜索容器样式 */
            .navigation-search {
            padding: 12px 16px;
            border-bottom: 1px solid #e0e0e0;
            background: #fff;
            flex-shrink: 0;
            width: 100%;
                min-width: 0;
                box-sizing: border-box;
                display: block;
            }

            /* 搜索输入框样式 */
            .navigation-search-input {
                width: 100% !important;
                height: 32px;
            padding: 8px 12px;
                margin: 0;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 12px;
            outline: none;
            transition: border-color 0.2s;
                box-sizing: border-box;
                line-height: 1;
                display: block;
                max-width: none;
                min-width: 0;
            }

            .navigation-search-input:focus {
                border-color: #2196f3;
            }

            /* 列表容器样式 */
            .navigation-items-container {
            flex: 1;
            overflow-y: auto;
            padding: 4px;
            min-height: 0;
            scrollbar-width: thin;
            scrollbar-color: #ccc #f5f5f5;
            }

            /* 空状态样式 */
            .navigation-empty-state {
                text-align: center;
                color: #666;
                padding: 20px;
                font-style: italic;
            }

            /* 缩略图容器样式 */
            .navigation-thumbnail {
                width: 40px;
                height: 40px;
                flex-shrink: 0;
                border-radius: 4px;
                overflow: hidden;
                background: #f5f5f5;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .navigation-thumbnail img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            /* 商品信息容器样式 */
            .navigation-item-info {
                display: flex;
                flex-direction: column;
                gap: 2px;
                flex: 1;
                min-width: 0;
            }

            .navigation-item-name-row {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 8px;
            }

            .navigation-item-name {
                flex: 1;
                margin-right: 6px;
                font-weight: 500;
                font-size: 11px;
                line-height: 1.3;
                word-wrap: break-word;
                min-width: 0;
            }

            .navigation-item-variant-count {
                color: #666;
                font-size: 9px;
                flex-shrink: 0;
                background: #f0f0f0;
                padding: 1px 4px;
                border-radius: 8px;
            }

            .navigation-item-stats-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 10px;
                color: #666;
            }

            .navigation-item-stats-left {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .navigation-item-sales {
                font-weight: 500;
            }

            .navigation-item-sales.has-sales {
                color: #28a745;
            }

            .navigation-item-sales.no-sales {
                color: #999;
            }

            .navigation-item-favorites {
                font-weight: 500;
            }

            .navigation-item-favorites.has-favorites {
                color: #f48fb1;
            }

            .navigation-item-favorites.no-favorites {
                color: #999;
            }

            .navigation-item-index {
                color: #999;
                font-size: 9px;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 创建独立的切换按钮
     */
    private createToggleButton(): void {
        // 检查是否已存在
        if (document.querySelector('.navigation-toggle-button')) return;

        this.toggleButton = document.createElement('div');
        this.toggleButton.className = 'navigation-toggle-button';
        this.toggleButton.innerHTML = '◀';

        // 移动端：点击切换
        this.toggleButton.onclick = (e) => {
            e.stopPropagation();
            this.toggleNavigation();
        };

        // PC端：hover显示，离开隐藏（通过CSS处理）
        this.toggleButton.onmouseenter = () => {
            if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
                this.showNavigation();
            }
        };

        document.body.appendChild(this.toggleButton);
    }

    /**
     * 创建导航栏容器
     */
    private createNavigationContainer(): void {
        // 创建主容器
        this.navigationContainer = document.createElement('div');
        this.navigationContainer.className = 'item-navigation';

        this.createContentContainer();
        document.body.appendChild(this.navigationContainer);

        // PC端：鼠标离开主面板时隐藏
        this.setupPCHoverBehavior();
    }

    /**
     * 设置PC端hover行为
     */
    private setupPCHoverBehavior(): void {
        if (!this.navigationContainer || !this.toggleButton) return;

        // 只在支持hover的设备上设置
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            return;
        }

        // 鼠标进入主面板时保持显示
        this.navigationContainer.onmouseenter = () => {
            if (this.hoverTimeout) {
                clearTimeout(this.hoverTimeout);
                this.hoverTimeout = null;
            }
        };

        // 鼠标离开主面板时隐藏
        this.navigationContainer.onmouseleave = () => {
            if (this.hoverTimeout) {
                clearTimeout(this.hoverTimeout);
            }
            this.hoverTimeout = window.setTimeout(() => {
                // 检查鼠标是否在按钮上
                const buttonRect = this.toggleButton!.getBoundingClientRect();
                const mouseX = (window as any).lastMouseX || 0;
                const mouseY = (window as any).lastMouseY || 0;
                
                if (!(mouseX >= buttonRect.left && mouseX <= buttonRect.right &&
                      mouseY >= buttonRect.top && mouseY <= buttonRect.bottom)) {
                    this.hideNavigation();
                }
            }, 200); // 200ms延迟，避免快速移动时闪烁
        };

        // 跟踪鼠标位置
        document.addEventListener('mousemove', (e) => {
            (window as any).lastMouseX = e.clientX;
            (window as any).lastMouseY = e.clientY;
        });
    }

    /**
     * 创建内容容器
     */
    private createContentContainer(): void {
        const contentContainer = document.createElement('div');
        contentContainer.className = 'navigation-content';

        // 创建头部
        const header = document.createElement('div');
        header.className = 'navigation-header';

        const title = document.createElement('div');
        title.className = 'navigation-header-title';
        title.textContent = `商品导航 (${this.items.length})`;
        header.appendChild(title);

        // 创建关闭按钮
        const closeButton = document.createElement('div');
        closeButton.className = 'navigation-close-button';
        closeButton.innerHTML = '×';
        closeButton.onclick = () => {
            this.hideNavigation();
        };
        header.appendChild(closeButton);

        // 创建搜索栏
        const searchContainer = document.createElement('div');
        searchContainer.className = 'navigation-search';

        this.searchInput = document.createElement('input');
        this.searchInput.type = 'text';
        this.searchInput.className = 'navigation-search-input';
        this.searchInput.placeholder = '搜索商品...';
        this.searchInput.oninput = () => this.filterItems();
        searchContainer.appendChild(this.searchInput);

        // 创建商品列表容器
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'navigation-items-container';
        
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
     * 切换导航栏状态（移动端使用）
     */
    private toggleNavigation(): void {
        if (!this.navigationContainer) return;
        
        this.isExpanded = !this.isExpanded;
        
        if (this.isExpanded) {
            this.showNavigation();
        } else {
            this.hideNavigation();
        }
    }

    /**
     * 显示导航栏
     */
    private showNavigation(): void {
        if (!this.navigationContainer) return;
        this.navigationContainer.classList.add('expanded');
        this.isExpanded = true;
        if (this.toggleButton) {
            this.toggleButton.innerHTML = '▶';
        }
    }

    /**
     * 隐藏导航栏
     */
    private hideNavigation(): void {
        if (!this.navigationContainer) return;
        this.navigationContainer.classList.remove('expanded');
        this.isExpanded = false;
        if (this.toggleButton) {
            this.toggleButton.innerHTML = '◀';
        }
    }

    /**
     * 创建导航项（使用 API 数据）
     */
    private createNavigationItems(): void {
        if (!this.navigationContainer) return;

        const itemsContainer = this.navigationContainer.querySelector('.navigation-items-container');
        if (!itemsContainer) return;

        // 清空现有内容
        itemsContainer.innerHTML = '';

        const itemsToShow = this.filteredItems.length > 0 ? this.filteredItems : this.items;

        if (itemsToShow.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'navigation-empty-state';
            emptyState.textContent = this.searchInput?.value ? '未找到匹配的商品' : '暂无商品';
            itemsContainer.appendChild(emptyState);
            return;
        }

        itemsToShow.forEach((itemElement, index) => {
            const { data, element, variations } = itemElement;
            const variationCount = variations.length;
            const salesCount = variations.reduce((sum, v) => sum + v.data.salesCount, 0);
            const favoritesCount = data.favoritesCount;

            const navItem = document.createElement('div');
            navItem.className = 'navigation-item';
            navItem.setAttribute('data-item-id', data.id);

            // 创建封面图
            const thumbnailContainer = document.createElement('div');
            thumbnailContainer.className = 'navigation-thumbnail';

            if (data.thumbnail) {
                const img = document.createElement('img');
                img.src = data.thumbnail;
                img.onerror = () => {
                    thumbnailContainer.innerHTML = '<div style="color: #999; font-size: 10px;">无图</div>';
                };
                thumbnailContainer.appendChild(img);
            } else {
                thumbnailContainer.innerHTML = '<div style="color: #999; font-size: 10px;">无图</div>';
            }

            // 创建商品信息
            const itemInfo = document.createElement('div');
            itemInfo.className = 'navigation-item-info';

            const nameRow = document.createElement('div');
            nameRow.className = 'navigation-item-name-row';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'navigation-item-name';
            nameSpan.textContent = data.name;

            const countSpan = document.createElement('span');
            countSpan.className = 'navigation-item-variant-count';
            countSpan.textContent = `${variationCount}变体`;

            nameRow.appendChild(nameSpan);
            nameRow.appendChild(countSpan);

            // 添加销量和点赞信息（始终显示，包括0销量）
            const statsRow = document.createElement('div');
            statsRow.className = 'navigation-item-stats-row';
            
            const statsLeft = document.createElement('div');
            statsLeft.className = 'navigation-item-stats-left';
            
            const salesSpan = document.createElement('span');
            salesSpan.className = `navigation-item-sales ${salesCount > 0 ? 'has-sales' : 'no-sales'}`;
            salesSpan.textContent = `销量: ${salesCount}`;

            const favsSpan = document.createElement('span');
            favsSpan.className = `navigation-item-favorites ${favoritesCount > 0 ? 'has-favorites' : 'no-favorites'}`;
            favsSpan.innerHTML = `<span style="color: inherit;">❤️</span> ${favoritesCount}`;

            statsLeft.appendChild(salesSpan);
            statsLeft.appendChild(favsSpan);

            const indexSpan = document.createElement('span');
            indexSpan.className = 'navigation-item-index';
            indexSpan.textContent = `#${index + 1}`;

            statsRow.appendChild(statsLeft);
            statsRow.appendChild(indexSpan);
            itemInfo.appendChild(statsRow);

            itemInfo.appendChild(nameRow);
            navItem.appendChild(thumbnailContainer);
            navItem.appendChild(itemInfo);

            // 添加点击事件
            navItem.onclick = () => this.scrollToItem(element, navItem);

            itemsContainer.appendChild(navItem);
        });
    }

    /**
     * 过滤商品（使用 API 数据）
     */
    private filterItems(): void {
        if (!this.searchInput) return;

        const searchTerm = this.searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            this.filteredItems = [];
        } else {
            this.filteredItems = this.items.filter(itemElement => {
                const { data } = itemElement;
                return data.name.toLowerCase().includes(searchTerm) || 
                       data.id.includes(searchTerm);
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

            // 移动端：如果导航栏是收缩状态，点击后自动展开
            if (window.matchMedia('(max-width: 768px)').matches && !this.isExpanded) {
                this.showNavigation();
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
        });

        // 设置当前活跃状态
        activeNavItem.classList.add('active');
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
        
        // 保存监听器以便清理
        (this as any).scrollListener = onScroll;
    }

}
