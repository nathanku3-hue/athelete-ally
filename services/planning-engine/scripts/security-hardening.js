// 安全加固配置脚本
import fs from 'fs';
import path from 'path';

const securityHardening = () => {
  console.log('🔒 开始安全加固配置...\n');
  
  // 1. 创建安全配置文件
  const securityConfig = {
    // CORS配置
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    },
    
    // 安全头配置
    securityHeaders: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'",
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    },
    
    // 速率限制配置
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 100, // 每个IP最多100个请求
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false
    },
    
    // JWT配置
    jwt: {
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      expiresIn: '1h',
      issuer: 'athlete-ally',
      audience: 'athlete-ally-users'
    },
    
    // 输入验证配置
    validation: {
      maxBodySize: '10mb',
      maxFileSize: '5mb',
      allowedFileTypes: ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
      sanitizeInput: true
    },
    
    // 日志配置
    logging: {
      level: 'info',
      format: 'json',
      sanitize: true,
      excludeFields: ['password', 'token', 'secret']
    }
  };
  
  // 2. 创建安全中间件
  const securityMiddleware = `
// 安全中间件
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

export const securityMiddleware = (app) => {
  // Helmet安全头
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));
  
  // CORS配置
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));
  
  // 速率限制
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 每个IP最多100个请求
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
  });
  
  app.use('/api/', limiter);
  
  // 请求大小限制
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  return app;
};
`;
  
  // 3. 创建输入验证工具
  const validationUtils = `
// 输入验证工具
import validator from 'validator';
import xss from 'xss';

export const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return xss(validator.escape(input.trim()));
  }
  return input;
};

export const validateEmail = (email) => {
  return validator.isEmail(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
};

export const validateUserId = (userId) => {
  return validator.isUUID(userId);
};
`;
  
  // 4. 创建安全审计日志
  const auditLogger = `
// 安全审计日志
import winston from 'winston';

const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/security-audit.log' }),
    new winston.transports.Console()
  ]
});

export const logSecurityEvent = (event, details) => {
  auditLogger.info({
    type: 'security_event',
    event,
    details: sanitizeDetails(details),
    timestamp: new Date().toISOString(),
    ip: details.ip || 'unknown'
  });
};

const sanitizeDetails = (details) => {
  const sanitized = { ...details };
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.secret;
  return sanitized;
};
`;
  
  // 5. 保存配置文件
  const configDir = './security';
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(configDir, 'security-config.json'), JSON.stringify(securityConfig, null, 2));
  fs.writeFileSync(path.join(configDir, 'security-middleware.js'), securityMiddleware);
  fs.writeFileSync(path.join(configDir, 'validation-utils.js'), validationUtils);
  fs.writeFileSync(path.join(configDir, 'audit-logger.js'), auditLogger);
  
  console.log('✅ 安全配置文件已创建');
  console.log('✅ 安全中间件已配置');
  console.log('✅ 输入验证工具已创建');
  console.log('✅ 审计日志系统已配置');
  
  // 6. 安全建议
  console.log('\n🔒 安全加固建议:');
  console.log('1. 定期更新依赖包: npm audit fix');
  console.log('2. 使用环境变量存储敏感信息');
  console.log('3. 启用HTTPS在生产环境');
  console.log('4. 定期轮换JWT密钥');
  console.log('5. 监控异常登录和API调用');
  console.log('6. 实施数据库加密');
  console.log('7. 配置防火墙规则');
  console.log('8. 定期进行安全扫描');
  
  return securityConfig;
};

// 运行安全加固
const result = securityHardening();
console.log('\n🎉 安全加固配置完成！');

