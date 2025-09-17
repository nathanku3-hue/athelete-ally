#!/bin/bash
# 安全清理脚本 - 从Git历史中清除敏感文件

echo "🔒 开始执行安全清理协议..."

# 1. 从Git历史中移除敏感文件
echo "步骤1: 从Git历史中移除 config/production-infrastructure.env"
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch config/production-infrastructure.env" --prune-empty --tag-name-filter cat -- --all

# 2. 清理引用
echo "步骤2: 清理引用和垃圾回收"
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 3. 验证清理结果
echo "步骤3: 验证敏感文件已从历史中移除"
git log --all --full-history -- "config/production-infrastructure.env"

echo "✅ 安全清理完成！"
