/**
 * @fileoverview 共享包统一导出
 * 提供认证、安全、配置等共享功能
 */

// 配置相关
export * from './config/ports.js';

// 认证相关
export * from './auth/jwt.js';
export * from './auth/test-utils.js';
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

// Metrics
export * from './metrics.js';

// Fastify type augmentation
export * from './fastify-augment.js';
