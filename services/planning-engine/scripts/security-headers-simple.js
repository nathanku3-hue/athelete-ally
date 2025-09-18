// 安全头配置修复脚本 - 简化版
import fs from 'fs';
import path from 'path';

const fixSecurityHeaders = () => {
  console.log('🛡️ 开始修复安全头配置...\n');
  
  // 1. 创建安全头中间件
  const securityHeadersMiddleware = `
// 安全头中间件
import helmet from 'helmet';

export const securityHeadersMiddleware = (app) => {
  // 基础安全头配置
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    xssFilter: true,
    hidePoweredBy: true
  }));
  
  // 自定义安全头
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.removeHeader('X-Powered-By');
    next();
  });
  
  return app;
};

export default securityHeadersMiddleware;
`;

  // 2. 创建安全头测试脚本
  const securityHeadersTest = `
// 安全头测试脚本
import http from 'http';

const testSecurityHeaders = async (url) => {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = http.get(url, (res) => {
      const headers = res.headers;
      const duration = Date.now() - start;
      
      const securityHeaders = {
        'X-Content-Type-Options': headers['x-content-type-options'],
        'X-Frame-Options': headers['x-frame-options'],
        'X-XSS-Protection': headers['x-xss-protection'],
        'Strict-Transport-Security': headers['strict-transport-security'],
        'Content-Security-Policy': headers['content-security-policy'],
        'Referrer-Policy': headers['referrer-policy']
      };
      
      const hasSecurityHeaders = Object.values(securityHeaders).some(header => header);
      const headerCount = Object.values(securityHeaders).filter(header => header).length;
      
      resolve({
        success: hasSecurityHeaders && headerCount >= 4,
        status: res.statusCode,
        duration,
        headers: securityHeaders,
        headerCount
      });
    });
    
    req.on('error', (err) => {
      resolve({
        success: false,
        status: 0,
        duration: Date.now() - start,
        error: err.message
      });
    });
    
    req.setTimeout(5000, () => {
      resolve({
        success: false,
        status: 0,
        duration: 5000,
        error: 'Timeout'
      });
    });
  });
};

const runSecurityHeadersTest = async () => {
  console.log('🧪 开始安全头测试...\n');
  
  const endpoints = [
    'http://localhost:4102/health',
    'http://localhost:4102/metrics',
    'http://localhost:9090/api/v1/status/config',
    'http://localhost:3001/api/health'
  ];
  
  const results = [];
  for (const endpoint of endpoints) {
    console.log('🔍 测试 ' + endpoint + '...');
    const result = await testSecurityHeaders(endpoint);
    results.push({ endpoint, ...result });
    
    const status = result.success ? '✅' : '❌';
    console.log('   ' + status + ' 安全头: ' + (result.headerCount || 0) + '/6 (' + result.duration + 'ms)');
    
    if (result.headers) {
      Object.entries(result.headers).forEach(([key, value]) => {
        if (value) {
          console.log('      ✅ ' + key);
        } else {
          console.log('      ❌ ' + key);
        }
      });
    }
  }
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log('\n📊 安全头测试结果:');
  console.log('='.repeat(50));
  console.log('✅ 成功: ' + successful.length + '/' + results.length + ' (' + (successful.length/results.length*100).toFixed(1) + '%)');
  console.log('❌ 失败: ' + failed.length + '/' + results.length);
  
  if (successful.length > 0) {
    const avgHeaderCount = successful.reduce((sum, r) => sum + (r.headerCount || 0), 0) / successful.length;
    console.log('🛡️  平均安全头数量: ' + avgHeaderCount.toFixed(1) + '/6');
  }
  
  if (failed.length > 0) {
    console.log('\n❌ 失败的端点:');
    failed.forEach(f => {
      console.log('   - ' + f.endpoint + ': ' + f.status + ' (' + f.duration + 'ms)');
    });
  }
  
  return results;
};

// 运行安全头测试
runSecurityHeadersTest().catch(console.error);
`;

  // 3. 保存配置文件
  const securityDir = './security';
  if (!fs.existsSync(securityDir)) {
    fs.mkdirSync(securityDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(securityDir, 'security-headers-middleware.js'), securityHeadersMiddleware);
  fs.writeFileSync(path.join(securityDir, 'security-headers-test.js'), securityHeadersTest);
  
  console.log('✅ 安全头配置修复完成！');
  console.log('📁 配置文件已创建:');
  console.log('   - security/security-headers-middleware.js');
  console.log('   - security/security-headers-test.js');
  
  console.log('\n🧪 测试安全头配置:');
  console.log('   node security/security-headers-test.js');
  
  console.log('\n💡 使用建议:');
  console.log('1. 在Express应用中应用安全头中间件');
  console.log('2. 定期测试安全头配置');
  console.log('3. 根据实际需求调整安全头策略');
  console.log('4. 监控安全头效果');
  
  return true;
};

// 运行安全头修复
const result = fixSecurityHeaders();
console.log('\n🎉 安全头配置修复完成！');

