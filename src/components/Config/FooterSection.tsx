import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Plus, Trash2, Sparkles, Loader2, CheckCircle2, MessageSquare, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FooterSectionProps {
    footerLinks: any[];
    setFooterLinks: (links: any[]) => void;
    translating: boolean;
    translationSuccess: boolean;
    translationProgress: { current: number, total: number } | null;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
    footerLinks,
    setFooterLinks,
    translating,
    translationSuccess,
    translationProgress
}) => {
    const addFooterLink = () => {
        if (footerLinks.length >= 8) {
            alert('Máximo 8 bloques permitidos.');
            return;
        }
        const newId = Math.random().toString(36).substring(2, 11);
        setFooterLinks([...footerLinks, { id: newId, title: '', content: '', section: 'services' }]);
    };

    const removeFooterLink = (id: string) => {
        setFooterLinks(footerLinks.filter(l => l.id !== id && !l.protected));
    };

    const updateFooterLink = (id: string, field: string, value: string) => {
        setFooterLinks(footerLinks.map(l => l.id === id ? { ...l, [field]: value } : l));
    };

    return (
        <div className="p-6 md:p-8 pt-0 border-t border-white/5 relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <LayoutGrid size={180} className="text-primary" />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-6 relative z-10">
                <div className="flex-1">
                    <AnimatePresence mode="wait">
                        {translationSuccess ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-2 text-primary"
                            >
                                <div className="p-1.5 rounded-full bg-primary/20">
                                    <CheckCircle2 size={14} className="animate-pulse" />
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]">
                                    Contenido optimizado por IA STARK 2.0
                                </p>
                            </motion.div>
                        ) : translating && translationProgress ? (
                            <motion.div 
                                key="progress"
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                className="flex items-center gap-3 text-blue-400"
                            >
                                <div className="relative w-5 h-5">
                                    <Loader2 size={14} className="animate-spin absolute inset-0 m-auto" />
                                    <svg className="w-full h-full -rotate-90">
                                        <circle
                                            cx="10" cy="10" r="8"
                                            fill="none" stroke="currentColor" strokeWidth="2"
                                            strokeDasharray={50}
                                            strokeDashoffset={50 - (50 * (translationProgress.current / translationProgress.total))}
                                            className="opacity-20"
                                        />
                                    </svg>
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest">
                                    IA Stark 2.0: {translationProgress.current} / {translationProgress.total} bloques...
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="info"
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }}
                                className="flex items-start gap-3 max-w-xl"
                            >
                                <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0">
                                    <Sparkles size={16} className="animate-pulse" />
                                </div>
                                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                                    Escribe un título y un texto informativo. <span className="text-primary">IA STARK 2.0</span> se encargará de traducir el contenido a 10 idiomas y asignar un icono inteligente de forma automática al guardar.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                <button
                    type="button"
                    onClick={addFooterLink}
                    disabled={translating}
                    className={cn(
                        "relative z-10 text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary/10 hover:bg-primary border border-primary/20 hover:text-slate-900 transition-all shadow-lg hover:shadow-primary/30 group disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                >
                    {translating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} className="transition-transform group-hover:rotate-90" />}
                    Añadir Bloque
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <AnimatePresence mode="popLayout">
                    {footerLinks.map((link, idx) => (
                        <motion.div
                            key={link.id || idx}
                            layout
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, x: -20 }}
                            className="group/card relative bg-white/[0.03] backdrop-blur-xl border border-white/5 hover:border-primary/20 rounded-3xl p-6 transition-all"
                        >
                            <div className="flex items-start justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-primary group-hover/card:scale-110 group-hover/card:border-primary/30 transition-all shadow-inner">
                                        {link.icon ? (
                                            <span className="text-xl">{link.icon}</span>
                                        ) : (
                                            <MessageSquare size={18} className="opacity-40" />
                                        )}
                                    </div>
                                    <div className="flex-1 group/input">
                                        <input
                                            type="text"
                                            value={link.title}
                                            onChange={e => updateFooterLink(link.id, 'title', e.target.value)}
                                            className="bg-transparent border-none p-0 text-sm font-black text-white placeholder:text-slate-700 outline-none focus:ring-0 w-full"
                                            placeholder="Título del bloque..."
                                        />
                                        <div className="h-px w-0 group-focus-within/input:w-full bg-primary/40 transition-all duration-500" />
                                    </div>
                                </div>
                                {!link.protected && (
                                    <button
                                        onClick={() => removeFooterLink(link.id)}
                                        className="p-2 text-slate-700 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all opacity-0 group-hover/card:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="relative group/text">
                                    <textarea
                                        value={link.content}
                                        onChange={e => updateFooterLink(link.id, 'content', e.target.value)}
                                        rows={4}
                                        className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 text-xs font-medium text-slate-400 focus:text-white focus:border-primary/20 outline-none transition-all placeholder:text-slate-800 resize-none shadow-inner"
                                        placeholder="Contenido descriptivo para este bloque..."
                                    />
                                    <div className="absolute bottom-3 right-3 opacity-20 group-focus-within/text:opacity-60 transition-opacity">
                                        <MessageSquare size={14} className="text-primary" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                    <select
                                        value={link.section || 'services'}
                                        onChange={e => updateFooterLink(link.id, 'section', e.target.value)}
                                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500 outline-none hover:border-primary/30 transition-all"
                                    >
                                        <option value="legal" className="bg-slate-900">Legal / Privacidad</option>
                                        <option value="services" className="bg-slate-900">Servicios / Ayuda</option>
                                        <option value="platform" className="bg-slate-900">Plataforma</option>
                                    </select>
                                    
                                    {link.translations && Object.keys(link.translations).length > 0 && (
                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">
                                                {Object.keys(link.translations).length} Idiomas Activos
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};
