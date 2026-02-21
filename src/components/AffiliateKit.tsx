import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';
import { Copy, Check, MessageSquare, Mail, Image as ImageIcon, Download, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

interface AffiliateKitProps {
    onBack: () => void;
}

export function AffiliateKit({ onBack }: AffiliateKitProps) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'copy' | 'email' | 'design'>('copy');
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    useEffect(() => {
        // SEO: Noindex for affiliate pages
        const meta = document.createElement('meta');
        meta.name = "robots";
        meta.content = "noindex";
        document.head.appendChild(meta);
        return () => {
            document.head.removeChild(meta);
        };
    }, []);

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const whatsappTemplates = t('affiliate_kit.whatsapp.templates', { returnObjects: true }) as any[];
    const emailTemplates = t('affiliate_kit.email.templates', { returnObjects: true }) as any[];

    return (
        <div className="min-h-screen bg-[#0a0f1d] py-16 md:py-20 px-4 md:px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                {/* Back */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-10 text-sm font-medium"
                >
                    <ArrowLeft size={16} />
                    {t('affiliate_terms.back')}
                </button>

                {/* Header */}
                <div className="mb-12 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                        {t('affiliate_kit.title')}
                    </h1>
                    <p className="text-xl text-slate-400">
                        <Trans i18nKey="affiliate_kit.subtitle">
                            Todo lo que necesitas para <span className="text-primary font-bold">empezar a recomendar</span>
                        </Trans>
                    </p>
                    <p className="text-slate-500 italic max-w-2xl text-sm">
                        {t('affiliate_kit.desc')}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 mb-10 w-fit">
                    {[
                        { id: 'copy', label: t('affiliate_kit.tabs.copy'), icon: MessageSquare },
                        { id: 'email', label: t('affiliate_kit.tabs.email'), icon: Mail },
                        { id: 'design', label: t('affiliate_kit.tabs.design'), icon: ImageIcon },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            //@ts-ignore
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                                activeTab === tab.id
                                    ? "bg-primary text-slate-900 shadow-lg shadow-primary/20"
                                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                            )}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'copy' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {whatsappTemplates.map((item, idx) => (
                                    <div key={idx} className="glass-card rounded-3xl p-8 space-y-4 relative group">
                                        <div className="text-[10px] font-black uppercase text-primary tracking-widest">{item.label}</div>
                                        <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 text-slate-300 text-sm leading-relaxed min-h-[120px]">
                                            {item.text.replace('{{link}}', '[TU_ENLACE]')}
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(item.text.replace('{{link}}', '[TU_ENLACE]'), idx)}
                                            className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-primary/10 hover:text-primary rounded-xl transition-all border border-white/10 text-xs font-bold uppercase tracking-widest"
                                        >
                                            {copiedIndex === idx ? (
                                                <>
                                                    <Check size={14} className="text-primary" />
                                                    {t('affiliate_kit.whatsapp.copied')}
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={14} />
                                                    {t('affiliate_kit.whatsapp.copy_btn')}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'email' && (
                        <div className="space-y-6">
                            {emailTemplates.map((item, idx) => (
                                <div key={idx} className="glass-card rounded-[2.5rem] p-10 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Asunto:</label>
                                        <div className="text-lg font-bold text-white border-b border-white/5 pb-2">{item.subject}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Cuerpo del mensaje:</label>
                                        <div className="bg-slate-950/50 p-8 rounded-3xl border border-white/5 text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                                            {item.body.replace('{{link}}', '[TU_ENLACE]')}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(`Asunto: ${item.subject}\n\n${item.body.replace('{{link}}', '[TU_ENLACE]')}`, idx)}
                                        className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-slate-900 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all text-sm"
                                    >
                                        {copiedIndex === idx ? <Check size={18} /> : <Copy size={18} />}
                                        {copiedIndex === idx ? t('affiliate_kit.whatsapp.copied') : t('affiliate_kit.whatsapp.copy_btn')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'design' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white/5 border border-white/10 rounded-[2.5rem] p-10 md:p-12">
                            <div className="space-y-6">
                                <h2 className="text-3xl font-black text-white">{t('affiliate_kit.designs.title')}</h2>
                                <p className="text-slate-400 leading-relaxed italic">
                                    {t('affiliate_kit.designs.desc')}
                                </p>
                                <button className="flex items-center gap-3 px-8 py-4 bg-primary text-slate-900 rounded-full font-bold shadow-xl shadow-primary/20 hover:brightness-110 transition-all uppercase tracking-widest text-xs">
                                    <Download size={18} />
                                    {t('affiliate_kit.designs.download')}
                                </button>
                            </div>
                            <div className="relative group">
                                <div className="aspect-[1.91/1] bg-slate-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50" />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-4">
                                        <div className="text-primary font-black text-2xl uppercase tracking-tighter">LEGALFLOW</div>
                                        <div className="text-white text-lg font-bold leading-tight uppercase tracking-[0.2em]">{t('affiliate_kit.designs.preview_label')}</div>
                                    </div>
                                </div>
                                <div className="absolute -bottom-4 -right-4 bg-primary/10 backdrop-blur-md px-4 py-2 rounded-lg border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest shadow-lg">
                                    LinkedIn Size (1200x627)
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
