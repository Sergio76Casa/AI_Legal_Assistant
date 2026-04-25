import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare, FileText, TrendingUp, AlertCircle, Crown, Rocket } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PLAN_IDS, getPlanMetadata } from '../lib/constants/plans';
import { useAppSettings } from '../lib/AppSettingsContext';
import { cn } from '../lib/utils';

interface UsageData {
    tier: string;
    chatQueriesCount: number;
    documentsCount: number;
    maxChatQueries: number;
    maxDocuments: number;
    periodEnd: string;
}

interface UsageDashboardProps {
    userId: string;
    onUpgradeClick?: () => void;
    refreshTrigger?: number;
}

export const UsageDashboard: React.FC<UsageDashboardProps> = ({ userId, onUpgradeClick, refreshTrigger }) => {
    const { t, i18n } = useTranslation();
    const { settings } = useAppSettings();
    const [usage, setUsage] = useState<UsageData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsage();
    }, [userId, refreshTrigger]);

    const fetchUsage = async () => {
        try {
            // Obtener perfil y su tenant_id
            const { data: profile } = await supabase
                .from('profiles')
                .select('role, tenant_id, created_at, subscription_tier')
                .eq('id', userId)
                .maybeSingle();

            // Obtener el plan del Tenant (Fuente Única de Verdad en Multi-Tenant)
            let tier = 'free';
            if (profile?.tenant_id) {
                const { data: tenant } = await supabase
                    .from('tenants')
                    .select('plan')
                    .eq('id', profile.tenant_id)
                    .maybeSingle();

                if (tenant?.plan) {
                    tier = tenant.plan;
                }
            }

            // Fallback o override para Superadmins y cuentas Business -> Enterprise
            if (profile?.role === 'superadmin' || tier === 'business' || profile?.subscription_tier === 'business') {
                tier = PLAN_IDS.ENTERPRISE;
            }

            if (tier === 'premium') tier = 'pro';

            const { data: usageData } = await supabase
                .from('usage_tracking')
                .select('chat_queries_count')
                .eq('user_id', userId)
                .gte('period_end', new Date().toISOString())
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            const { count: docsCount } = await supabase
                .from('documents')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            const { data: limits } = await supabase
                .rpc('get_tier_limits', { p_tier: tier })
                .maybeSingle();

            const typedLimits = limits as { max_chat_queries: number; max_documents: number } | null;

            const isSuperAdmin = profile?.role === 'superadmin';

            setUsage({
                tier,
                chatQueriesCount: usageData?.chat_queries_count || 0,
                documentsCount: docsCount || 0,
                maxChatQueries: isSuperAdmin ? -1 : (typedLimits?.max_chat_queries || 50),
                maxDocuments: isSuperAdmin ? -1 : (typedLimits?.max_documents || 10),
                periodEnd: profile?.created_at || new Date().toISOString(),
            });
        } catch (error) {
            console.error('Error fetching usage:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!usage) return null;

    const chatPercentage = usage.maxChatQueries === -1
        ? 0
        : (usage.chatQueriesCount / usage.maxChatQueries) * 100;

    const docsPercentage = usage.maxDocuments === -1
        ? 0
        : (usage.documentsCount / usage.maxDocuments) * 100;

    const isNearLimit = chatPercentage > 80 || docsPercentage > 80;
    const isAtLimit = chatPercentage >= 100 || docsPercentage >= 100;


    return (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/10">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{t('usage.title')}</h2>
                    <p className="text-slate-400 text-sm">
                        {t('usage.period_until')} {new Date(usage.periodEnd).toLocaleDateString(i18n.language === 'es' ? 'es-ES' : 'en-US')}
                    </p>
                </div>
                <div className={cn(
                    "px-4 py-2 rounded-lg text-white font-semibold flex items-center gap-2 shadow-lg transition-all",
                    (usage.tier === PLAN_IDS.ENTERPRISE)
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                        : usage.tier === PLAN_IDS.BUSINESS 
                            ? "bg-primary/10 border border-primary/20 text-primary shadow-lg shadow-primary/10" 
                            : "bg-white/5 border border-white/10 text-slate-300"
                )}>
                    {usage.tier === PLAN_IDS.ENTERPRISE ? <Rocket className="w-4 h-4" /> : <Crown className="w-5 h-5 text-white/80" />}
                    <span className="uppercase tracking-wider">
                        {t('usage.plan')} {usage.tier === PLAN_IDS.ENTERPRISE ? 'ENTERPRISE' : getPlanMetadata(usage.tier, settings?.plan_names).commercialName}
                    </span>
                </div>
            </div>

            {/* Alert near limit */}
            {isNearLimit && usage.tier === PLAN_IDS.STARTER && (
                <div className={cn(
                    "mb-6 p-4 rounded-lg border",
                    isAtLimit ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'
                )}>
                    <div className="flex items-start gap-3">
                        <AlertCircle className={cn(
                            "w-5 h-5 flex-shrink-0 mt-0.5",
                            isAtLimit ? 'text-red-400' : 'text-amber-400'
                        )} />
                        <div>
                            <p className={cn(
                                "font-semibold",
                                isAtLimit ? 'text-red-300' : 'text-amber-300'
                            )}>
                                {isAtLimit ? t('usage.at_limit') : t('usage.near_limit')}
                            </p>
                            <p className={cn(
                                "text-sm mt-1",
                                isAtLimit ? 'text-red-400' : 'text-amber-400'
                            )}>
                                {isAtLimit ? t('usage.at_limit_desc') : t('usage.near_limit_desc')}
                            </p>
                            <button
                                onClick={onUpgradeClick}
                                className="mt-3 px-4 py-2 bg-primary text-slate-900 rounded-lg font-semibold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all text-sm"
                            >
                                {t('usage.view_plans')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Usage Metrics */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Chat Queries */}
                <div className="bg-blue-500/10 p-6 rounded-xl border border-blue-500/20">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                            <MessageSquare className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">{t('usage.chat_queries')}</p>
                            <p className="text-xs text-blue-300">
                                {usage.maxChatQueries === -1
                                    ? `${usage.chatQueriesCount} ${t('usage.queries')} (${t('usage.unlimited')})`
                                    : `${usage.chatQueriesCount} ${t('usage.of')} ${usage.maxChatQueries}`}
                            </p>
                        </div>
                    </div>
                    {usage.maxChatQueries !== -1 && (
                        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${chatPercentage >= 100
                                    ? 'bg-red-500'
                                    : chatPercentage >= 80
                                        ? 'bg-amber-500'
                                        : 'bg-blue-400'
                                    }`}
                                style={{ width: `${Math.min(chatPercentage, 100)}%` }}
                            />
                        </div>
                    )}
                </div>

                {/* Documents */}
                <div className="bg-primary/10 p-6 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary/20 rounded-lg border border-primary/30">
                            <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">{t('usage.documents_uploaded')}</p>
                            <p className="text-xs text-primary/70">
                                {usage.maxDocuments === -1
                                    ? `${usage.documentsCount} ${t('usage.documents_word')} (${t('usage.unlimited')})`
                                    : `${usage.documentsCount} ${t('usage.of')} ${usage.maxDocuments}`}
                            </p>
                        </div>
                    </div>
                    {usage.maxDocuments !== -1 && (
                        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${docsPercentage >= 100
                                    ? 'bg-red-500'
                                    : docsPercentage >= 80
                                        ? 'bg-amber-500'
                                        : 'bg-primary'
                                    }`}
                                style={{ width: `${Math.min(docsPercentage, 100)}%` }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Upgrade Benefits */}
            {usage.tier === PLAN_IDS.STARTER && (
                <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-xl border border-primary/20">
                    <div className="flex items-start gap-3">
                        <TrendingUp className="w-6 h-6 text-primary flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-white mb-2">
                                {t('usage.unlock_pro')}
                            </h3>
                            <ul className="space-y-1 text-sm text-slate-300">
                                {(t('usage.unlock_features', { returnObjects: true }) as string[]).map((feature, i) => (
                                    <li key={i}>✅ {feature}</li>
                                ))}
                            </ul>
                            <button
                                onClick={onUpgradeClick}
                                className="mt-4 px-6 py-2 bg-primary text-slate-900 rounded-lg font-semibold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all"
                            >
                                {t('usage.upgrade_pro_price')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
