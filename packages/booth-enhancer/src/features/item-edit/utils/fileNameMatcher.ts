/**
 * 文件名到商品名的模糊匹配算法
 *
 * 流程：
 * 1. normalizeString 去掉版本号、括号内容、扩展名、分隔符
 * 2. calculateMatchScore 基于规则 + LCS 打分
 * 3. isWordBoundaryMatch 对独立词匹配额外加分
 * 4. findBestMatchItem 在商品树中找最高分项，低于阈值返回 null
 *
 * 评分阈值：
 * - 完全相等: 1.0
 * - startsWith: 0.95
 * - fileName includes itemName: 0.77 ~ 0.92（越靠前越高）
 * - itemName includes fileName: 0.6
 * - LCS: 最高 0.8
 * - 词边界加分: +0.1
 * - MIN_SCORE_THRESHOLD: 0.4
 */

export interface MatchableNode {
  data?: {
    itemName?: string;
    [key: string]: any;
  };
}

export interface MatchableTree {
  nodes: Record<string, MatchableNode>;
}

export const MIN_MATCH_SCORE_THRESHOLD = 0.4;
export const WORD_BOUNDARY_BONUS = 0.1;

/**
 * 归一化文件名/商品名，去掉噪音字符
 * - 小写化
 * - 去扩展名（zip/rar/7z/unitypackage）
 * - 去版本号（v1.0, 1.2.3 等）
 * - 去括号内容
 * - 去分隔符
 */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/\.(zip|rar|7z|unitypackage)$/i, '')
    .replace(/[_\-\s]?v?\d+[\._]\d+[\._]?\d*/gi, '')
    .replace(/[(\[（【][^)\]）】]*[)\]）】]/g, '')
    .replace(/[\s\-_\.]/g, '')
    .trim();
}

/**
 * 最长公共子串长度（动态规划，O(m*n) 时间、O(n) 空间）
 */
export function longestCommonSubstring(str1: string, str2: string): string {
  if (!str1 || !str2) return '';
  
  const m = str1.length;
  const n = str2.length;
  let maxLength = 0;
  let endIndex = 0;
  
  const dp: number[] = new Array(n + 1).fill(0);
  
  for (let i = 1; i <= m; i++) {
    let prev = 0;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      if (str1[i - 1] === str2[j - 1]) {
        dp[j] = prev + 1;
        if (dp[j] > maxLength) {
          maxLength = dp[j];
          endIndex = i;
        }
      } else {
        dp[j] = 0;
      }
      prev = temp;
    }
  }
  
  return maxLength > 0 ? str1.substring(endIndex - maxLength, endIndex) : '';
}

/**
 * 根据归一化后的字符串计算匹配分数
 * @param fileName 归一化后的文件名
 * @param itemName 归一化后的商品名
 */
export function calculateMatchScore(fileName: string, itemName: string): number {
  if (!itemName || !fileName) return 0;
  if (fileName === itemName) return 1.0;
  if (fileName.startsWith(itemName)) return 0.95;
  
  // 完整子串匹配：基础分高于 LCS 上限（0.8），保证优先
  if (fileName.includes(itemName)) {
    const position = fileName.indexOf(itemName);
    const relativePosition = position / fileName.length;
    return 0.92 - (relativePosition * 0.15);  // 0.77 ~ 0.92
  }
  
  if (itemName.includes(fileName)) return 0.6;
  
  // 最长公共子串
  const lcs = longestCommonSubstring(fileName, itemName);
  if (lcs.length === 0) return 0;
  
  const lcsRatio = lcs.length / itemName.length;
  if (lcsRatio >= 0.8) {
    return 0.5 + lcsRatio * 0.3;  // 最高 0.8
  }
  
  const minLen = Math.min(itemName.length, fileName.length);
  return (lcs.length / minLen) * 0.5;
}

/**
 * 检查 itemName 是否在原始（未归一化）文件名中是一个独立词
 * （前后有分隔符或处于字符串边界）
 */
export function isWordBoundaryMatch(
  originalFileName: string,
  normalizedItemName: string
): boolean {
  const lowerFileName = originalFileName.toLowerCase();
  const index = lowerFileName.indexOf(normalizedItemName.toLowerCase());
  if (index === -1) return false;
  
  const charBefore = index > 0 ? lowerFileName[index - 1] : '';
  const isBoundaryBefore = index === 0 || /[\s\-_\.]/.test(charBefore);
  
  const endIndex = index + normalizedItemName.length;
  const charAfter = endIndex < lowerFileName.length ? lowerFileName[endIndex] : '';
  const isBoundaryAfter = endIndex === lowerFileName.length || /[\s\-_\.]/.test(charAfter);
  
  return isBoundaryBefore && isBoundaryAfter;
}

/**
 * 在商品树中为给定文件名找最佳匹配
 * @returns 匹配的节点 ID，或 null（未达阈值）
 */
export function findBestMatchItem(
  fileName: string,
  itemTree: MatchableTree | null | undefined
): string | null {
  if (!fileName || !itemTree) return null;
  
  const normalizedFileName = normalizeString(fileName);
  let bestMatch: { itemId: string; score: number } | null = null;
  
  for (const [nodeId, node] of Object.entries(itemTree.nodes)) {
    const itemName = node.data?.itemName;
    if (!itemName) continue;
    
    const normalizedItemName = normalizeString(itemName);
    let score = calculateMatchScore(normalizedFileName, normalizedItemName);
    
    // 独立词匹配加分
    if (score > 0 && isWordBoundaryMatch(fileName, normalizedItemName)) {
      score += WORD_BOUNDARY_BONUS;
    }
    
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { itemId: nodeId, score };
    }
  }
  
  return bestMatch && bestMatch.score >= MIN_MATCH_SCORE_THRESHOLD
    ? bestMatch.itemId
    : null;
}
