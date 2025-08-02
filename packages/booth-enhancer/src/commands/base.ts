import { CommandContext } from "../types";

export abstract class PageCommand {
    protected context: CommandContext;
    protected path: string;

    constructor(context: CommandContext) {
        this.context = context;
        this.path = window.location.pathname;
    }

    shouldExecute(): boolean {
        return false;
    }

    execute(): void {
        console.log(`${this.constructor.name} 执行`);
    }

    cleanup(): void {
        // 子类实现具体清理逻辑
    }
} 