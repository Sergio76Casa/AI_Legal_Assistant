"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useChat } from "@/context/ChatContext";

export default function Hero() {
    const t = useTranslations('Hero');
    const { setIsOpen, setInitialQuery } = useChat();
    const [query, setQuery] = useState("");

    const handleSearch = () => {
        if (!query.trim()) return;
        setInitialQuery(query);
        setIsOpen(true);
        setQuery("");
    };

    return (
        <section className="relative w-full py-20 md:py-32 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
            {/* Background Elements (Glassmorphism blobs) */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-green/5 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl -z-10" />

            <h1 className="font-serif text-4xl md:text-6xl font-bold text-brand-green mb-6 tracking-tight">
                {t('title')} <br />
                <span className="italic text-brand-gold">{t('titleHighlight')}</span> {t('titleSuffix')}
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-12 font-light">
                {t('subtitle')}
            </p>

            {/* Smart Search Bar */}
            <div className="relative w-full max-w-2xl group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="h-6 w-6 text-brand-gold" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder={t('searchPlaceholder')}
                    className="w-full py-4 pl-14 pr-6 rounded-full border border-gray-200 bg-white/80 backdrop-blur-sm shadow-xl text-lg text-brand-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                />
                <div className="absolute inset-y-0 right-2 flex items-center">
                    <button
                        onClick={handleSearch}
                        className="bg-brand-green text-white px-6 py-2 rounded-full hover:bg-opacity-90 transition-all font-medium text-sm"
                    >
                        {t('searchButton')}
                    </button>
                </div>
            </div>
        </section>
    );
}
