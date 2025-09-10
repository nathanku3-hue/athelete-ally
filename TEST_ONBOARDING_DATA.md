# 测试Onboarding数据指南

## 🎯 当前状态
"Modify Plan"按钮现在正确地跳转到purpose页面，这说明系统检测到没有有效的onboarding数据。

## 🧪 测试Summary页面

如果你想测试summary页面，可以在浏览器控制台中运行以下命令：

### 方法1: 创建完整的测试数据
```javascript
// 在浏览器控制台中运行
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
console.log('Test data created successfully!');
```

### 方法2: 创建最小有效数据
```javascript
// 最小有效数据
const minimalData = {
    userId: 'test_user_123',
    currentStep: 1,
    isCompleted: false,
    purpose: 'general_fitness',
    proficiency: 'beginner',
    availabilityDays: ['Monday'],
    equipment: ['bodyweight']
};

localStorage.setItem('onboardingData', JSON.stringify(minimalData));
console.log('Minimal test data created!');
```

## 🔍 验证数据

创建数据后，验证数据是否有效：

```javascript
// 检查数据
const data = JSON.parse(localStorage.getItem('onboardingData') || '{}');
console.log('Current data:', data);

// 检查有效性
const hasValidData = data.purpose || data.proficiency || data.season || 
                   (data.availabilityDays && data.availabilityDays.length > 0) || 
                   (data.equipment && data.equipment.length > 0);
console.log('Has valid data:', hasValidData);
```

## 🎯 测试流程

1. **创建测试数据**（使用上面的方法1或2）
2. **刷新训练计划页面**
3. **点击"Modify Plan"按钮**
4. **应该跳转到summary页面**，显示测试数据

## 🧹 清除数据

如果需要清除数据重新开始：

```javascript
// 清除onboarding数据
localStorage.removeItem('onboardingData');
console.log('Onboarding data cleared');

// 或者清除所有localStorage
localStorage.clear();
console.log('All localStorage cleared');
```

## 📊 预期行为

### 有有效数据时
- 点击"Modify Plan"按钮
- 控制台显示: "Valid data found, going to summary page"
- 跳转到 `/onboarding/summary`
- 显示完整的summary页面

### 无数据时
- 点击"Modify Plan"按钮
- 控制台显示: "No onboarding data found, starting fresh onboarding"
- 跳转到 `/onboarding/purpose`
- 开始新的onboarding流程

## 🎉 成功标志

如果测试成功，你应该看到：
1. Summary页面显示测试数据
2. 包含所有onboarding步骤的信息
3. 可以编辑各个步骤
4. 有"Create My Training Plan"按钮

---

**按照此指南测试，应该能够看到完整的summary页面！** 🎊

