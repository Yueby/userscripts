import { Utils } from './utils/utils';
import { handleError } from './utils/error';
import { FeatureContext } from "./types";
import { ItemEditFeature, ItemManageFeature, SessionFeature } from "./features";

class BoothEnhancer {
    private context: FeatureContext = {
        observers: new Map(),
        cachedElements: new Map()
    };
    private features = [
        // new OrderAnalysisFeature(this.context),
        new ItemEditFeature(this.context),
        new ItemManageFeature(this.context),
        new SessionFeature(this.context)
    ];

    async init() {
        try {
            await Utils.waitForDOMReady();

            for (const feature of this.features) {
                try {
                    if (feature.shouldExecute()) {
                        await feature.execute();
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
            this.features.forEach(feature => feature.cleanup());
            this.context.observers.clear();
            this.context.cachedElements.clear();
        } catch (error) {
            handleError(error);
        }
    }
}

// 启动增强功能
new BoothEnhancer().init();
