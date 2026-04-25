import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, BarChart3, TrendingUp } from 'lucide-react';

interface PerformanceAnalyticsProps {
    data: any[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0A0F1D]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{label}</p>
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        <p className="text-sm font-black text-white">
                            {payload[0].value} <span className="text-[10px] text-slate-500 font-bold uppercase ml-1">Clics</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                        <p className="text-sm font-black text-primary">
                            {payload[1].value} <span className="text-[10px] text-primary/60 font-bold uppercase ml-1">Ventas</span>
                        </p>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({ data }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0A0F1D]/40 backdrop-blur-2xl border border-white/5 rounded-[40px] p-8 lg:p-10 relative overflow-hidden group"
        >
            {/* Decoration */}
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none group-hover:scale-110 group-hover:opacity-[0.05] transition-all duration-1000">
                <BarChart3 size={200} className="text-primary" />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
                <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white flex items-center gap-3">
                        <Calendar size={18} className="text-primary" /> Rendimiento de Conversión
                    </h3>
                    <p className="text-xs text-slate-500 font-bold mt-2 uppercase tracking-widest">Análisis de impacto Stark · Últimos 30 días</p>
                </div>

                <div className="flex items-center gap-6 p-1.5 bg-black/40 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 px-4">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Alcance</span>
                    </div>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-2 px-4">
                        <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Impacto</span>
                    </div>
                </div>
            </div>

            <div className="h-[350px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="neonClicks" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="neonSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="rgb(var(--primary))" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="rgb(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        
                        <CartesianGrid 
                            strokeDasharray="4 4" 
                            stroke="rgba(255,255,255,0.03)" 
                            vertical={false} 
                        />
                        
                        <XAxis 
                            dataKey="name" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#475569', fontSize: 10, fontWeight: '900' }}
                            dy={15}
                        />
                        
                        <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#475569', fontSize: 10, fontWeight: '900' }}
                        />
                        
                        <Tooltip content={<CustomTooltip />} />
                        
                        <Area 
                            type="monotone" 
                            dataKey="clics" 
                            stroke="#3b82f6" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#neonClicks)"
                            animationDuration={2000}
                        />
                        
                        <Area 
                            type="monotone" 
                            dataKey="ventas" 
                            stroke="rgb(var(--primary))" 
                            strokeWidth={4} 
                            fillOpacity={1} 
                            fill="url(#neonSales)" 
                            animationDuration={2500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 group/tip cursor-help">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover/tip:scale-110 transition-transform">
                        <TrendingUp size={16} />
                    </div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Tendencia de crecimiento positiva detectada</span>
                </div>
                <button className="text-[9px] font-black text-slate-500 uppercase tracking-tighter hover:text-white transition-colors">Exportar Reporte (CSV)</button>
            </div>
        </motion.div>
    );
};
