import React from 'react';
import { CreditCard } from 'lucide-react';

interface TransactionMonitorProps {
    payments: any[];
}

export const TransactionMonitor: React.FC<TransactionMonitorProps> = ({ payments }) => {
    return (
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
            <div className="p-10 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.02]">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                        <CreditCard size={20} className="text-blue-500" />
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white">Monitor de Transacciones</h3>
                        <p className="text-slate-500 text-[10px] font-bold">Rastreo de suscripciones y márgenes en tiempo real</p>
                    </div>
                </div>
                <button className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 transition-all">
                    Exportar a CSV
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/[0.01]">
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Fecha</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Cliente (Propietario)</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Plan</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Afiliado / Partner</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#13ecc8] text-right">Margen Neto (€)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {payments.length > 0 ? (
                            payments.map((payment, i) => (
                                <tr key={i} className="hover:bg-white/[0.03] transition-colors group">
                                    <td className="px-10 py-8">
                                        <div className="text-xs font-bold text-slate-400">
                                            {new Date(payment.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center font-bold text-slate-500 text-[10px] border border-white/5 uppercase">
                                                {(payment.referral_id?.referred_user_id?.profiles?.full_name || 'U').charAt(0)}
                                            </div>
                                            <div className="text-sm font-black text-white tracking-tight">
                                                {payment.referral_id?.referred_user_id?.profiles?.full_name || 'Usuario Business'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[9px] font-black uppercase tracking-wider">
                                            Plan Business
                                        </span>
                                    </td>
                                    <td className="px-10 py-8 text-center text-xs font-bold text-slate-400 italic">
                                        {payment.referral_id?.affiliate_id?.affiliate_code || '-'}
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="text-base font-black text-[#13ecc8] group-hover:scale-110 transition-transform origin-right tracking-tighter">
                                            +{(149 - Number(payment.amount)).toFixed(2)}€
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-10 py-12 text-center text-slate-600 italic font-medium">Buscando transacciones recientes...</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
