#!/bin/bash

# 检查构建产物是否被意外提交
# 这个脚本应该在CI/CD管道中运行，如果检测到构建产物则失败

set -e

echo "🔍 检查是否有构建产物被意外提交..."

# 检查常见的构建产物目录和文件
BUILD_ARTIFACTS=(
    "**/node_modules"
    "**/dist"
    "**/.turbo"
    "**/build"
    "**/.next"
    "**/coverage"
    "**/prisma/generated"
    "**/generated"
)

FOUND_ARTIFACTS=()

for pattern in "${BUILD_ARTIFACTS[@]}"; do
    if find . -name "$(basename "$pattern")" -type d 2>/dev/null | grep -q .; then
        FOUND_ARTIFACTS+=("$pattern")
    fi
done

if [ ${#FOUND_ARTIFACTS[@]} -gt 0 ]; then
    echo "❌ 发现以下构建产物被意外提交:"
    for artifact in "${FOUND_ARTIFACTS[@]}"; do
        echo "  - $artifact"
    done
    echo ""
    echo "请确保这些目录在.gitignore中，并且从Git历史中移除。"
    echo "运行以下命令来清理:"
    echo "  git rm -r --cached <directory>"
    echo "  git commit -m 'Remove build artifacts'"
    exit 1
else
    echo "✅ 没有发现构建产物被意外提交"
fi

echo "✅ 构建产物检查通过"
