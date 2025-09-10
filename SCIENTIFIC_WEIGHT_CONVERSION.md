# 科学化重量转换系统

## 🎯 实现目标
实现"科学且人性化"的重量转换系统，确保App显示的重量总能对应到健身房中实际可用的杠片组合。

## 🔬 科学化取整规则

### LBS → KG 转换
- **规则**: 向上取整到最接近的 2.5 倍数
- **原理**: 健身房标准杠片最小单位为 2.5kg
- **实现**: `Math.ceil(rawKg / 2.5) * 2.5`

### KG → LBS 转换  
- **规则**: 四舍五入到最接近的 5 倍数
- **原理**: 健身房标准杠片最小单位为 5lbs
- **实现**: `Math.round(rawLbs / 5) * 5`

## 📊 转换示例

### LBS → KG 转换示例
```
135 lbs → 61.2 kg → 62.5 kg (向上取整到2.5倍数)
225 lbs → 102.1 kg → 102.5 kg (向上取整到2.5倍数)
45 lbs → 20.4 kg → 22.5 kg (向上取整到2.5倍数)
```

### KG → LBS 转换示例
```
62.5 kg → 137.8 lbs → 140 lbs (四舍五入到5倍数)
102.5 kg → 225.9 lbs → 225 lbs (四舍五入到5倍数)
22.5 kg → 49.6 lbs → 50 lbs (四舍五入到5倍数)
```

## 🛠️ 技术实现

### 核心函数
```typescript
// LBS → KG 转换
export function convertLbsToKg(lbs: number): number {
  if (lbs === 0) return 0;
  const rawKg = lbs / 2.20462;
  const roundedKg = Math.ceil(rawKg / 2.5) * 2.5;
  return roundedKg;
}

// KG → LBS 转换
export function convertKgToLbs(kg: number): number {
    if (kg === 0) return 0;
    const rawLbs = kg * 2.20462;
    const roundedLbs = Math.round(rawLbs / 5) * 5;
    return roundedLbs;
}

// 格式化显示
export function formatWeight(weightInLbs: number, targetUnit: 'lbs' | 'kg'): string {
    if (targetUnit === 'kg') {
        const kg = convertLbsToKg(weightInLbs);
        return parseFloat(kg.toFixed(1)).toString();
    }
    return weightInLbs.toString();
}
```

### 集成到ExerciseCard
```typescript
const ExerciseCard = ({ exercise, unit }: { exercise: ExerciseDetail; unit: Unit; }) => {
    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    
    // 使用科学化取整的重量显示
    const displayWeight = formatWeight(exercise.plannedWeight, unit);

    return (
        <div className="relative">
            <div onClick={() => setIsPopoverVisible(!isPopoverVisible)} className="...">
                <p className="font-bold text-lg">{exercise.name}</p>
                <p className="text-gray-400">
                    {exercise.sets} sets x {exercise.reps} reps @ {displayWeight} {unit}
                </p>
                <p className="text-xs text-blue-400 mt-2 font-semibold">{exercise.cue}</p>
            </div>
        </div>
    );
};
```

## 🎯 产品价值

### 用户体验提升
- **实用性**: 显示的重量对应实际可用的杠片组合
- **一致性**: 双向转换保持逻辑一致性
- **专业性**: 符合健身房标准设备规格

### 技术优势
- **模块化**: 独立的重量转换服务，易于维护
- **可复用**: 可在整个应用中重复使用
- **类型安全**: 完整的TypeScript类型定义
- **可测试**: 纯函数，易于单元测试

## 🔍 测试用例

### 边界情况测试
```typescript
// 零重量处理
convertLbsToKg(0) // → 0
convertKgToLbs(0) // → 0

// 小数处理
convertLbsToKg(45) // → 22.5 (20.4 → 22.5)
convertKgToLbs(22.5) // → 50 (49.6 → 50)

// 大重量处理
convertLbsToKg(315) // → 145 (142.9 → 145)
convertKgToLbs(145) // → 320 (319.7 → 320)
```

### 双向一致性测试
```typescript
// 确保双向转换的一致性
const originalLbs = 135;
const kg = convertLbsToKg(originalLbs); // → 62.5
const backToLbs = convertKgToLbs(kg); // → 140 (可能不完全一致，但符合取整规则)
```

## 📁 文件结构
```
src/
├── lib/
│   └── weightConverter.ts          # 重量转换服务
├── app/
│   ├── plan/
│   │   └── page.tsx               # 训练计划页面 (已集成)
│   └── api/
│       └── v1/
│           └── plans/
│               └── current/
│                   └── route.ts   # API端点 (已更新注释)
```

## 🚀 未来扩展

### 可能的增强功能
1. **自定义取整规则**: 支持不同健身房的杠片规格
2. **重量建议**: 基于用户能力推荐合适的重量
3. **进度跟踪**: 记录重量变化趋势
4. **设备适配**: 支持不同设备的重量单位偏好

### 国际化支持
- 支持不同地区的重量单位标准
- 本地化的重量显示格式
- 文化相关的取整规则

---

**科学化重量转换系统已成功实现！** 🎊

现在训练计划页面显示的所有重量都经过科学化取整，确保用户看到的重量对应健身房中实际可用的杠片组合，完美体现了"科学且人性化"的产品原则。

