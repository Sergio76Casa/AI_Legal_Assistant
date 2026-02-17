import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare, FileText, TrendingUp, AlertCircle, Crown } from 'lucide-react';

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
    const [usage, setUsage] = useState<UsageData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsage();
    }, [userId, refreshTrigger]);

    const fetchUsage = async () => {
        try {
            // 1. Obtener perfil para ver rol y tier manual
            const { data: profile } = await supabase
                .from('profiles')
                .select('role, subscription_tier, created_at')
                .eq('id', userId)
                .maybeSingle();

            // 2. Obtener suscripción de Stripe
            const { data: subscription } = await supabase
                .from('subscriptions')
                .select('tier, current_period_end')
                .eq('user_id', userId)
                .eq('status', 'active')
                .maybeSingle();

            // Prioridad: Rol Admin > Suscripción Stripe (si no es free) > Perfil Tier > Free
            let tier = 'free';

            if (profile?.role === 'superadmin' || profile?.role === 'admin') {
                tier = 'business';
            } else if (subscription && subscription.tier !== 'free') {
                tier = subscription.tier;
            } else if (profile?.subscription_tier) {
                tier = profile.subscription_tier;
            }

            if (tier === 'premium') tier = 'pro';

            // 3. Obtener uso actual
            const { data: usageData } = await supabase
                .from('usage_tracking')
                .select('chat_queries_count')
                .eq('user_id', userId)
                .gte('period_end', new Date().toISOString())
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            // 4. Contar documentos del usuario
            const { count: docsCount } = await supabase
                .from('documents')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            // 5. Obtener límites según el tier
            const { data: limits } = await supabase
                .rpc('get_tier_limits', { p_tier: tier })
                .maybeSingle();

            const typedLimits = limits as { max_chat_queries: number; max_documents: number } | null;

            // Si es admin, forzamos ilimitado aunque no esté en la tabla de límites
            const isAdmin = profile?.role === 'superadmin' || profile?.role === 'admin';

            setUsage({
                tier,
                chatQueriesCount: usageData?.chat_queries_count || 0,
                documentsCount: docsCount || 0,
                maxChatQueries: isAdmin ? -1 : (typedLimits?.max_chat_queries || 5),
                maxDocuments: isAdmin ? -1 : (typedLimits?.max_documents || 1),
                periodEnd: subscription?.current_period_end || profile?.created_at || new Date().toISOString(),
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
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

    const tierNames: Record<string, string> = {
        free: 'Gratuito',
        pro: 'Pro',
        business: 'Business',
    };

    const tierColors: Record<string, string> = {
        free: 'from-slate-500 to-slate-600',
        pro: 'from-emerald-500 to-emerald-600',
        business: 'from-purple-500 to-purple-600',
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            {/* Header con Plan Actual */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Tu Uso Actual</h2>
                    <p className="text-slate-600 text-sm">
                        Período actual hasta el {new Date(usage.periodEnd).toLocaleDateString('es-ES')}
                    </p>
                </div>
                <div className={`px-4 py-2 rounded-lg bg-gradient-to-r ${tierColors[usage.tier]} text-white font-semibold flex items-center gap-2`}>
                    <Crown className="w-5 h-5" />
                    Plan {tierNames[usage.tier]}
                </div>
            </div>

            {/* Alerta si está cerca del límite */}
            {isNearLimit && usage.tier === 'free' && (
                <div className={`mb-6 p-4 rounded-lg border-2 ${isAtLimit
                    ? 'bg-red-50 border-red-200'
                    : 'bg-amber-50 border-amber-200'
                    }`}>
                    <div className="flex items-start gap-3">
                        <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isAtLimit ? 'text-red-600' : 'text-amber-600'
                            }`} />
                        <div>
                            <p className={`font-semibold ${isAtLimit ? 'text-red-900' : 'text-amber-900'
                                }`}>
                                {isAtLimit ? '¡Has alcanzado tu límite!' : '¡Cerca del límite!'}
                            </p>
                            <p className={`text-sm mt-1 ${isAtLimit ? 'text-red-700' : 'text-amber-700'
                                }`}>
                                {isAtLimit
                                    ? 'Actualiza a Pro para continuar usando el servicio sin límites.'
                                    : 'Considera actualizar a Pro para obtener más consultas y documentos.'}
                            </p>
                            <button
                                onClick={onUpgradeClick}
                                className="mt-3 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
                            >
                                Ver Planes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Métricas de Uso */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Consultas al Chat */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500 rounded-lg">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-blue-900">Consultas al Chat IA</p>
                            <p className="text-xs text-blue-700">
                                {usage.maxChatQueries === -1
                                    ? `${usage.chatQueriesCount} consultas (Ilimitado)`
                                    : `${usage.chatQueriesCount} de ${usage.maxChatQueries}`}
                            </p>
                        </div>
                    </div>
                    {usage.maxChatQueries !== -1 && (
                        <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${chatPercentage >= 100
                                    ? 'bg-red-500'
                                    : chatPercentage >= 80
                                        ? 'bg-amber-500'
                                        : 'bg-blue-600'
                                    }`}
                                style={{ width: `${Math.min(chatPercentage, 100)}%` }}
                            />
                        </div>
                    )}
                </div>

                {/* Documentos */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-500 rounded-lg">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-emerald-900">Documentos Subidos</p>
                            <p className="text-xs text-emerald-700">
                                {usage.maxDocuments === -1
                                    ? `${usage.documentsCount} documentos (Ilimitado)`
                                    : `${usage.documentsCount} de ${usage.maxDocuments}`}
                            </p>
                        </div>
                    </div>
                    {usage.maxDocuments !== -1 && (
                        <div className="w-full bg-emerald-200 rounded-full h-3 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${docsPercentage >= 100
                                    ? 'bg-red-500'
                                    : docsPercentage >= 80
                                        ? 'bg-amber-500'
                                        : 'bg-emerald-600'
                                    }`}
                                style={{ width: `${Math.min(docsPercentage, 100)}%` }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Beneficios de Actualizar */}
            {usage.tier === 'free' && (
                <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200">
                    <div className="flex items-start gap-3">
                        <TrendingUp className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-2">
                                Desbloquea todo el potencial con Pro
                            </h3>
                            <ul className="space-y-1 text-sm text-slate-700">
                                <li>✅ 100 consultas al mes (vs 5 actuales)</li>
                                <li>✅ 20 documentos (vs 1 actual)</li>
                                <li>✅ Análisis avanzado de documentos</li>
                                <li>✅ Exportación a PDF/Word</li>
                                <li>✅ Soporte prioritario</li>
                            </ul>
                            <button
                                onClick={onUpgradeClick}
                                className="mt-4 px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                            >
                                Actualizar a Pro por €9.99/mes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
