import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
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
    Banknote,
    ArrowUpRight,
    Calendar,
    MousePointer2,
    X
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

interface AffiliateData {
    id: string;
    affiliate_code: string;
    status: 'pending' | 'active';
    total_earned: number;
    created_at: string;
}

const MIN_PAYOUT = 50; // Umbral mínimo en €

// Datos de prueba para el gráfico
const chartData = [
    { name: '01 Feb', clics: 45, ventas: 2 },
    { name: '05 Feb', clics: 89, ventas: 5 },
    { name: '10 Feb', clics: 120, ventas: 8 },
    { name: '15 Feb', clics: 167, ventas: 12 },
    { name: '20 Feb', clics: 210, ventas: 15 },
    { name: '21 Feb', clics: 245, ventas: 18 },
];

// Datos de prueba para la tabla de referidos
const referralData = [
    { id: 1, date: '2026-02-21', status: 'Activo', plan: 'Business Anual', commission: 357.60 },
    { id: 2, date: '2026-02-20', status: 'Activo', plan: 'Business Mensual', commission: 29.80 },
    { id: 3, date: '2026-02-18', status: 'Pendiente', plan: 'Starter Mensual', commission: 9.80 },
    { id: 4, date: '2026-02-15', status: 'Activo', plan: 'Business Mensual', commission: 29.80 },
];

export const AffiliatePanel: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [copied, setCopied] = useState(false);
    const [customizing, setCustomizing] = useState(false);
    const [newCode, setNewCode] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Mock Stats based on requirements
    const [stats] = useState({
        clicks: 245,
        conversions: 18,
        convRate: 7.3,
        pendingEarnings: 124.50,
        totalPaid: 850.00
    });

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
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="animate-spin text-[#13ecc8]" size={40} />
            </div>
        );
    }

    if (!affiliate) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] p-12 text-center text-white relative overflow-hidden shadow-2xl border border-white/5">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#13ecc8]/10 rounded-full blur-[150px] -mr-48 -mt-48"></div>

                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-[#13ecc8]/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-[#13ecc8]/20">
                            <TrendingUp size={40} className="text-[#13ecc8]" />
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                            Programa de Partners
                        </h1>

                        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                            Gana comisiones recurrentes recomendando la tecnología líder en extranjería a otros profesionales.
                        </p>

                        <div className="grid md:grid-cols-3 gap-6 mb-12 text-left">
                            {[
                                { title: '20%', desc: 'Comisión Recurrente' },
                                { title: '30 días', desc: 'Ventana de Atribución' },
                                { title: '50€', desc: 'Umbral mínimo de pago' }
                            ].map((feat, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
                                    <div className="text-3xl font-black text-[#13ecc8] mb-1">{feat.title}</div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{feat.desc}</div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleJoin}
                            disabled={joining}
                            className="px-12 py-5 bg-[#13ecc8] hover:brightness-110 text-slate-900 text-lg font-black rounded-2xl transition-all shadow-xl shadow-[#13ecc8]/20 active:scale-95 flex items-center gap-3 mx-auto uppercase tracking-widest"
                        >
                            {joining ? <Loader2 className="animate-spin" /> : <TrendingUp size={24} />}
                            Unirme ahora
                        </button>

                        {error && (
                            <div className="mt-6 text-red-400 text-sm font-bold flex items-center justify-center gap-2">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <AnimatePresence>
                {/* 1. Alerta de Nueva Comisión */}
                {profile?.last_notification && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className="bg-[#13ecc8]/10 border border-[#13ecc8]/20 rounded-3xl p-6 flex items-center justify-between gap-4 text-[#13ecc8] overflow-hidden"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#13ecc8]/10 flex items-center justify-center border border-[#13ecc8]/20">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-black uppercase tracking-widest">¡Nueva Comisión Ingresada!</p>
                                <p className="text-xs text-[#13ecc8]/70 font-medium">{profile.last_notification}</p>
                            </div>
                        </div>
                        <button
                            onClick={async () => {
                                await supabase.from('profiles').update({ last_notification: null }).eq('id', user.id);
                                setProfile({ ...profile, last_notification: null });
                            }}
                            className="text-[#13ecc8]/40 hover:text-[#13ecc8] transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                )}

                {/* 2. Banner de Validación Pendiente */}
                {affiliate.status === 'pending' && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-4 text-amber-400 group"
                    >
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20 group-hover:scale-110 transition-transform">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-black uppercase tracking-widest">Modo Lectura • Validación en curso</p>
                            <p className="text-xs text-amber-500/70 font-medium">Podrás retirar tus comisiones una vez finalice el proceso de revisión (24-48h).</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
                        <TrendingUp size={32} className="text-[#13ecc8]" />
                        Panel de Afiliado
                    </h2>
                    <p className="text-slate-500 font-medium px-1">
                        Bienvenido de nuevo, <span className="text-white font-bold">{profile?.username || 'Partner'}</span> · Tu comisión es del <span className="text-[#13ecc8] font-black">20% vitalicia</span>
                    </p>
                </div>
                <div className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] w-fit border",
                    affiliate.status === 'active'
                        ? 'bg-[#13ecc8]/5 text-[#13ecc8] border-[#13ecc8]/20'
                        : 'bg-amber-500/5 text-amber-500 border-amber-500/20'
                )}>
                    {affiliate.status === 'active' ? '● Cuenta Activa' : '● Verificación Pendiente'}
                </div>
            </header>

            {/* 1. Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { label: 'Clics Totales', value: stats.clicks, icon: MousePointer2, color: 'text-blue-400' },
                    { label: 'Conversiones', value: stats.conversions, icon: Users, color: 'text-[#13ecc8]' },
                    { label: 'Tasa de Conv.', value: `${stats.convRate}%`, icon: ArrowUpRight, color: 'text-amber-400' },
                    { label: 'Ingr. Pendientes', value: `${stats.pendingEarnings.toFixed(2)}€`, icon: DollarSign, color: 'text-primary' },
                    { label: 'Total Cobrado', value: `${stats.totalPaid.toFixed(2)}€`, icon: Banknote, color: 'text-slate-300' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm group hover:border-[#13ecc8]/30 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <stat.icon size={18} className={stat.color} />
                            <div className="w-2 h-2 rounded-full bg-white/10 group-hover:bg-[#13ecc8]/50 transition-colors" />
                        </div>
                        <div className="text-2xl font-black text-white mb-1 tracking-tight">{stat.value}</div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Main Content Section: Chart & Affiliate Link */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2. Performance Chart */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6 overflow-hidden relative">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                            Rendimiento 30 días
                        </h3>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Clics</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#13ecc8]" />
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Ventas</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorClics" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#13ecc8" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#13ecc8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px' }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="clics" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorClics)" />
                                <Area type="monotone" dataKey="ventas" stroke="#13ecc8" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. Enlace de Afiliado Destacado */}
                <div className="bg-gradient-to-br from-primary/10 to-blue-500/10 border border-[#13ecc8]/20 rounded-[2.5rem] p-10 flex flex-col justify-between group">
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-[#13ecc8]/10 rounded-2xl flex items-center justify-center border border-[#13ecc8]/20 group-hover:scale-110 transition-transform">
                            <LinkIcon size={32} className="text-[#13ecc8]" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-white tracking-tight">Tu Enlace Único</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">Comparte este enlace para empezar a generar comisiones recurrentes hoy mismo.</p>
                        </div>
                        <div className="bg-slate-950/50 border border-white/5 p-4 rounded-2xl text-center">
                            <span className="text-[#13ecc8] font-mono font-bold text-sm block truncate">legalflow.digital?ref={affiliate.affiliate_code}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleCopy}
                        className={cn(
                            "w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all mt-8",
                            copied
                                ? "bg-[#13ecc8] text-slate-900 shadow-[0_0_30px_rgba(19,236,200,0.3)]"
                                : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                        )}
                    >
                        {copied ? <><Check size={18} /> ¡Copiado!</> : <><Copy size={18} /> Copiar Enlace</>}
                    </button>
                </div>
            </div>

            {/* 3. Tabla de Referidos */}
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
                <div className="p-8 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                        <Calendar size={16} className="text-slate-500" />
                        Historial de Referidos
                    </h3>
                    <div className="text-[10px] font-medium text-slate-500 italic">Mostrando últimos 10 movimientos</div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02]">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Fecha</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Estado</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Plan Contratado</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Tu Comisión</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {referralData.map((item) => (
                                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="text-sm font-bold text-slate-300">{item.date}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px) font-black uppercase tracking-wider",
                                            item.status === 'Activo'
                                                ? 'bg-[#13ecc8]/10 text-[#13ecc8] border border-[#13ecc8]/20'
                                                : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                        )}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-sm font-black text-white">{item.plan}</div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="text-base font-black text-[#13ecc8] group-hover:scale-110 transition-transform origin-right">+{item.commission.toFixed(2)}€</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-6 bg-white/[0.01] border-t border-white/10 flex justify-center">
                    <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Cargar historial completo</button>
                </div>
            </div>

            {/* Footer / FAQ & Ranking */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-md">
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                            <AlertCircle size={24} className="text-primary" />
                        </div>
                        <h4 className="text-lg font-black text-white uppercase tracking-tight">¿Cómo recibo mis pagos?</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Tus comisiones se acumulan durante el mes. Entre el <span className="text-white font-bold">día 1 y 5</span> del mes siguiente, si has superado los <span className="text-white font-bold">{MIN_PAYOUT}€</span>, recibirás el pago automáticamente vía Stripe o transferencia.
                        </p>
                    </div>
                    <div className="flex flex-col justify-end">
                        {!customizing ? (
                            <button
                                onClick={() => {
                                    setNewCode(affiliate.affiliate_code);
                                    setCustomizing(true);
                                }}
                                className="w-fit flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-[#13ecc8] transition-all bg-white/5 px-6 py-3 rounded-xl border border-white/10"
                            >
                                <Edit3 size={14} /> Personalizar mi código exclusivo
                            </button>
                        ) : (
                            <div className="p-6 bg-slate-950/30 rounded-2xl border border-white/5 space-y-4 animate-in slide-in-from-bottom-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Personalizar Código</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newCode}
                                        onChange={(e) => setNewCode(e.target.value)}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-[#13ecc8]/50 font-bold"
                                    />
                                    <button
                                        onClick={handleSaveCustomCode}
                                        className="bg-[#13ecc8] text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
                                    >
                                        Guardar
                                    </button>
                                    <button
                                        onClick={() => setCustomizing(false)}
                                        className="text-slate-500 px-2 py-2 text-[10px] font-black uppercase tracking-widest"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 1. Top Partners Ranking */}
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 flex flex-col gap-6 backdrop-blur-md relative overflow-hidden group">
                    <div className="flex items-center gap-3">
                        <TrendingUp size={20} className="text-[#13ecc8]" />
                        <h4 className="text-xs font-black uppercase tracking-widest text-white">Top Partners del Mes</h4>
                    </div>

                    <div className="space-y-4">
                        {[
                            { rank: 1, name: 'Partner #12', amount: 1450.20, color: 'text-amber-400' },
                            { rank: 2, name: 'Partner #42', amount: 1250.00, color: 'text-slate-300' },
                            { rank: 3, name: 'Partner #09', amount: 980.50, color: 'text-amber-700' },
                        ].map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-[#13ecc8]/20 transition-all">
                                <div className="flex items-center gap-3">
                                    <span className={cn("text-lg font-black", p.color)}>#{p.rank}</span>
                                    <span className="text-xs font-bold text-slate-400">{p.name}</span>
                                </div>
                                <div className="text-sm font-black text-white">{p.amount.toFixed(2)}€</div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Actualizado hace 2 horas</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
