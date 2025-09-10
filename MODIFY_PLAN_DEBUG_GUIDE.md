# Modify Plan 按钮调试指南

## 🎯 问题描述
"Modify Plan"按钮跳转到onboarding summary页面，但显示的是欢迎页面（landing page），而不是实际的summary页面。

## 🔍 调试步骤

### 1. 检查浏览器控制台
打开浏览器开发者工具，查看控制台输出：

```javascript
// 点击"Modify Plan"按钮后，应该看到以下日志：
Modify Plan clicked - onboarding data: [数据或null]
Parsed onboarding data: [解析后的数据]
Has valid onboarding data: [true/false]
```

### 2. 检查localStorage数据
在浏览器控制台中运行：

```javascript
// 检查onboarding数据
console.log('Onboarding data:', localStorage.getItem('onboardingData'));

// 检查解析后的数据
const data = JSON.parse(localStorage.getItem('onboardingData') || '{}');
console.log('Parsed data:', data);
console.log('Has purpose:', !!data.purpose);
console.log('Has proficiency:', !!data.proficiency);
console.log('Has equipment:', data.equipment?.length > 0);
```

### 3. 检查summary页面数据
在summary页面加载时，控制台应该显示：

```javascript
Summary page - onboarding data: [数据对象]
Summary page - hasAnyData: [true/false]
Summary page - data breakdown: {
  purpose: [值或undefined],
  proficiency: [值或undefined],
  season: [值或undefined],
  availabilityDays: [数组或undefined],
  equipment: [数组或undefined]
}
```

## 🛠️ 修复方案

### 方案1: 使用测试数据（已实现）
如果没有onboarding数据，系统会自动创建测试数据：

```javascript
const testData = {
    userId: 'test_user_123',
    currentStep: 5,
    isCompleted: false,
    purpose: 'strength_training',
    purposeDetails: 'Building muscle and strength',
    proficiency: 'intermediate',
    season: 'offseason',
    competitionDate: null,
    availabilityDays: ['Monday', 'Wednesday', 'Friday'],
    weeklyGoalDays: 3,
    equipment: ['barbell', 'dumbbells', 'bench'],
    fixedSchedules: []
};
```

### 方案2: 手动创建测试数据
在浏览器控制台中运行：

```javascript
// 创建测试数据
const testData = {
    userId: 'test_user_123',
    currentStep: 5,
    isCompleted: false,
    purpose: 'strength_training',
    purposeDetails: 'Building muscle and strength',
    proficiency: 'intermediate',
    season: 'offseason',
    competitionDate: null,
    availabilityDays: ['Monday', 'Wednesday', 'Friday'],
    weeklyGoalDays: 3,
    equipment: ['barbell', 'dumbbells', 'bench'],
    fixedSchedules: []
};

localStorage.setItem('onboardingData', JSON.stringify(testData));
console.log('Test data created successfully');
```

### 方案3: 清除数据重新开始
如果数据损坏，清除并重新开始：

```javascript
// 清除onboarding数据
localStorage.removeItem('onboardingData');
console.log('Onboarding data cleared');
```

## 🎯 预期行为

### 有有效数据时
- 点击"Modify Plan"按钮
- 跳转到 `/onboarding/summary`
- 显示完整的summary页面，包含所有onboarding数据

### 无数据时
- 点击"Modify Plan"按钮
- 自动创建测试数据
- 跳转到 `/onboarding/summary`
- 显示完整的summary页面

### 数据损坏时
- 点击"Modify Plan"按钮
- 清除损坏的数据
- 跳转到 `/onboarding/purpose`
- 开始新的onboarding流程

## 🔧 调试工具

### 控制台命令
```javascript
// 检查当前状态
console.log('Current onboarding data:', localStorage.getItem('onboardingData'));

// 强制创建测试数据
localStorage.setItem('onboardingData', JSON.stringify({
    userId: 'test_user_123',
    currentStep: 5,
    isCompleted: false,
    purpose: 'strength_training',
    proficiency: 'intermediate',
    availabilityDays: ['Monday', 'Wednesday', 'Friday'],
    equipment: ['barbell', 'dumbbells', 'bench']
}));

// 清除所有数据
localStorage.clear();
```

### 网络面板
检查是否有API调用失败：
- 查看Network面板
- 检查是否有失败的请求
- 查看响应状态码

## 🎉 测试步骤

1. **清除现有数据**：
   ```javascript
   localStorage.clear();
   ```

2. **刷新页面**：
   刷新训练计划页面

3. **点击"Modify Plan"按钮**：
   查看控制台输出

4. **验证结果**：
   - 应该跳转到summary页面
   - 应该显示测试数据
   - 不应该显示欢迎页面

## 🚨 常见问题

### 问题1: 仍然显示欢迎页面
**原因**: 数据检查逻辑有问题
**解决**: 检查控制台输出，确认数据格式正确

### 问题2: 数据创建失败
**原因**: localStorage被禁用或空间不足
**解决**: 检查浏览器设置，清除其他数据

### 问题3: 页面不跳转
**原因**: 路由问题
**解决**: 检查Next.js路由配置

---

**按照此调试指南，应该能够解决Modify Plan按钮的问题！** 🎊

