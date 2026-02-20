import { useEffect } from 'react';
import { X, FileText, LayoutGrid, Building2, TrendingUp, Cpu, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ServicesModalProps {
    type: 'documents' | 'templates' | 'organization' | 'affiliates' | null;
    onClose: () => void;
}

const colorMap = {
    documents: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    templates: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    organization: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    affiliates: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
};

const iconMap = {
    documents: FileText,
    templates: LayoutGrid,
    organization: Building2,
    affiliates: TrendingUp
};

export function ServicesModal({ type, onClose }: ServicesModalProps) {
    const { t } = useTranslation();

    useEffect(() => {
        if (type) document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, [type]);

    if (!type) return null;

    const Icon = iconMap[type];
    const colorClass = colorMap[type];

    // Get translations
    const title = t(`modals.services.${type}.title`);
    const description = t(`modals.services.${type}.desc`);
    const features = t(`modals.services.${type}.features`, { returnObjects: true }) as any[];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal */}
            <div className="relative bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl flex items-center justify-center border ${colorClass}`}>
                            <Icon size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{title}</h2>
                            <p className="text-xs text-slate-500">{t('modals.services.tagline')}</p>
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
                <div className="p-6 overflow-y-auto max-h-[calc(85vh-88px)] space-y-8">
                    <div className="space-y-4">
                        <p className="text-slate-400 leading-relaxed">
                            {description}
                        </p>
                    </div>

                    <div className="grid gap-6">
                        {Array.isArray(features) && features.map((feature, i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                                <div className="mt-1">
                                    <Cpu size={18} className="text-primary/60" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white mb-1">{feature.title}</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer note */}
                    <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-primary/60">
                            <Shield size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider italic">{t('modals.services.certified')}</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full md:w-auto px-8 py-3 bg-primary text-slate-900 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
                        >
                            {t('modals.common.understand')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
