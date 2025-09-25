import { randomUUID } from 'crypto';

/**
 * 安全ID生成器
 * 使用crypto.randomUUID()生成不可预测的安全ID
 */
export class SecureIdGenerator {
  /**
   * 生成安全的Job ID
   */
  static generateJobId(): string {
    return `job_${randomUUID()}`;
  }

  /**
   * 生成安全的Plan ID
   */
  static generatePlanId(): string {
    return `plan_${randomUUID()}`;
  }

  /**
   * 生成安全的Session ID
   */
  static generateSessionId(): string {
    return `session_${randomUUID()}`;
  }

  /**
   * 生成安全的Request ID
   */
  static generateRequestId(): string {
    return `req_${randomUUID()}`;
  }

  /**
   * 生成安全的Event ID
   */
  static generateEventId(): string {
    return `event_${randomUUID()}`;
  }

  /**
   * 验证ID格式是否安全
   */
  static isValidSecureId(id: string, prefix: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const expectedPrefix = `${prefix}_`;
    
    if (!id.startsWith(expectedPrefix)) {
      return false;
    }
    
    const uuidPart = id.substring(expectedPrefix.length);
    return uuidRegex.test(uuidPart);
  }

  /**
   * 生成带时间戳的安全ID（用于调试和排序）
   */
  static generateTimestampedId(prefix: string): string {
    const timestamp = Date.now();
    const uuid = randomUUID();
    return `${prefix}_${timestamp}_${uuid}`;
  }
}

/**
 * 安全ID验证器
 */
export class SecureIdValidator {
  /**
   * 验证Job ID
   */
  static isValidJobId(id: string): boolean {
    return SecureIdGenerator.isValidSecureId(id, 'job');
  }

  /**
   * 验证Plan ID
   */
  static isValidPlanId(id: string): boolean {
    return SecureIdGenerator.isValidSecureId(id, 'plan');
  }

  /**
   * 验证Session ID
   */
  static isValidSessionId(id: string): boolean {
    return SecureIdGenerator.isValidSecureId(id, 'session');
  }

  /**
   * 验证Request ID
   */
  static isValidRequestId(id: string): boolean {
    return SecureIdGenerator.isValidSecureId(id, 'req');
  }

  /**
   * 验证Event ID
   */
  static isValidEventId(id: string): boolean {
    return SecureIdGenerator.isValidSecureId(id, 'event');
  }
}
