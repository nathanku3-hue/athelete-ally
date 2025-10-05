# 合约类型规范文档

## 概述

本文档定义了 Athlete Ally 项目中 API 和前端之间的合约类型规范，确保类型一致性和防止合约漂移。

## 核心原则

1. **单一真实来源**: 所有类型定义都在 `@athlete-ally/shared-types` 中
2. **运行时验证**: 使用 Zod 进行 API 请求/响应的运行时验证
3. **编译时检查**: TypeScript 确保编译时类型安全
4. **合约测试**: 自动化测试验证 API 和前端类型一致性

## 规范类型定义

### 疲劳评估类型 (Fatigue Assessment)

#### FatigueLevel
```typescript
type FatigueLevel = 'low' | 'moderate' | 'high';
```

**重要**: 使用 `'moderate'` 而不是 `'normal'`。这是规范值。

#### FatigueAssessmentInput
```typescript
interface FatigueAssessmentInput {
  sleepQuality: number; // 1-10 scale
  stressLevel: number; // 1-10 scale  
  muscleSoreness: number; // 1-10 scale
  energyLevel: number; // 1-10 scale
  motivation: number; // 1-10 scale
}
```

#### FatigueAssessmentResult
```typescript
interface FatigueAssessmentResult {
  success: boolean;
  fatigueScore: number; // 0-10 scale
  level: FatigueLevel;
  message: string;
  timestamp: string;
}
```

### 季节类型 (Season)

#### Season
```typescript
type Season = 'offseason' | 'preseason' | 'inseason';
```

**重要**: 使用无连字符格式 (`'offseason'`) 而不是连字符格式 (`'off-season'`)。

#### SeasonOption
```typescript
interface SeasonOption {
  id: Season;
  title: string;
  description: string;
}
```

### 反馈类型 (Feedback)

#### FeedbackType
```typescript
type FeedbackType = 'bug' | 'feature' | 'improvement' | 'general';
```

#### FeedbackData
```typescript
interface FeedbackData {
  type: FeedbackType;
  rating: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  userEmail?: string;
  userId?: string;
}
```

## 运行时验证

### Zod 模式

所有类型都有对应的 Zod 验证模式：

```typescript
import { 
  FatigueAssessmentInputSchema,
  FatigueAssessmentResultSchema,
  SeasonSchema,
  FeedbackDataSchema
} from '@athlete-ally/shared-types';
```

### 验证函数

```typescript
import { 
  safeValidateFatigueAssessmentInput,
  safeValidateSeason,
  safeValidateFeedbackData
} from '@athlete-ally/shared-types';
```

## API 合约

### POST /api/v1/fatigue/status

**请求**:
```typescript
FatigueAssessmentInput
```

**响应**:
```typescript
FatigueAssessmentResult
```

**验证**:
- 请求数据使用 `safeValidateFatigueAssessmentInput()` 验证
- 响应数据使用 `safeValidateFatigueAssessmentResult()` 验证

### GET /api/v1/fatigue/status

**响应**:
```typescript
FatigueStatusResponse
```

## 迁移指南

### 从旧格式迁移

#### 疲劳级别迁移
```typescript
// ❌ 旧格式
const level = 'normal';

// ✅ 新格式
const level: FatigueLevel = 'moderate';
```

#### 季节格式迁移
```typescript
// ❌ 旧格式
const season = 'off-season';

// ✅ 新格式
const season: Season = 'offseason';
```

### 导入更新

```typescript
// ❌ 旧方式 - 本地定义
interface FatigueResult {
  level: 'low' | 'normal' | 'high';
}

// ✅ 新方式 - 使用共享类型
import { FatigueAssessmentResult, FatigueLevel } from '@athlete-ally/shared-types';
```

## 合约测试

### 运行合约测试

```bash
npm test -- src/__tests__/contracts/type-consistency.test.ts
```

### 测试覆盖

- ✅ 类型验证测试
- ✅ API 响应格式测试
- ✅ 运行时验证测试
- ✅ 类型漂移检测测试

## CI/CD 集成

### 合约漂移检测

```bash
node scripts/detect-contract-drift.js
```

### GitHub Actions 集成

```yaml
- name: Detect Contract Drift
  run: node scripts/detect-contract-drift.js
```

## 最佳实践

### 1. 始终使用共享类型

```typescript
// ✅ 正确
import { FatigueLevel } from '@athlete-ally/shared-types';
const level: FatigueLevel = 'moderate';

// ❌ 错误
const level = 'normal'; // 字面量字符串
```

### 2. 运行时验证

```typescript
// ✅ 正确
const result = safeValidateFatigueAssessmentInput(requestBody);
if (!result.success) {
  return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
}

// ❌ 错误
const { sleepQuality } = requestBody; // 没有验证
```

### 3. 类型安全

```typescript
// ✅ 正确
const seasonOptions: SeasonOption[] = [
  { id: 'offseason', title: 'Off-Season', description: '...' }
];

// ❌ 错误
const seasonOptions = [
  { id: 'off-season', title: 'Off-Season', description: '...' } // 错误的 id
];
```

## 故障排除

### 常见错误

1. **类型不匹配**: 确保使用共享类型而不是字面量
2. **验证失败**: 检查输入数据是否符合 Zod 模式
3. **导入错误**: 确保从 `@athlete-ally/shared-types` 导入

### 调试工具

```bash
# 检查类型一致性
npm run type-check

# 运行合约测试
npm test -- contracts

# 检测漂移
node scripts/detect-contract-drift.js
```

## 版本控制

### 向后兼容性

当需要更改类型时：

1. 更新共享类型定义
2. 添加向后兼容的映射
3. 更新文档
4. 运行合约测试
5. 逐步迁移使用方

### 示例: 疲劳级别迁移

```typescript
// 向后兼容映射
const mapLegacyFatigueLevel = (level: string): FatigueLevel => {
  switch (level) {
    case 'normal': return 'moderate';
    case 'off-season': return 'offseason';
    default: return level as FatigueLevel;
  }
};
```

## 总结

通过遵循这些规范，我们可以：

- ✅ 防止合约漂移
- ✅ 确保类型一致性
- ✅ 提供运行时验证
- ✅ 自动化合约测试
- ✅ 快速检测问题

这确保了 API 和前端之间的稳定合约，提高了代码质量和维护性。
