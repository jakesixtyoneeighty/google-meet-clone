'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Bot, Sparkles, MessageSquare } from 'lucide-react';
import { type Channel as ChannelType, type MessageResponse, type Event } from 'stream-chat';
import {
    MessageInput,
    MessageList,
    Channel,
    Window,
} from 'stream-chat-react';

interface ChatSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    channel: ChannelType;
    defaultTab?: 'chat' | 'mojo';
}

const MOJO_USER_ID = 'mojo-assistant';

interface MojoMessage {
    id: string;
    text: string;
    isFromMojo: boolean;
    userName: string;
    timestamp: Date;
}

const ChatSidebar = ({ isOpen, onClose, channel, defaultTab = 'chat' }: ChatSidebarProps) => {
    const [activeTab, setActiveTab] = useState<'chat' | 'mojo'>(defaultTab);
    const [mojoMessages, setMojoMessages] = useState<MojoMessage[]>([]);
    const [mojoInput, setMojoInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Filter messages for Mojo conversations
    const filterMojoMessages = useCallback((allMessages: MessageResponse[]): MojoMessage[] => {
        const filtered: MojoMessage[] = [];

        allMessages.forEach((msg, index) => {
            const text = msg.text || '';
            const isFromMojo = msg.user?.id === MOJO_USER_ID;
            const mentionsMojo = text.toLowerCase().includes('@mojo');

            if (isFromMojo || mentionsMojo) {
                filtered.push({
                    id: msg.id || `msg-${index}`,
                    text: text,
                    isFromMojo,
                    userName: msg.user?.name || msg.user?.id || 'Unknown',
                    timestamp: new Date(msg.created_at || Date.now()),
                });
            }
        });

        return filtered;
    }, []);

    // Load and watch messages for Mojo tab
    useEffect(() => {
        if (!channel || !isOpen || activeTab !== 'mojo') return;

        const loadMessages = async () => {
            try {
                const state = await channel.watch();
                if (state.messages) {
                    setMojoMessages(filterMojoMessages(state.messages));
                }
            } catch (error) {
                console.error('Failed to load messages:', error);
            }
        };

        loadMessages();

        const handleNewMessage = (event: Event) => {
            if (event.message) {
                const msg = event.message;
                const text = msg.text || '';
                const isFromMojo = msg.user?.id === MOJO_USER_ID;
                const mentionsMojo = text.toLowerCase().includes('@mojo');

                if (isFromMojo || mentionsMojo) {
                    setMojoMessages(prev => [...prev, {
                        id: msg.id || `msg-${Date.now()}`,
                        text: text,
                        isFromMojo,
                        userName: msg.user?.name || msg.user?.id || 'Unknown',
                        timestamp: new Date(msg.created_at || Date.now()),
                    }]);
                }

                if (isFromMojo) {
                    setIsTyping(false);
                }
            }
        };

        const handleTypingStart = (event: Event) => {
            if (event.user?.id === MOJO_USER_ID) {
                setIsTyping(true);
            }
        };

        const handleTypingStop = (event: Event) => {
            if (event.user?.id === MOJO_USER_ID) {
                setIsTyping(false);
            }
        };

        channel.on('message.new', handleNewMessage);
        channel.on('typing.start', handleTypingStart);
        channel.on('typing.stop', handleTypingStop);

        return () => {
            channel.off('message.new', handleNewMessage);
            channel.off('typing.start', handleTypingStart);
            channel.off('typing.stop', handleTypingStop);
        };
    }, [channel, isOpen, activeTab, filterMojoMessages]);

    // Auto-scroll to bottom for Mojo messages
    useEffect(() => {
        if (activeTab === 'mojo') {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [mojoMessages, isTyping, activeTab]);

    // Send message with @mojo prefix
    const sendMojoMessage = async () => {
        if (!mojoInput.trim() || !channel) return;

        const messageText = mojoInput.startsWith('@mojo') ? mojoInput : `@mojo ${mojoInput}`;

        try {
            setIsTyping(true);
            await channel.sendMessage({ text: messageText });
            setMojoInput('');
        } catch (error) {
            console.error('Failed to send message:', error);
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMojoMessage();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed right-0 top-0 h-full w-96 bg-nj-grey-950 border-l border-nj-grey-800 z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header with Tabs */}
            <div className="flex flex-col border-b border-nj-grey-800">
                <div className="flex items-center justify-between p-4 pb-0">
                    <h2 className="font-bold text-white text-lg">Messages</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full hover:bg-nj-grey-800 flex items-center justify-center transition-colors"
                    >
                        <X size={18} className="text-nj-grey-400" />
                    </button>
                </div>

                {/* Tab Switcher */}
                <div className="flex px-4 pt-3 gap-1">
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-medium text-sm transition-colors ${activeTab === 'chat'
                                ? 'bg-nj-grey-800 text-white'
                                : 'text-nj-grey-400 hover:text-white hover:bg-nj-grey-900'
                            }`}
                    >
                        <MessageSquare size={16} />
                        Chat
                    </button>
                    <button
                        onClick={() => setActiveTab('mojo')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-medium text-sm transition-colors ${activeTab === 'mojo'
                                ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-300 border-t border-l border-r border-purple-500/30'
                                : 'text-nj-grey-400 hover:text-purple-300 hover:bg-purple-900/20'
                            }`}
                    >
                        <Bot size={16} />
                        Mojo
                    </button>
                </div>
            </div>

            {/* Chat Tab Content */}
            {activeTab === 'chat' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Channel channel={channel}>
                        <Window>
                            <MessageList disableDateSeparator />
                            <MessageInput />
                        </Window>
                    </Channel>
                </div>
            )}

            {/* Mojo Tab Content */}
            {activeTab === 'mojo' && (
                <>
                    {/* Mojo Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {mojoMessages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center px-6">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                                    <Sparkles size={28} className="text-purple-400" />
                                </div>
                                <h3 className="text-white font-semibold mb-2">No Mojo conversations yet</h3>
                                <p className="text-nj-grey-400 text-sm">
                                    Ask Mojo anything! He&apos;s sarcastic, but helpful... mostly.
                                </p>
                            </div>
                        ) : (
                            mojoMessages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.isFromMojo ? 'justify-start' : 'justify-end'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${msg.isFromMojo
                                            ? 'bg-gradient-to-br from-purple-600/30 to-pink-600/30 border border-purple-500/30'
                                            : 'bg-nj-grey-800'
                                            }`}
                                    >
                                        {!msg.isFromMojo && (
                                            <p className="text-xs text-nj-grey-400 mb-1">{msg.userName}</p>
                                        )}
                                        <p className="text-white text-sm whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 border border-purple-500/30 rounded-2xl px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></span>
                                        </div>
                                        <span className="text-purple-300 text-xs">Mojo is thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Mojo Input */}
                    <div className="p-4 border-t border-nj-grey-800">
                        <div className="flex items-center gap-2 bg-nj-grey-900 rounded-full px-4 py-2 border border-nj-grey-700 focus-within:border-purple-500 transition-colors">
                            <span className="text-purple-400 text-sm font-medium">@mojo</span>
                            <input
                                type="text"
                                value={mojoInput}
                                onChange={(e) => setMojoInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask something..."
                                className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-nj-grey-500"
                            />
                            <button
                                onClick={sendMojoMessage}
                                disabled={!mojoInput.trim()}
                                className="w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-500 disabled:bg-nj-grey-700 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                            >
                                <Send size={14} className="text-white" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ChatSidebar;
