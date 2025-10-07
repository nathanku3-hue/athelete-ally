// 敏感信息脱敏工具
export class SensitiveDataMasker {
  private static readonly SENSITIVE_PATTERNS = [
    // 密码相关
    /password["\s]*[:=]["\s]*[^"'\s,}]+/gi,
    /passwd["\s]*[:=]["\s]*[^"'\s,}]+/gi,
    /pwd["\s]*[:=]["\s]*[^"'\s,}]+/gi,
    
    // 令牌相关
    /token["\s]*[:=]["\s]*[^"'\s,}]+/gi,
    /bearer["\s]*[:=]["\s]*[^"'\s,}]+/gi,
    /jwt["\s]*[:=]["\s]*[^"'\s,}]+/gi,
    /api[_-]?key["\s]*[:=]["\s]*[^"'\s,}]+/gi,
    
    // 数据库相关
    /database[_-]?url["\s]*[:=]["\s]*[^"'\s,}]+/gi,
    /db[_-]?url["\s]*[:=]["\s]*[^"'\s,}]+/gi,
    /connection[_-]?string["\s]*[:=]["\s]*[^"'\s,}]+/gi,
    
    // 用户信息
    /user[_-]?id["\s]*[:=]["\s]*[^"'\s,}]+/gi,
    /email["\s]*[:=]["\s]*[^"'\s,}]+/gi,
    /phone["\s]*[:=]["\s]*[^"'\s,}]+/gi,
    
    // 其他敏感信息
    /secret["\s]*[:=]["\s]*[^"'\s,}]+/gi,
    /private[_-]?key["\s]*[:=]["\s]*[^"'\s,}]+/gi,
    /access[_-]?key["\s]*[:=]["\s]*[^"'\s,}]+/gi,
  ];

  private static readonly MASK_CHAR = '*';
  private static readonly MASK_LENGTH = 8;

  /**
   * 脱敏敏感信息
   */
  static maskSensitiveData(data: unknown): unknown {
    if (typeof data === 'string') {
      return this.maskString(data);
    }
    
    if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data)) {
        return data.map(item => this.maskSensitiveData(item));
      }
      
      const masked: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        // 检查key是否包含敏感信息
        if (this.isSensitiveKey(key)) {
          masked[key] = this.maskValue(value);
        } else {
          masked[key] = this.maskSensitiveData(value);
        }
      }
      return masked;
    }
    
    return data;
  }

  /**
   * 脱敏字符串
   */
  private static maskString(str: string): string {
    let masked = str;
    
    for (const pattern of this.SENSITIVE_PATTERNS) {
      masked = masked.replace(pattern, (match) => {
        const parts = match.split(/[:=]/);
        if (parts.length === 2) {
          const key = parts[0].trim();
          const value = parts[1].trim().replace(/["']/g, '');
          return `${key}: "${this.maskValue(value)}"`;
        }
        return match;
      });
    }
    
    return masked;
  }

  /**
   * 检查key是否敏感
   */
  private static isSensitiveKey(key: string): boolean {
    const lowerKey = key.toLowerCase();
    return this.SENSITIVE_PATTERNS.some(pattern => 
      pattern.test(lowerKey)
    );
  }

  /**
   * 脱敏值
   */
  private static maskValue(value: unknown): string {
    if (typeof value === 'string') {
      if (value.length <= 4) {
        return this.MASK_CHAR.repeat(4);
      }
      if (value.length <= this.MASK_LENGTH) {
        return this.MASK_CHAR.repeat(value.length);
      }
      return value.substring(0, 2) + this.MASK_CHAR.repeat(this.MASK_LENGTH - 4) + value.substring(value.length - 2);
    }
    return this.MASK_CHAR.repeat(this.MASK_LENGTH);
  }
}

// 安全的日志记录器
export class SafeLogger {
  private static isProduction = process.env.NODE_ENV === 'production';

  /**
   * 安全记录错误
   */
  static error(message: string, error?: unknown, context?: unknown): void {
    const maskedError = error ? SensitiveDataMasker.maskSensitiveData(error) : undefined;
    const maskedContext = context ? SensitiveDataMasker.maskSensitiveData(context) : undefined;
    
    if (this.isProduction) {
      // Production logging - defer to app/service logger
      this.logToExternalLogger('error', message, {
        error: maskedError ? this.sanitizeError(maskedError) : undefined,
        context: maskedContext ? this.sanitizeContext(maskedContext) : undefined,
        timestamp: new Date().toISOString()
      });
    } else {
      // Development logging - defer to app/service logger
      this.logToExternalLogger('error', message, { error: maskedError, context: maskedContext });
    }
  }

  /**
   * 安全记录警告
   */
  static warn(message: string, context?: unknown): void {
    const maskedContext = context ? SensitiveDataMasker.maskSensitiveData(context) : undefined;
    
    if (this.isProduction) {
      // Production logging - defer to app/service logger
      this.logToExternalLogger('warn', message, {
        context: maskedContext ? this.sanitizeContext(maskedContext) : undefined,
        timestamp: new Date().toISOString()
      });
    } else {
      // Development logging - defer to app/service logger
      this.logToExternalLogger('warn', message, maskedContext);
    }
  }

  /**
   * 安全记录信息
   */
  static info(message: string, context?: unknown): void {
    const maskedContext = context ? SensitiveDataMasker.maskSensitiveData(context) : undefined;
    
    if (this.isProduction) {
      // Production logging - defer to app/service logger
      this.logToExternalLogger('info', message, {
        context: maskedContext ? this.sanitizeContext(maskedContext) : undefined,
        timestamp: new Date().toISOString()
      });
    } else {
      // Development logging - defer to app/service logger
      this.logToExternalLogger('info', message, maskedContext);
    }
  }

  /**
   * 外部日志记录接口 - 由应用/服务实现
   */
  private static logToExternalLogger(_level: string, _message: string, _context?: unknown): void {
    // No-op stub - apps/services should implement actual logging
    // This allows packages to export logging interface without direct console usage
  }

  /**
   * 清理错误信息
   */
  private static sanitizeError(error: unknown): Record<string, unknown> {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: this.isProduction ? undefined : error.stack
      };
    }
    return error as Record<string, unknown>;
  }

  /**
   * 清理上下文信息
   */
  private static sanitizeContext(context: unknown): Record<string, unknown> {
    // 移除可能包含敏感信息的字段
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'url', 'email', 'phone'];
    const sanitized = { ...(context as Record<string, unknown>) };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        delete sanitized[field];
      }
    }

    return sanitized;
  }
}

// 导出便捷方法
export const safeLog = SafeLogger;
export const maskData = SensitiveDataMasker.maskSensitiveData;
