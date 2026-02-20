import React, { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { useChat } from '../lib/ChatContext';
import { useTranslation } from 'react-i18next';

export function Hero() {
    const { sendMessage } = useChat();
    const { t } = useTranslation();
    const [query, setQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            sendMessage(query);
            setQuery('');
        }
    };
    return (
        <section className="relative px-6 pt-16 pb-24 md:pt-32 md:pb-32 max-w-7xl mx-auto flex flex-col items-center text-center">
            {/* Subtle radial glow */}
            <div className="absolute inset-0 hero-gradient pointer-events-none"></div>

            {/* Trust badge */}
            <div className="relative inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-xs font-medium text-primary tracking-wide uppercase">{t('hero.verification_badge')}</span>
            </div>

            {/* Title */}
            <h1 className="relative font-serif text-4xl md:text-6xl lg:text-7xl text-white tracking-tight leading-[1.1] mb-6 max-w-4xl animate-fade-in delay-75">
                {t('hero.title')}
            </h1>

            {/* Subtitle */}
            <p className="relative text-lg md:text-xl text-slate-400 max-w-2xl mb-12 font-light leading-relaxed animate-fade-in delay-100">
                {t('hero.subtitle')}
            </p>

            {/* AI Search */}
            <form onSubmit={handleSearch} className="relative w-full max-w-2xl group animate-fade-in delay-150">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center bg-white/5 rounded-full ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-primary/30 focus-within:shadow-[0_0_30px_rgba(19,236,200,0.1)] transition-all duration-300 backdrop-blur-sm">
                    <div className="pl-6 text-slate-500">
                        <Search className="w-6 h-6" />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('hero.search_placeholder')}
                        className="w-full py-5 px-4 bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 text-lg outline-none"
                    />
                    <button type="submit" className="mr-2 p-3 bg-primary rounded-full text-slate-900 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </form>

            {/* Stats */}
            <div className="relative mt-12 grid grid-cols-3 gap-6 max-w-xl mx-auto animate-fade-in delay-200">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-2">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-lg font-bold text-white">{t('hero.stats.documents')}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{t('hero.stats.processed')}</p>
                </div>

                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-2">
                        <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-lg font-bold text-white">{t('hero.stats.availability')}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{t('hero.stats.assistance')}</p>
                </div>

                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-2">
                        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <p className="text-lg font-bold text-white">{t('hero.stats.response')}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{t('hero.stats.speed')}</p>
                </div>
            </div>

            {/* Social proof */}
            <div className="relative mt-8 flex items-center justify-center gap-3 text-sm text-slate-500 font-medium animate-fade-in delay-250">
                <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                        <img
                            key={i}
                            src={`/avatars/avatar${i}.png`}
                            alt={`User ${i}`}
                            className="w-10 h-10 rounded-full border-2 border-slate-900 ring-1 ring-white/10 object-cover shadow-sm"
                        />
                    ))}
                </div>
                <span>{t('hero.social_proof')}</span>
            </div>
        </section>
    );
}
