import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Globe } from 'lucide-react';

const languages = [
    { code: 'es', name: 'Español', flagCode: 'es', dir: 'ltr' },
    { code: 'en', name: 'English', flagCode: 'gb', dir: 'ltr' },
    { code: 'fr', name: 'Français', flagCode: 'fr', dir: 'ltr' },
    { code: 'ar', name: 'العربية (Maghreb)', flagCode: 'ma', dir: 'rtl' },
    { code: 'zh', name: '中文', flagCode: 'cn', dir: 'ltr' },
    { code: 'ur', name: 'اردو', flagCode: 'pk', dir: 'rtl' },
    { code: 'ru', name: 'Русский', flagCode: 'ru', dir: 'ltr' },
    { code: 'pt', name: 'Português', flagCode: 'pt', dir: 'ltr' },
    { code: 'wo', name: 'Wolof (Senegal)', flagCode: 'sn', dir: 'ltr' },
    { code: 'bm', name: 'Bambara (Mali)', flagCode: 'ml', dir: 'ltr' }
];

export const LanguageSelector: React.FC = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    const changeLanguage = (lang: typeof languages[0]) => {
        i18n.changeLanguage(lang.code);
        document.documentElement.dir = lang.dir;
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-2 py-1.5 text-slate-500 hover:text-primary transition-all cursor-pointer group"
                title="Cambiar idioma / Change language"
            >
                <Globe size={16} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                    {currentLang.code}
                </span>
                <ChevronDown size={12} className={`transition-transform opacity-50 group-hover:opacity-100 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-44 bg-slate-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 py-1.5 z-50 overflow-hidden">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => changeLanguage(lang)}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-white/10 transition-colors ${i18n.language === lang.code ? 'text-primary bg-primary/10 font-semibold' : 'text-slate-300'}`}
                            >
                                <img
                                    src={`https://flagcdn.com/w20/${lang.flagCode}.png`}
                                    alt={lang.name}
                                    className="w-5 h-auto rounded-sm"
                                />
                                <span className="text-xs">{lang.name}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
