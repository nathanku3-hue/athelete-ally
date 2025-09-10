# Generating 页面调试模式

## 当前状态
Generating 页面已设置为调试模式，会直接跳转到 plans 页面，跳过状态轮询。

## 调试模式行为
1. **进入页面**: 显示"Debug mode: Generating your training plan..."
2. **延迟2秒**: 模拟生成过程
3. **自动跳转**: 跳转到 `/plans/[planId]` 页面
4. **PlanId生成**: 使用 jobId 或生成随机 planId

## 如何切换回正常模式
要恢复正常的轮询模式，需要：

1. **注释掉调试代码**:
```javascript
// 注释掉这个 useEffect
/*
React.useEffect(() => {
  // ... 调试代码
}, [jobId, clearData, router]);
*/

// 取消注释轮询逻辑
const {
  status: planStatus,
  // ... 其他轮询代码
} = usePlanStatusPolling({...});
```

2. **恢复状态使用**:
```javascript
// 改为使用轮询状态
const currentStatus = planStatus || defaultStatus;
```

## 调试信息
- 控制台会输出: "Debug mode: Direct navigation to plans page"
- 2秒后自动跳转到 plans 页面
- 使用真实的 API 获取计划数据

## 测试流程
1. 完成 onboarding 流程
2. 在 summary 页面点击提交
3. 自动跳转到 generating 页面
4. 等待2秒
5. 自动跳转到 plans 页面查看生成的计划
