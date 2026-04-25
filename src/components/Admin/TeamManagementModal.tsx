import React from 'react';
import { X, Users, Loader2, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TeamManagementModalProps {
    tenant: any;
    users: any[];
    loading: boolean;
    updatingUserPlan?: string | null;
    onUpdateUserPlan?: (userId: string, newPlan: string) => void;
    onClose: () => void;
}

export const TeamManagementModal: React.FC<TeamManagementModalProps> = ({
    tenant,
    users,
    loading,
    updatingUserPlan,
    onUpdateUserPlan,
    onClose
}) => {
    if (!tenant) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-white/10">
                <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0 bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/15 text-primary rounded-lg border border-primary/20">
                            <Users size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Equipo de {tenant.name}</h3>
                            <p className="text-xs text-primary font-bold uppercase tracking-widest">{users.length} Miembros activos</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-0 overflow-y-auto">
                    {loading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="animate-spin mx-auto text-slate-500" size={32} />
                            <p className="mt-4 text-slate-400 font-medium">Cargando equipo...</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {users.map((u) => (
                                <div key={u.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-slate-300 border border-white/10 overflow-hidden">
                                            {u.username?.charAt(0) || u.email.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{u.username || 'Usuario'}</p>
                                            <p className="text-sm text-slate-400 font-medium">{u.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-fit group/select">
                                            <select
                                                value={u.subscription_tier === 'free' ? 'free' : 'business'}
                                                disabled={updatingUserPlan === u.id}
                                                onChange={(e) => onUpdateUserPlan?.(u.id, e.target.value)}
                                                className={cn(
                                                    "appearance-none cursor-pointer outline-none inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all pr-8 border disabled:opacity-50",
                                                    u.subscription_tier !== 'free'
                                                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:ring-2 hover:ring-amber-500/20'
                                                        : 'bg-white/5 text-slate-500 border-white/10 hover:bg-white/10'
                                                )}
                                            >
                                                <option value="free" className="bg-slate-900 text-slate-400">STARTER (Free)</option>
                                                <option value="business" className="bg-slate-900 text-amber-500">ENTERPRISE (Pro)</option>
                                            </select>
                                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-current">
                                                {updatingUserPlan === u.id ? <Loader2 size={10} className="animate-spin" /> : <Clock size={10} />}
                                            </div>
                                        </div>
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider min-w-[70px] text-center",
                                            u.role === 'admin' ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" : "bg-white/10 text-slate-400 border border-white/10"
                                        )}>
                                            {u.role}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {users.length === 0 && (
                                <div className="p-12 text-center text-slate-500 italic font-medium">
                                    Sin usuarios registrados todavía en Legal AI Global.
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="p-6 border-t border-white/10 bg-white/5 shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-primary text-slate-900 font-bold rounded-xl hover:bg-primary/90 transition-colors"
                    >
                        Cerrar Panel
                    </button>
                </div>
            </div>
        </div>
    );
};
