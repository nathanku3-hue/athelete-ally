# 🔧 TypeScript 配置修复计划

## 问题分析

### 当前问题
1. **路径别名不一致** - 不同服务使用不同的路径别名
2. **模块解析不统一** - 有些使用 NodeNext，有些使用 node
3. **缺少共享包引用** - 服务无法正确引用共享包
4. **构建输出配置不统一** - 输出目录和文件配置不一致

### 修复策略
1. 统一所有服务使用基础 tsconfig.base.json
2. 建立一致的路径别名系统
3. 确保共享包正确引用
4. 统一构建输出配置

## 修复方案

### 1. 更新根目录 tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@packages/*": ["./packages/*/src"],
      "@services/*": ["./services/*/src"],
      "@apps/*": ["./apps/*/src"],
      "@athlete-ally/*": ["./packages/*/src"],
      "@athlete-ally/event-bus": ["./packages/event-bus/src"],
      "@athlete-ally/event-bus/*": ["./packages/event-bus/src/*"],
      "@athlete-ally/contracts": ["./packages/contracts/events"],
      "@athlete-ally/contracts/*": ["./packages/contracts/events/*"],
      "@athlete-ally/shared": ["./packages/shared/src"],
      "@athlete-ally/shared/*": ["./packages/shared/src/*"],
      "@athlete-ally/shared-types": ["./packages/shared-types/src"],
      "@athlete-ally/shared-types/*": ["./packages/shared-types/src/*"]
    },
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": [
    "next-env.d.ts", 
    "src/**/*.ts", 
    "src/**/*.tsx", 
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "services/**/*",
    "packages/**/*", 
    "apps/gateway-bff/**/*",
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**"
  ]
}
```

### 2. 更新 tsconfig.base.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "ESNext",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": false,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@athlete-ally/*": ["./packages/*/src"],
      "@athlete-ally/event-bus": ["./packages/event-bus/src"],
      "@athlete-ally/event-bus/*": ["./packages/event-bus/src/*"],
      "@athlete-ally/contracts": ["./packages/contracts/events"],
      "@athlete-ally/contracts/*": ["./packages/contracts/events/*"],
      "@athlete-ally/shared": ["./packages/shared/src"],
      "@athlete-ally/shared/*": ["./packages/shared/src/*"],
      "@athlete-ally/shared-types": ["./packages/shared-types/src"],
      "@athlete-ally/shared-types/*": ["./packages/shared-types/src/*"],
      "@athlete-ally/services/*": ["./services/*/src"],
      "@athlete-ally/apps/*": ["./apps/*/src"]
    }
  },
  "exclude": ["node_modules", "dist", "build", ".next"]
}
```

### 3. 服务级 tsconfig.json 模板
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "ESNext",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": false,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@packages/*": ["../../packages/*/src"],
      "@services/*": ["../../services/*/src"],
      "@apps/*": ["../../apps/*/src"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/__tests__/**"]
}
```

## 修复步骤

### 步骤 1: 更新根目录配置
- 更新 tsconfig.json 路径别名
- 确保与 tsconfig.base.json 一致

### 步骤 2: 更新基础配置
- 更新 tsconfig.base.json
- 添加所有必要的路径别名

### 步骤 3: 修复服务配置
- 为每个服务创建统一的 tsconfig.json
- 确保继承基础配置
- 添加服务特定的路径别名

### 步骤 4: 验证配置
- 运行类型检查
- 验证路径别名工作
- 确保构建成功

## 预期结果

### 修复后效果
- ✅ 所有服务使用统一的 TypeScript 配置
- ✅ 路径别名在所有服务中一致工作
- ✅ 共享包可以正确引用
- ✅ 构建输出配置统一
- ✅ 类型检查通过

### 验证方法
```bash
# 检查所有服务类型
npm run type-check

# 构建所有服务
npm run build:all

# 运行测试
npm run test:all
```

---

**制定者**: 工程师 C (平台与构建专家)  
**制定时间**: $(date)  
**版本**: 1.0
