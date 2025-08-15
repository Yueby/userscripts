import * as cheerio from 'cheerio';
import type { APIParsedItem, BoothItem, HTMLParsedItem, HTMLParsedVariant } from '../../types/item';
import { logger } from '../core/logger';
import { SessionManager } from '../core/session-manager';

/**
 * 商品管理器
 * 负责管理Booth商品数据结构和图标获取
 * 符合Booth的设计：一个商品ID对应多个变体
 */
export class ItemManager {
	private static instance: ItemManager;
	private itemsMap: Map<string, APIParsedItem> = new Map();
	private htmlItemsMap: Map<string, HTMLParsedItem> = new Map(); // 新增HTML解析数据存储
	private boothItemsMap: Map<string, BoothItem> = new Map(); // 统一的BoothItem数据
	private isInitialized: boolean = false;

	private constructor() {}

	/**
	 * 获取单例实例
	 */
	static getInstance(): ItemManager {
		if (!ItemManager.instance) {
			ItemManager.instance = new ItemManager();
		}
		return ItemManager.instance;
	}

	/**
	 * 初始化商品数据
	 * 从Booth管理页面获取所有商品信息
	 */
	async initialize(): Promise<void> {
		if (this.isInitialized) {
			return;
		}

		try {
			// 先加载API数据
			await this.loadItemsFromApi();

			// 再加载HTML数据
			await this.loadItemsFromHTML();

			// 初始化统一的BoothItem数据
			this.initializeBoothItems();

			this.isInitialized = true;
		} catch (error) {
			logger.error('商品数据初始化失败:', error);
			logger.warn('商品数据初始化失败，将使用空数据继续运行');
			// 不抛出错误，而是标记为已初始化以避免重复尝试
			this.isInitialized = true;
		}
	}

	/**
	 * 从管理页面API加载商品数据
	 */
	private async loadItemsFromApi(): Promise<void> {
		try {
			let page = 1;
			let hasMorePages = true;

			while (hasMorePages) {
				const boothManageUrl = `https://manage.booth.pm/items?page=${page}`;

				const response = await fetch(boothManageUrl);

				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}

				const data = await response.json();

				if (data && data.items && Array.isArray(data.items)) {
					data.items.forEach((item: any, index: number) => {
						try {
							if (item.id && item.name) {
								const itemId = item.id.toString();
								const name = item.name.trim();

								// 提取图标URL - 优先使用 base_resized 图片
								let iconUrl = '';
								if (item.primary_image?.base_resized?.url) {
									iconUrl = item.primary_image.base_resized.url;
								} else if (item.primary_image?.url) {
									iconUrl = item.primary_image.url;
								}

								// 创建商品数据对象
								const itemData: APIParsedItem = {
									id: item.id,
									name: name, // 使用trim后的name变量
									url: item.url,
									state: item.state,
									state_label: item.state_label,
									primary_image: item.primary_image,
									variants: item.variants || [],
									iconUrl: iconUrl
								};

								this.itemsMap.set(itemId, itemData);
							}
						} catch (error) {
							logger.warn(`[API] 解析API商品数据失败 (索引 ${index}):`, error);
						}
					});

					// 检查是否还有更多页面
					if (data.metadata && data.metadata.next_page) {
						page++;
					} else {
						hasMorePages = false;
					}
				} else {
					hasMorePages = false;
				}
			}

			logger.info(`[API] 数据加载完成，共获取 ${this.itemsMap.size} 个商品`);
		} catch (error) {
			logger.error('[API] 数据加载失败:', error);
			throw error;
		}
	}

	/**
	 * 从HTML页面加载商品数据
	 */
	private async loadItemsFromHTML(): Promise<void> {
		try {
			const sessionManager = SessionManager.getInstance();
			const sessionValue = await sessionManager.getValidSession();

			const boothManageUrl = 'https://manage.booth.pm/items';

			const headers: Record<string, string> = {
				Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
				'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6,ru;q=0.5',
				'Accept-Encoding': 'gzip, deflate, br, zstd',
				'Cache-Control': 'max-age=0',
				'User-Agent': navigator.userAgent,
				Referer: window.location.origin
			};

			// 如果有 Session，添加到请求头
			if (sessionValue) {
				headers['Cookie'] = `_plaza_session_nktz7u=${sessionValue}`;
				logger.info('[HTML] 使用 Session 访问 HTML 商品数据');
			} else {
				logger.warn('[HTML] 未找到有效 Session，将尝试无认证请求');
			}

			const response = await fetch(boothManageUrl, {
				method: 'GET',
				headers
			});

			if (!response.ok) {
				if (response.status === 401) {
					throw new Error(`[HTML] 认证失败 (401): ${sessionValue ? 'Session 已失效' : '请先登录 Booth 账户'}`);
				} else {
					throw new Error(`[HTML] HTTP ${response.status}: ${response.statusText}`);
				}
			}

			const htmlContent = await response.text();

			// 检查响应内容类型
			if (htmlContent.includes('<html') || htmlContent.includes('<!DOCTYPE')) {
				this.parseItemsFromHTML(htmlContent);
			} else {
				logger.warn('[HTML] 响应内容不是HTML页面');
			}
		} catch (error) {
			logger.error('[HTML] HTML解析加载商品数据时发生错误:', error);
			throw error;
		}
	}

	/**
	 * 使用cheerio解析HTML页面中的商品数据
	 */
	private parseItemsFromHTML(htmlContent: string): void {
		try {
			const $ = cheerio.load(htmlContent);

			// 从HTML元素中解析商品数据
			const itemsFromElements = this.parseItemsFromElements($);

			if (itemsFromElements.length > 0) {
				this.processItemsFromElements(itemsFromElements);
				logger.info(`[HTML] HTML解析完成，共获取 ${this.htmlItemsMap.size} 个商品`);
			} else {
				logger.warn('[HTML] 未从HTML元素中找到商品数据');
			}
		} catch (error) {
			logger.error('[HTML] 解析HTML时出错:', error);
		}
	}

	/**
	 * 从HTML元素中解析商品数据
	 */
	private parseItemsFromElements($: cheerio.CheerioAPI): HTMLParsedItem[] {
		const items: HTMLParsedItem[] = [];

		try {
			// 获取所有商品li元素
			const itemElements = $('#items > li');

			itemElements.each((index, itemElement) => {
				try {
					const $item = $(itemElement);

					// 使用精确的CSS选择器获取商品名称
					const itemNameElement = $item.find('.cell.item-name-with-stock .wrapper.row .cell.item-label span a');
					let itemName = itemNameElement.text().trim();

					// 检查商品名称是否为空
					if (!itemName) {
						logger.warn(`商品名称为空 (索引 ${index}), 尝试备用选择器`);
						// 尝试备用选择器
						const backupNameElement = $item.find('.cell.item-label span a');
						const backupName = backupNameElement.text().trim();
						if (!backupName) {
							logger.warn(`跳过商品 (索引 ${index}): 无法获取商品名称`);
							return; // 跳过这个商品
						}
						itemName = backupName;
					}

					// 使用精确的CSS选择器获取商品链接
					const itemUrlElement = $item.find('.cell.item-name-with-stock .wrapper.row .cell.item-label a');
					const itemUrl = itemUrlElement.attr('href') || '';

					// 解析收藏数 - 使用正确的CSS选择器
					let favoritesElement = $item.find('.dashboard-item-footer-stats .item-stat.favs .count');
					let favoritesText = favoritesElement.text().trim();

					// 如果主要选择器没有找到，尝试备用选择器
					if (!favoritesText) {
						favoritesElement = $item.find('.dashboard-item-footer-stats div div span');
						favoritesText = favoritesElement.text().trim();
					}

					const favorites = parseInt(favoritesText) || 0;

					// 解析商品变体
					const variants: HTMLParsedVariant[] = [];
					const variantElements = $item.find('.dashboard-items-variation > li');

					variantElements.each((variantIndex, variantElement) => {
						try {
							const $variant = $(variantElement);

							// 解析变体名称 - 第一个div的文本内容
							const variantNameElement = $variant.find('div').first();
							const variantName = variantNameElement.text().trim();

							// 解析变体价格 - 使用精确的CSS选择器
							const variantPriceElement = $variant.find('.number.price');
							// 获取div下的第二个元素（纯文本）
							const priceTextNodes = variantPriceElement.contents().filter(function () {
								return this.type === 'text';
							});
							const variantPriceText = priceTextNodes.text().trim();
							const variantPrice = this.parsePrice(variantPriceText);

							const variant: HTMLParsedVariant = {
								name: variantName,
								price: variantPrice
							};

							variants.push(variant);
						} catch (variantError) {
							logger.warn(`解析变体失败 (商品索引 ${index}, 变体索引 ${variantIndex}):`, variantError);
						}
					});

					const item: HTMLParsedItem = {
						name: itemName.trim(),
						url: itemUrl,
						favorites: favorites,
						variants: variants
					};

					items.push(item);
				} catch (error) {
					logger.warn(`解析商品元素失败 (索引 ${index}):`, error);
				}
			});
		} catch (error) {
			logger.error('从HTML元素解析商品数据失败:', error);
		}

		return items;
	}

	/**
	 * 处理从HTML元素解析的商品数据
	 */
	private processItemsFromElements(items: HTMLParsedItem[]): void {
		try {
			items.forEach((item: HTMLParsedItem, index: number) => {
				try {
					// 使用索引生成ID
					const itemId = `html-item-${index}`;

					// 直接存储HTMLParsedItem格式的数据到htmlItemsMap
					this.htmlItemsMap.set(itemId, item);
				} catch (error) {
					logger.warn(`处理HTML商品数据失败 (索引 ${index}):`, error);
				}
			});
		} catch (error) {
			logger.error('处理HTML元素商品数据时出错:', error);
		}
	}

	/**
	 * 解析价格字符串为数字
	 */
	private parsePrice(priceText: string): number {
		try {
			// 处理 "1,000 JPY" 格式的价格
			// 移除货币符号(JPY)和空格，只保留数字和逗号
			const cleanPrice = priceText.replace(/[^\d,]/g, '').replace(',', '');
			const price = parseFloat(cleanPrice);
			return isNaN(price) ? 0 : price;
		} catch (error) {
			logger.warn(`解析价格失败: ${priceText}`, error);
			return 0;
		}
	}

	/**
	 * 初始化统一的BoothItem数据
	 * 将API解析数据和HTML解析数据合并
	 */
	private initializeBoothItems(): void {
		this.boothItemsMap.clear();

		// 创建HTML商品的可用匹配列表（深拷贝）
		const availableHtmlItems = new Map<string, HTMLParsedItem>();
		this.htmlItemsMap.forEach((htmlItem, htmlId) => {
			availableHtmlItems.set(htmlId, { ...htmlItem });
		});

		// 遍历API解析的商品数据
		this.itemsMap.forEach((apiItem, itemId) => {
			// 尝试找到对应的HTML解析数据
			const htmlItem = this.findHTMLItemByName(apiItem.name, availableHtmlItems);

			// 创建统一的BoothItem
			const boothItem: BoothItem = {
				id: apiItem.id,
				name: apiItem.name,
				state: apiItem.state,
				url: apiItem.url,
				iconUrl: apiItem.iconUrl,
				favorites: htmlItem?.favorites || 0,
				variants: htmlItem?.variants || []
			};

			this.boothItemsMap.set(itemId, boothItem);

			if (htmlItem) {
				// 如果匹配成功，从可用列表中移除该HTML商品
				const matchedHtmlId = Array.from(availableHtmlItems.entries()).find(([, item]) => item.name === apiItem.name)?.[0];
				if (matchedHtmlId) {
					availableHtmlItems.delete(matchedHtmlId);
				}
			}
		});

		// logger.info(`初始化完成: 创建了 ${this.boothItemsMap.size} 个统一的BoothItem`);
	}

	/**
	 * 通过商品名称查找HTML解析的商品数据
	 */
	private findHTMLItemByName(name: string, availableItems?: Map<string, HTMLParsedItem>): HTMLParsedItem | null {
		const itemsToSearch = availableItems || this.htmlItemsMap;
		for (const htmlItem of itemsToSearch.values()) {
			if (htmlItem.name === name) {
				return htmlItem;
			}
		}
		return null;
	}

	/**
	 * 根据商品ID获取商品数据
	 */
	getItem(id: string): APIParsedItem | null {
		return this.itemsMap.get(id) || null;
	}

	/**
	 * 根据商品ID获取商品图标
	 */
	getItemIcon(id: string): string {
		const item = this.getItem(id);
		if (!item) {
			logger.warn(`未找到商品ID: ${id}`);
			return this.getDefaultIcon();
		}
		return item.iconUrl || this.getDefaultIcon();
	}

	/**
	 * 根据商品ID获取指定尺寸的图片URL
	 * @param id 商品ID
	 * @param size 图片尺寸 ('72x72', '150x150', '300x300', '620x620', 'original')
	 */
	getItemImageUrl(id: string, size: '72x72' | '150x150' | '300x300' | '620x620' | 'original' = '72x72'): string {
		const item = this.getItem(id);
		if (!item) {
			return this.getDefaultIcon();
		}

		// 目前我们只存储了 base_resized 图片URL
		// 如果需要其他尺寸，需要修改数据结构来存储完整的图片信息
		return item.iconUrl || this.getDefaultIcon();
	}

	/**
	 * 根据商品ID获取商品名称
	 */
	getItemName(id: string): string {
		const item = this.getItem(id);
		return item?.name || '未知商品';
	}

	/**
	 * 根据商品ID获取商品状态
	 */
	getItemState(id: string): string {
		const item = this.getItem(id);
		return item?.state || '';
	}

	/**
	 * 根据商品ID获取商品URL
	 */
	getItemUrl(id: string): string {
		const item = this.getItem(id);
		return item?.url || '';
	}

	/**
	 * 获取所有商品数据
	 */
	getAllItems(): Map<string, APIParsedItem> {
		return new Map(this.itemsMap);
	}

	/**
	 * 获取所有商品ID
	 */
	getAllItemIds(): string[] {
		return Array.from(this.itemsMap.keys());
	}

	/**
	 * 检查商品是否存在
	 */
	hasItem(id: string): boolean {
		return this.itemsMap.has(id);
	}

	/**
	 * 获取商品总数
	 */
	getItemCount(): number {
		return this.itemsMap.size;
	}

	/**
	 * 获取HTML解析的商品数据
	 */
	getHTMLItem(id: string): HTMLParsedItem | null {
		return this.htmlItemsMap.get(id) || null;
	}

	/**
	 * 获取所有HTML解析的商品数据
	 */
	getAllHTMLItems(): Map<string, HTMLParsedItem> {
		return new Map(this.htmlItemsMap);
	}

	/**
	 * 获取HTML解析的商品数量
	 */
	getHTMLItemCount(): number {
		return this.htmlItemsMap.size;
	}

	/**
	 * 清除HTML缓存数据
	 */
	clearHTMLCache(): void {
		this.htmlItemsMap.clear();
	}

	/**
	 * 获取默认图标URL
	 */
	private getDefaultIcon(): string {
		return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iNzIiIHZpZXdCb3g9IjAgMCA3MiA3MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjcyIiBoZWlnaHQ9IjcyIiByeD0iOCIgZmlsbD0iI0YzRjRGNiIvPgo8cGF0aCBkPSJNMzYgMjRDMzAuNDc3MiAyNCAyNiAyOC40NzcyIDI2IDM0QzI2IDM5LjUyMjggMzAuNDc3MiA0NCAzNiA0QzQxLjUyMjggNDQgNDYgMzkuNTIyOCA0NiAzNEM0NiAyOC40NzcyIDQxLjUyMjggMjQgMzYgMjRaIiBmaWxsPSIjNkI3MjgwIi8+CjxwYXRoIGQ9Ik0yNCA0OEg0OFY1MkgyNFY0OFoiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+';
	}

	/**
	 * 根据商品ID获取BoothItem数据
	 */
	getBoothItem(id: string): BoothItem | null {
		return this.boothItemsMap.get(id) || null;
	}

	/**
	 * 获取所有BoothItem数据
	 */
	getAllBoothItems(): Map<string, BoothItem> {
		return new Map(this.boothItemsMap);
	}

	/**
	 * 获取所有BoothItem ID
	 */
	getAllBoothItemIds(): string[] {
		return Array.from(this.boothItemsMap.keys());
	}

	/**
	 * 检查BoothItem是否存在
	 */
	hasBoothItem(id: string): boolean {
		return this.boothItemsMap.has(id);
	}

	/**
	 * 获取BoothItem总数
	 */
	getBoothItemCount(): number {
		return this.boothItemsMap.size;
	}

	/**
	 * 清除缓存数据
	 */
	clearCache(): void {
		this.itemsMap.clear();
		this.htmlItemsMap.clear();
		this.boothItemsMap.clear();
		this.isInitialized = false;
	}

	/**
	 * 重新加载商品数据
	 */
	async reload(): Promise<void> {
		this.clearCache();
		await this.initialize();
	}
}
