'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Bot, Sparkles } from 'lucide-react';
import { type Channel as ChannelType, type MessageResponse, type Event } from 'stream-chat';

interface MojoPanelProps {
    isOpen: boolean;
    onClose: () => void;
    channel: ChannelType;
}

const MOJO_USER_ID = 'mojo-assistant';

interface MojoMessage {
    id: string;
    text: string;
    isFromMojo: boolean;
    userName: string;
    timestamp: Date;
}

const MojoPanel = ({ isOpen, onClose, channel }: MojoPanelProps) => {
    const [messages, setMessages] = useState<MojoMessage[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Filter messages for Mojo conversations
    const filterMojoMessages = useCallback((allMessages: MessageResponse[]): MojoMessage[] => {
        const filtered: MojoMessage[] = [];

        allMessages.forEach((msg, index) => {
            const text = msg.text || '';
            const isFromMojo = msg.user?.id === MOJO_USER_ID;
            const mentionsMojo = text.toLowerCase().includes('@mojo');

            // Include if it's from Mojo or mentions Mojo
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

    // Load and watch messages
    useEffect(() => {
        if (!channel || !isOpen) return;

        const loadMessages = async () => {
            try {
                const state = await channel.watch();
                if (state.messages) {
                    setMessages(filterMojoMessages(state.messages));
                }
            } catch (error) {
                console.error('Failed to load messages:', error);
            }
        };

        loadMessages();

        // Listen for new messages
        const handleNewMessage = (event: Event) => {
            if (event.message) {
                const msg = event.message;
                const text = msg.text || '';
                const isFromMojo = msg.user?.id === MOJO_USER_ID;
                const mentionsMojo = text.toLowerCase().includes('@mojo');

                if (isFromMojo || mentionsMojo) {
                    setMessages(prev => [...prev, {
                        id: msg.id || `msg-${Date.now()}`,
                        text: text,
                        isFromMojo,
                        userName: msg.user?.name || msg.user?.id || 'Unknown',
                        timestamp: new Date(msg.created_at || Date.now()),
                    }]);
                }

                // Clear typing indicator when Mojo responds
                if (isFromMojo) {
                    setIsTyping(false);
                }
            }
        };

        // Listen for typing indicators
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
    }, [channel, isOpen, filterMojoMessages]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Send message with @mojo prefix
    const sendMessage = async () => {
        if (!input.trim() || !channel) return;

        const messageText = input.startsWith('@mojo') ? input : `@mojo ${input}`;

        try {
            setIsTyping(true); // Optimistically show typing
            await channel.sendMessage({ text: messageText });
            setInput('');
        } catch (error) {
            console.error('Failed to send message:', error);
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed right-0 top-0 h-full w-96 bg-nj-grey-950 border-l border-nj-grey-800 z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-nj-grey-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-red-glow">
                        <Bot size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-white text-lg">Ask Mojo</h2>
                        <p className="text-xs text-nj-grey-400">Your sarcastic assistant</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full hover:bg-nj-grey-800 flex items-center justify-center transition-colors"
                >
                    <X size={18} className="text-nj-grey-400" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
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
                    messages.map((msg) => (
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

            {/* Input */}
            <div className="p-4 border-t border-nj-grey-800">
                <div className="flex items-center gap-2 bg-nj-grey-900 rounded-full px-4 py-2 border border-nj-grey-700 focus-within:border-purple-500 transition-colors">
                    <span className="text-purple-400 text-sm font-medium">@mojo</span>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask something..."
                        className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-nj-grey-500"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim()}
                        className="w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-500 disabled:bg-nj-grey-700 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    >
                        <Send size={14} className="text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MojoPanel;
