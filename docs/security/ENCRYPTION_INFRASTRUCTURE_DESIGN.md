# 加密基础设施设计

## 🎯 目标
设计并实现企业级密钥管理服务(KMS)和加密基础设施，确保敏感数据的安全存储和传输。

## 📋 架构概览

### 核心组件
1. **密钥管理服务 (KMS)**: 集中式密钥生命周期管理
2. **数据加密服务**: 应用层数据加密/解密
3. **传输加密**: TLS/SSL 端到端加密
4. **存储加密**: 数据库和文件系统加密
5. **密钥轮换**: 自动化密钥轮换机制

---

## 🔐 1. 密钥管理服务 (KMS) 设计

### 1.1 KMS 选型分析

#### 推荐方案：AWS KMS + HashiCorp Vault 混合架构

```yaml
# KMS 架构配置
kms_architecture:
  primary: "aws_kms"
  secondary: "hashicorp_vault"
  
  aws_kms:
    region: "us-west-2"
    key_spec: "SYMMETRIC_DEFAULT"
    key_usage: "ENCRYPT_DECRYPT"
    key_rotation: true
    rotation_period: "365d"
    
  hashicorp_vault:
    version: "1.15.0"
    storage_backend: "consul"
    ha_enabled: true
    auto_unseal: "aws_kms"
    audit_logging: true
```

### 1.2 密钥分类和用途

```typescript
// 密钥分类定义
interface KeyClassification {
  // 数据加密密钥 (DEK)
  dataEncryptionKeys: {
    personalData: string;      // 个人敏感数据
    healthData: string;        // 健康相关数据
    financialData: string;     // 财务数据
    auditData: string;         // 审计日志数据
  };
  
  // 密钥加密密钥 (KEK)
  keyEncryptionKeys: {
    masterKey: string;         // 主密钥
    rotationKey: string;       // 轮换密钥
    backupKey: string;         // 备份密钥
  };
  
  // 传输加密密钥
  transportKeys: {
    apiCommunication: string;  // API 通信
    databaseConnection: string; // 数据库连接
    interServiceCommunication: string; // 服务间通信
  };
}
```

---

## 🏗️ 2. 基础设施即代码 (Terraform)

### 2.1 AWS KMS 配置

```hcl
# terraform/kms/main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# KMS 主密钥
resource "aws_kms_key" "master_key" {
  description             = "Athlete Ally Master Encryption Key"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  
  tags = {
    Name        = "athlete-ally-master-key"
    Environment = var.environment
    Service     = "protocol-engine"
  }
}

# KMS 别名
resource "aws_kms_alias" "master_key_alias" {
  name          = "alias/athlete-ally-master"
  target_key_id = aws_kms_key.master_key.key_id
}

# 数据加密密钥
resource "aws_kms_key" "data_encryption_keys" {
  for_each = {
    personal_data = "Personal Data Encryption"
    health_data   = "Health Data Encryption"
    audit_data    = "Audit Data Encryption"
  }
  
  description             = each.value
  deletion_window_in_days = 30
  enable_key_rotation     = true
  
  tags = {
    Name        = "athlete-ally-${each.key}-key"
    Environment = var.environment
    DataType    = each.key
  }
}

# KMS 策略
resource "aws_kms_key_policy" "master_key_policy" {
  key_id = aws_kms_key.master_key.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "Allow Protocol Engine Service"
        Effect = "Allow"
        Principal = {
          AWS = aws_iam_role.protocol_engine_role.arn
        }
        Action = [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:DescribeKey"
        ]
        Resource = "*"
      }
    ]
  })
}
```

### 2.2 HashiCorp Vault 配置

```hcl
# terraform/vault/main.tf
resource "aws_instance" "vault_cluster" {
  count         = 3
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.medium"
  
  vpc_security_group_ids = [aws_security_group.vault.id]
  subnet_id              = aws_subnet.private[count.index].id
  
  user_data = templatefile("${path.module}/vault-init.sh", {
    vault_version = "1.15.0"
    kms_key_id    = aws_kms_key.master_key.key_id
    cluster_name  = "athlete-ally-vault"
  })
  
  tags = {
    Name = "vault-${count.index + 1}"
    Role = "vault"
  }
}

# Vault 安全组
resource "aws_security_group" "vault" {
  name_prefix = "vault-"
  vpc_id      = var.vpc_id
  
  ingress {
    from_port   = 8200
    to_port     = 8200
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  
  ingress {
    from_port   = 8201
    to_port     = 8201
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

### 2.3 Vault 初始化脚本

```bash
#!/bin/bash
# vault-init.sh

# 安装 Vault
wget https://releases.hashicorp.com/vault/${vault_version}/vault_${vault_version}_linux_amd64.zip
unzip vault_${vault_version}_linux_amd64.zip
mv vault /usr/local/bin/
chmod +x /usr/local/bin/vault

# 创建 Vault 配置
mkdir -p /etc/vault.d
cat > /etc/vault.d/vault.hcl << EOF
storage "consul" {
  address = "127.0.0.1:8500"
  path    = "vault/"
}

listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_disable = false
  tls_cert_file = "/etc/vault.d/tls/vault.crt"
  tls_key_file  = "/etc/vault.d/tls/vault.key"
}

seal "awskms" {
  region     = "us-west-2"
  kms_key_id = "${kms_key_id}"
}

cluster_addr = "https://$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4):8201"
api_addr     = "https://$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4):8200"

ui = true
EOF

# 启动 Vault 服务
systemctl enable vault
systemctl start vault
```

---

## 🔧 3. 数据加密服务实现

### 3.1 加密服务接口

```typescript
// services/encryption/src/EncryptionService.ts
export interface EncryptionService {
  // 数据加密
  encryptData(data: any, keyId: string): Promise<EncryptedData>;
  
  // 数据解密
  decryptData(encryptedData: EncryptedData): Promise<any>;
  
  // 批量加密
  encryptBatch(dataArray: any[], keyId: string): Promise<EncryptedData[]>;
  
  // 密钥轮换
  rotateKey(keyId: string): Promise<string>;
  
  // 密钥状态检查
  getKeyStatus(keyId: string): Promise<KeyStatus>;
}

export interface EncryptedData {
  ciphertext: string;
  keyId: string;
  algorithm: string;
  iv: string;
  tag?: string;
  metadata?: Record<string, any>;
}

export interface KeyStatus {
  keyId: string;
  status: 'ACTIVE' | 'PENDING_DELETION' | 'DISABLED';
  creationDate: Date;
  lastRotationDate?: Date;
  nextRotationDate?: Date;
}
```

### 3.2 AWS KMS 实现

```typescript
// services/encryption/src/providers/AWSKMSProvider.ts
import { KMSClient, EncryptCommand, DecryptCommand, GenerateDataKeyCommand } from '@aws-sdk/client-kms';
import { EncryptionService, EncryptedData, KeyStatus } from '../EncryptionService';

export class AWSKMSProvider implements EncryptionService {
  private kmsClient: KMSClient;
  
  constructor(region: string = 'us-west-2') {
    this.kmsClient = new KMSClient({ region });
  }
  
  async encryptData(data: any, keyId: string): Promise<EncryptedData> {
    try {
      // 生成数据密钥
      const dataKeyCommand = new GenerateDataKeyCommand({
        KeyId: keyId,
        KeySpec: 'AES_256'
      });
      
      const dataKeyResponse = await this.kmsClient.send(dataKeyCommand);
      
      // 使用数据密钥加密数据
      const plaintext = JSON.stringify(data);
      const encrypted = await this.encryptWithDataKey(
        plaintext, 
        dataKeyResponse.Plaintext!,
        dataKeyResponse.CiphertextBlob!
      );
      
      return {
        ciphertext: encrypted.ciphertext,
        keyId: keyId,
        algorithm: 'AES-256-GCM',
        iv: encrypted.iv,
        tag: encrypted.tag,
        metadata: {
          encryptedDataKey: dataKeyResponse.CiphertextBlob!.toString('base64'),
          keySpec: 'AES_256'
        }
      };
    } catch (error) {
      throw new EncryptionError(`Failed to encrypt data: ${error.message}`);
    }
  }
  
  async decryptData(encryptedData: EncryptedData): Promise<any> {
    try {
      // 解密数据密钥
      const decryptCommand = new DecryptCommand({
        CiphertextBlob: Buffer.from(encryptedData.metadata!.encryptedDataKey, 'base64')
      });
      
      const decryptResponse = await this.kmsClient.send(decryptCommand);
      
      // 使用数据密钥解密数据
      const decrypted = await this.decryptWithDataKey(
        encryptedData.ciphertext,
        decryptResponse.Plaintext!,
        encryptedData.iv,
        encryptedData.tag
      );
      
      return JSON.parse(decrypted);
    } catch (error) {
      throw new EncryptionError(`Failed to decrypt data: ${error.message}`);
    }
  }
  
  private async encryptWithDataKey(
    plaintext: string, 
    dataKey: Uint8Array, 
    encryptedDataKey: Uint8Array
  ): Promise<{ ciphertext: string; iv: string; tag: string }> {
    const crypto = await import('crypto');
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipher('aes-256-gcm', dataKey);
    cipher.setAAD(encryptedDataKey);
    
    let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
    ciphertext += cipher.final('base64');
    
    const tag = cipher.getAuthTag();
    
    return {
      ciphertext,
      iv: iv.toString('base64'),
      tag: tag.toString('base64')
    };
  }
  
  private async decryptWithDataKey(
    ciphertext: string,
    dataKey: Uint8Array,
    iv: string,
    tag: string
  ): Promise<string> {
    const crypto = await import('crypto');
    const decipher = crypto.createDecipher('aes-256-gcm', dataKey);
    decipher.setAuthTag(Buffer.from(tag, 'base64'));
    
    let plaintext = decipher.update(ciphertext, 'base64', 'utf8');
    plaintext += decipher.final('utf8');
    
    return plaintext;
  }
  
  async rotateKey(keyId: string): Promise<string> {
    // AWS KMS 自动处理密钥轮换
    // 这里可以触发轮换或检查轮换状态
    return keyId;
  }
  
  async getKeyStatus(keyId: string): Promise<KeyStatus> {
    // 实现密钥状态检查逻辑
    return {
      keyId,
      status: 'ACTIVE',
      creationDate: new Date(),
      lastRotationDate: new Date(),
      nextRotationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1年后
    };
  }
}
```

### 3.3 数据库字段加密

```typescript
// services/encryption/src/DatabaseEncryption.ts
export class DatabaseEncryption {
  private encryptionService: EncryptionService;
  
  constructor(encryptionService: EncryptionService) {
    this.encryptionService = encryptionService;
  }
  
  // 加密敏感字段
  async encryptSensitiveFields<T extends Record<string, any>>(
    data: T,
    sensitiveFields: (keyof T)[]
  ): Promise<T> {
    const encryptedData = { ...data };
    
    for (const field of sensitiveFields) {
      if (data[field] !== null && data[field] !== undefined) {
        const keyId = this.getKeyIdForField(field as string);
        encryptedData[field] = await this.encryptionService.encryptData(
          data[field], 
          keyId
        );
      }
    }
    
    return encryptedData;
  }
  
  // 解密敏感字段
  async decryptSensitiveFields<T extends Record<string, any>>(
    data: T,
    sensitiveFields: (keyof T)[]
  ): Promise<T> {
    const decryptedData = { ...data };
    
    for (const field of sensitiveFields) {
      if (data[field] !== null && data[field] !== undefined) {
        decryptedData[field] = await this.encryptionService.decryptData(
          data[field] as EncryptedData
        );
      }
    }
    
    return decryptedData;
  }
  
  private getKeyIdForField(fieldName: string): string {
    const keyMapping: Record<string, string> = {
      'parameters': 'personal_data',
      'adaptations': 'personal_data',
      'details': 'audit_data',
      'metrics': 'health_data'
    };
    
    return keyMapping[fieldName] || 'personal_data';
  }
}
```

---

## 🔄 4. 密钥轮换机制

### 4.1 自动轮换策略

```typescript
// services/encryption/src/KeyRotationService.ts
export class KeyRotationService {
  private encryptionService: EncryptionService;
  private rotationSchedule: Map<string, RotationConfig> = new Map();
  
  constructor(encryptionService: EncryptionService) {
    this.encryptionService = encryptionService;
    this.initializeRotationSchedule();
  }
  
  private initializeRotationSchedule() {
    // 配置密钥轮换计划
    this.rotationSchedule.set('personal_data', {
      keyId: 'personal_data',
      rotationInterval: 90 * 24 * 60 * 60 * 1000, // 90天
      gracePeriod: 7 * 24 * 60 * 60 * 1000, // 7天宽限期
      autoRotate: true
    });
    
    this.rotationSchedule.set('health_data', {
      keyId: 'health_data',
      rotationInterval: 180 * 24 * 60 * 60 * 1000, // 180天
      gracePeriod: 14 * 24 * 60 * 60 * 1000, // 14天宽限期
      autoRotate: true
    });
  }
  
  async startRotationProcess(): Promise<void> {
    for (const [keyName, config] of this.rotationSchedule) {
      if (config.autoRotate) {
        await this.scheduleKeyRotation(keyName, config);
      }
    }
  }
  
  private async scheduleKeyRotation(
    keyName: string, 
    config: RotationConfig
  ): Promise<void> {
    setInterval(async () => {
      try {
        await this.rotateKey(keyName, config);
      } catch (error) {
        console.error(`Key rotation failed for ${keyName}:`, error);
      }
    }, config.rotationInterval);
  }
  
  private async rotateKey(
    keyName: string, 
    config: RotationConfig
  ): Promise<void> {
    console.log(`Starting key rotation for ${keyName}`);
    
    // 1. 创建新密钥
    const newKeyId = await this.encryptionService.rotateKey(config.keyId);
    
    // 2. 重新加密所有使用旧密钥的数据
    await this.reEncryptDataWithNewKey(config.keyId, newKeyId);
    
    // 3. 更新密钥引用
    await this.updateKeyReferences(config.keyId, newKeyId);
    
    // 4. 禁用旧密钥（在宽限期后）
    setTimeout(async () => {
      await this.disableOldKey(config.keyId);
    }, config.gracePeriod);
    
    console.log(`Key rotation completed for ${keyName}`);
  }
  
  private async reEncryptDataWithNewKey(
    oldKeyId: string, 
    newKeyId: string
  ): Promise<void> {
    // 实现数据重新加密逻辑
    // 这里需要与数据库服务集成
  }
  
  private async updateKeyReferences(
    oldKeyId: string, 
    newKeyId: string
  ): Promise<void> {
    // 更新密钥引用
  }
  
  private async disableOldKey(keyId: string): Promise<void> {
    // 禁用旧密钥
  }
}

interface RotationConfig {
  keyId: string;
  rotationInterval: number;
  gracePeriod: number;
  autoRotate: boolean;
}
```

---

## 📊 5. 审计日志管道设计

### 5.1 审计日志架构

```yaml
# 审计日志管道配置
audit_pipeline:
  collection:
    source: "postgresql_audit_logs"
    format: "json"
    batch_size: 1000
    flush_interval: "30s"
  
  processing:
    service: "audit-processor"
    functions:
      - data_validation
      - data_enrichment
      - data_classification
      - anomaly_detection
  
  storage:
    primary: "elasticsearch"
    secondary: "s3_glacier"
    retention:
      hot: "30d"
      warm: "90d"
      cold: "1y"
      frozen: "7y"
  
  monitoring:
    metrics: "prometheus"
    alerts: "alertmanager"
    dashboards: "grafana"
```

### 5.2 审计日志处理器

```typescript
// services/audit-processor/src/AuditLogProcessor.ts
export class AuditLogProcessor {
  private elasticsearchClient: Client;
  private s3Client: S3Client;
  
  constructor() {
    this.elasticsearchClient = new Client({
      node: process.env.ELASTICSEARCH_URL
    });
    
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION
    });
  }
  
  async processAuditLogs(logs: AuditLog[]): Promise<void> {
    // 1. 数据验证和清理
    const validatedLogs = await this.validateLogs(logs);
    
    // 2. 数据丰富化
    const enrichedLogs = await this.enrichLogs(validatedLogs);
    
    // 3. 数据分类
    const classifiedLogs = await this.classifyLogs(enrichedLogs);
    
    // 4. 异常检测
    const anomalyLogs = await this.detectAnomalies(classifiedLogs);
    
    // 5. 存储到 Elasticsearch
    await this.storeToElasticsearch(classifiedLogs);
    
    // 6. 存储到 S3 (长期归档)
    await this.archiveToS3(classifiedLogs);
    
    // 7. 发送告警
    if (anomalyLogs.length > 0) {
      await this.sendAlerts(anomalyLogs);
    }
  }
  
  private async validateLogs(logs: AuditLog[]): Promise<AuditLog[]> {
    return logs.filter(log => {
      return log.userId && 
             log.action && 
             log.resourceType && 
             log.createdAt;
    });
  }
  
  private async enrichLogs(logs: AuditLog[]): Promise<AuditLog[]> {
    return logs.map(log => ({
      ...log,
      // 添加地理位置信息
      geoLocation: await this.getGeoLocation(log.ip),
      // 添加用户代理解析
      userAgentInfo: this.parseUserAgent(log.userAgent),
      // 添加风险评分
      riskScore: this.calculateRiskScore(log)
    }));
  }
  
  private async classifyLogs(logs: AuditLog[]): Promise<AuditLog[]> {
    return logs.map(log => ({
      ...log,
      // 数据分类
      dataClassification: this.classifyData(log),
      // 合规标签
      complianceTags: this.getComplianceTags(log)
    }));
  }
  
  private async detectAnomalies(logs: AuditLog[]): Promise<AuditLog[]> {
    // 实现异常检测逻辑
    return logs.filter(log => this.isAnomalous(log));
  }
  
  private async storeToElasticsearch(logs: AuditLog[]): Promise<void> {
    const index = `audit-logs-${new Date().toISOString().split('T')[0]}`;
    
    const body = logs.flatMap(log => [
      { index: { _index: index } },
      log
    ]);
    
    await this.elasticsearchClient.bulk({ body });
  }
  
  private async archiveToS3(logs: AuditLog[]): Promise<void> {
    const key = `audit-logs/${new Date().toISOString().split('T')[0]}/logs.json`;
    
    await this.s3Client.send(new PutObjectCommand({
      Bucket: process.env.AUDIT_S3_BUCKET,
      Key: key,
      Body: JSON.stringify(logs),
      StorageClass: 'GLACIER'
    }));
  }
}
```

---

## 🚀 6. 部署和监控

### 6.1 Docker 配置

```dockerfile
# services/encryption/Dockerfile
FROM node:18-alpine

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制源代码
COPY . .

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S encryption -u 1001

# 设置权限
RUN chown -R encryption:nodejs /app
USER encryption

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

### 6.2 Kubernetes 配置

```yaml
# k8s/encryption-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: encryption-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: encryption-service
  template:
    metadata:
      labels:
        app: encryption-service
    spec:
      containers:
      - name: encryption-service
        image: athlete-ally/encryption-service:latest
        ports:
        - containerPort: 3000
        env:
        - name: AWS_REGION
          value: "us-west-2"
        - name: KMS_KEY_ID
          valueFrom:
            secretKeyRef:
              name: encryption-secrets
              key: kms-key-id
        - name: VAULT_ADDR
          value: "https://vault.athlete-ally.internal"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        securityContext:
          runAsNonRoot: true
          runAsUser: 1001
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
```

---

## 📋 7. 实施检查清单

### 7.1 部署前检查
- [ ] KMS 密钥已创建并配置
- [ ] Vault 集群已部署并初始化
- [ ] 加密服务已实现并测试
- [ ] 数据库字段加密已配置
- [ ] 密钥轮换机制已实现
- [ ] 审计日志管道已配置

### 7.2 安全验证
- [ ] 密钥访问权限已限制
- [ ] 传输加密已启用
- [ ] 存储加密已配置
- [ ] 审计日志已启用
- [ ] 密钥轮换已测试
- [ ] 灾难恢复计划已制定

---

## 🎯 总结

这套加密基础设施设计提供了：

1. **企业级密钥管理**
2. **端到端数据加密**
3. **自动化密钥轮换**
4. **全面的审计追踪**
5. **高可用性架构**

通过实施这些组件，我们可以确保Protocol Engine具有银行级的数据安全保护。
