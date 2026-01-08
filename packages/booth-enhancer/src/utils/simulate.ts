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
        const mouseEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        element.dispatchEvent(mouseEvent);
    }
} 