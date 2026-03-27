#!/bin/bash
# Rulesmith - 一键部署脚本
# 用法: curl -fsSL https://raw.githubusercontent.com/bwwq/Rulesmith/main/deploy.sh | bash

set -e

REPO="https://github.com/bwwq/Rulesmith.git"
DIR="Rulesmith"

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker not installed. Please install Docker first."
    exit 1
fi

COMPOSE_CMD=""
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    echo "[ERROR] docker-compose not found."
    exit 1
fi

# 拉取代码
if [ -d "$DIR" ]; then
    echo "[1/3] Updating existing repo..."
    cd "$DIR" && git pull
else
    echo "[1/3] Cloning repo..."
    git clone "$REPO" && cd "$DIR"
fi

# 构建并启动
echo "[2/3] Building image..."
$COMPOSE_CMD down 2>/dev/null
$COMPOSE_CMD build --no-cache

echo "[3/3] Starting container..."
$COMPOSE_CMD up -d

echo ""
echo "======================================="
echo " Rulesmith is live on http://$(hostname -I | awk '{print $1}')"
echo "======================================="
