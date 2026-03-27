import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Check, X, Send, Users, Lock, LogIn, Plus, CheckCircle2, AlertCircle, Moon, Sun } from 'lucide-react';

// --- MOCK DATA FOR DEMONSTRATION ---
const INITIAL_PLAYERS = [
    { id: 'p1', name: 'Steve (Me)', count: 2, isDone: false, isMe: true, color: 'bg-blue-500' },
    { id: 'p2', name: 'Craig', count: 1, isDone: false, isMe: false, color: 'bg-purple-500' },
    { id: 'p3', name: 'Jony', count: 3, isDone: true, isMe: false, color: 'bg-orange-500' }
];

const INITIAL_ITEMS = [
    { id: 'i1', text: '极简主义的排版', type: 'YES', authorName: 'Steve (Me)', authorId: 'p1' },
    { id: 'i2', text: '复杂的层级嵌套', type: 'NO', authorName: 'Craig', authorId: 'p2' },
    { id: 'i3', text: '高斯模糊背景', type: 'YES', authorName: 'Jony', authorId: 'p3' },
    { id: 'i4', text: '刺眼的霓虹色彩', type: 'NO', authorName: 'Steve (Me)', authorId: 'p1' },
    { id: 'i5', text: '顺滑的过渡动画', type: 'YES', authorName: 'Jony', authorId: 'p3' },
    { id: 'i6', text: '留白空间 (Negative Space)', type: 'YES', authorName: 'Jony', authorId: 'p3' },
];

export default function App() {
    const [appState, setAppState] = useState('login'); // 'login' | 'workspace'
    const [nickname, setNickname] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);

    const [players, setPlayers] = useState(INITIAL_PLAYERS);
    const [items, setItems] = useState(INITIAL_ITEMS);
    const [inputText, setInputText] = useState('');

    // 1. Login Handler
    const handleLogin = (e) => {
        e.preventDefault();
        if (nickname.trim() && roomCode.trim()) {
            // In a real app, you would sync this with backend
            setPlayers(prev => [
                { id: 'p_new', name: `${nickname} (Me)`, count: 0, isDone: false, isMe: true, color: 'bg-blue-600' },
                ...INITIAL_PLAYERS.filter(p => !p.isMe) // remove old mock "Me"
            ]);
            setAppState('workspace');
        }
    };

    // 2. Validation Lock Logic
    const myPlayer = players.find(p => p.isMe);
    const otherPlayers = players.filter(p => !p.isMe);

    const minOtherCount = useMemo(() => {
        if (otherPlayers.length === 0) return 0;
        return Math.min(...otherPlayers.map(p => p.count));
    }, [otherPlayers]);

    const isLocked = myPlayer ? myPlayer.count >= minOtherCount + 2 : false;

    // 3. Add Item Handler
    const handleAddItem = (type) => {
        if (!inputText.trim() || isLocked || myPlayer?.isDone) return;

        const newItem = {
            id: Date.now().toString(),
            text: inputText.trim(),
            type: type,
            authorName: myPlayer.name,
            authorId: myPlayer.id
        };

        setItems(prev => [newItem, ...prev]);
        setPlayers(prev => prev.map(p =>
            p.id === myPlayer.id ? { ...p, count: p.count + 1 } : p
        ));
        setInputText('');
    };

    // 4. Mark as Done
    const handleToggleDone = () => {
        setPlayers(prev => prev.map(p =>
            p.isMe ? { ...p, isDone: !p.isDone } : p
        ));
    };

    // Render Login View
    if (appState === 'login') {
        return (
            <div className={`min-h-screen flex items-center justify-center relative overflow-hidden font-sans transition-colors duration-500 ${isDarkMode ? 'bg-[#0A0A0C]' : 'bg-slate-50'}`}>
                {/* Theme Toggle */}
                <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`absolute top-6 right-6 z-50 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-sm border ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-yellow-400 hover:bg-slate-800' : 'bg-white/50 border-slate-200 text-slate-600 hover:bg-white'}`}
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Ambient Background Blur for Premium feel */}
                <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-3xl transition-opacity duration-1000 ${isDarkMode ? 'bg-blue-600/10' : 'bg-blue-400/20'}`} />
                <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-3xl transition-opacity duration-1000 ${isDarkMode ? 'bg-purple-600/10' : 'bg-purple-400/20'}`} />

                <div className={`relative z-10 w-full max-w-md p-8 backdrop-blur-xl rounded-3xl transition-all duration-500 ${isDarkMode ? 'bg-slate-900/60 border border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.5)]' : 'bg-white/70 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'}`}>
                    <div className="text-center mb-10">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transition-colors ${isDarkMode ? 'bg-gradient-to-tr from-slate-700 to-slate-600 text-white' : 'bg-gradient-to-tr from-slate-800 to-slate-600 text-white'}`}>
                            <Users size={32} strokeWidth={1.5} />
                        </div>
                        <h1 className={`text-2xl font-semibold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>加入协作房间</h1>
                        <p className={`mt-2 text-sm transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>与你的团队同步设计意图</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className={`block text-xs font-medium uppercase tracking-wider mb-2 ml-1 transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>你的昵称</label>
                            <input
                                type="text"
                                required
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl transition-all outline-none ${isDarkMode ? 'bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50' : 'bg-white/50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'}`}
                                placeholder="例如: Jony Ive"
                            />
                        </div>
                        <div>
                            <label className={`block text-xs font-medium uppercase tracking-wider mb-2 ml-1 transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>房间代码</label>
                            <input
                                type="text"
                                required
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl transition-all outline-none font-mono ${isDarkMode ? 'bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50' : 'bg-white/50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'}`}
                                placeholder="XXXX-XXXX"
                            />
                        </div>
                        <button
                            type="submit"
                            className={`w-full mt-4 font-medium py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2 ${isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                        >
                            <LogIn size={18} />
                            <span>进入工作区</span>
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Render Workspace View
    return (
        <div className={`min-h-screen font-sans pb-32 transition-colors duration-500 ${isDarkMode ? 'bg-[#0A0A0C]' : 'bg-[#F5F5F7]'}`}>
            {/* 顶部浮动：玩家状态展示区 (Player Status Area) */}
            <header className={`sticky top-0 z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md shadow-sm transition-colors duration-500 ${isDarkMode ? 'bg-slate-950/70 border-b border-slate-800/50' : 'bg-white/70 border-b border-slate-200/50'}`}>
                <div className="flex items-center gap-3">
                    <div className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-900 text-white'}`}>
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        Room: {roomCode || 'A8X9'}
                    </div>
                </div>

                {/* 玩家列表与主题切换 - 灵动岛风格 */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        {players.map(player => (
                            <div
                                key={player.id}
                                className={`relative group flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 ${player.isMe ? (isDarkMode ? 'bg-slate-800 shadow-sm shadow-black/20 border border-slate-700' : 'bg-white shadow-sm border border-slate-200') : (isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-200/50')}`}
                                title={`${player.name} - 已提交: ${player.count}`}
                            >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold ${player.color} shadow-inner`}>
                                    {player.name.charAt(0)}
                                </div>
                                <span className={`text-sm font-medium hidden sm:block transition-colors ${player.isMe ? (isDarkMode ? 'text-slate-200' : 'text-slate-800') : (isDarkMode ? 'text-slate-400' : 'text-slate-600')}`}>
                                    {player.name}
                                </span>

                                {/* 提交数量徽章 (Badge) */}
                                <div className={`flex items-center justify-center min-w-[20px] h-5 rounded-full px-1.5 text-xs font-semibold border transition-colors ${isDarkMode ? 'bg-slate-900 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                    {player.count}
                                </div>

                                {/* 完成状态确认图标 */}
                                {player.isDone && (
                                    <div className={`absolute -top-1 -right-1 rounded-full p-0.5 shadow-sm transition-colors ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                                        <CheckCircle2 size={14} className="text-green-500" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Theme Toggle Button in Workspace */}
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`p-2.5 rounded-full transition-all duration-300 shadow-sm border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>
            </header>

            {/* 主体：调色板双栏面板 (Palette Board Area) */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* 左列：是 / YES */}
                    <section className="flex flex-col h-full">
                        <div className={`flex items-center gap-3 mb-6 sticky top-[72px] py-2 z-10 transition-colors duration-500 ${isDarkMode ? 'bg-[#0A0A0C]' : 'bg-[#F5F5F7]'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-green-600 transition-colors ${isDarkMode ? 'bg-green-500/20' : 'bg-green-100'}`}>
                                <Check size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className={`text-xl font-bold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>是 / YES</h2>
                                <p className={`text-xs font-medium mt-0.5 transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>必须包含的设计元素与原则</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            {items.filter(i => i.type === 'YES').map(item => (
                                <div
                                    key={item.id}
                                    className={`group p-4 rounded-2xl shadow-sm transition-all duration-300 relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border border-green-900/30 hover:border-green-800/60 hover:shadow-black/40' : 'bg-white border border-green-500/10 hover:shadow-md hover:border-green-500/30'}`}
                                >
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-colors ${isDarkMode ? 'bg-green-500/70' : 'bg-green-400'}`}></div>
                                    <p className={`font-medium pl-2 transition-colors ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{item.text}</p>
                                    <div className="mt-3 flex items-center gap-2 pl-2">
                                        <span className={`text-[11px] px-2 py-1 rounded-md border font-medium transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                            添加者: {item.authorName}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {items.filter(i => i.type === 'YES').length === 0 && (
                                <div className={`border-2 border-dashed rounded-2xl p-8 text-center text-sm transition-colors ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                                    暂无条目，等待添加
                                </div>
                            )}
                        </div>
                    </section>

                    {/* 右列：否 / NO */}
                    <section className="flex flex-col h-full">
                        <div className={`flex items-center gap-3 mb-6 sticky top-[72px] py-2 z-10 transition-colors duration-500 ${isDarkMode ? 'bg-[#0A0A0C]' : 'bg-[#F5F5F7]'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-red-600 transition-colors ${isDarkMode ? 'bg-red-500/20' : 'bg-red-100'}`}>
                                <X size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className={`text-xl font-bold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>否 / NO</h2>
                                <p className={`text-xs font-medium mt-0.5 transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>绝对避免出现的元素或反模式</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            {items.filter(i => i.type === 'NO').map(item => (
                                <div
                                    key={item.id}
                                    className={`group p-4 rounded-2xl shadow-sm transition-all duration-300 relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border border-red-900/30 hover:border-red-800/60 hover:shadow-black/40' : 'bg-white border border-red-500/10 hover:shadow-md hover:border-red-500/30'}`}
                                >
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-colors ${isDarkMode ? 'bg-red-500/70' : 'bg-red-400'}`}></div>
                                    <p className={`font-medium pl-2 transition-colors ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{item.text}</p>
                                    <div className="mt-3 flex items-center gap-2 pl-2">
                                        <span className={`text-[11px] px-2 py-1 rounded-md border font-medium transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                            添加者: {item.authorName}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {items.filter(i => i.type === 'NO').length === 0 && (
                                <div className={`border-2 border-dashed rounded-2xl p-8 text-center text-sm transition-colors ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                                    暂无条目，等待添加
                                </div>
                            )}
                        </div>
                    </section>

                </div>
            </main>

            {/* 底部控制台交互区 (Action Control Area) - 悬浮 Dock 设计 */}
            <div className="fixed bottom-6 left-0 right-0 px-6 pointer-events-none z-50">
                <div className="max-w-3xl mx-auto flex flex-col items-center gap-3">

                    {/* 校验限制锁提示 (Validation Lock Tooltip) */}
                    <div className={`transition-all duration-500 transform ${isLocked ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
                        <div className={`px-4 py-2 rounded-full shadow-lg border flex items-center gap-2 text-sm font-medium backdrop-blur-md transition-colors ${isDarkMode ? 'bg-red-950/90 text-red-400 border-red-900/60 shadow-black/50' : 'bg-red-50 text-red-600 border-red-200'}`}>
                            <Lock size={14} />
                            <span>您的条目过多，请等待其他玩家添加（数量差不可大于2）</span>
                        </div>
                    </div>

                    {/* 交互输入舱 (The Dock) */}
                    <div className={`w-full p-2 rounded-2xl pointer-events-auto transition-all duration-300 backdrop-blur-2xl ${myPlayer?.isDone ? 'opacity-60 grayscale' : ''} ${isDarkMode ? 'bg-slate-900/80 border border-slate-700/60 shadow-[0_20px_40px_rgb(0,0,0,0.4)]' : 'bg-white/80 border border-white/60 shadow-[0_20px_40px_rgb(0,0,0,0.08)]'}`}>

                        <div className="flex flex-col sm:flex-row gap-2">
                            {/* 文本输入 */}
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    disabled={isLocked || myPlayer?.isDone}
                                    placeholder={myPlayer?.isDone ? "您已完成添加阶段" : isLocked ? "提交锁定中..." : "输入预想中的元素短语..."}
                                    className={`w-full h-12 pl-4 pr-12 rounded-xl transition-all outline-none ${isDarkMode ? 'bg-slate-950/50 border-transparent text-slate-200 placeholder:text-slate-500 focus:bg-slate-950 focus:ring-2 focus:ring-slate-700' : 'bg-slate-100/50 border-transparent text-slate-700 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-300'} ${isLocked ? 'cursor-not-allowed opacity-70' : ''}`}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !isLocked && !myPlayer?.isDone) {
                                            handleAddItem('YES');
                                        }
                                    }}
                                />
                            </div>

                            {/* 操作按钮组 */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleAddItem('YES')}
                                    disabled={isLocked || !inputText.trim() || myPlayer?.isDone}
                                    className={`h-12 px-4 font-medium rounded-xl transition-all flex items-center gap-1 active:scale-95 whitespace-nowrap ${isDarkMode ? 'bg-green-600 hover:bg-green-500 text-white disabled:bg-slate-800 disabled:text-slate-600' : 'bg-green-500 hover:bg-green-600 text-white disabled:bg-slate-200 disabled:text-slate-400'}`}
                                >
                                    <Plus size={18} />
                                    <span>添加到 "是"</span>
                                </button>
                                <button
                                    onClick={() => handleAddItem('NO')}
                                    disabled={isLocked || !inputText.trim() || myPlayer?.isDone}
                                    className={`h-12 px-4 font-medium rounded-xl transition-all flex items-center gap-1 active:scale-95 whitespace-nowrap ${isDarkMode ? 'bg-red-600 hover:bg-red-500 text-white disabled:bg-slate-800 disabled:text-slate-600' : 'bg-red-500 hover:bg-red-600 text-white disabled:bg-slate-200 disabled:text-slate-400'}`}
                                >
                                    <Plus size={18} />
                                    <span>添加到 "否"</span>
                                </button>

                                <div className={`w-px h-8 mx-1 transition-colors ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>

                                <button
                                    onClick={handleToggleDone}
                                    className={`h-12 px-4 font-medium rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${myPlayer?.isDone ? (isDarkMode ? 'bg-slate-200 text-slate-900 shadow-md' : 'bg-slate-800 text-white shadow-md') : (isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}`}
                                >
                                    {myPlayer?.isDone ? (
                                        <>
                                            <CheckCircle2 size={18} />
                                            <span>等待推进...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            <span>无元素添加</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}