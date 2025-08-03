import { ItemEditFeature, ItemManageFeature, SessionFeature } from './features';
import { FeatureContext } from './types';
import { handleError } from './utils/error';
import { Utils } from './utils/utils';

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

			console.log('Booth Enhancer 已启动');
		} catch (error) {
			handleError(error, () => {
				console.error('Booth Enhancer 启动失败');
			});
		}
	}

	destroy() {
		try {
			this.features.forEach((feature) => feature.cleanup());
			this.context.observers.clear();
			this.context.cachedElements.clear();
		} catch (error) {
			handleError(error);
		}
	}
}

// 启动增强功能
new BoothEnhancer().init();
