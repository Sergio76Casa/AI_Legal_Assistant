import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link as LinkIcon, Copy, Check, Edit3, Save, X, MessageCircle, Share2, Globe } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AffiliateLinkManagerProps {
    affiliateCode: string;
    onUpdateCode: (newCode: string) => Promise<boolean>;
    onCopy: () => void;
    copied: boolean;
    updating: boolean;
    error: string | null;
}

export const AffiliateLinkManager: React.FC<AffiliateLinkManagerProps> = ({
    affiliateCode,
    onUpdateCode,
    onCopy,
    copied,
    updating,
    error
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newCode, setNewCode] = useState(affiliateCode);
    const affiliateUrl = `https://legalflow.digital?ref=${affiliateCode}`;

    const handleSave = async () => {
        const success = await onUpdateCode(newCode);
        if (success) setIsEditing(false);
    };

    return (
        <div className="bg-[#0A0F1D]/40 backdrop-blur-2xl border border-white/5 rounded-[40px] p-8 lg:p-10 flex flex-col justify-between h-full relative group">
            <div className="space-y-8 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(var(--primary),0.2)] transition-all">
                        <LinkIcon size={32} className="text-primary" />
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
                        >
                            <Edit3 size={18} />
                        </button>
                    )}
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                        Portal de Resonancia
                        <Globe size={16} className="text-primary" />
                    </h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] leading-relaxed">Comparte tu frecuencia única para generar comisiones vitalicias</p>
                </div>

                <AnimatePresence mode="wait">
                    {isEditing ? (
                        <motion.div
                            key="edit"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-600 uppercase tracking-widest">ref=</span>
                                <input
                                    type="text"
                                    value={newCode}
                                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                                    className="w-full bg-black/40 border border-primary/30 rounded-2xl py-4 pl-14 pr-4 text-sm font-mono text-primary outline-none focus:shadow-[0_0_20px_rgba(var(--primary),0.1)] transition-all"
                                    placeholder="NUEVO-CODIGO"
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSave}
                                    disabled={updating}
                                    className="flex-1 py-3 bg-primary text-slate-900 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                                >
                                    {updating ? <span className="animate-spin text-sm">●</span> : <Save size={14} />}
                                    Guardar Código
                                </button>
                                <button
                                    onClick={() => { setIsEditing(false); setNewCode(affiliateCode); }}
                                    className="p-3 bg-white/5 text-slate-500 hover:text-white rounded-xl transition-all"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            {error && <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest">{error}</p>}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="view"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <div className="bg-slate-900/50 border border-white/5 p-5 rounded-2xl text-center backdrop-blur-md group-hover:border-primary/20 transition-colors">
                                <span className="text-primary font-mono font-black text-sm block truncate tracking-wider">
                                    legalflow.digital?ref={affiliateCode}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => {
                                        const text = `Te recomiendo LegalFlow AI para gestionar tus expedientes de forma inteligente. Accede aquí: ${affiliateUrl}`;
                                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                    }}
                                    className="py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center gap-2 transition-all"
                                >
                                    <MessageCircle size={14} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">WhatsApp</span>
                                </button>
                                <button
                                    onClick={() => {
                                        if (navigator.share) {
                                            navigator.share({ title: 'LegalFlow AI', text: 'Únete a LegalFlow AI', url: affiliateUrl });
                                        }
                                    }}
                                    className="py-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center gap-2 transition-all"
                                >
                                    <Share2 size={14} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Compartir</span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <button
                onClick={onCopy}
                disabled={isEditing}
                className={cn(
                    "w-full py-5 rounded-[20px] font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all relative overflow-hidden mt-8",
                    copied
                        ? "bg-primary text-slate-900 shadow-[0_0_30px_rgba(var(--primary),0.3)] scale-[0.98]"
                        : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                )}
            >
                {copied ? <><Check size={18} /> ¡Copiado!</> : <><Copy size={18} /> Copiar Link Stark</>}
                {copied && <motion.div layoutId="copy-glow" className="absolute inset-0 bg-white/20 blur-xl" />}
            </button>
        </div>
    );
};
