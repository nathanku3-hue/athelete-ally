#!/usr/bin/env node
/**
 * Contract Drift Detection Script
 * 
 * This script checks for type inconsistencies and contract drift between
 * API and frontend by scanning for disallowed literals and ensuring
 * shared types are used consistently.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const DISALLOWED_PATTERNS = {
  // Fatigue level drift - should use 'moderate' not 'normal'
  fatigueLevel: {
    pattern: /['"`]normal['"`]/g,
    message: "Found 'normal' fatigue level - should use 'moderate' from shared types",
    allowedFiles: ['docs/', 'tests/', '*.md', 'legacy-mappings.ts', 'contract-bc.test.ts', 'detect-contract-drift.js']
  },
  
  // Season format drift - should use 'offseason' not 'off-season'
  seasonFormat: {
    pattern: /['"`](off-season|pre-season|in-season)['"`]/g,
    message: "Found hyphenated season format - should use 'offseason', 'preseason', 'inseason'",
    allowedFiles: ['docs/', 'tests/', '*.md', 'legacy-mappings.ts', 'contract-bc.test.ts', 'detect-contract-drift.js']
  },
  
  // Feedback type drift - should use canonical enum
  feedbackType: {
    pattern: /['"`](issue|problem|complaint)['"`]/g,
    message: "Found non-canonical feedback type - should use 'bug', 'feature', 'improvement', 'general'",
    allowedFiles: ['docs/', 'tests/', '*.md', 'legacy-mappings.ts', 'contract-bc.test.ts', 'detect-contract-drift.js']
  }
};

const REQUIRED_SHARED_IMPORTS = {
  fatigue: {
    files: ['**/fatigue/**/*.ts', '**/fatigue/**/*.tsx'],
    imports: ['FatigueLevel', 'FatigueAssessmentInput', 'FatigueAssessmentResult']
  },
  season: {
    files: ['**/onboarding/**/*.ts', '**/onboarding/**/*.tsx', '**/season/**/*.ts'],
    imports: ['Season', 'SeasonOption']
  },
  feedback: {
    files: ['**/feedback/**/*.ts', '**/feedback/**/*.tsx'],
    imports: ['FeedbackType', 'FeedbackData']
  }
};

class ContractDriftDetector {
  constructor() {
    this.violations = [];
    this.projectRoot = process.cwd();
  }

  /**
   * Main detection function
   */
  async detectDrift() {
    console.log('🔍 检测合约漂移...\n');

    try {
      // 1. 检查禁止的字面量模式
      await this.checkDisallowedPatterns();

      // 2. 检查必需的共享类型导入
      await this.checkRequiredImports();

      // 3. 检查类型一致性
      await this.checkTypeConsistency();

      // 4. 生成报告
      this.generateReport();

      if (this.violations.length > 0) {
        console.log(`\n❌ 发现 ${this.violations.length} 个合约漂移问题`);
        process.exit(1);
      } else {
        console.log('\n✅ 未发现合约漂移问题');
        process.exit(0);
      }
    } catch (error) {
      console.error('❌ 合约漂移检测失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 检查禁止的字面量模式
   */
  async checkDisallowedPatterns() {
    console.log('📋 检查禁止的字面量模式...');

    const sourceFiles = this.getSourceFiles();
    
    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      for (const [category, config] of Object.entries(DISALLOWED_PATTERNS)) {
        const matches = content.match(config.pattern);
        
        if (matches) {
          // 检查是否在允许的文件中
          const isAllowed = this.isFileAllowed(file, config.allowedFiles);
          
          if (!isAllowed) {
            this.violations.push({
              type: 'disallowed_pattern',
              category,
              file,
              message: config.message,
              matches: matches.slice(0, 5), // 只显示前5个匹配
              line: this.findLineNumber(content, matches[0])
            });
          }
        }
      }
    }

    console.log(`  ✅ 检查了 ${sourceFiles.length} 个文件`);
  }

  /**
   * 检查必需的共享类型导入
   */
  async checkRequiredImports() {
    console.log('📋 检查必需的共享类型导入...');

    for (const [category, config] of Object.entries(REQUIRED_SHARED_IMPORTS)) {
      const files = this.getFilesByPattern(config.files);
      
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        
        // 检查是否导入了共享类型
        const hasSharedImport = content.includes('@athlete-ally/shared-types');
        
        if (hasSharedImport) {
          // 检查是否导入了必需的特定类型
          for (const importName of config.imports) {
            if (!content.includes(importName)) {
              this.violations.push({
                type: 'missing_import',
                category,
                file,
                message: `Missing required import: ${importName}`,
                suggestion: `Add ${importName} to your imports from @athlete-ally/shared-types`
              });
            }
          }
        } else {
          // 检查是否使用了相关类型但没有导入
          const usesTypes = config.imports.some(importName => 
            content.includes(importName) || 
            content.includes(`'${importName.toLowerCase()}'`) ||
            content.includes(`"${importName.toLowerCase()}"`)
          );
          
          if (usesTypes) {
            this.violations.push({
              type: 'missing_shared_import',
              category,
              file,
              message: `Uses ${category} types but doesn't import from @athlete-ally/shared-types`,
              suggestion: `Import from @athlete-ally/shared-types: import { ${config.imports.join(', ')} } from '@athlete-ally/shared-types'`
            });
          }
        }
      }
    }

    console.log('  ✅ 检查了共享类型导入');
  }

  /**
   * 检查类型一致性
   */
  async checkTypeConsistency() {
    console.log('📋 检查类型一致性...');

    try {
      // 运行 TypeScript 编译检查
      execSync('npx tsc --noEmit --project apps/frontend/tsconfig.json', { 
        stdio: 'pipe',
        cwd: this.projectRoot 
      });
      console.log('  ✅ TypeScript 类型检查通过');
    } catch (error) {
      const errorOutput = error.stdout?.toString() || error.stderr?.toString() || '';
      
      // 解析 TypeScript 错误
      const typeErrors = this.parseTypeScriptErrors(errorOutput);
      
      typeErrors.forEach(error => {
        this.violations.push({
          type: 'type_error',
          file: error.file,
          message: error.message,
          line: error.line,
          suggestion: 'Fix TypeScript type error'
        });
      });
    }
  }

  /**
   * 获取源代码文件
   */
  getSourceFiles() {
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    const excludeDirs = [
      'node_modules', 
      '.git', 
      'dist', 
      'build', 
      '.next',
      'prisma/generated',
      '.codex/worktrees', // 排除工作树
      'coverage',
      'test-results',
      'smoke-results'
    ];
    
    const files = [];
    
    const scanDir = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!excludeDirs.includes(item)) {
            scanDir(fullPath);
          }
        } else if (extensions.some(ext => item.endsWith(ext))) {
          // 排除生成的文件
          if (!this.isGeneratedFile(fullPath)) {
            files.push(fullPath);
          }
        }
      }
    };
    
    scanDir(this.projectRoot);
    return files;
  }

  /**
   * 检查是否为生成的文件
   */
  isGeneratedFile(filePath) {
    const generatedPatterns = [
      /prisma\/generated/,
      /\.d\.ts$/,
      /library\.d\.ts$/,
      /generated/,
      /node_modules/,
      /\.codex\/worktrees/,
      /coverage\//,
      /test-results\//,
      /smoke-results\//
    ];
    
    return generatedPatterns.some(pattern => pattern.test(filePath));
  }

  /**
   * 根据模式获取文件
   */
  getFilesByPattern(patterns) {
    const files = [];
    
    for (const pattern of patterns) {
      try {
        const result = execSync(`find . -name "${pattern}" -type f`, { 
          encoding: 'utf8',
          cwd: this.projectRoot 
        });
        
        const patternFiles = result.trim().split('\n').filter(f => f);
        files.push(...patternFiles);
      } catch (error) {
        // 忽略 find 命令的错误
      }
    }
    
    return [...new Set(files)]; // 去重
  }

  /**
   * 检查文件是否在允许列表中
   */
  isFileAllowed(filePath, allowedPatterns) {
    return allowedPatterns.some(pattern => {
      if (pattern.endsWith('/')) {
        return filePath.includes(pattern);
      } else if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(filePath);
      } else {
        return filePath.includes(pattern);
      }
    });
  }

  /**
   * 查找行号
   */
  findLineNumber(content, searchText) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchText)) {
        return i + 1;
      }
    }
    return null;
  }

  /**
   * 解析 TypeScript 错误
   */
  parseTypeScriptErrors(errorOutput) {
    const errors = [];
    const lines = errorOutput.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^(.+?)\((\d+),\d+\): error (.+)$/);
      if (match) {
        errors.push({
          file: match[1],
          line: parseInt(match[2]),
          message: match[3]
        });
      }
    }
    
    return errors;
  }

  /**
   * 生成报告
   */
  generateReport() {
    if (this.violations.length === 0) {
      return;
    }

    console.log('\n📊 合约漂移检测报告');
    console.log('='.repeat(50));

    // 按类型分组
    const grouped = this.violations.reduce((acc, violation) => {
      if (!acc[violation.type]) {
        acc[violation.type] = [];
      }
      acc[violation.type].push(violation);
      return acc;
    }, {});

    for (const [type, violations] of Object.entries(grouped)) {
      console.log(`\n🔍 ${type.toUpperCase()} (${violations.length} 个问题)`);
      
      violations.forEach((violation, index) => {
        console.log(`\n${index + 1}. ${violation.file}`);
        console.log(`   ${violation.message}`);
        
        if (violation.line) {
          console.log(`   行号: ${violation.line}`);
        }
        
        if (violation.suggestion) {
          console.log(`   建议: ${violation.suggestion}`);
        }
        
        if (violation.matches) {
          console.log(`   匹配: ${violation.matches.join(', ')}`);
        }
      });
    }

    console.log('\n' + '='.repeat(50));
    console.log('💡 修复建议:');
    console.log('1. 使用 @athlete-ally/shared-types 中的规范类型');
    console.log('2. 避免使用字面量字符串，使用枚举或常量');
    console.log('3. 确保 API 和前端使用相同的类型定义');
    console.log('4. 运行合约测试验证类型一致性');
  }
}

// 命令行接口
if (require.main === module) {
  const detector = new ContractDriftDetector();
  detector.detectDrift();
}

module.exports = ContractDriftDetector;
