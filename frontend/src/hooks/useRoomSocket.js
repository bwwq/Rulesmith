import { useState, useEffect, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';

// 自动匹配环境: 如果是本地开发走 3001 端口，线上生产环境 (Docker Nginx) 则走当面同构域名
const SOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : '/');

export function useRoomSocket() {
    const [socket, setSocket] = useState(null);
    const [players, setPlayers] = useState([]);
    const [items, setItems] = useState([]);
    const [phase, setPhase] = useState('adding'); // 'adding' | 'consensus'
    const [myPlayerId, setMyPlayerId] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const newSocket = io(SOCKET_URL, {
            autoConnect: false // 手动决定何时连接
        });
        setSocket(newSocket);

        newSocket.on('connect', () => {
             setIsConnected(true);
             setErrorMsg('');
        });

        newSocket.on('disconnect', () => {
             setIsConnected(false);
        });

        newSocket.on('room_state_updated', (state) => {
             setPlayers(state.players);
             setItems(state.items);
             setPhase(state.phase);
        });

        newSocket.on('action_rejected', (data) => {
             setErrorMsg(data.message);
             // 3秒后自动清除错误提示
             setTimeout(() => setErrorMsg(''), 3000);
        });

        return () => newSocket.close();
    }, []);

    // 加入房间
    const joinRoom = useCallback((roomId, nickname) => {
        if(socket) {
            socket.connect();
            socket.emit('join_room', { roomId, nickname }, (response) => {
                if(response.success) {
                    setMyPlayerId(response.myId);
                }
            });
        }
    }, [socket]);

    // 添加调色板元素
    const addItem = useCallback((roomId, text, type) => {
        if(socket) {
            socket.emit('add_item', { roomId, text, type });
        }
    }, [socket]);

    // 宣布添加完成
    const toggleDone = useCallback((roomId, isDone) => {
        if(socket) {
            socket.emit('toggle_done', { roomId, isDone });
        }
    }, [socket]);

    // 计算衍生属性供 UI 使用
    const myPlayer = useMemo(() => players.find(p => p.id === myPlayerId) || null, [players, myPlayerId]);
    const otherPlayers = useMemo(() => players.filter(p => p.id !== myPlayerId), [players, myPlayerId]);

    // 获取其余玩家最少提交的数量
    const minOtherCount = useMemo(() => {
        if (otherPlayers.length === 0) return 0;
        return Math.min(...otherPlayers.map(p => p.count));
    }, [otherPlayers]);

    // 前端根据同步来的状态计算 +2 规则锁定状态 (双重保险，辅助呈现UI提示)
    const isLocked = myPlayer ? myPlayer.count >= minOtherCount + 2 : false;

    return {
        isConnected,
        players,
        items,
        phase,
        myPlayer,
        isLocked,
        errorMsg,
        joinRoom,
        addItem,
        toggleDone
    };
}
