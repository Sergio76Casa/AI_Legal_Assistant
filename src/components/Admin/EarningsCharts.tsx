import React from 'react';
import { BarChart3 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface EarningsChartsProps {
    data: any[];
}

export const EarningsCharts: React.FC<EarningsChartsProps> = ({ data }) => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 150);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2.5rem] p-10 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white flex items-center gap-2">
                        <BarChart3 size={16} className="text-[#13ecc8]" />
                        Proyección de Crecimiento
                    </h3>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Histórico de rendimientos netos por semestre</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#13ecc8]" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ingresos</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Beneficio Neto</span>
                    </div>
                </div>
            </div>

            <div className="h-[400px] w-full mt-4 bg-white/5 rounded-3xl">
                {mounted && (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#13ecc8" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#13ecc8" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorBeneficio" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#475569', fontSize: 11, fontWeight: 'bold' }}
                                dy={15}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#475569', fontSize: 11, fontWeight: 'bold' }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px', padding: '16px' }}
                                itemStyle={{ fontWeight: 'black', textTransform: 'uppercase' }}
                                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                            />
                            <Area type="monotone" dataKey="ingresos" stroke="#13ecc8" strokeWidth={4} fillOpacity={1} fill="url(#colorIngresos)" />
                            <Area type="monotone" dataKey="beneficio" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorBeneficio)" />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};
