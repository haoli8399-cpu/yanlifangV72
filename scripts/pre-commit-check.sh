#!/bin/bash
# 演立方 — 提交前验证脚本
# 用法：bash scripts/pre-commit-check.sh
# 阶段 A 手动运行，阶段 B 集成到 CI

set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== 演立方提交前检查 ==="
echo ""

# 0. Memory First 回执门禁
echo "🧠 Memory First 回执门禁..."
cd "$ROOT_DIR"
node scripts/project-memory.mjs gate
echo "✅ Memory Gate 通过"
echo ""

# 1. 工作空间与版本治理检查
echo "📚 工作空间与版本治理检查..."
cd "$ROOT_DIR"
node scripts/check-governance.mjs
echo "✅ 治理检查通过"
echo ""

# 2. 后端 TypeScript 检查
echo "📦 后端 TypeScript 检查..."
cd "$ROOT_DIR/backend"
npx tsc --noEmit
echo "✅ 后端通过"
echo ""

# 4. 后端 Build
echo "🔨 后端 Build 检查..."
cd "$ROOT_DIR/backend"
npm run build
echo "✅ 后端 Build 通过"
echo ""

# 5. 前端 TypeScript 检查
echo "🎨 前端 TypeScript 检查..."
cd "$ROOT_DIR/codebase"
npx tsc --noEmit
echo "✅ 前端类型检查通过"
echo ""

# 6. 前端 Build
echo "🔨 前端 Build 检查..."
npm run build
echo "✅ Build 通过"
echo ""

# 7. 前端 Lint
echo "🧹 前端 Lint 检查..."
npm run lint
echo "✅ 前端 Lint 通过"
echo ""

# 8. 小程序 Build
echo "📱 小程序 Build 检查..."
cd "$ROOT_DIR/miniprogram"
npm run build:mp-weixin
echo "✅ 小程序 Build 通过"
echo ""

echo "🎉 全部检查通过！可以安全提交。"
