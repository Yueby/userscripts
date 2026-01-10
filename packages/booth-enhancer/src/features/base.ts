/**
 * 页面上下文
 * 包含页面功能所需的共享资源
 */
export interface FeatureContext {
  observers: Map<string, MutationObserver | IntersectionObserver>;
  cachedElements: Map<string, HTMLElement>;
}

/**
 * 页面基类（向后兼容）
 * 所有页面功能继承自此类
 * @deprecated 请使用 PageFeature 代替
 */
export abstract class Feature {
  protected context: FeatureContext;
  protected path: string;

  constructor(context: FeatureContext) {
    this.context = context;
    this.path = window.location.pathname;
  }

  /**
   * 判断当前页面是否应该执行此功能
   */
  shouldExecute(): boolean {
    return false;
  }

  /**
   * 执行页面功能
   */
  async execute(): Promise<void> {
    // console.log(`${this.constructor.name} executed`);
  }
}
