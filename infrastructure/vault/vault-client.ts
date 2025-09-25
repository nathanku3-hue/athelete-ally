import axios from 'axios';
import { z } from 'zod';

// Vault 配置模式
const VaultConfigSchema = z.object({
  url: z.string().url().default('http://localhost:8200'),
  token: z.string(),
  timeout: z.number().default(10000),
  retries: z.number().default(3),
});

export type VaultConfig = z.infer<typeof VaultConfigSchema>;

// 密钥类型定义
export interface SecretData {
  [key: string]: string | number | boolean;
}

export interface SecretMetadata {
  created_time: string;
  deletion_time?: string;
  destroyed: boolean;
  version: number;
}

export interface SecretResponse {
  data: SecretData;
  metadata: SecretMetadata;
}

// Vault 客户端类
export class VaultClient {
  private config: VaultConfig;
  private baseURL: string;

  constructor(config: Partial<VaultConfig> = {}) {
    this.config = VaultConfigSchema.parse({
      url: process.env.VAULT_URL || 'http://localhost:8200',
      token: process.env.VAULT_TOKEN || 'athlete-ally-root-token',
      ...config,
    });

    this.baseURL = this.config.url;
  }

  // 设置请求头
  private getHeaders() {
    return {
      'X-Vault-Token': this.config.token,
      'Content-Type': 'application/json',
    };
  }

  // 健康检查
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/v1/sys/health`, {
        timeout: this.config.timeout,
      });
      return response.status === 200;
    } catch (error) {
      console.error('Vault 健康检查失败:', error);
      return false;
    }
  }

  // 初始化 Vault
  async initialize(): Promise<void> {
    try {
      // 检查是否已初始化
      const health = await this.healthCheck();
      if (health) {
        console.log('✅ Vault 已初始化');
        return;
      }

      // 初始化 Vault
      const response = await axios.put(`${this.baseURL}/v1/sys/init`, {
        secret_shares: 5,
        secret_threshold: 3,
      });

      console.log('🔐 Vault 初始化完成');
      console.log('Root Token:', response.data.root_token);
      console.log('Unseal Keys:', response.data.keys);
    } catch (error) {
      console.error('Vault 初始化失败:', error);
      throw error;
    }
  }

  // 解封 Vault
  async unseal(keys: string[]): Promise<void> {
    try {
      for (const key of keys) {
        const response = await axios.put(`${this.baseURL}/v1/sys/unseal`, {
          key,
        });

        if (response.data.sealed === false) {
          console.log('✅ Vault 解封成功');
          return;
        }
      }
    } catch (error) {
      console.error('Vault 解封失败:', error);
      throw error;
    }
  }

  // 启用密钥引擎
  async enableSecretEngine(path: string, type: string = 'kv-v2'): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/v1/sys/mounts/${path}`, {
        type,
        description: `KV v2 secrets engine for ${path}`,
      });
      console.log(`✅ 密钥引擎 ${path} 已启用`);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(`ℹ️ 密钥引擎 ${path} 已存在`);
      } else {
        console.error(`密钥引擎 ${path} 启用失败:`, error);
        throw error;
      }
    }
  }

  // 写入密钥
  async writeSecret(path: string, data: SecretData): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/v1/${path}`, {
        data,
      });
      console.log(`✅ 密钥已写入: ${path}`);
    } catch (error) {
      console.error(`密钥写入失败 ${path}:`, error);
      throw error;
    }
  }

  // 读取密钥
  async readSecret(path: string): Promise<SecretData | null> {
    try {
      const response = await axios.get(`${this.baseURL}/v1/${path}`, {
        headers: this.getHeaders(),
      });
      return response.data.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error(`密钥读取失败 ${path}:`, error);
      throw error;
    }
  }

  // 更新密钥
  async updateSecret(path: string, data: SecretData): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/v1/${path}`, {
        data,
      });
      console.log(`✅ 密钥已更新: ${path}`);
    } catch (error) {
      console.error(`密钥更新失败 ${path}:`, error);
      throw error;
    }
  }

  // 删除密钥
  async deleteSecret(path: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/v1/${path}`, {
        headers: this.getHeaders(),
      });
      console.log(`✅ 密钥已删除: ${path}`);
    } catch (error) {
      console.error(`密钥删除失败 ${path}:`, error);
      throw error;
    }
  }

  // 列出密钥
  async listSecrets(path: string): Promise<string[]> {
    try {
      const response = await axios.request({
        method: 'LIST',
        url: `${this.baseURL}/v1/${path}`,
        headers: this.getHeaders(),
      });
      return response.data.data.keys || [];
    } catch (error) {
      if (error.response?.status === 404) {
        return [];
      }
      console.error(`密钥列表获取失败 ${path}:`, error);
      throw error;
    }
  }

  // 生成随机密钥
  async generateRandomKey(length: number = 32): Promise<string> {
    try {
      const response = await axios.post(`${this.baseURL}/v1/sys/tools/random`, {
        format: 'hex',
        bytes: length,
      });
      return response.data.data.random;
    } catch (error) {
      console.error('随机密钥生成失败:', error);
      throw error;
    }
  }

  // 生成密码
  async generatePassword(length: number = 16): Promise<string> {
    try {
      const response = await axios.post(`${this.baseURL}/v1/sys/tools/random`, {
        format: 'base64',
        bytes: length,
      });
      return response.data.data.random;
    } catch (error) {
      console.error('密码生成失败:', error);
      throw error;
    }
  }

  // 创建策略
  async createPolicy(name: string, policy: string): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/v1/sys/policies/acl/${name}`, {
        policy,
      });
      console.log(`✅ 策略已创建: ${name}`);
    } catch (error) {
      console.error(`策略创建失败 ${name}:`, error);
      throw error;
    }
  }

  // 创建令牌
  async createToken(policies: string[], ttl: string = '24h'): Promise<string> {
    try {
      const response = await axios.post(`${this.baseURL}/v1/auth/token/create`, {
        policies,
        ttl,
      });
      return response.data.auth.client_token;
    } catch (error) {
      console.error('令牌创建失败:', error);
      throw error;
    }
  }

  // 撤销令牌
  async revokeToken(token: string): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/v1/auth/token/revoke`, {
        token,
      });
      console.log('✅ 令牌已撤销');
    } catch (error) {
      console.error('令牌撤销失败:', error);
      throw error;
    }
  }
}

// 密钥路径生成器
export class SecretPathGenerator {
  static databaseCredentials(service: string): string {
    return `athlete-ally/database/${service}`;
  }

  static apiKeys(service: string): string {
    return `athlete-ally/api-keys/${service}`;
  }

  static jwtSecrets(): string {
    return 'athlete-ally/jwt/secrets';
  }

  static encryptionKeys(): string {
    return 'athlete-ally/encryption/keys';
  }

  static redisCredentials(): string {
    return 'athlete-ally/redis/credentials';
  }

  static natsCredentials(): string {
    return 'athlete-ally/nats/credentials';
  }

  static monitoringCredentials(): string {
    return 'athlete-ally/monitoring/credentials';
  }
}

// 默认策略
export const DEFAULT_POLICIES = {
  'athlete-ally-read': `
    path "athlete-ally/*" {
      capabilities = ["read"]
    }
  `,
  'athlete-ally-write': `
    path "athlete-ally/*" {
      capabilities = ["create", "read", "update", "delete"]
    }
  `,
  'athlete-ally-admin': `
    path "athlete-ally/*" {
      capabilities = ["create", "read", "update", "delete", "list"]
    }
    path "sys/*" {
      capabilities = ["read"]
    }
  `,
};

// 单例实例
let vaultClient: VaultClient | null = null;

export function getVaultClient(config?: Partial<VaultConfig>): VaultClient {
  if (!vaultClient) {
    vaultClient = new VaultClient(config);
  }
  return vaultClient;
}

export default VaultClient;
