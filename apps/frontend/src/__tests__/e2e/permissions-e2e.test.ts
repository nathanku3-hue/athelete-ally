/**
 * 权限系统端到端测试
 * 测试完整的权限管理流程
 */

import { test, expect } from '@playwright/test';

test.describe('权限管理系统 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    // 模拟登录状态
    await page.goto('/dashboard');
    
    // 模拟设置认证token
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'mock-jwt-token');
      localStorage.setItem('user-id', 'user-1');
    });
  });

  test('应该能够查看协议权限管理界面', async ({ page }) => {
    // 导航到协议详情页面
    await page.goto('/protocols/test-protocol-1');
    
    // 点击权限管理按钮
    await page.click('[data-testid="permissions-manager-button"]');
    
    // 验证权限管理界面加载
    await expect(page.locator('text=权限管理')).toBeVisible();
    await expect(page.locator('text=分享协议')).toBeVisible();
    
    // 验证标签页存在
    await expect(page.locator('text=分享设置')).toBeVisible();
    await expect(page.locator('text=权限详情')).toBeVisible();
    await expect(page.locator('text=公开设置')).toBeVisible();
  });

  test('应该能够分享协议给其他用户', async ({ page }) => {
    // 导航到协议详情页面
    await page.goto('/protocols/test-protocol-1');
    
    // 打开权限管理
    await page.click('[data-testid="permissions-manager-button"]');
    
    // 点击分享协议按钮
    await page.click('text=分享协议');
    
    // 验证分享对话框打开
    await expect(page.locator('text=分享协议: 测试协议')).toBeVisible();
    
    // 输入用户邮箱
    await page.fill('[data-testid="user-search-input"]', 'user-2@example.com');
    
    // 选择权限
    await page.check('[data-testid="permission-read"]');
    await page.check('[data-testid="permission-write"]');
    
    // 设置过期时间
    await page.fill('[data-testid="expires-at-input"]', '2024-12-31T23:59');
    
    // 添加消息
    await page.fill('[data-testid="message-input"]', '请查看这个协议');
    
    // 点击分享按钮
    await page.click('text=分享');
    
    // 验证分享成功
    await expect(page.locator('text=分享成功')).toBeVisible();
    
    // 验证分享出现在列表中
    await expect(page.locator('text=user-2@example.com')).toBeVisible();
  });

  test('应该能够管理分享权限', async ({ page }) => {
    // 导航到协议详情页面
    await page.goto('/protocols/test-protocol-1');
    
    // 打开权限管理
    await page.click('[data-testid="permissions-manager-button"]');
    
    // 假设已经有分享记录
    await expect(page.locator('text=user-2@example.com')).toBeVisible();
    
    // 点击权限设置按钮
    await page.click('[data-testid="permission-settings-button"]');
    
    // 修改权限
    await page.uncheck('[data-testid="permission-write"]');
    await page.check('[data-testid="permission-execute"]');
    
    // 保存更改
    await page.click('text=保存');
    
    // 验证权限更新成功
    await expect(page.locator('text=权限更新成功')).toBeVisible();
  });

  test('应该能够撤销分享', async ({ page }) => {
    // 导航到协议详情页面
    await page.goto('/protocols/test-protocol-1');
    
    // 打开权限管理
    await page.click('[data-testid="permissions-manager-button"]');
    
    // 假设已经有分享记录
    await expect(page.locator('text=user-2@example.com')).toBeVisible();
    
    // 点击撤销分享按钮
    await page.click('[data-testid="revoke-share-button"]');
    
    // 确认撤销
    await page.click('text=确认撤销');
    
    // 验证分享被撤销
    await expect(page.locator('text=分享已撤销')).toBeVisible();
    await expect(page.locator('text=user-2@example.com')).not.toBeVisible();
  });

  test('应该能够设置协议公开状态', async ({ page }) => {
    // 导航到协议详情页面
    await page.goto('/protocols/test-protocol-1');
    
    // 打开权限管理
    await page.click('[data-testid="permissions-manager-button"]');
    
    // 切换到公开设置标签页
    await page.click('text=公开设置');
    
    // 开启公开状态
    await page.check('[data-testid="public-toggle"]');
    
    // 验证警告信息显示
    await expect(page.locator('text=此协议已公开，所有用户都可以查看和复制')).toBeVisible();
    
    // 关闭公开状态
    await page.uncheck('[data-testid="public-toggle"]');
    
    // 验证警告信息消失
    await expect(page.locator('text=此协议已公开，所有用户都可以查看和复制')).not.toBeVisible();
  });

  test('应该能够查看权限详情', async ({ page }) => {
    // 导航到协议详情页面
    await page.goto('/protocols/test-protocol-1');
    
    // 打开权限管理
    await page.click('[data-testid="permissions-manager-button"]');
    
    // 切换到权限详情标签页
    await page.click('text=权限详情');
    
    // 验证权限说明显示
    await expect(page.locator('text=您的权限')).toBeVisible();
    await expect(page.locator('text=权限说明')).toBeVisible();
    
    // 验证权限说明内容
    await expect(page.locator('text=查看：可以查看协议内容和详细信息')).toBeVisible();
    await expect(page.locator('text=编辑：可以修改协议内容和设置')).toBeVisible();
    await expect(page.locator('text=执行：可以开始和执行协议训练')).toBeVisible();
    await expect(page.locator('text=分享：可以将协议分享给其他用户')).toBeVisible();
  });

  test('应该能够搜索用户', async ({ page }) => {
    // 导航到协议详情页面
    await page.goto('/protocols/test-protocol-1');
    
    // 打开权限管理
    await page.click('[data-testid="permissions-manager-button"]');
    
    // 点击分享协议按钮
    await page.click('text=分享协议');
    
    // 输入搜索关键词
    await page.fill('[data-testid="user-search-input"]', '张三');
    
    // 等待搜索结果
    await page.waitForSelector('[data-testid="user-search-results"]');
    
    // 验证搜索结果
    await expect(page.locator('text=张三')).toBeVisible();
    await expect(page.locator('text=zhangsan@example.com')).toBeVisible();
    
    // 选择用户
    await page.click('[data-testid="user-search-result-0"]');
    
    // 验证用户被选中
    await expect(page.locator('[data-testid="user-search-input"]')).toHaveValue('zhangsan@example.com');
  });

  test('应该能够处理权限错误', async ({ page }) => {
    // 导航到协议详情页面
    await page.goto('/protocols/test-protocol-1');
    
    // 打开权限管理
    await page.click('[data-testid="permissions-manager-button"]');
    
    // 模拟API错误
    await page.route('**/api/v1/protocols/*/shares', route => {
      route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Insufficient permissions' })
      });
    });
    
    // 点击分享协议按钮
    await page.click('text=分享协议');
    
    // 尝试分享
    await page.fill('[data-testid="user-search-input"]', 'user-2@example.com');
    await page.click('text=分享');
    
    // 验证错误信息显示
    await expect(page.locator('text=分享失败')).toBeVisible();
  });

  test('应该能够处理网络错误', async ({ page }) => {
    // 导航到协议详情页面
    await page.goto('/protocols/test-protocol-1');
    
    // 模拟网络错误
    await page.route('**/api/v1/protocols/*/shares', route => {
      route.abort('Failed');
    });
    
    // 打开权限管理
    await page.click('[data-testid="permissions-manager-button"]');
    
    // 验证错误状态显示
    await expect(page.locator('text=加载权限信息失败')).toBeVisible();
  });

  test('应该能够响应式设计', async ({ page }) => {
    // 设置移动设备视口
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 导航到协议详情页面
    await page.goto('/protocols/test-protocol-1');
    
    // 打开权限管理
    await page.click('[data-testid="permissions-manager-button"]');
    
    // 验证移动端布局
    await expect(page.locator('[data-testid="permissions-manager"]')).toBeVisible();
    
    // 验证标签页在移动端正确显示
    await expect(page.locator('text=分享设置')).toBeVisible();
    await expect(page.locator('text=权限详情')).toBeVisible();
    await expect(page.locator('text=公开设置')).toBeVisible();
    
    // 测试分享对话框在移动端的显示
    await page.click('text=分享协议');
    await expect(page.locator('[data-testid="share-dialog"]')).toBeVisible();
  });

  test('应该能够键盘导航', async ({ page }) => {
    // 导航到协议详情页面
    await page.goto('/protocols/test-protocol-1');
    
    // 打开权限管理
    await page.click('[data-testid="permissions-manager-button"]');
    
    // 使用Tab键导航
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // 使用Enter键激活分享按钮
    await page.keyboard.press('Enter');
    
    // 验证分享对话框打开
    await expect(page.locator('text=分享协议: 测试协议')).toBeVisible();
    
    // 使用Escape键关闭对话框
    await page.keyboard.press('Escape');
    
    // 验证对话框关闭
    await expect(page.locator('text=分享协议: 测试协议')).not.toBeVisible();
  });
});
