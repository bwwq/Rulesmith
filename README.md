# Rulesmith

> TRPG 跑团「调色板」在线协作工具，专为《显微镜 Microscope》等世界观共建桌游设计。

## 特性

- **双极面板**：「是/YES」与「否/NO」两栏清晰对立，深色/浅色主题一键切换
- **+2 公平锁**：任何玩家的条目数不得超过最少者 +2，前后端双重校验防作弊
- **共识流转**：全员点击完成后自动进入锁定展示阶段
- **零数据库**：纯内存房间，关房即清，轻量无残留

## 一键部署

VPS 上装好 Docker 后，运行：

```bash
git clone https://github.com/bwwq/Rulesmith.git && cd Rulesmith && docker compose up -d --build
```

完成后访问 `http://你的IP` 即可使用。

## 本地测试

Windows 下双击 `start-local.bat`，浏览器打开 `http://localhost:5173`。

多开无痕窗口输入同一房间号即可模拟多人联机。
