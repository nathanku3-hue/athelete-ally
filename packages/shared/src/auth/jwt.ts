import jwt from 'jsonwebtoken';
import { z } from 'zod';

// JWT 配置
const rawJwtSecret = process.env.JWT_SECRET;
if (process.env.NODE_ENV === 'production' && !rawJwtSecret) {
  throw new Error('JWT_SECRET is required in production environment');
}
if (process.env.NODE_ENV !== 'production' && !rawJwtSecret) {
  console.warn('Warning: JWT_SECRET not set; using dev-only default.');
}
export const JWT_SECRET = rawJwtSecret || 'dev-only-jwt-secret';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// JWT Payload Schema
export const JWTPayloadSchema = z.object({
  userId: z.string().uuid().or(z.string().min(1)), // Allow non-UUID in test/dev
  email: z.string().email().optional(),
  role: z.enum(['user', 'admin']).default('user'),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

export type JWTPayload = z.infer<typeof JWTPayloadSchema>;

// JWT 工具类
export class JWTManager {
  /**
   * 生成JWT token
   */
  static generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'athlete-ally',
      audience: 'athlete-ally-users'
    } as jwt.SignOptions);
  }

  /**
   * 验证JWT token
   */
  static verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'athlete-ally',
        audience: 'athlete-ally-users'
      }) as any;
      
      return JWTPayloadSchema.parse(decoded);
    } catch (error) {
      throw new Error(`JWT verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 从Authorization header中提取token
   */
  static extractTokenFromHeader(authHeader: string | undefined): string {
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new Error('Invalid authorization header format. Expected: Bearer <token>');
    }

    return parts[1];
  }

  /**
   * 从请求中获取用户身份
   */
  static getUserFromRequest(request: any): JWTPayload {
    const authHeader = request.headers.authorization || request.headers.Authorization;
    const token = this.extractTokenFromHeader(authHeader);
    return this.verifyToken(token);
  }
}

// 安全上下文类型
export interface SecurityContext {
  user: JWTPayload;
  requestId: string;
  timestamp: number;
}

// 安全上下文管理器
export class SecurityContextManager {
  private static context = new Map<string, SecurityContext>();

  /**
   * 设置安全上下文
   */
  static setContext(requestId: string, user: JWTPayload): void {
    this.context.set(requestId, {
      user,
      requestId,
      timestamp: Date.now()
    });
  }

  /**
   * 获取安全上下文
   */
  static getContext(requestId: string): SecurityContext | undefined {
    return this.context.get(requestId);
  }

  /**
   * 清除安全上下文
   */
  static clearContext(requestId: string): void {
    this.context.delete(requestId);
  }

  /**
   * 验证用户所有权
   */
  static verifyOwnership(requestId: string, resourceUserId: string): boolean {
    const context = this.getContext(requestId);
    if (!context) {
      return false;
    }
    return context.user.userId === resourceUserId;
  }
}
