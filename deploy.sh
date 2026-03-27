#!/bin/bash
# TRPG Palette Tool - Linux VPS 一键部署脚手架

echo "======================================"
echo "     RPG Palette 线上部署正在启动"
echo "======================================"

# 1. 前置依赖检查
if ! command -v docker &> /dev/null
then
    echo "错误: 系统未安装 Docker！请先安装 Docker。"
    exit 1
fi

# 检查是 docker-compose 还是新版 docker compose
COMPOSE_CMD=""
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    echo "错误: 系统未安装 docker-compose 插件！请先配置环境。"
    exit 1
fi

echo "[1/3] 正在关停一切可能的旧版同包容器..."
$COMPOSE_CMD down

echo "[2/3] 正在全新构建多阶段极简镜像 (包含前后端合并逻辑)..."
# 使用 --no-cache 防止 VPS 残留造成构建失败，此步可能花费较长时间 (npm install & Vite build)
$COMPOSE_CMD build --no-cache

echo "[3/3] 正在从后台正式拉起应用容器..."
$COMPOSE_CMD up -d

echo "======================================"
echo " 🎉 部署大功告成 (Deployment Successful)！"
echo ""
echo " -> 服务已运行在 Docker 容器内部端口 (映射出默认 80 端口)。"
echo " -> 现在您只需在浏览器中输入您的【VPS公网IP】即可玩耍！"
echo ""
echo " -> 实时查看日志请输入: $COMPOSE_CMD logs -f"
echo "======================================"
