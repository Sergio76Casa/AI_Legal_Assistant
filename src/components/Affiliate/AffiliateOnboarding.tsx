import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, DollarSign, Clock, ShieldCheck, Loader2, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AffiliateOnboardingProps {
    onJoin: () => void;
    joining: boolean;
    error: string | null;
}

export const AffiliateOnboarding: React.FC<AffiliateOnboardingProps> = ({ onJoin, joining, error }) => {
    const benefits = [
        { 
            title: '20% Vitalicio', 
            desc: 'Comisión recurrente por cada renovación del cliente.', 
            icon: DollarSign,
            color: 'text-[#13ecc8]'
        },
        { 
            title: '30 Días de Cookie', 
            desc: 'Atribución extendida para asegurar tus conversiones.', 
            icon: Clock,
            color: 'text-blue-400'
        },
        { 
            title: 'Pagos Garantizados', 
            desc: 'Liquidez mensual automática al superar los 50€.', 
            icon: ShieldCheck,
            color: 'text-amber-400'
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0A0F1D]/60 backdrop-blur-3xl rounded-[3rem] p-12 text-center border border-white/5 shadow-2xl relative overflow-hidden"
            >
                {/* Background Glow */}
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10">
                    <motion.div 
                        initial={{ rotate: -10, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.1)]"
                    >
                        <TrendingUp size={48} className="text-primary" />
                    </motion.div>

                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">
                        Legal <span className="text-primary">Partners</span> Protocol
                    </h1>

                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-16 leading-relaxed font-medium">
                        Únete a la red de prescriptores líderes en tecnología legal y monetiza tu red de contactos con comisiones de por vida.
                    </p>

                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid md:grid-cols-3 gap-6 mb-16"
                    >
                        {benefits.map((feat, i) => (
                            <motion.div 
                                key={i}
                                variants={itemVariants}
                                className="bg-white/[0.03] border border-white/10 p-8 rounded-[2rem] backdrop-blur-sm group hover:border-primary/30 transition-all hover:bg-white/[0.05] text-left relative overflow-hidden"
                            >
                                <div className={cn("mb-6 p-3 rounded-xl bg-white/5 w-fit border border-white/5 group-hover:scale-110 transition-transform", feat.color)}>
                                    <feat.icon size={24} />
                                </div>
                                <h3 className="text-lg font-black text-white mb-2">{feat.title}</h3>
                                <p className="text-xs text-slate-500 font-bold leading-relaxed uppercase tracking-widest">{feat.desc}</p>
                                
                                {/* Inner glow on hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </motion.div>
                        ))}
                    </motion.div>

                    <div className="space-y-6">
                        <button
                            onClick={onJoin}
                            disabled={joining}
                            className="group relative px-16 py-6 bg-primary text-slate-900 text-lg font-black rounded-2xl transition-all shadow-[0_0_40px_rgba(var(--primary),0.2)] hover:shadow-[0_0_50px_rgba(var(--primary),0.4)] active:scale-95 flex items-center gap-4 mx-auto uppercase tracking-[0.2em] overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            {joining ? <Loader2 className="animate-spin" /> : <Sparkles size={24} />}
                            Activar Protocolo
                        </button>

                        <AnimatePresence>
                            {error && (
                                <motion.p 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-400 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    <ShieldCheck size={16} className="rotate-180" /> {error}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
