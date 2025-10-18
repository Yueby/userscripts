import type { CharacterMap, ReplacerConfig } from '../types';

export class TextReplacer {
  private charMap: CharacterMap;
  private config: Required<ReplacerConfig>;
  private replaceCount: number = 0;

  constructor(charMap: CharacterMap, config?: ReplacerConfig) {
    this.charMap = charMap;
    this.config = {
      targetTags: config?.targetTags ?? ['*'],
      excludeTags: config?.excludeTags ?? ['SCRIPT', 'STYLE'],
    };
  }

  replaceText(text: string): string {
    let result = text;
    for (const [fancyChar, normalChar] of Object.entries(this.charMap)) {
      if (result.includes(fancyChar)) {
        result = result.replace(new RegExp(fancyChar, 'g'), normalChar);
        this.replaceCount++;
      }
    }
    return result;
  }

  private shouldProcessNode(node: Node): boolean {
    if (node.nodeType !== Node.TEXT_NODE) {
      return false;
    }

    const parentElement = node.parentElement;
    if (!parentElement) {
      return false;
    }

    const tagName = parentElement.tagName;
    if (this.config.excludeTags.includes(tagName)) {
      return false;
    }

    if (this.config.targetTags.includes('*')) {
      return true;
    }

    return this.config.targetTags.includes(tagName);
  }

  private processTextNode(node: Node): void {
    const originalText = node.textContent ?? '';
    if (!originalText) {
      return;
    }

    const replacedText = this.replaceText(originalText);
    if (replacedText !== originalText) {
      node.textContent = replacedText;
    }
  }

  private setValueAndTriggerEvents(element: HTMLInputElement | HTMLTextAreaElement, value: string): void {
    const prototype = element instanceof HTMLInputElement ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype;
    const nativeSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
    nativeSetter?.call(element, value);
    
    element.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  private replaceInInputElements(element: Element): void {
    const inputs = element.querySelectorAll('input[type="text"], input:not([type]), input[type="search"], input[type="url"], input[type="email"]');
    inputs.forEach((input) => {
      const inputElement = input as HTMLInputElement;
      const originalValue = inputElement.value;
      if (originalValue) {
        const replacedValue = this.replaceText(originalValue);
        if (replacedValue !== originalValue) {
          this.setValueAndTriggerEvents(inputElement, replacedValue);
        }
      }
    });
  }

  private replaceInTextareas(element: Element): void {
    const textareas = element.querySelectorAll('textarea');
    textareas.forEach((textarea) => {
      const originalValue = textarea.value;
      if (originalValue) {
        const replacedValue = this.replaceText(originalValue);
        if (replacedValue !== originalValue) {
          this.setValueAndTriggerEvents(textarea, replacedValue);
        }
      }
    });
  }

  private replaceInContentEditable(element: Element): void {
    const editables = element.querySelectorAll('[contenteditable="true"]');
    editables.forEach((editable) => {
      this.replaceInElement(editable);
    });
  }

  replaceInElement(element: Element): number {
    this.replaceCount = 0;

    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          return this.shouldProcessNode(node)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        },
      }
    );

    const textNodes: Node[] = [];
    let currentNode = walker.nextNode();
    while (currentNode) {
      textNodes.push(currentNode);
      currentNode = walker.nextNode();
    }

    textNodes.forEach(node => this.processTextNode(node));

    this.replaceInInputElements(element);
    this.replaceInTextareas(element);
    this.replaceInContentEditable(element);

    return this.replaceCount;
  }

  replaceInDocument(): number {
    return this.replaceInElement(document.body);
  }
}

