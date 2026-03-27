import React, { useState, useEffect } from 'react';
import { Check, X, Send, Users, Lock, LogIn, Plus, CheckCircle2, Moon, Sun, ShieldAlert, Award } from 'lucide-react';
import { useRoomSocket } from './hooks/useRoomSocket';

export default function App() {
    const [appState, setAppState] = useState('login'); // 'login' | 'workspace'
    const [nickname, setNickname] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [inputText, setInputText] = useState('');

    // --- 引入联机状态 Hook 代替原有的假数据与 useState ---
    const { 
        isConnected, players, items, phase, myPlayer, isLocked, errorMsg,
        joinRoom, addItem, toggleDone 
    } = useRoomSocket();

    // 1. Login Handler
    const handleLogin = (e) => {
        e.preventDefault();
        const trimmedCode = roomCode.trim().toUpperCase();
        const trimmedNick = nickname.trim();
        if (trimmedNick && trimmedCode) {
            joinRoom(trimmedCode, trimmedNick);
            setAppState('workspace');
        }
    };

    // 2. Add Item Handler
    const handleAddItem = (type) => {
        if (!inputText.trim() || isLocked || myPlayer?.isDone || phase !== 'adding') return;
        
        addItem(roomCode.trim().toUpperCase(), inputText.trim(), type);
        setInputText('');
    };

    // 3. Mark as Done
    const handleToggleDone = () => {
        if(!myPlayer) return;
        toggleDone(roomCode.trim().toUpperCase(), !myPlayer.isDone);
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
                        <h1 className={`text-2xl font-semibold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>加入 Rulesmith</h1>
                        <p className={`mt-2 text-sm transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>与团队实时锻造世界法则</p>
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
                                placeholder="例如: DM_Steve"
                            />
                        </div>
                        <div>
                            <label className={`block text-xs font-medium uppercase tracking-wider mb-2 ml-1 transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>房间代码</label>
                            <input
                                type="text"
                                required
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                className={`w-full px-4 py-3 rounded-xl transition-all outline-none font-mono tracking-widest ${isDarkMode ? 'bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50' : 'bg-white/50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'}`}
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
            
            {/* 顶层网络断开提示 */}
            {!isConnected && (
                <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white text-xs font-bold py-1.5 text-center flex justify-center items-center gap-2 shadow-md">
                    <ShieldAlert size={14} /> 服务器连接断开，正在尝试重连...
                </div>
            )}

            {/* 顶部状态浮动栏 (Player Status Area) */}
            <header className={`sticky top-0 z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md shadow-sm transition-colors duration-500 ${isDarkMode ? 'bg-slate-950/70 border-b border-slate-800/50' : 'bg-white/70 border-b border-slate-200/50'}`}>
                <div className="flex items-center gap-3">
                    <div className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-900 text-white'}`}>
                        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`}></span>
                        Room: {roomCode.toUpperCase()}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-wrap items-center gap-2 max-w-[60vw] md:max-w-none">
                        {players.map(player => (
                            <div
                                key={player.id}
                                className={`relative group flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 ${player.id === myPlayer?.id ? (isDarkMode ? 'bg-slate-800 shadow-sm shadow-black/20 border border-slate-700' : 'bg-white shadow-sm border border-slate-200') : (isDarkMode ? 'bg-slate-900/40 hover:bg-slate-800/50 border border-slate-800' : 'bg-slate-100/50 hover:bg-slate-200/50 border border-transparent')}`}
                                title={`${player.name} - 已提交: ${player.count}`}
                            >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold ${player.color || 'bg-blue-500'} shadow-inner`}>
                                    {player.name.charAt(0)}
                                </div>
                                <span className={`text-sm font-medium hidden sm:block transition-colors ${player.id === myPlayer?.id ? (isDarkMode ? 'text-slate-200' : 'text-slate-800') : (isDarkMode ? 'text-slate-400' : 'text-slate-600')}`}>
                                    {player.name} {player.id === myPlayer?.id && '(我)'}
                                </span>

                                <div className={`flex items-center justify-center min-w-[20px] h-5 rounded-full px-1.5 text-xs font-semibold border transition-colors ${isDarkMode ? 'bg-slate-900 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                    {player.count}
                                </div>

                                {player.isDone && (
                                    <div className={`absolute -top-1 -right-1 rounded-full p-0.5 shadow-sm transition-colors ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                                        <CheckCircle2 size={14} className="text-green-500" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`p-2.5 rounded-full transition-all duration-300 shadow-sm border shrink-0 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>
            </header>

            {/* 新增功能：共识阶段提示横幅 */}
            {phase === 'consensus' && (
                <div className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 px-6 shadow-lg flex items-center justify-center gap-3">
                    <Award size={20} className="animate-bounce" />
                    <span className="font-semibold text-sm tracking-wide">调色板共识阶段已达成！禁止变更，进入最终探讨。</span>
                </div>
            )}

            {/* 主体：调色板双栏面板 */}
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
                                <p className={`text-xs font-medium mt-0.5 transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>包含的核心元素与原则</p>
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
                                            添增者: {item.authorName}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {items.filter(i => i.type === 'YES').length === 0 && (
                                <div className={`border-2 border-dashed rounded-2xl p-8 text-center text-sm transition-colors ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                                    暂无条目
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
                                            添增者: {item.authorName}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {items.filter(i => i.type === 'NO').length === 0 && (
                                <div className={`border-2 border-dashed rounded-2xl p-8 text-center text-sm transition-colors ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                                    暂无条目
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>

            {/* 当处于 consensus 共识阶段时，隐藏输入舱以避免干扰 */}
            {phase === 'adding' && (
                <div className="fixed bottom-6 left-0 right-0 px-6 pointer-events-none z-50">
                    <div className="max-w-3xl mx-auto flex flex-col items-center gap-3">
                        
                        {/* 实时来自后端的越界拦截错误通知，或者前端拦截提示 */}
                        <div className={`transition-all duration-500 transform ${(isLocked || errorMsg) ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
                            <div className={`px-4 py-2 rounded-full shadow-lg border flex items-center gap-2 text-sm font-medium backdrop-blur-md transition-colors ${isDarkMode ? 'bg-red-950/90 text-red-400 border-red-900/60 shadow-[0_5px_15px_rgb(20,0,0,0.5)]' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                <Lock size={14} />
                                <span>{errorMsg || "您的条目过多，请等待其他玩家添加（数量差不可大于2）"}</span>
                            </div>
                        </div>

                        {/* 交互输入舱 (The Dock) */}
                        <div className={`w-full p-2 rounded-2xl pointer-events-auto transition-all duration-300 backdrop-blur-2xl ${myPlayer?.isDone ? 'opacity-60 grayscale' : ''} ${isDarkMode ? 'bg-slate-900/80 border border-slate-700/60 shadow-[0_20px_40px_rgb(0,0,0,0.6)]' : 'bg-white/80 border border-white/60 shadow-[0_20px_40px_rgb(0,0,0,0.1)]'}`}>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        disabled={isLocked || myPlayer?.isDone || !isConnected}
                                        placeholder={myPlayer?.isDone ? "您已标记完成本阶段" : (isLocked ? "由于平衡限制，本轮暂停提交" : "输入要追加的世界观元素...")}
                                        className={`w-full h-12 pl-4 pr-12 rounded-xl transition-all outline-none ${isDarkMode ? 'bg-slate-950/50 border-transparent text-slate-200 placeholder:text-slate-500 focus:bg-slate-950 focus:ring-2 focus:ring-slate-700' : 'bg-slate-100/50 border-transparent text-slate-700 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-300'} ${(isLocked || !isConnected) ? 'cursor-not-allowed opacity-70' : ''}`}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !isLocked && !myPlayer?.isDone && inputText.trim()) {
                                                handleAddItem('YES');
                                            }
                                        }}
                                    />
                                </div>

                                {/* 操作按钮组 */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleAddItem('YES')}
                                        disabled={isLocked || !inputText.trim() || myPlayer?.isDone || !isConnected}
                                        className={`h-12 px-4 font-medium rounded-xl transition-all flex items-center gap-1 active:scale-95 whitespace-nowrap ${isDarkMode ? 'bg-green-600 hover:bg-green-500 text-white disabled:bg-slate-800 disabled:text-slate-600' : 'bg-green-500 hover:bg-green-600 text-white disabled:bg-slate-200 disabled:text-slate-400'}`}
                                    >
                                        <Plus size={18} />
                                        <span>添加到 "是"</span>
                                    </button>
                                    <button
                                        onClick={() => handleAddItem('NO')}
                                        disabled={isLocked || !inputText.trim() || myPlayer?.isDone || !isConnected}
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
                                                <span>等待其他玩家...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                <span>完成添加</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
