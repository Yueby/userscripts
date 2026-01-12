import { BaseAPI } from "../api/BaseAPI";

/**
 * 页面子模块基类
 * 所有页面功能模块继承此类
 * 
 * 使用方式：
 * 1. 实现 initialize() 方法处理初始数据
 * 2. 在 initialize() 中通过 api.onItemAdded() 注册新增元素监听（如需要）
 */
export abstract class PageModule<TApi extends BaseAPI = BaseAPI> {
    protected api: TApi;

    constructor(api: TApi) {
        this.api = api;
        
        // 基类统一注册 API 就绪回调
        // 使用 setTimeout 确保在子类字段初始化之后执行
        this.api.onReady(() => {
            setTimeout(() => {
                this.initialize();
            }, 0);
        });
    }

    /**
     * 初始化模块
     * 在 API 数据加载完成后调用
     * 可通过 this.api 访问 API 实例
     */
    protected abstract initialize(): void;
}

