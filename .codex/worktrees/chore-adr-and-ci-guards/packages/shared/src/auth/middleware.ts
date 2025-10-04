import type { FastifyRequest, FastifyReply } from '../fastify-augment.js';
import { JWTManager, SecurityContextManager } from './jwt.js';

// 身份验证中间件
export async function authMiddleware(request: any, reply: any) {
  try {
    // 跳过预检请求和健康检查端点
    if (request.method === 'OPTIONS') return;
    if (request.url === '/health' || 
        request.url === '/api/health' || 
        request.url === '/api/v1/health' ||
        request.url === '/metrics') {
      return;
    }

    // 获取用户身份
    const user = JWTManager.getUserFromRequest(request);
    
    // 设置安全上下文
    const requestId = request.id || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    SecurityContextManager.setContext(requestId, user);
    
    // 将用户信息附加到请求对象
    request.user = user;
    request.requestId = requestId;

  } catch (error) {
    reply.code(401).send({
      error: 'unauthorized',
      message: error instanceof Error ? error.message : 'Authentication failed'
    });
  }
}

// 所有权检查中间件
export function ownershipCheckMiddleware(resourceUserIdExtractor: (request: any) => string) {
  return async (request: any, reply: any) => {
    try {
      const requestId = request.requestId;
      if (!requestId) {
        reply.code(401).send({
          error: 'unauthorized',
          message: 'Request ID not found'
        });
        return;
      }
      const resourceUserId = resourceUserIdExtractor(request);
      
      if (!SecurityContextManager.verifyOwnership(requestId, resourceUserId)) {
        reply.code(403).send({
          error: 'forbidden',
          message: 'Access denied: You can only access your own resources'
        });
        return;
      }
    } catch (error) {
      reply.code(500).send({
        error: 'internal_error',
        message: 'Ownership verification failed'
      });
    }
  };
}

// 角色检查中间件
export function roleCheckMiddleware(requiredRoles: string[]) {
  return async (request: any, reply: any) => {
    try {
      const user = request.user;
      
      if (!user || !('role' in user) || !requiredRoles.includes(user.role as string)) {
        reply.code(403).send({
          error: 'forbidden',
          message: `Access denied: Required roles: ${requiredRoles.join(', ')}`
        });
        return;
      }
    } catch (error) {
      reply.code(500).send({
        error: 'internal_error',
        message: 'Role verification failed'
      });
    }
  };
}

// 清理中间件 - 在请求结束时清理安全上下文
export async function cleanupMiddleware(request: any, reply: any) {
  const requestId = request.requestId;
  if (requestId) {
    SecurityContextManager.clearContext(requestId);
  }
}
