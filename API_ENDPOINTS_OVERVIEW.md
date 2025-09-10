# API 端点总览 (API Endpoints Overview)

## 训练计划相关 (Training Plan APIs)

### GET /api/v1/plans/current
**功能**: 获取当前用户的训练计划
**响应**: 
```json
{
  "weekNumber": 1,
  "theme": "Foundation",
  "volume": "Mid",
  "fatigueStatus": "high",
  "trainingDays": [...]
}
```

### GET /api/v1/plans/[planId]
**功能**: 获取特定计划的详细信息
**参数**: planId (路径参数)
**响应**: 完整的计划详情，包括多个微周期

## 用户偏好相关 (User Preferences APIs)

### GET /api/v1/user/preferences
**功能**: 获取用户偏好设置
**响应**:
```json
{
  "unit": "lbs",
  "theme": "dark",
  "notifications": true
}
```

### PATCH /api/v1/user/preferences
**功能**: 更新用户偏好设置
**请求体**:
```json
{
  "unit": "kg"
}
```
**响应**:
```json
{
  "success": true,
  "message": "User preference updated successfully",
  "unit": "kg"
}
```

## 动作详情相关 (Exercise Details APIs)

### GET /api/v1/exercises/[exerciseId]
**功能**: 获取特定动作的详细信息
**参数**: exerciseId (路径参数)
**响应**:
```json
{
  "id": "ex1",
  "name": "Bench Press",
  "description": "A compound upper body exercise...",
  "instructions": ["Step 1", "Step 2", ...],
  "tips": ["Tip 1", "Tip 2", ...],
  "muscles": ["Pectoralis Major", "Anterior Deltoid"],
  "equipment": ["Barbell", "Bench"],
  "difficulty": 4,
  "gifUrl": "https://example.com/gifs/ex1.gif",
  "videoUrl": "https://example.com/videos/ex1.mp4"
}
```

## 疲劳度监控相关 (Fatigue Monitoring APIs)

### GET /api/v1/fatigue/status
**功能**: 获取用户当前疲劳度状态
**响应**:
```json
{
  "level": "high",
  "score": 8.5,
  "factors": [
    {
      "type": "sleep_quality",
      "value": 6.5,
      "impact": "moderate",
      "description": "Poor sleep quality detected"
    }
  ],
  "recommendations": [
    "Consider reducing training intensity by 10-15%",
    "Increase sleep duration by 30-60 minutes"
  ],
  "lastUpdated": "2024-01-01T00:00:00.000Z",
  "nextAssessment": "2024-01-02T00:00:00.000Z"
}
```

### POST /api/v1/fatigue/status
**功能**: 提交疲劳度评估
**请求体**:
```json
{
  "sleepQuality": 6,
  "stressLevel": 7,
  "muscleSoreness": 5,
  "energyLevel": 4,
  "motivation": 6
}
```
**响应**:
```json
{
  "success": true,
  "fatigueScore": 6.2,
  "level": "normal",
  "message": "Fatigue assessment submitted successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 页面路由 (Page Routes)

### /plan
**功能**: 主训练计划页面
**特性**: 
- 平台自适应布局（桌面/移动）
- 实时数据加载
- 单位切换
- 疲劳度警报
- 动作详情弹窗

### /fatigue-assessment
**功能**: 疲劳度评估页面
**特性**:
- 交互式滑块评估
- 实时结果计算
- 个性化建议
- 结果保存

## 数据流架构 (Data Flow Architecture)

```
用户界面 (UI)
    ↓
API 层 (Next.js API Routes)
    ↓
模拟数据层 (Mock Data Layer)
    ↓
[未来] 真实后端服务 (Real Backend Services)
```

## 错误处理 (Error Handling)

所有API端点都包含完整的错误处理：
- HTTP状态码正确返回
- 详细的错误信息
- 前端降级处理
- 用户友好的错误提示

## 性能优化 (Performance Optimizations)

- 模拟API延迟（150-500ms）
- 前端状态缓存
- 懒加载动作详情
- 响应式图片和组件

## 安全考虑 (Security Considerations)

- 输入验证
- 错误信息过滤
- CORS配置
- 类型安全（TypeScript）

## 测试建议 (Testing Recommendations)

1. **API端点测试**: 使用Postman或curl测试所有端点
2. **前端集成测试**: 验证数据流和用户交互
3. **错误场景测试**: 模拟网络错误和无效数据
4. **性能测试**: 验证加载时间和响应速度
5. **跨平台测试**: 确保桌面和移动端体验一致
