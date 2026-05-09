import type { SingleItemConfig } from '../config-types';

/**
 * 清理结果统计
 */
export interface CleanupResult {
  commonFiles: number;
  variationFileIds: number;
  fileItemMapEntries: number;
  get total(): number;
}

/**
 * 清理商品配置中所有对失效文件 ID 的引用
 * - commonFiles 里不在可用集合中的 ID
 * - 每个 variation.fileIds 里不在可用集合中的 ID
 * - 每个 variation.fileItemMap 里键不在可用集合中的条目
 * 同时兼容历史数据（fileItemMap 的 value 可能是 string，统一转为 string[]）
 *
 * ⚠️ 安全守卫：若 availableFileIds 为空（页面尚未就绪 / 文件面板暂时消失），
 * 函数直接返回零清理。因为此时若继续执行，会把所有 fileIds/commonFiles/fileItemMap
 * 当作失效被清空，这是一个已知的危险场景（React 重挂载文件面板时会触发）。
 *
 * @param itemConfig 单商品配置（会被原地修改）
 * @param availableFileIds 当前 Booth 页面实际存在的文件 ID 集合
 * @returns 各维度清理的数量
 */
export function cleanMissingFileIds(
  itemConfig: SingleItemConfig,
  availableFileIds: Set<string>
): CleanupResult {
  let commonRemoved = 0;
  let variationRemoved = 0;
  let mapRemoved = 0;
  
  const emptyResult: CleanupResult = {
    commonFiles: 0,
    variationFileIds: 0,
    fileItemMapEntries: 0,
    get total() {
      return this.commonFiles + this.variationFileIds + this.fileItemMapEntries;
    }
  };
  
  // 安全守卫：availableFileIds 为空时不执行清理
  if (availableFileIds.size === 0) {
    return emptyResult;
  }

  // 清理 commonFiles
  if (itemConfig.commonFiles && itemConfig.commonFiles.length > 0) {
    const before = itemConfig.commonFiles.length;
    itemConfig.commonFiles = itemConfig.commonFiles.filter(id =>
      availableFileIds.has(id)
    );
    commonRemoved = before - itemConfig.commonFiles.length;
  }

  // 清理每个 variation
  itemConfig.variations.forEach(variation => {
    // fileIds 数组
    if (variation.fileIds && variation.fileIds.length > 0) {
      const before = variation.fileIds.length;
      variation.fileIds = variation.fileIds.filter(id =>
        availableFileIds.has(id)
      );
      variationRemoved += before - variation.fileIds.length;
    }

    // fileItemMap：键必须在可用集合内，值兼容旧数据并过滤空项
    if (variation.fileItemMap) {
      const cleaned: Record<string, string[]> = {};
      for (const [fileId, itemIds] of Object.entries(variation.fileItemMap)) {
        if (!availableFileIds.has(fileId)) {
          mapRemoved++;
          continue;
        }
        const ids = Array.isArray(itemIds)
          ? itemIds
          : [itemIds as unknown as string];
        const valid = ids.filter(Boolean);
        if (valid.length > 0) {
          cleaned[fileId] = valid;
        }
      }
      variation.fileItemMap = cleaned;
    }
  });

  return {
    commonFiles: commonRemoved,
    variationFileIds: variationRemoved,
    fileItemMapEntries: mapRemoved,
    get total() {
      return this.commonFiles + this.variationFileIds + this.fileItemMapEntries;
    }
  };
}
