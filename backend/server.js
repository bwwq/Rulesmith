import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// --- 托管前端静态构建产物 (For production single-container deployment) ---
app.use(express.static(path.join(__dirname, 'public')));


const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

/**
 * 内存房间状态存储 (In-memory Storage)
 * 考虑到跑团桌游特点，不使用持久化DB。一旦该房间内所有玩家离线，该房间的缓存及数据将被 GC 释放。
 * 结构设计: 
 * roomId -> {
 *   players: [{ id, name, count, isDone, color }],
 *   items: [{ id, text, type, authorName, authorId }],
 *   phase: 'adding' | 'consensus' 
 * }
 */
const rooms = new Map();

// 头像占位色分配盘
const tailwindColors = ['bg-blue-600', 'bg-purple-600', 'bg-orange-600', 'bg-emerald-600', 'bg-rose-600', 'bg-cyan-600', 'bg-amber-600', 'bg-indigo-600'];

const cleanupEmptyRooms = () => {
    rooms.forEach((data, roomId) => {
        if(data.players.length === 0) {
            rooms.delete(roomId);
            console.log(`[Room ${roomId}] Cleanup: Empty room deleted.`);
        }
    });
};

io.on('connection', (socket) => {
  console.log(`[+] User connected: ${socket.id}`);

  // 1. 用户加入房间
  socket.on('join_room', ({ roomId, nickname }, callback) => {
    socket.join(roomId);
    
    // 初始化房间数据如果这是第一个人
    if (!rooms.has(roomId)) {
        rooms.set(roomId, { players: [], items: [], phase: 'adding' });
        console.log(`[Room ${roomId}] New Session created by ${nickname}`);
    }
    
    const room = rooms.get(roomId);
    
    // 检查此连接是否属于已在房间的状态恢复
    const existingPlayerIndex = room.players.findIndex(p => p.id === socket.id);
    if(existingPlayerIndex === -1) {
        // 创建新玩家记录
        const newPlayer = {
            id: socket.id,
            name: nickname,
            count: 0,
            isDone: false,
            color: tailwindColors[room.players.length % tailwindColors.length]
        };
        room.players.push(newPlayer);
    } else {
        room.players[existingPlayerIndex].name = nickname; // 允许更新自己昵称
    }

    // 广播房间最新状态给组内所有人
    io.to(roomId).emit('room_state_updated', {
        players: room.players,
        items: room.items,
        phase: room.phase
    });

    if(callback) callback({ success: true, myId: socket.id });
  });

  // 2. 玩家尝试并提交一个元素
  socket.on('add_item', ({ roomId, text, type }) => {
    const room = rooms.get(roomId);
    if (!room || room.phase !== 'adding') return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    // ----- [核心业务锁]: 服务端安全校验 -----
    const otherPlayers = room.players.filter(p => p.id !== socket.id);
    const minOtherCount = otherPlayers.length === 0 ? 0 : Math.min(...otherPlayers.map(p => p.count));
    
    // 确保任何试图绕过前端页面发送请求的外挂不成立
    if (player.count >= minOtherCount + 2) {
       socket.emit('action_rejected', { reason: 'exceed_limit', message: '提交速度过快，拒绝越界提交。' });
       return;
    }

    // 接受通过校验的条目
    player.count += 1;
    const newItem = {
        id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5), // 简易全局唯一ID
        text: text,
        type: type,
        authorName: player.name,
        authorId: player.id
    };
    room.items.unshift(newItem); // 添加到最前端

    io.to(roomId).emit('room_state_updated', {
        players: room.players,
        items: room.items,
        phase: room.phase
    });
  });

  // 3. 玩家宣布结束环节
  socket.on('toggle_done', ({ roomId, isDone }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    player.isDone = isDone;

    // 当全员声明完成，阶段自动升维至【共识阶段】
    const allDone = room.players.length > 0 && room.players.every(p => p.isDone);
    if(allDone && room.phase === 'adding') {
        room.phase = 'consensus';
        console.log(`[Room ${roomId}] -> phase shifted to CONSENSUS`);
    } else if (!allDone && room.phase === 'consensus') {
        room.phase = 'adding'; // 如果有人意外重新点击了按钮，允许退回增加
        console.log(`[Room ${roomId}] <- phase reverted to ADDING`);
    }

    io.to(roomId).emit('room_state_updated', {
        players: room.players,
        items: room.items,
        phase: room.phase
    });
  });

  // 4. 清理下线用户
  socket.on('disconnect', () => {
    console.log(`[-] User disconnected: ${socket.id}`);
    rooms.forEach((room, roomId) => {
        const index = room.players.findIndex(p => p.id === socket.id);
        if(index !== -1) {
            // 将玩家移除或者标记为离线。这里直接移除对临时局更干净
            room.players.splice(index, 1);
            
            // 重新广播，更新因人数减少而引起的限频释放
            if(room.players.length > 0) {
                io.to(roomId).emit('room_state_updated', {
                    players: room.players,
                    items: room.items,
                    phase: room.phase
                });
            }
        }
    });

    // 内存泄漏防护措施
    cleanupEmptyRooms();
  });
});

// React Router history fallback (Catch-all)
app.get('*', (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Backend WebSocket server is successfully running on http://localhost:${PORT}`);
});
