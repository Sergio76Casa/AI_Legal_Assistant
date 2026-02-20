import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    Users,
    Link as LinkIcon,
    Copy,
    Check,
    TrendingUp,
    DollarSign,
    AlertCircle,
    Loader2,
    Edit3,
    Banknote
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AffiliateData {
    id: string;
    affiliate_code: string;
    status: 'pending' | 'active';
    total_earned: number;
    created_at: string;
}

const COMMISSION_RATE = 0.20; // 20% fijo
const MIN_PAYOUT = 50; // Umbral mínimo en €

export const AffiliatePanel: React.FC = () => {
    const { t } = useTranslation();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [copied, setCopied] = useState(false);
    const [customizing, setCustomizing] = useState(false);
    const [newCode, setNewCode] = useState('');
    const [savingCode, setSavingCode] = useState(false);
    const [payoutRequested, setPayoutRequested] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Simulated data — replace with real queries when referral_conversions table exists
    const [stats] = useState({ activeClients: 0, clicks: 0, pendingBalance: 0 });

    useEffect(() => {
        const loadData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                const { data: prof } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                setProfile(prof);

                const { data: aff } = await supabase
                    .from('affiliates')
                    .select('*')
                    .eq('user_id', user.id)
                    .maybeSingle();
                setAffiliate(aff);
            }
            setLoading(false);
        };
        loadData();
    }, []);

    const generateDefaultCode = (name: string) => {
        const initials = name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 3);
        const random = Math.floor(1000 + Math.random() * 9000);
        return `${initials}${random}`;
    };

    const handleJoin = async () => {
        if (!user || !profile) return;
        setJoining(true);
        setError(null);
        try {
            const defaultCode = generateDefaultCode(profile.username || user.email.split('@')[0]);
            const { data, error: joinErr } = await supabase
                .from('affiliates')
                .insert({
                    user_id: user.id,
                    affiliate_code: defaultCode,
                    status: 'active'
                })
                .select()
                .single();
            if (joinErr) throw joinErr;
            setAffiliate(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setJoining(false);
        }
    };

    const handleCopy = () => {
        if (!affiliate) return;
        const url = `https://legalflow.digital?ref=${affiliate.affiliate_code}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSaveCustomCode = async () => {
        if (!affiliate || !newCode.trim()) return;
        setSavingCode(true);
        setError(null);
        try {
            const cleanCode = newCode.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
            const { error: updateErr } = await supabase
                .from('affiliates')
                .update({ affiliate_code: cleanCode })
                .eq('id', affiliate.id);
            if (updateErr) {
                if (updateErr.code === '23505') throw new Error('Este código ya está en uso. Prueba con otro.');
                throw updateErr;
            }
            setAffiliate({ ...affiliate, affiliate_code: cleanCode });
            setCustomizing(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSavingCode(false);
        }
    };

    const handleRequestPayout = () => {
        // TODO: Connect to Stripe payout or notification system
        setPayoutRequested(true);
        setTimeout(() => setPayoutRequested(false), 4000);
    };

    const canRequestPayout = (affiliate?.total_earned ?? 0) >= MIN_PAYOUT;

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="animate-spin text-[#13ecc8]" size={40} />
            </div>
        );
    }

    // ── ESTADO A: No es afiliado aún ──
    if (!affiliate) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-12 text-center text-white relative overflow-hidden shadow-2xl border border-white/5">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#13ecc8]/10 rounded-full blur-[150px] -mr-48 -mt-48"></div>

                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-[#13ecc8]/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-[#13ecc8]/20">
                            <TrendingUp size={40} className="text-[#13ecc8]" />
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                            Programa de Partners
                        </h1>

                        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Gana comisiones recurrentes recomendando la tecnología líder en extranjería a otros profesionales.
                        </p>

                        <div className="grid md:grid-cols-3 gap-6 mb-12 text-left">
                            {[
                                { title: '20%', desc: 'Comisión Recurrente' },
                                { title: '30 días', desc: 'Ventana de Atribución' },
                                { title: '50€', desc: 'Umbral mínimo de pago' }
                            ].map((feat, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                                    <div className="text-2xl font-bold text-[#13ecc8] mb-1">{feat.title}</div>
                                    <div className="text-sm text-slate-400">{feat.desc}</div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleJoin}
                            disabled={joining}
                            className="px-10 py-4 bg-[#13ecc8] hover:brightness-110 text-slate-900 text-lg font-bold rounded-xl transition-all shadow-lg shadow-[#13ecc8]/20 active:scale-95 flex items-center gap-3 mx-auto"
                        >
                            {joining ? <Loader2 className="animate-spin" /> : <TrendingUp size={24} />}
                            Unirme al Programa
                        </button>

                        {error && (
                            <div className="mt-4 text-red-400 text-sm flex items-center justify-center gap-2">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ── ESTADO B: Dashboard de Afiliado Activo ──
    const balance = affiliate.total_earned;

    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <TrendingUp size={24} className="text-primary" />
                        Panel de Afiliado
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Hola, {profile?.username || 'Partner'} · Comisión fija del {COMMISSION_RATE * 100}%</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-fit ${affiliate.status === 'active' ? 'bg-[#13ecc8]/10 text-[#13ecc8] border border-[#13ecc8]/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                    {affiliate.status === 'active' ? '● Activo' : '● Pendiente'}
                </span>
            </header>

            {/* ── ROW 1: Saldo + Clientes ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Saldo Acumulado */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>

                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                                <DollarSign size={20} className="text-primary" />
                            </div>
                            <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-widest">{t('affiliate.balance_title', { defaultValue: 'Saldo Acumulado' })}</h3>
                        </div>
                        <div className="text-5xl font-black text-primary tracking-tighter mb-2">
                            {balance.toFixed(2)}€
                        </div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                            Umbral de cobro: {MIN_PAYOUT}€ · Liquidación vía Stripe
                        </p>
                    </div>

                    <button
                        onClick={handleRequestPayout}
                        disabled={!canRequestPayout || payoutRequested}
                        className={`mt-8 w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all
                            ${canRequestPayout && !payoutRequested
                                ? 'bg-primary text-slate-900 hover:brightness-110 shadow-lg shadow-primary/20 cursor-pointer active:scale-95'
                                : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'}`}
                    >
                        {payoutRequested ? (
                            <>
                                <Check size={16} />
                                Solicitud enviada ✓
                            </>
                        ) : (
                            <>
                                <Banknote size={16} />
                                {canRequestPayout ? 'Solicitar Pago' : `Faltan ${(MIN_PAYOUT - balance).toFixed(2)}€ para cobrar`}
                            </>
                        )}
                    </button>
                </div>

                {/* Clientes Activos */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>

                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                <Users size={20} className="text-blue-400" />
                            </div>
                            <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-widest">{t('affiliate.active_clients', { defaultValue: 'Clientes Activos' })}</h3>
                        </div>
                        <div className="text-5xl font-black text-white tracking-tighter mb-2">
                            {stats.activeClients}
                        </div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                            Suscriptores de pago referidos
                        </p>
                    </div>

                    {/* Mini Stats */}
                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <div className="text-xl font-black text-white">{stats.clicks}</div>
                            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Clics</div>
                        </div>
                        <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                            <div className="text-xl font-black text-primary">{(COMMISSION_RATE * 100).toFixed(0)}%</div>
                            <div className="text-[10px] text-primary/40 font-black uppercase tracking-widest">Comisión</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── ROW 2: Enlace Único ── */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-slate-800 rounded-lg border border-white/10">
                            <LinkIcon size={18} className="text-primary" />
                        </div>
                        <h3 className="font-black text-white text-[10px] uppercase tracking-widest">Tu Enlace de Afiliado</h3>
                    </div>

                    <div className="flex flex-col md:flex-row items-stretch gap-4">
                        <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-4 font-mono text-sm text-primary truncate select-all flex items-center">
                            legalflow.digital?ref={affiliate.affiliate_code}
                        </div>
                        <button
                            onClick={handleCopy}
                            className={`px-8 py-4 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-3 justify-center min-w-[150px]
                                ${copied
                                    ? 'bg-primary text-slate-900 shadow-lg shadow-primary/20'
                                    : 'bg-white/5 text-slate-400 hover:text-primary hover:bg-white/10 border border-white/10'}`}
                        >
                            {copied ? <><Check size={16} /> ¡Copiado!</> : <><Copy size={16} /> Copiar Enlace</>}
                        </button>
                    </div>

                    {!customizing ? (
                        <button
                            onClick={() => {
                                setNewCode(affiliate.affiliate_code);
                                setCustomizing(true);
                            }}
                            className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary flex items-center gap-2 transition-colors"
                        >
                            <Edit3 size={12} /> Personalizar código
                        </button>
                    ) : (
                        <div className="mt-6 p-6 bg-white/5 rounded-2xl border border-white/10 animate-in slide-in-from-top-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Introduce tu código personalizado:</label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-primary/50 font-bold"
                                    value={newCode}
                                    onChange={(e) => setNewCode(e.target.value)}
                                    placeholder="MI-CODIGO"
                                />
                                <button
                                    onClick={handleSaveCustomCode}
                                    disabled={savingCode}
                                    className="px-6 py-3 bg-primary text-slate-900 text-xs font-black uppercase tracking-widest rounded-xl hover:brightness-110 disabled:opacity-50 transition-all active:scale-95"
                                >
                                    {savingCode ? <Loader2 size={14} className="animate-spin" /> : 'Guardar'}
                                </button>
                                <button
                                    onClick={() => setCustomizing(false)}
                                    className="px-4 py-3 text-xs font-bold text-slate-500 hover:text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                            {error && <p className="mt-3 text-[10px] text-red-400 font-bold uppercase">{error}</p>}
                        </div>
                    )}
                </div>

                <div className="bg-white/[0.02] border-t border-white/5 p-4 px-8">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 flex items-center gap-3">
                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                        💡 Cookie de atribución: 30 días. Los referidos se guardan al registrarse.
                    </p>
                </div>
            </div>

            {/* ── ROW 3: Quick Info ── */}
            <div className="p-5 bg-slate-900/30 rounded-2xl border border-white/5 flex items-start gap-4">
                <AlertCircle size={18} className="text-slate-600 mt-0.5 shrink-0" />
                <div>
                    <h4 className="font-bold text-slate-400 text-sm mb-1">¿Cómo funciona?</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        Comparte tu enlace → Un profesional se registra y elige un plan de pago → Ganas el <span className="text-[#13ecc8] font-bold">20%</span> de su suscripción cada mes.
                        Los pagos se procesan vía Stripe entre el 1 y 5 de cada mes cuando superes los {MIN_PAYOUT}€.
                    </p>
                </div>
            </div>
        </div>
    );
};
