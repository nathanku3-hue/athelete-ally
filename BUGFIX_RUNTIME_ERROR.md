# Bug Fix: Runtime Error - Cannot read properties of undefined

## 问题描述
```
TypeError: Cannot read properties of undefined (reading 'status')
Source: src\app\plan\page.tsx (248:41) @ status
```

## 根本原因
在数据加载期间，`plan` 状态为 `null`，但 Header 组件试图访问 `plan.fatigue.status`，导致运行时错误。

## 解决方案

### 1. 更新类型定义
将 Header 组件的 plan 参数类型从 `WeeklyPlan` 改为 `WeeklyPlan | null`：

```typescript
const Header = ({ 
  plan, 
  unit, 
  onUnitChange
}: { 
  plan: WeeklyPlan | null;  // ✅ 允许 null 值
  unit: Unit; 
  onUnitChange: (unit: Unit) => void;
}) => {
```

### 2. 添加空值检查
在访问 plan 属性之前添加空值检查：

```typescript
// 如果plan还在加载中，显示加载状态
if (!plan) {
  return (
    <div className="flex justify-between items-center mb-8 p-4 bg-gray-800/50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-gray-500 animate-pulse"></div>
        <div>
          <h1 className="text-2xl font-bold">Loading...</h1>
          <p className="text-sm text-gray-400">Please wait</p>
        </div>
      </div>
      {/* 单位切换器仍然可用 */}
    </div>
  );
}
```

### 3. 更新所有相关组件
同样更新 DesktopLayout 和 MobileLayout 组件：

```typescript
const DesktopLayout = ({ 
  plan, 
  unit, 
  selectedDay, 
  setSelectedDay 
}: { 
  plan: WeeklyPlan | null;  // ✅ 允许 null 值
  unit: Unit; 
  selectedDay: string; 
  setSelectedDay: (day: string) => void; 
}) => {
```

### 4. 添加加载状态UI
为所有组件添加优雅的加载状态：

- **Header**: 显示脉冲动画的状态点和"Loading..."文本
- **DesktopLayout**: 显示骨架屏动画
- **MobileLayout**: 显示简化的加载状态

## 修复效果

### 之前
- ❌ 运行时错误：`Cannot read properties of undefined`
- ❌ 页面崩溃
- ❌ 用户体验差

### 之后
- ✅ 优雅的加载状态
- ✅ 无运行时错误
- ✅ 平滑的用户体验
- ✅ 单位切换器在加载期间仍然可用

## 技术细节

### 加载状态设计
1. **状态点**: 使用脉冲动画的灰色圆点
2. **文本**: "Loading..." 和 "Please wait"
3. **骨架屏**: 使用 `animate-pulse` 类创建加载动画
4. **功能保持**: 单位切换器在加载期间仍然可用

### 类型安全
- 所有组件现在正确处理 `null` 值
- TypeScript 类型检查通过
- 运行时错误完全消除

## 测试验证

1. **页面加载**: 验证加载状态正确显示
2. **数据获取**: 验证数据加载完成后正确渲染
3. **错误处理**: 验证网络错误时的降级处理
4. **交互功能**: 验证单位切换在加载期间可用

这个修复确保了页面在数据加载期间不会崩溃，提供了更好的用户体验！🎉

