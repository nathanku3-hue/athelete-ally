/**
 * @fileoverview 共享包统一导出
 * 
 * 提供认证、安全、配置等共享功能
 * 
 * @example
 * ```typescript
 * import { authMiddleware, SecureIdGenerator } from '@athlete-ally/shared';
 * ```
 * 
 * @note 所有相对导入使用 .js 扩展名以支持 ESM 模块解析
 */

// 配置相关
export * from './config/ports.js';

// 认证相关
export * from './auth/jwt.js';
export { 
  authMiddleware, 
  cleanupMiddleware, 
  ownershipCheckMiddleware, 
  roleCheckMiddleware 
} from './auth/middleware.js';

// 安全相关
export * from './security/secure-id.js';

// 错误处理
export * from './error-handler.js';
