
// 速率限制中间件
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

// 基础速率限制
const basicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP最多100个请求
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000)
    });
  }
});

// 严格速率限制
const strictLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5分钟
  max: 20, // 每个IP最多20个请求
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 登录速率限制
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 每个IP最多5次登录尝试
  message: {
    error: 'Too many login attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

// API速率限制
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟
  max: 60, // 每个IP最多60个API请求
  message: {
    error: 'API rate limit exceeded, please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 慢速限制
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15分钟
  delayAfter: 50, // 50个请求后开始延迟
  delayMs: 500, // 每个请求延迟500ms
  maxDelayMs: 20000, // 最大延迟20秒
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

// 动态速率限制
const dynamicLimiter = (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  const isBot = /bot|crawler|spider|crawling/i.test(userAgent);
  
  if (isBot) {
    // 对爬虫使用更严格的限制
    return rateLimit({
      windowMs: 60 * 1000, // 1分钟
      max: 10, // 最多10个请求
      message: 'Bot rate limit exceeded'
    })(req, res, next);
  } else {
    // 对普通用户使用标准限制
    return basicLimiter(req, res, next);
  }
};

// 基于IP的速率限制
const ipBasedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: (req) => {
    // 根据IP类型设置不同的限制
    const ip = req.ip;
    if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return 200; // 内网IP允许更多请求
    }
    return 100; // 外网IP限制更严格
  },
  message: 'IP-based rate limit exceeded',
  standardHeaders: true,
  legacyHeaders: false
});

// 基于用户的速率限制
const userBasedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: (req) => {
    // 根据用户类型设置不同的限制
    if (req.user && req.user.isPremium) {
      return 500; // 高级用户
    }
    if (req.user && req.user.isVerified) {
      return 200; // 验证用户
    }
    return 100; // 普通用户
  },
  keyGenerator: (req) => {
    return req.user ? req.user.id : req.ip;
  },
  message: 'User-based rate limit exceeded',
  standardHeaders: true,
  legacyHeaders: false
});

export {
  basicLimiter,
  strictLimiter,
  loginLimiter,
  apiLimiter,
  speedLimiter,
  dynamicLimiter,
  ipBasedLimiter,
  userBasedLimiter
};

export default basicLimiter;
