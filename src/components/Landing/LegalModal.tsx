import { useEffect } from 'react';
import { X, Shield, Cookie, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LegalModalProps {
    type: 'privacy' | 'cookies' | 'legal' | null;
    onClose: () => void;
}

export function LegalModal({ type, onClose }: LegalModalProps) {
    const { t } = useTranslation();

    useEffect(() => {
        if (type) document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, [type]);

    if (!type) return null;

    const modalTitle = type === 'privacy'
        ? t('legal.privacy_title')
        : type === 'cookies'
            ? t('legal.cookies_title')
            : t('footer.links.legal_notice');

    const introText = type === 'privacy'
        ? t('modals.legal.privacy_intro')
        : type === 'cookies'
            ? t('modals.legal.cookies_intro')
            : t('modals.legal.legal_intro');

    // Get the array of sections from the translation file
    // We cast to any to avoid TS errors with arrays in t() if not using a specific type
    const content = t(`modals.legal.${type}_content`, { returnObjects: true }) as any[];

    const Icon = type === 'privacy'
        ? Shield
        : type === 'cookies'
            ? Cookie
            : ShieldCheck;

    const iconColorClass = type === 'privacy'
        ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
        : type === 'cookies'
            ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
            : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal */}
            <div className="relative bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl flex items-center justify-center border ${iconColorClass}`}>
                            <Icon size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {modalTitle}
                            </h2>
                            <p className="text-xs text-slate-500">{t('modals.common.update_date')}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(85vh-88px)] space-y-6">
                    <p className="text-sm text-slate-400 leading-relaxed">
                        {introText}
                    </p>

                    {Array.isArray(content) && content.map((section, i) => (
                        <div key={i} className="space-y-2">
                            <h3 className="text-sm font-bold text-white">{section.title}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">{section.body}</p>
                        </div>
                    ))}

                    {/* Footer note */}
                    <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <p className="text-[10px] text-slate-600">
                            {t('modals.common.query_contact', { email: type === 'privacy' ? 'privacy@legalflow.digital' : 'legal@legalflow.digital' })}
                        </p>
                        <button
                            onClick={onClose}
                            className="w-full md:w-auto px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
                        >
                            {t('modals.common.close')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
