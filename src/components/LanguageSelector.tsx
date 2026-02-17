import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

const languages = [
    { code: 'es', name: 'Español', flagCode: 'es', dir: 'ltr' },
    { code: 'en', name: 'English', flagCode: 'gb', dir: 'ltr' },
    { code: 'fr', name: 'Français', flagCode: 'fr', dir: 'ltr' },
    { code: 'ar', name: 'العربية (Maghreb)', flagCode: 'ma', dir: 'rtl' },
    { code: 'zh', name: '中文', flagCode: 'cn', dir: 'ltr' },
    { code: 'ur', name: 'اردو', flagCode: 'pk', dir: 'rtl' }
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
                className="flex items-center gap-1.5 px-2 py-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all"
                title="Cambiar idioma / Change language"
            >
                <img
                    src={`https://flagcdn.com/w20/${currentLang.flagCode}.png`}
                    alt={currentLang.name}
                    className="w-5 h-auto rounded-sm"
                />
                <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 overflow-hidden">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => changeLanguage(lang)}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-slate-50 transition-colors ${i18n.language === lang.code ? 'text-emerald-700 bg-emerald-50/50 font-semibold' : 'text-slate-600'}`}
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
