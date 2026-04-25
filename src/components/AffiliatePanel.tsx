import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, AlertCircle, X, Loader2, Sparkles, HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';

// Hooks
import { useAffiliateStats } from '../hooks/affiliate/useAffiliateStats';
import { useAffiliateActions } from '../hooks/affiliate/useAffiliateActions';

// Sub-components
import { AffiliateOnboarding } from './Affiliate/AffiliateOnboarding';
import { StatsGrid } from './Affiliate/StatsGrid';
import { PerformanceAnalytics } from './Affiliate/PerformanceAnalytics';
import { AffiliateLinkManager } from './Affiliate/AffiliateLinkManager';
import { ReferralHistory } from './Affiliate/ReferralHistory';
import { AffiliateRanking } from './Affiliate/AffiliateRanking';
import { ViewHeader } from './Admin/ViewHeader';

export const AffiliatePanel: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [affiliate, setAffiliate] = useState<any>(null);
    const [initialLoading, setInitialLoading] = useState(true);

    // Hooks
    const { loading: statsLoading, stats, referrals, chartData, refreshStats } = useAffiliateStats(affiliate?.id);
    const { 
        joining, updating, copied, error, setError, 
        handleJoin, handleUpdateCode, handleCopyLink 
    } = useAffiliateActions(user?.id, profile);

    useEffect(() => {
        const init = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                setUser(authUser);
                const { data: prof } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
                setProfile(prof);
                const { data: aff } = await supabase.from('affiliates').select('*').eq('user_id', authUser.id).maybeSingle();
                setAffiliate(aff);
            }
            setInitialLoading(false);
        };
        init();
    }, []);

    const onJoinClick = async () => {
        const newAff = await handleJoin();
        if (newAff) setAffiliate(newAff);
    };

    const onUpdateAffiliateCode = async (newCode: string) => {
        const success = await handleUpdateCode(affiliate.id, newCode);
        if (success) {
            setAffiliate({ ...affiliate, affiliate_code: newCode.toUpperCase() });
        }
        return success;
    };

    if (initialLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-40 gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Sincronizando Red Stark...</span>
            </div>
        );
    }

    if (!affiliate) {
        return <AffiliateOnboarding onJoin={onJoinClick} joining={joining} error={error} />;
    }

    return (
        <div className="page-enter space-y-12">
            <ViewHeader 
                icon={TrendingUp} 
                title="Programa de afiliados" 
                subtitle={`Identificador de Nodo: ${affiliate.id.substring(0, 8)}`}
                badge={affiliate.status === 'active' ? 'PROTOCOLO ACTIVO' : 'VALIDACIÓN PENDIENTE'}
                badgeColor={affiliate.status === 'active' ? 'primary' : 'amber'}
            />

            <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4">
                <AnimatePresence>
                    {/* 1. Commission Notification */}
                    {profile?.last_notification && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-primary/10 border border-primary/20 rounded-3xl p-6 flex items-center justify-between gap-4 text-primary relative overflow-hidden group mb-8"
                        >
                            <div className="absolute inset-y-0 left-0 w-1 bg-primary" />
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <Sparkles size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-black uppercase tracking-widest">¡Protocolo de Pago Activado!</p>
                                    <p className="text-xs text-primary/70 font-bold">{profile.last_notification}</p>
                                </div>
                            </div>
                            <button
                                onClick={async () => {
                                    await supabase.from('profiles').update({ last_notification: null }).eq('id', user.id);
                                    setProfile({ ...profile, last_notification: null });
                                }}
                                className="p-2 text-primary/40 hover:text-primary transition-colors hover:bg-primary/10 rounded-xl"
                            >
                                <X size={20} />
                            </button>
                        </motion.div>
                    )}

                    {/* 2. Verification Banner */}
                    {affiliate.status === 'pending' && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-center gap-4 text-amber-500 group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20 group-hover:rotate-12 transition-transform">
                                <AlertCircle size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest">Estado: Verificación Stark en Curso</p>
                                <p className="text-[10px] text-amber-500/70 font-bold uppercase tracking-tighter mt-1">Tu cuenta será plenamente funcional en las próximas 24-48 horas después del análisis de seguridad.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 1. Stats Grid */}
                <StatsGrid stats={stats} />

                {/* 2. Charts & Link Management */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                    <div className="lg:col-span-2">
                        <PerformanceAnalytics data={chartData} />
                    </div>
                    <div className="lg:col-span-1 h-full">
                        <AffiliateLinkManager 
                            affiliateCode={affiliate.affiliate_code}
                            onUpdateCode={onUpdateAffiliateCode}
                            onCopy={() => handleCopyLink(affiliate.affiliate_code)}
                            copied={copied}
                            updating={updating}
                            error={error}
                        />
                    </div>
                </div>

                {/* 3. Ranking & Support */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8">
                        <ReferralHistory referrals={referrals} />
                    </div>
                    <div className="lg:col-span-4">
                        <AffiliateRanking />
                    </div>
                </div>

                {/* 4. Support Footer Card */}
                <div className="bg-[#0A0F1D]/40 backdrop-blur-2xl border border-white/5 rounded-[40px] p-10 lg:p-14 relative overflow-hidden group">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                        <div className="space-y-6">
                            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                                <HelpCircle size={28} className="text-indigo-400" />
                            </div>
                            <h4 className="text-2xl font-black text-white tracking-tight">Liquidación de Activos</h4>
                            <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                Tus comisiones activas se consolidan mensualmente. Las transferencias se ejecutan entre el <span className="text-white font-black">día 1 y 5</span> de cada ciclo fiscal Stark, siempre que el saldo supere los <span className="text-primary font-black">50.00€</span>.
                            </p>
                        </div>
                        <div className="flex flex-col justify-center items-center md:items-end">
                            <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/5 text-center md:text-right w-full max-w-sm relative group/inner">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/inner:rotate-45 transition-transform">
                                    <Sparkles size={40} className="text-primary" />
                                </div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 block">Próximo Pago Estimado</span>
                                <div className="text-4xl font-black text-white tracking-tighter tabular-nums">1.250,00€</div>
                                <div className="mt-4 text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-xl inline-block">
                                    Ciclo: Mayo 2026
                                </div>
                            </div>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};
