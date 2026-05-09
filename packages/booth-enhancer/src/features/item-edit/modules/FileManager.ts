import { ItemEditAPI } from "../../../api/item-edit";
import { Simulate } from "../../../utils/simulate";
import { PageModule } from "../../PageModule";

/**
 * 文件管理功能模块
 * 为文件管理面板提供全选/全不选功能
 */
export class FileManager extends PageModule<ItemEditAPI> {

    constructor(api: ItemEditAPI) {
        super(api);
    }

    protected initialize(): void {
        // 直接查找并增强文件管理面板
        this.enhanceFilePanel();
    }

    /**
     * 增强文件管理面板
     */
    private enhanceFilePanel(): void {
        // 通过标题 "Add/Edit Files" 定位面板
        const panel = this.findFilePanel();
        if (!panel) return;
        
        // 避免重复处理
        if (panel.hasAttribute('data-file-manager-enhanced')) return;
        panel.setAttribute('data-file-manager-enhanced', 'true');
        
        // 找到包含存储空间信息的 div
        const storageDiv = panel.querySelector('.font-heavy-sans.text-\\[14px\\]');
        if (!storageDiv) return;
        
        // 在存储空间 div 后面添加按钮容器
        this.addActionButtons(storageDiv as HTMLElement);
    }

    /**
     * 查找文件管理面板
     */
    private findFilePanel(): HTMLElement | null {
        // 通过标题 "Add/Edit Files" 定位面板
        const titleElements = document.querySelectorAll('.font-booth-demi');
        for (const title of Array.from(titleElements)) {
            if (title.textContent?.includes('Add/Edit Files')) {
                return title.closest('.bg-white') as HTMLElement;
            }
        }
        return null;
    }

    /**
     * 添加操作按钮
     */
    private addActionButtons(storageDiv: HTMLElement): void {
        // 创建按钮容器
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'flex gap-8 py-12 px-16 border-b border-b-border300';
        buttonContainer.style.cssText = 'background: #f8f9fa;';
        
        // 创建"全选"按钮
        const selectAllBtn = document.createElement('button');
        selectAllBtn.type = 'button';
        selectAllBtn.className = 'btn calm small';
        selectAllBtn.textContent = '全选';
        selectAllBtn.onclick = () => this.selectAllFiles();
        
        // 创建"全不选"按钮
        const unselectAllBtn = document.createElement('button');
        unselectAllBtn.type = 'button';
        unselectAllBtn.className = 'btn calm small';
        unselectAllBtn.textContent = '全不选';
        unselectAllBtn.onclick = () => this.unselectAllFiles();
        
        buttonContainer.appendChild(selectAllBtn);
        buttonContainer.appendChild(unselectAllBtn);
        
        // 插入到存储空间 div 后面
        storageDiv.parentElement?.insertBefore(buttonContainer, storageDiv.nextSibling);
    }

    /**
     * 全选所有文件
     */
    private selectAllFiles(): void {
        this.setAllCheckboxes(true);
    }

    /**
     * 全不选所有文件
     */
    private unselectAllFiles(): void {
        this.setAllCheckboxes(false);
    }

    /**
     * 设置所有复选框状态（分批执行，避免一次性触发过多 React 更新）
     */
    private async setAllCheckboxes(checked: boolean): Promise<void> {
        const fileCheckboxes = document.querySelectorAll(
            'ul.list-none input.charcoal-checkbox-input[type="checkbox"]'
        );
        
        // 只处理状态需要变化的复选框
        const toToggle = Array.from(fileCheckboxes).filter(
            cb => (cb as HTMLInputElement).checked !== checked
        );
        
        if (toToggle.length === 0) return;
        
        const BATCH_SIZE = 10;
        const FRAME_DELAY = () => new Promise(resolve => requestAnimationFrame(resolve));
        
        for (let i = 0; i < toToggle.length; i += BATCH_SIZE) {
            const batch = toToggle.slice(i, i + BATCH_SIZE);
            batch.forEach(cb => Simulate.click(cb as HTMLInputElement));
            
            // 每批之间让出主线程，让 React 完成状态更新
            if (i + BATCH_SIZE < toToggle.length) {
                await FRAME_DELAY();
            }
        }
    }
}

