/**
 * JWT测试工具
 * 用于生成测试环境中的有效JWT token
 */

import { JWTManager } from './jwt';

export class JWTTestUtils {
  /**
   * 生成测试用的JWT token
   * @param userId 用户ID（可以是UUID或普通字符串）
   * @param role 用户角色
   * @param email 用户邮箱
   */
  static generateTestToken(
    userId: string = 'test-user-123',
    role: 'user' | 'admin' = 'user',
    email?: string
  ): string {
    return JWTManager.generateToken({
      userId,
      role,
      email,
    });
  }

  /**
   * 生成UUID格式的测试token
   */
  static generateUUIDTestToken(
    userId: string = '550e8400-e29b-41d4-a716-446655440000',
    role: 'user' | 'admin' = 'user',
    email?: string
  ): string {
    return JWTManager.generateToken({
      userId,
      role,
      email,
    });
  }

  /**
   * 获取测试用的Authorization header
   */
  static getTestAuthHeader(
    userId: string = 'test-user-123',
    role: 'user' | 'admin' = 'user',
    email?: string
  ): string {
    const token = this.generateTestToken(userId, role, email);
    return `Bearer ${token}`;
  }

  /**
   * 获取UUID格式的测试Authorization header
   */
  static getUUIDTestAuthHeader(
    userId: string = '550e8400-e29b-41d4-a716-446655440000',
    role: 'user' | 'admin' = 'user',
    email?: string
  ): string {
    const token = this.generateUUIDTestToken(userId, role, email);
    return `Bearer ${token}`;
  }
}
