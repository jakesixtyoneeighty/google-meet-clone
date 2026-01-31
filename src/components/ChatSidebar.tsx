'use client';
import { X, MessageSquare } from 'lucide-react';
import { type Channel as ChannelType } from 'stream-chat';
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
}

const ChatSidebar = ({ isOpen, onClose, channel }: ChatSidebarProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed right-0 top-0 h-full w-96 bg-nj-grey-950 border-l border-nj-grey-800 z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-nj-grey-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-nj-red to-orange-500 flex items-center justify-center shadow-red-glow">
                        <MessageSquare size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-white text-lg">Chat</h2>
                        <p className="text-xs text-nj-grey-400">Type @mojo to ask the assistant</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full hover:bg-nj-grey-800 flex items-center justify-center transition-colors"
                >
                    <X size={18} className="text-nj-grey-400" />
                </button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Channel channel={channel}>
                    <Window>
                        <MessageList disableDateSeparator />
                        <MessageInput />
                    </Window>
                </Channel>
            </div>
        </div>
    );
};

export default ChatSidebar;
