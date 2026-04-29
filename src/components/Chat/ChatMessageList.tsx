import React from 'react';
import { FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../../lib/utils';
import type { Message } from '../../hooks/useChatLogic';

interface ChatMessageListProps {
    messages: Message[];
    isTyping: boolean;
    messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({ messages, isTyping, messagesEndRef }) => (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0b1120]">
        {messages.map((msg) => (
            <div
                key={msg.id}
                className={cn('flex w-full', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
                <div className={cn(
                    'max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm',
                    msg.role === 'user'
                        ? 'bg-primary text-slate-900 rounded-tr-none'
                        : 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-none'
                )}>
                    {msg.role === 'user' ? (
                        msg.content
                    ) : (
                        <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-li:my-0.5 prose-ul:my-1 prose-strong:text-white">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                    )}

                    {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-white/10 flex flex-wrap gap-x-3 gap-y-1">
                            {msg.sources.map((source, idx) => (
                                <span
                                    key={idx}
                                    className="flex items-center gap-1 text-[10px] text-slate-500 font-medium"
                                    title={`Similitud: ${source.similarity}%`}
                                >
                                    <FileText size={9} className="text-primary/50" />
                                    {source.title
                                        .replace(/^\d+_/, '')
                                        .replace(/\s*\(\d+\/\d+\)$/, '')
                                        .replace(/\.pdf$/i, '')
                                        .replace(/_/g, ' ')
                                        .trim()
                                        .substring(0, 40)
                                    }
                                    {source.similarity > 0 && (
                                        <span className="text-primary/50">· {source.similarity}%</span>
                                    )}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        ))}

        {isTyping && (
            <div className="flex justify-start animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="bg-white/5 text-slate-200 border border-white/10 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                </div>
            </div>
        )}

        <div ref={messagesEndRef} />
    </div>
);
