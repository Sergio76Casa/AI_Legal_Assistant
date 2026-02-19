import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    Users,
    Link as LinkIcon,
    Copy,
    Check,
    TrendingUp,
    DollarSign,
    ExternalLink,
    AlertCircle,
    Loader2,
    Edit3
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AffiliateData {
    id: string;
    affiliate_code: string;
    status: 'pending' | 'active';
    total_earned: number;
    created_at: string;
}

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
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                // Load Profile
                const { data: prof } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                setProfile(prof);

                // Load Affiliate Data
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
                    status: 'active' // Auto-active for now as per usual B2B flow, or 'pending' if manual review
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
        const url = `https://legalflow.digital/${affiliate.affiliate_code}`;
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

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="animate-spin text-emerald-500" size={40} />
            </div>
        );
    }

    // ESTADO A: No Afiliado
    if (!affiliate) {
        return (
            <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-500">
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 rounded-3xl p-12 text-center text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>

                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border border-emerald-500/30">
                            <TrendingUp size={40} className="text-emerald-400" />
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                            {t('affiliate.title')}
                        </h1>

                        <p className="text-xl text-emerald-100/80 max-w-2xl mx-auto mb-10 leading-relaxed">
                            {t('affiliate.description')}
                        </p>

                        <div className="grid md:grid-cols-3 gap-6 mb-12 text-left">
                            {[
                                { title: '30%', desc: 'Comisión Recurrente' },
                                { title: '30 días', desc: 'Atribución de Cookie' },
                                { title: 'Mensual', desc: 'Pagos Automáticos' }
                            ].map((feat, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
                                    <div className="text-2xl font-bold text-emerald-400 mb-1">{feat.title}</div>
                                    <div className="text-sm text-slate-300">{feat.desc}</div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleJoin}
                            disabled={joining}
                            className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-lg font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-3 mx-auto"
                        >
                            {joining ? <Loader2 className="animate-spin" /> : <TrendingUp size={24} />}
                            {t('affiliate.join_btn')}
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

    // ESTADO B: Afiliado Activo
    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{t('affiliate.dashboard_title')}</h1>
                    <p className="text-slate-500">Bienvenido al panel, {profile?.username || 'Socio'}</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${affiliate.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {affiliate.status === 'active' ? '● Activo' : '● Pendiente'}
                    </span>
                </div>
            </header>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Link Card */}
                <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 flex-1">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-slate-900 text-white rounded-lg">
                                <LinkIcon size={20} />
                            </div>
                            <h3 className="font-bold text-slate-900">{t('affiliate.your_link')}</h3>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm text-slate-600 truncate">
                                https://legalflow.digital/{affiliate.affiliate_code}
                            </div>
                            <button
                                onClick={handleCopy}
                                className={`p-3 rounded-xl transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                {copied ? <Check size={20} /> : <Copy size={20} />}
                            </button>
                        </div>

                        {!customizing ? (
                            <button
                                onClick={() => {
                                    setNewCode(affiliate.affiliate_code);
                                    setCustomizing(true);
                                }}
                                className="mt-4 text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1.5"
                            >
                                <Edit3 size={12} /> {t('affiliate.customize_code')}
                            </button>
                        ) : (
                            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 animate-in fade-in duration-200">
                                <label className="block text-xs font-bold text-slate-500 mb-2">{t('affiliate.customize_hint')}</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                        value={newCode}
                                        onChange={(e) => setNewCode(e.target.value)}
                                        placeholder="NUEVO-CODIGO"
                                    />
                                    <button
                                        onClick={handleSaveCustomCode}
                                        disabled={savingCode}
                                        className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50"
                                    >
                                        {savingCode ? <Loader2 size={14} className="animate-spin" /> : t('affiliate.save')}
                                    </button>
                                    <button
                                        onClick={() => setCustomizing(false)}
                                        className="px-3 py-2 text-xs font-bold text-slate-500"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                                {error && <p className="mt-2 text-[10px] text-red-500">{error}</p>}
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50 border-t border-slate-100 p-4 px-6">
                        <p className="text-xs text-slate-500 flex items-center gap-2">
                            <ExternalLink size={12} /> Envía este link a tus contactos o compártelo en redes sociales.
                        </p>
                    </div>
                </div>

                {/* Earnings Card */}
                <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-500 text-white rounded-lg border border-emerald-400">
                                <DollarSign size={20} />
                            </div>
                            <h3 className="font-bold">{t('affiliate.balance.title')}</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <span className="text-xs text-emerald-100/70 block mb-1 uppercase tracking-wider">{t('affiliate.balance.earned')}</span>
                                <div className="text-3xl font-bold">{affiliate.total_earned.toFixed(2)}€</div>
                            </div>
                            <div className="pt-4 border-t border-emerald-500/30">
                                <span className="text-xs text-emerald-100/70 block mb-1 uppercase tracking-wider">{t('affiliate.balance.pending')}</span>
                                <div className="text-xl font-bold">0.00€</div>
                            </div>
                        </div>
                    </div>

                    <p className="mt-6 text-[10px] text-emerald-100/60 leading-tight"> Los pagos se realizan entre el día 1 y 5 de cada mes a tu cuenta configurada.</p>
                </div>
            </div>

            {/* General Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: t('affiliate.stats.clicks'), value: '0', icon: <TrendingUp className="text-emerald-500" /> },
                    { label: t('affiliate.stats.registrations'), value: '0', icon: <Users className="text-blue-500" /> },
                    { label: t('affiliate.stats.paid_customers'), value: '0', icon: <Check className="text-amber-500" /> }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-slate-50 rounded-xl">
                            {stat.icon}
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                            <div className="text-sm text-slate-500">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Help / FAQ */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <AlertCircle size={18} className="text-slate-400" /> ¿Necesitas ayuda con el programa?
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    Contacta con nuestro equipo de soporte para afiliados para obtener material gráfico, consejos de conversión o resolver dudas sobre tus cobros.
                </p>
                <button className="text-sm font-bold text-slate-900 hover:underline">Ir a guía de afiliados →</button>
            </div>
        </div>
    );
};
