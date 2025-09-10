/** @type {import('next').NextConfig} */
const nextConfig = {
  // 啟用為 Docker 優化的獨立輸出模式
  output: 'standalone',
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 前端構建時排除所有後端相關的模塊
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        assert: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
        child_process: false,
        // 排除 Prisma 相關模塊
        '@prisma/client': false,
        'prisma': false,
      };
      
      // 確保 Prisma 相關包不會被包含在客戶端構建中
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push({
          '@prisma/client': 'commonjs @prisma/client',
          'prisma': 'commonjs prisma',
        });
      }
    }
    
    // 排除 services 目錄，確保前端不會意外導入後端代碼
    config.resolve.alias = {
      ...config.resolve.alias,
      // 將 services 目錄重定向到空對象，防止意外導入
      '@/services': false,
      '../services': false,
      '../../services': false,
    };
    
    return config;
  },
  // 確保只有必要的實驗性功能
  experimental: {
    esmExternals: 'loose',
  },
};

export default nextConfig;