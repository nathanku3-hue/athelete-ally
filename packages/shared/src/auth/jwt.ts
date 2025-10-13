import jwt from 'jsonwebtoken';
import { z } from 'zod';

// JWT 配置
const rawJwtSecret = process.env.JWT_SECRET;
if (process.env.NODE_ENV === 'production' && !rawJwtSecret) {
  throw new Error('JWT_SECRET is required in production environment');
}
if (process.env.NODE_ENV !== 'production' && !rawJwtSecret) {
  // Defer to external logger - apps/services handle actual logging
  // Warning: JWT_SECRET not set; using dev-only default.
}
export const JWT_SECRET = rawJwtSecret || 'dev-only-jwt-secret';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// JWT Payload Schema
export const JWTPayloadSchema = z.object({
  userId: z.string().uuid().or(z.string().min(1)), // Allow non-UUID in test/dev
  email: z.string().email().optional(),
  role: z.enum(['user', 'admin', 'curator']).default('user'),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

export type JWTPayload = z.infer<typeof JWTPayloadSchema>;

// Header值类型定义
type HeaderValue = string | string[] | null | undefined;

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
      }) as JWTPayload;
      
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
   * 安全的header值标准化函数
   */
  private static toHeaderString(value: HeaderValue): string | undefined {
    if (value == null) return undefined;
    if (Array.isArray(value)) {
      const filtered = value.filter((v) => typeof v === 'string' && v.trim().length > 0) as string[];
      if (filtered.length === 0) return undefined;
      // Safety: If multiple distinct values appear, reject to avoid ambiguity
      const uniq = Array.from(new Set(filtered.map((v) => v.trim())));
      if (uniq.length > 1) return undefined;
      return uniq[0];
    }
    const s = value.trim();
    return s.length > 0 ? s : undefined;
  }

  /**
   * 健壮的Bearer token解析函数
   */
  private static extractTokenFromHeaderSafe(raw: string | undefined): string | undefined {
    if (!raw) return undefined;
    const trimmed = raw.trim();
    const m = /^Bearer\s+([^\s]+)$/i.exec(trimmed);
    const token = m?.[1];
    return token && token.length > 0 ? token : undefined;
  }

  /**
   * 从请求中获取用户身份（支持Next/Express两种header格式）
   */
  static getUserFromRequest(request: { headers: unknown }): JWTPayload | undefined {
    const headers = request.headers;
    let rawAuth: HeaderValue;

    // Next/Fetch Headers
    if (headers && typeof headers === 'object' && 'get' in headers && typeof headers.get === 'function') {
      rawAuth = headers.get('authorization');
    } else if (headers && typeof headers === 'object') {
      // Node/Express IncomingHttpHeaders-like
      const headersObj = headers as Record<string, HeaderValue>;
      rawAuth = headersObj.authorization ?? headersObj.Authorization;
    } else {
      rawAuth = undefined;
    }

    const authHeader = this.toHeaderString(rawAuth);
    const token = this.extractTokenFromHeaderSafe(authHeader);
    if (!token) return undefined;

    try {
      return this.verifyToken(token);
    } catch {
      return undefined;
    }
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
