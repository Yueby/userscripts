/**
 * AboutCG Auto Video - 入口文件
 * 自动播放 AboutCG 网站视频的用户脚本
 * 
 * @author Yueby
 * @version 0.1.0
 */

import { AutoPlayController } from './core/AutoPlayController';
import { Logger } from './utils/logger';

/**
 * 主控制器实例
 */
const controller = new AutoPlayController();

/**
 * 启动函数
 */
async function bootstrap(): Promise<void> {
  try {
    await controller.initialize();
  } catch (error) {
    Logger.error('插件初始化失败', error);
  }
}

/**
 * 根据文档加载状态决定何时启动
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
