import crypto from 'crypto';

export enum DataClassification {
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
  CONFIDENTIAL = 'CONFIDENTIAL',
  PERSONAL = 'PERSONAL',
  SENSITIVE = 'SENSITIVE'
}

export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
}

export interface EncryptedData {
  encrypted: string;
  iv: string;
  classification: DataClassification;
  encryptedAt: Date;
}

/**
 * 数据加密服务
 * 负责敏感数据的加密和解密
 */
export class EncryptionService {
  private readonly config: EncryptionConfig;
  private readonly encryptionKey: string;

  constructor() {
    this.config = {
      algorithm: 'aes-256-gcm',
      keyLength: 32,
      ivLength: 16
    };
    
    // 从环境变量获取加密密钥
    this.encryptionKey = process.env.ENCRYPTION_KEY || this.generateKey();
    
    if (!process.env.ENCRYPTION_KEY) {
      console.warn('ENCRYPTION_KEY not set, using generated key. This is not secure for production!');
    }
  }

  /**
   * 加密敏感数据
   */
  encryptSensitiveData(data: any, classification: DataClassification = DataClassification.PERSONAL): EncryptedData {
    try {
      const jsonData = JSON.stringify(data);
      const iv = crypto.randomBytes(this.config.ivLength);
      const cipher = crypto.createCipher(this.config.algorithm, this.encryptionKey);
      
      let encrypted = cipher.update(jsonData, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      return {
        encrypted: encrypted,
        iv: iv.toString('hex'),
        classification,
        encryptedAt: new Date()
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt sensitive data');
    }
  }

  /**
   * 解密敏感数据
   */
  decryptSensitiveData(encryptedData: EncryptedData): any {
    try {
      const encrypted = encryptedData.encrypted;

      const decipher = crypto.createDecipher(this.config.algorithm, this.encryptionKey);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt sensitive data');
    }
  }

  /**
   * 加密用户ID（用于哈希存储）
   */
  hashUserId(userId: string): string {
    return crypto
      .createHash('sha256')
      .update(userId + this.encryptionKey)
      .digest('hex');
  }

  /**
   * 验证用户ID哈希
   */
  verifyUserIdHash(userId: string, hash: string): boolean {
    const computedHash = this.hashUserId(userId);
    return crypto.timingSafeEqual(
      Buffer.from(computedHash, 'hex'),
      Buffer.from(hash, 'hex')
    );
  }

  /**
   * 加密协议参数
   */
  encryptProtocolParameters(parameters: any): EncryptedData {
    return this.encryptSensitiveData(parameters, DataClassification.PERSONAL);
  }

  /**
   * 解密协议参数
   */
  decryptProtocolParameters(encryptedData: EncryptedData): any {
    return this.decryptSensitiveData(encryptedData);
  }

  /**
   * 加密用户适应数据
   */
  encryptUserAdaptations(adaptations: any): EncryptedData {
    return this.encryptSensitiveData(adaptations, DataClassification.SENSITIVE);
  }

  /**
   * 解密用户适应数据
   */
  decryptUserAdaptations(encryptedData: EncryptedData): any {
    return this.decryptSensitiveData(encryptedData);
  }

  /**
   * 生成随机加密密钥
   */
  private generateKey(): string {
    return crypto.randomBytes(this.config.keyLength).toString('hex');
  }

  /**
   * 检查数据是否需要加密
   */
  requiresEncryption(classification: DataClassification): boolean {
    return [
      DataClassification.CONFIDENTIAL,
      DataClassification.PERSONAL,
      DataClassification.SENSITIVE
    ].includes(classification);
  }

  /**
   * 获取数据分类的加密强度
   */
  getEncryptionStrength(classification: DataClassification): 'low' | 'medium' | 'high' {
    switch (classification) {
      case DataClassification.PUBLIC:
        return 'low';
      case DataClassification.INTERNAL:
        return 'medium';
      case DataClassification.CONFIDENTIAL:
      case DataClassification.PERSONAL:
      case DataClassification.SENSITIVE:
        return 'high';
      default:
        return 'medium';
    }
  }

  /**
   * 生成数据访问令牌
   */
  generateAccessToken(userId: string, protocolId: string, permissions: string[]): string {
    const payload = {
      userId,
      protocolId,
      permissions,
      issuedAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24小时
    };

    const token = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = crypto
      .createHmac('sha256', this.encryptionKey)
      .update(token)
      .digest('hex');

    return `${token}.${signature}`;
  }

  /**
   * 验证数据访问令牌
   */
  verifyAccessToken(token: string): { valid: boolean; payload?: any } {
    try {
      const [encodedPayload, signature] = token.split('.');
      
      if (!encodedPayload || !signature) {
        return { valid: false };
      }

      // 验证签名
      const expectedSignature = crypto
        .createHmac('sha256', this.encryptionKey)
        .update(encodedPayload)
        .digest('hex');

      if (!crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      )) {
        return { valid: false };
      }

      // 解析载荷
      const payload = JSON.parse(Buffer.from(encodedPayload, 'base64').toString('utf8'));
      
      // 检查过期时间
      if (payload.expiresAt && Date.now() > payload.expiresAt) {
        return { valid: false };
      }

      return { valid: true, payload };
    } catch (error) {
      console.error('Token verification failed:', error);
      return { valid: false };
    }
  }
}

export const encryptionService = new EncryptionService();
