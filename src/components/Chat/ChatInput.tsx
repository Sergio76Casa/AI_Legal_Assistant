import React, { FormEvent } from 'react';
import { Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (e: FormEvent) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSubmit }) => {
    const { t } = useTranslation();
    return (
        <div className="p-4 bg-slate-900/80 border-t border-white/10">
            <form onSubmit={onSubmit} className="relative flex items-center">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={t('hero.search_placeholder')}
                    className="w-full py-4 pl-6 pr-14 bg-white/5 border border-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all placeholder:text-slate-500 text-white"
                />
                <button
                    type="submit"
                    disabled={!value.trim()}
                    className="absolute right-2 p-2 bg-primary text-slate-900 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
            <p className="text-center text-[10px] text-slate-600 mt-3">{t('chat.disclaimer')}</p>
        </div>
    );
};
