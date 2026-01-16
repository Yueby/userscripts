/**
 * 模拟用户输入和键盘事件的工具类
 */
export class Simulate {
    /**
     * 模拟用户输入文本
     * @param element 目标输入元素
     * @param text 要输入的文本
     */
    static input(element: HTMLElement, text: string): void {
        let nativeInputValueSetter;

        if (element instanceof HTMLInputElement) {
            nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        } else if (element instanceof HTMLTextAreaElement) {
            nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
        }

        if (nativeInputValueSetter) {
            nativeInputValueSetter.call(element, text);
        } else {
            // Fallback for other elements or if setter not found
            (element as any).value = text;
        }

        const ev2 = new Event('input', { bubbles: true });
        element.dispatchEvent(ev2);
    }

    /**
     * 模拟键盘按下事件
     * @param element 目标元素
     * @param keyCode 键码
     */
    static keyDown(element: HTMLElement, keyCode: number): void {
        const keyboardEvent = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            key: 'Enter',
            code: 'Enter',
            keyCode: keyCode,
            which: keyCode,
            shiftKey: false,
            ctrlKey: false,
            metaKey: false
        });
        element.dispatchEvent(keyboardEvent);
    }

    /**
     * 模拟按下回车键
     * @param element 目标元素
     */
    static pressEnter(element: HTMLElement): void {
        this.keyDown(element, 13);
    }

    /**
     * 模拟鼠标点击事件
     * @param element 目标元素
     */
    static click(element: HTMLElement): void {
        // 不传递 view 参数，让浏览器使用默认值，避免跨域和类型转换问题
        const mouseEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(mouseEvent);
    }

    /**
     * 模拟拖拽操作
     * @param sourceElement 源元素（被拖拽的元素）
     * @param targetElement 目标元素（放置位置的元素）
     * @param position 'before' | 'after' - 放置在目标元素之前还是之后
     */
    /**
     * 模拟鼠标拖拽操作（触发 Booth 的拖拽处理器）
     * @param sourceDragHandle 拖拽触发元素（如 button）
     * @param targetDragHandle 目标拖拽元素（如 button）
     * @param sourceElement 实际要移动的元素（如 li）
     * @param targetElement 目标位置的元素（如 li）
     * @param position 插入位置
     */
    static dragAndDrop(
        sourceDragHandle: HTMLElement,
        targetDragHandle: HTMLElement,
        sourceElement: HTMLElement,
        targetElement: HTMLElement,
        position: 'before' | 'after' = 'before'
    ): boolean {
        try {
            // 获取元素位置用于模拟鼠标坐标
            const sourceRect = sourceDragHandle.getBoundingClientRect();
            const targetRect = targetDragHandle.getBoundingClientRect();
            
            // 1. 触发 mousedown（开始拖拽）
            const mouseDownEvent = new MouseEvent('mousedown', {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: sourceRect.left + sourceRect.width / 2,
                clientY: sourceRect.top + sourceRect.height / 2,
                button: 0
            });
            sourceDragHandle.dispatchEvent(mouseDownEvent);
            
            // 2. 触发 dragstart
            const dragStartEvent = new DragEvent('dragstart', {
                bubbles: true,
                cancelable: true,
                dataTransfer: new DataTransfer(),
                clientX: sourceRect.left + sourceRect.width / 2,
                clientY: sourceRect.top + sourceRect.height / 2
            });
            sourceElement.dispatchEvent(dragStartEvent);
            
            // 3. 触发 dragenter 和 dragover（移动到目标上方）
            const targetY = position === 'before' 
                ? targetRect.top + 5  // 靠近顶部
                : targetRect.bottom - 5;  // 靠近底部
            
            const dragEnterEvent = new DragEvent('dragenter', {
                bubbles: true,
                cancelable: true,
                dataTransfer: dragStartEvent.dataTransfer,
                clientX: targetRect.left + targetRect.width / 2,
                clientY: targetY
            });
            targetElement.dispatchEvent(dragEnterEvent);
            
            const dragOverEvent = new DragEvent('dragover', {
                bubbles: true,
                cancelable: true,
                dataTransfer: dragStartEvent.dataTransfer,
                clientX: targetRect.left + targetRect.width / 2,
                clientY: targetY
            });
            targetElement.dispatchEvent(dragOverEvent);
            
            // 4. 触发 drop（放下）
            const dropEvent = new DragEvent('drop', {
                bubbles: true,
                cancelable: true,
                dataTransfer: dragStartEvent.dataTransfer,
                clientX: targetRect.left + targetRect.width / 2,
                clientY: targetY
            });
            targetElement.dispatchEvent(dropEvent);
            
            // 5. 触发 dragend（结束）
            const dragEndEvent = new DragEvent('dragend', {
                bubbles: true,
                cancelable: true,
                dataTransfer: dragStartEvent.dataTransfer
            });
            sourceElement.dispatchEvent(dragEndEvent);
            
            // 6. 触发 mouseup（释放鼠标）
            const mouseUpEvent = new MouseEvent('mouseup', {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: targetRect.left + targetRect.width / 2,
                clientY: targetY,
                button: 0
            });
            targetDragHandle.dispatchEvent(mouseUpEvent);
            
            return true;
        } catch (error) {
            console.error('[dragAndDrop] 模拟拖拽失败:', error);
            return false;
        }
    }
} 