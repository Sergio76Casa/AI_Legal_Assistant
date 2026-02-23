import { X, Zap, Crown, Rocket, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PLAN_IDS, getPlanMetadata } from '../lib/constants/plans';
import { useAppSettings } from '../lib/AppSettingsContext';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    limitType: 'chat_query' | 'upload_document';
    onSelectPlan?: (tier: 'pro' | 'business') => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
    isOpen,
    onClose,
    limitType,
    onSelectPlan,
}) => {
    const { t } = useTranslation();
    const { settings } = useAppSettings();
    if (!isOpen) return null;

    const starterMeta = getPlanMetadata(PLAN_IDS.STARTER, settings?.plan_names);
    const businessMeta = getPlanMetadata(PLAN_IDS.BUSINESS, settings?.plan_names);
    const enterpriseMeta = getPlanMetadata(PLAN_IDS.ENTERPRISE, settings?.plan_names);

    const limitMessages = {
        chat_query: {
            title: t('upgrade.at_limit_queries_title'),
            description: t('upgrade.at_limit_queries_desc'),
            free: `${starterMeta.maxQueries} ${t('upgrade.monthly_queries')}`,
            pro: `${businessMeta.maxQueries} ${t('upgrade.monthly_queries')}`,
            business: t('upgrade.unlimited_queries'),
        },
        upload_document: {
            title: t('upgrade.at_limit_docs_title'),
            description: t('upgrade.at_limit_docs_desc'),
            free: `${starterMeta.maxDocuments} ${t('upgrade.docs_limit')}`,
            pro: `${businessMeta.maxDocuments} ${t('upgrade.docs_limit')}`,
            business: t('upgrade.unlimited_docs'),
        },
    };

    const message = limitMessages[limitType];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" >
            <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200 border border-white/10">
                {/* Header */}
                <div className="relative p-6 border-b border-white/10">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-500/15 rounded-lg border border-amber-500/20">
                            <Zap className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{message.title}</h2>
                            <p className="text-slate-400 text-sm mt-1">{message.description}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-slate-300 mb-6">
                        Actualiza tu plan para continuar disfrutando de nuestros servicios sin interrupciones.
                    </p>

                    {/* Comparison */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        {/* Plan Pro (Comercial: Business) */}
                        <div className="border-2 border-primary/50 rounded-xl p-6 bg-primary/5 relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-slate-900 px-3 py-1 rounded-full text-xs font-semibold">
                                {t('pricing.recommended')}
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                                <Crown className="w-6 h-6 text-primary" />
                                <h3 className="text-xl font-bold text-white">{businessMeta.commercialName}</h3>
                            </div>
                            <div className="mb-4">
                                <span className="text-3xl font-bold text-white">€49</span>
                                <span className="text-slate-400">/mes</span>
                            </div>
                            <ul className="space-y-2 mb-6">
                                <li className="flex items-center gap-2 text-sm text-slate-300">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                    {message.pro}
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-300">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                    {t('upgrade.feature_stark')}
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-300">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                    {t('upgrade.feature_export')}
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-300">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                    {t('upgrade.feature_support_priority')}
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-300">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                    {t('upgrade.feature_history')}
                                </li>
                            </ul>
                            <button
                                onClick={() => {
                                    onSelectPlan?.('pro');
                                    onClose();
                                }}
                                className="w-full bg-primary text-slate-900 py-3 rounded-lg font-semibold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2"
                            >
                                {t('upgrade.action_upgrade')} {businessMeta.commercialName}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Plan Business (Comercial: Enterprise) */}
                        <div className="border-2 border-purple-500/30 rounded-xl p-6 bg-purple-500/5">
                            <div className="flex items-center gap-2 mb-4">
                                <Rocket className="w-6 h-6 text-purple-400" />
                                <h3 className="text-xl font-bold text-white">{enterpriseMeta.commercialName}</h3>
                            </div>
                            <div className="mb-4">
                                <span className="text-3xl font-bold text-white">€149</span>
                                <span className="text-slate-400">/mes</span>
                            </div>
                            <ul className="space-y-2 mb-6">
                                <li className="flex items-center gap-2 text-sm text-slate-300">
                                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                                    {message.business}
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-300">
                                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                                    {t('upgrade.feature_api')}
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-300">
                                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                                    {t('upgrade.feature_multiuser')}
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-300">
                                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                                    {t('upgrade.feature_support_24h')}
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-300">
                                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                                    {t('upgrade.feature_legal_hours')}
                                </li>
                            </ul>
                            <button
                                onClick={() => {
                                    onSelectPlan?.('business');
                                    onClose();
                                }}
                                className="w-full bg-white/10 text-white py-3 rounded-lg font-semibold hover:bg-white/15 border border-white/10 transition-all flex items-center justify-center gap-2"
                            >
                                {t('upgrade.action_upgrade')} {enterpriseMeta.commercialName}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-white/5 -mx-6 -mb-6 p-6 rounded-b-2xl border-t border-white/10">
                        <p className="text-sm text-slate-500 text-center">
                            💳 Pago seguro con Stripe • ✅ Cancela cuando quieras • 🔒 Datos protegidos
                        </p>
                    </div>
                </div>
            </div>
        </div >
    );
};
