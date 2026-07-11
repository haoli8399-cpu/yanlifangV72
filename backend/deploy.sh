#!/bin/bash
# 演出撮合平台 - 一键部署脚本
# 使用：bash deploy.sh [staging|production]

set -e

ENV=${1:-staging}
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== 演出撮合平台 部署开始 ==="
echo "环境: $ENV"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"

# 1. 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose 未安装"
    exit 1
fi

cd "$PROJECT_DIR/backend"

# 2. 拉取最新代码
echo "📦 拉取最新镜像..."
docker compose pull 2>/dev/null || echo "⚠️  部分镜像拉取失败，使用本地缓存"

# 3. 构建自建服务
echo "🔨 构建 API 服务..."
docker compose build yanchu-api

# 4. 启动服务
echo "🚀 启动服务..."
docker compose up -d

# 5. 等待数据库就绪
echo "⏳ 等待数据库就绪..."
for i in {1..30}; do
    if docker compose exec -T supabase-db pg_isready -U postgres &>/dev/null; then
        echo "✅ 数据库就绪"
        break
    fi
    sleep 2
done

# 6. 运行数据库迁移
echo "🗄️  运行数据库迁移..."
docker compose exec -T supabase-db psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/001_schema.sql 2>/dev/null || echo "⚠️  迁移可能已执行"

# 7. 健康检查
echo "🏥 健康检查..."
sleep 3

check_endpoint() {
    local url=$1
    local name=$2
    if curl -sf "$url" &>/dev/null; then
        echo "  ✅ $name: $url"
    else
        echo "  ⚠️  $name: $url (未响应)"
    fi
}

check_endpoint "http://localhost:3001/health" "API 服务"
check_endpoint "http://localhost:3000/" "PostgREST"

echo ""
echo "=== 部署完成 ==="
echo "API:     http://localhost:3001/v1/"
echo "Auth:    http://localhost:9999/"
echo "Studio:  http://localhost:8000/"
echo "Storage: http://localhost:5000/"
