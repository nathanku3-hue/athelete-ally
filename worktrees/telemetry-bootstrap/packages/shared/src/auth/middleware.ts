import { FastifyRequest, FastifyReply } from 'fastify';
import { JWTManager, SecurityContextManager } from './jwt.js';

// 身份验证中间件
export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
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
    (request as any).user = user;
    (request as any).requestId = requestId;

  } catch (error) {
    reply.code(401).send({
      error: 'unauthorized',
      message: error instanceof Error ? error.message : 'Authentication failed'
    });
  }
}

// 所有权检查中间件
export function ownershipCheckMiddleware(resourceUserIdExtractor: (request: FastifyRequest) => string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const requestId = (request as any).requestId;
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
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      
      if (!user || !requiredRoles.includes(user.role)) {
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
export async function cleanupMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const requestId = (request as any).requestId;
  if (requestId) {
    SecurityContextManager.clearContext(requestId);
  }
}
