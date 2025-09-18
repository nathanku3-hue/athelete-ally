// src/lib/weightConverter.ts

/**
 * 将磅 (LBS) 转换为公斤 (KG)，并向上取整到最接近的 2.5 的倍数。
 * @param lbs - 磅数值
 * @returns 取整后的公斤数值
 */
export function convertLbsToKg(lbs: number): number {
  if (lbs === 0) return 0;
  const rawKg = lbs / 2.20462;
  // 向上取整到最接近的 2.5 倍数
  const roundedKg = Math.ceil(rawKg / 2.5) * 2.5;
  return roundedKg;
}

/**
 * 将公斤 (KG) 转换为磅 (LBS)，并四舍五入到最接近的 5 的倍数。
 * @param kg - 公斤数值
 * @returns 取整后的磅数值
 */
export function convertKgToLbs(kg: number): number {
    if (kg === 0) return 0;
    const rawLbs = kg * 2.20462;
    // 四舍五入到最接近的 5 倍数
    const roundedLbs = Math.round(rawLbs / 5) * 5;
    return roundedLbs;
}

/**
 * 根据用户选择的单位，显示经过科学取整的重量。
 * @param weightInLbs - 数据库中储存的基础重量 (LBS)
 * @param targetUnit - 用户希望看到的单位 ('lbs' 或 'kg')
 * @returns 格式化后的重量字符串
 */
export function formatWeight(weightInLbs: number, targetUnit: 'lbs' | 'kg'): string {
    if (targetUnit === 'kg') {
        const kg = convertLbsToKg(weightInLbs);
        // 使用 toFixed(1) 来处理 .5 的情况，并用 parseFloat 去除不必要的 .0
        return parseFloat(kg.toFixed(1)).toString();
    }
    // LBS 单位无需转换，直接返回
    return weightInLbs.toString();
}

/**
 * 获取重量转换的详细信息，用于调试和显示
 * @param weightInLbs - 数据库中储存的基础重量 (LBS)
 * @param targetUnit - 用户希望看到的单位 ('lbs' 或 'kg')
 * @returns 包含原始值、转换值和取整值的详细信息
 */
export function getWeightConversionDetails(weightInLbs: number, targetUnit: 'lbs' | 'kg') {
    if (targetUnit === 'kg') {
        const rawKg = weightInLbs / 2.20462;
        const roundedKg = convertLbsToKg(weightInLbs);
        return {
            original: weightInLbs,
            rawConversion: rawKg,
            roundedConversion: roundedKg,
            unit: 'kg',
            roundingRule: '向上取整到 2.5 倍数'
        };
    } else {
        const rawLbs = weightInLbs;
        const roundedLbs = Math.round(weightInLbs / 5) * 5;
        return {
            original: weightInLbs,
            rawConversion: rawLbs,
            roundedConversion: roundedLbs,
            unit: 'lbs',
            roundingRule: '四舍五入到 5 倍数'
        };
    }
}

