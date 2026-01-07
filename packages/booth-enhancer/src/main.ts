import { ItemEditFeature, ItemManageFeature, SessionFeature } from './features';
import { FeatureContext } from './types';
import { handleError } from './utils/error';

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
			for (const feature of this.features) {
				try {
					if (feature.shouldExecute()) {
						await feature.execute();
					}
				} catch (error) {
					handleError(error);
				}
			}

			// console.log('Booth Enhancer 已启动');
		} catch (error) {
			handleError(error, () => {
				console.error('Booth Enhancer 启动失败');
			});
		}
	}
}

// 启动增强功能
new BoothEnhancer().init();
