/**
 * 对象工具类
 * 提供通用的对象操作工具函数
 */

/**
 * 安全地获取嵌套对象的属性值
 * @param obj 目标对象
 * @param path 属性路径，使用点号分隔，如 'user.profile.name'
 * @returns 属性值，如果路径不存在则返回 undefined
 */
export const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};

