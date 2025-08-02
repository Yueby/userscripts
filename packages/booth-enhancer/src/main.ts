import { Utils } from './utils/utils';
import { handleError } from './utils/error';
import {
    SessionCommand,
    ItemEditCommand,
    ItemManageCommand
} from './commands';
import { CommandContext } from "./types";

class BoothEnhancer {
    private context: CommandContext = {
        observers: new Map(),
        cachedElements: new Map()
    };
    private commands = [
        new SessionCommand(this.context),
        new ItemEditCommand(this.context),
        new ItemManageCommand(this.context)
    ];

    async init() {
        try {
            await Utils.waitForDOMReady();

            for (const command of this.commands) {
                try {
                    if (command.shouldExecute()) {
                        await command.execute();
                    }
                } catch (error) {
                    handleError(error);
                }
            }

            console.log('Booth功能增强已启动');
        } catch (error) {
            handleError(error, () => {
                console.error('Booth功能增强启动失败');
            });
        }
    }

    destroy() {
        try {
            this.commands.forEach(command => command.cleanup());
            this.context.observers.clear();
            this.context.cachedElements.clear();
        } catch (error) {
            handleError(error);
        }
    }
}

// 启动增强功能
new BoothEnhancer().init();
