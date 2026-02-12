"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useState, useTransition } from "react";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: "es", label: "Español" },
        { code: "en", label: "English" },
        { code: "fr", label: "Français" },
        { code: "ar", label: "العربية" },
        { code: "zh", label: "中文" },
    ];

    const onSelectChange = (nextLocale: string) => {
        startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
            setIsOpen(false);
        });
    };

    return (
        <div className="absolute top-6 right-6 z-50">
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all border border-gray-100 text-sm font-medium text-gray-700"
                >
                    <Globe className="w-4 h-4 text-brand-green" />
                    <span className="uppercase">{locale}</span>
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => onSelectChange(lang.code)}
                                className={`w-full text-left px-4 py-3 text-sm hover:bg-brand-surface transition-colors flex items-center justify-between ${locale === lang.code ? "text-brand-green font-semibold bg-brand-surface/50" : "text-gray-600"
                                    }`}
                                disabled={isPending}
                            >
                                {lang.label}
                                {locale === lang.code && <span className="w-2 h-2 rounded-full bg-brand-green"></span>}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
