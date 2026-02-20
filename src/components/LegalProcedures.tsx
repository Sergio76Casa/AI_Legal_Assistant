import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Landmark, Users, Briefcase, ChevronRight, Sparkles, ShieldCheck, Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { useChat } from '../lib/ChatContext';
import { useTranslation, Trans } from 'react-i18next';

import { supabase } from '../lib/supabase';
import { useUsageLimits } from '../lib/useUsageLimits';
import { UpgradeModal } from './UpgradeModal';

interface LegalProceduresProps {
    onBack: () => void;
    user: any;
}

export function LegalProcedures({ onBack, user }: LegalProceduresProps) {
    const { t } = useTranslation();
    const { sendMessage } = useChat();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const procedures = [
        {
            id: 'residencia',
            icon: <Landmark className="w-6 h-6" />,
            title: t('procedures_page.items.residencia.title'),
            description: t('procedures_page.items.residencia.desc'),
            questions: [
                t('procedures_page.items.residencia.q1'),
                t('procedures_page.items.residencia.q2'),
                t('procedures_page.items.residencia.q3')
            ]
        },
        {
            id: 'nacionalidad',
            icon: <Users className="w-6 h-6" />,
            title: t('procedures_page.items.nacionalidad.title'),
            description: t('procedures_page.items.nacionalidad.desc'),
            questions: [
                t('procedures_page.items.nacionalidad.q1'),
                t('procedures_page.items.nacionalidad.q2'),
                t('procedures_page.items.nacionalidad.q3')
            ]
        },
        {
            id: 'trabajo',
            icon: <Briefcase className="w-6 h-6" />,
            title: t('procedures_page.items.trabajo.title'),
            description: t('procedures_page.items.trabajo.desc'),
            questions: [
                t('procedures_page.items.trabajo.q1'),
                t('procedures_page.items.trabajo.q2'),
                t('procedures_page.items.trabajo.q3')
            ]
        },
        {
            id: 'asilo',
            icon: <ShieldCheck className="w-6 h-6" />,
            title: t('procedures_page.items.asilo.title'),
            description: t('procedures_page.items.asilo.desc'),
            questions: [
                t('procedures_page.items.asilo.q1'),
                t('procedures_page.items.asilo.q2'),
                t('procedures_page.items.asilo.q3')
            ]
        }
    ];

    // Límites de uso
    const { canPerformAction, refresh } = useUsageLimits(user?.id, 'upload_document');

    // Asegurar que la página empiece desde arriba al cargar
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!user) {
            alert(t('procedures_page.analysis_banner.login_required'));
            return;
        }

        if (!canPerformAction) {
            setShowUpgradeModal(true);
            return;
        }

        const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            setUploadError(t('procedures_page.analysis_banner.error_types'));
            setUploadStatus('error');
            return;
        }

        try {
            setIsUploading(true);
            setUploadStatus('uploading');
            setUploadError(null);

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;
            const userCountry = user?.user_metadata?.country || 'ES';

            // Determinar tipo para DB
            const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';

            // 1. Subir a Storage
            const { error: uploadError } = await supabase.storage
                .from('user-documents')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Registrar en DB
            const { data: docData, error: dbError } = await supabase
                .from('documents')
                .insert({
                    name: file.name,
                    url: filePath,
                    user_id: user.id,
                    type: fileType,
                    status: 'processing',
                    country: userCountry
                })
                .select('id')
                .single();

            if (dbError) throw dbError;

            // 3. Procesar con Edge Function
            const { error: invokeError } = await supabase.functions.invoke('process-pdf', {
                body: {
                    bucket_id: 'user-documents',
                    file_path: filePath,
                    user_id: user.id,
                    document_id: docData?.id
                }
            });

            if (invokeError) throw invokeError;

            setUploadStatus('success');
            refresh();

            // Abrir el chat con un mensaje de análisis
            setTimeout(() => {
                sendMessage(t('procedures_page.analysis_banner.chat_msg', { name: file.name }));
                setUploadStatus('idle');
                setIsUploading(false);
            }, 1500);

        } catch (err: any) {
            console.error('Error:', err);
            setUploadError(err.message);
            setUploadStatus('error');
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0f1d]">
            {/* Header / Nav Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group mb-12"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">{t('procedures_page.back')}</span>
                </button>

                <div className="max-w-3xl mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="font-serif text-4xl sm:text-5xl text-white mb-6 leading-tight">
                            <Trans i18nKey="procedures_page.title">
                                Guía Integral de <span className="text-primary italic">Trámites Legales</span>
                            </Trans>
                        </h1>
                        <p className="text-lg sm:text-xl text-slate-400 font-light leading-relaxed">
                            {t('procedures_page.desc')}
                        </p>
                    </motion.div>
                </div>

                {/* Grid de Trámites */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-20">
                    {procedures.map((proc, idx) => (
                        <motion.div
                            key={proc.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="glass-card rounded-[2rem] p-6 sm:p-8 border border-white/5 hover:border-primary/20 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-8">
                                <div className="p-4 bg-white/5 rounded-2xl text-primary group-hover:bg-primary group-hover:text-slate-900 transition-colors">
                                    {proc.icon}
                                </div>
                                <Sparkles className="w-5 h-5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            <h3 className="font-serif text-2xl text-white mb-4">{proc.title}</h3>
                            <p className="text-slate-400 mb-8 font-light line-clamp-2 text-sm md:text-base">{proc.description}</p>

                            <div className="space-y-3">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">{t('procedures_page.common_questions')}</p>
                                {proc.questions.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(q)}
                                        className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl text-sm text-slate-300 hover:bg-primary/10 hover:text-primary transition-all text-left group/btn"
                                    >
                                        <span className="line-clamp-2">{q}</span>
                                        <ChevronRight className="w-4 h-4 flex-shrink-0" />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Banner de Análisis de Documentos */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative rounded-[2.5rem] bg-slate-900 text-white p-8 sm:p-12 overflow-hidden mb-24 min-h-[400px] flex items-center shadow-2xl border border-white/10"
                >
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10"></div>

                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 blur-[100px] -ml-32 -mb-32"></div>

                    <div className="relative z-10 max-w-2xl w-full text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border border-primary/30 backdrop-blur-md">
                            <Sparkles size={14} className="animate-pulse" />
                            {t('procedures_page.analysis_banner.tag')}
                        </div>
                        <h2 className="font-serif text-3xl sm:text-4xl mb-6 leading-tight">{t('procedures_page.analysis_banner.title')}</h2>
                        <p className="text-slate-400 text-base sm:text-lg font-light mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                            <Trans i18nKey="procedures_page.analysis_banner.desc">
                                No te preocupes por el lenguaje técnico. Súbela ahora y <span className="text-primary font-medium italic">STARK lo analizará por ti</span> en segundos.
                            </Trans>
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,image/png,image/jpeg,image/jpg"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className={cn(
                                    "group relative px-10 py-5 rounded-lg font-serif text-lg transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden shadow-xl shadow-primary/20 w-full sm:w-auto",
                                    uploadStatus === 'success' ? "bg-emerald-500 text-white" : "bg-primary text-slate-900 hover:brightness-110"
                                )}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        <span>{t('procedures_page.analysis_banner.processing')}</span>
                                    </>
                                ) : uploadStatus === 'success' ? (
                                    <>
                                        <CheckCircle2 className="w-6 h-6" />
                                        <span>{t('procedures_page.analysis_banner.success')}</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
                                        <span>{t('procedures_page.analysis_banner.upload_btn')}</span>
                                    </>
                                )}
                            </button>

                            {uploadStatus === 'idle' && (
                                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest text-center lg:text-left">
                                    {t('procedures_page.analysis_banner.formats')} <br className="hidden sm:block" />
                                    {t('procedures_page.analysis_banner.privacy')}
                                </p>
                            )}

                            {uploadStatus === 'error' && (
                                <div className="flex items-center gap-2 text-rose-400 text-sm animate-in fade-in slide-in-from-left-2">
                                    <AlertCircle size={18} />
                                    <span>{uploadError}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Upgrade Modal Integration */}
                <UpgradeModal
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                    limitType="upload_document"
                />
            </div>
        </div>
    );
}
