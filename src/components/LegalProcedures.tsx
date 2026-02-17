import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Landmark, Users, Briefcase, ChevronRight, Sparkles, ShieldCheck, Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { useChat } from '../lib/ChatContext';

import { supabase } from '../lib/supabase';
import { useUsageLimits } from '../lib/useUsageLimits';
import { UpgradeModal } from './UpgradeModal';

interface LegalProceduresProps {
    onBack: () => void;
    user: any;
}

const procedures = [
    {
        id: 'residencia',
        icon: <Landmark className="w-6 h-6" />,
        title: 'Residencia y Estancia',
        description: 'Todo sobre NIE, TIE, Arraigo Social, Laboral y Familiar. Te guiamos en cada paso.',
        questions: ['¿Cómo obtengo el arraigo social?', 'Diferencia entre NIE y TIE', 'Requisitos para reagrupación familiar']
    },
    {
        id: 'nacionalidad',
        icon: <Users className="w-6 h-6" />,
        title: 'Nacionalidad Española',
        description: 'Exámenes CCSE/DELE, plazos de residencia y presentación telemática.',
        questions: ['¿Cuántos años necesito para la nacionalidad?', '¿Cómo es el examen CCSE?', 'Documentos para nacionalidad por residencia']
    },
    {
        id: 'trabajo',
        icon: <Briefcase className="w-6 h-6" />,
        title: 'Permisos de Trabajo',
        description: 'Cuenta propia, cuenta ajena, profesionales altamente cualificados y nómadas digitales.',
        questions: ['Requisitos para Visa de Nómada Digital', '¿Puedo trabajar con mi residencia de estudiante?', 'Modificación de estancia a trabajo']
    },
    {
        id: 'asilo',
        icon: <ShieldCheck className="w-6 h-6" />,
        title: 'Protección Internacional',
        description: 'Asilo, protección subsidiaria y razones humanitarias.',
        questions: ['¿Cómo pido cita para asilo?', 'Derechos durante la espera de asilo', '¿Qué es la tarjeta roja?']
    }
];

export function LegalProcedures({ onBack, user }: LegalProceduresProps) {
    const { sendMessage } = useChat();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Límites de uso
    const { canPerformAction, tier, refresh } = useUsageLimits(user?.id, 'upload_document');

    // Asegurar que la página empiece desde arriba al cargar
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!user) {
            alert('Por favor, inicia sesión para analizar tus documentos.');
            return;
        }

        if (!canPerformAction) {
            setShowUpgradeModal(true);
            return;
        }

        const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            setUploadError('Solo se permiten archivos PDF, JPG o PNG');
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
                sendMessage(`He subido un documento: ${file.name}. Por favor, analízalo y dime si hay plazos o requisitos importantes.`);
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
        <div className="min-h-screen bg-stone-50/50">
            {/* Header / Nav Area */}
            <div className="max-w-7xl mx-auto px-6 pt-12">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-stone-500 hover:text-primary transition-colors group mb-12"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Volver al inicio</span>
                </button>

                <div className="max-w-3xl mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="font-serif text-5xl text-stone-900 mb-6 leading-tight">
                            Guía Integral de <span className="text-primary italic">Trámites Legales</span>
                        </h1>
                        <p className="text-xl text-stone-600 font-light leading-relaxed">
                            Simplificamos la burocracia española para que puedas enfocarte en tu nueva vida.
                            Información actualizada sobre extranjería, nacionalidad y derechos.
                        </p>
                    </motion.div>
                </div>

                {/* Grid de Trámites */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    {procedures.map((proc, idx) => (
                        <motion.div
                            key={proc.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="bg-white rounded-[2rem] p-8 border border-stone-100 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex items-start justify-between mb-8">
                                <div className="p-4 bg-stone-50 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    {proc.icon}
                                </div>
                                <Sparkles className="w-5 h-5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            <h3 className="font-serif text-2xl text-stone-900 mb-4">{proc.title}</h3>
                            <p className="text-stone-600 mb-8 font-light line-clamp-2">{proc.description}</p>

                            <div className="space-y-3">
                                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Preguntas comunes</p>
                                {proc.questions.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(q)}
                                        className="w-full flex items-center justify-between p-4 bg-stone-50/50 rounded-xl text-sm text-stone-700 hover:bg-emerald-50 hover:text-primary transition-all text-left group/btn"
                                    >
                                        <span>{q}</span>
                                        <ChevronRight className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
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
                    className="relative rounded-[2.5rem] bg-stone-900 text-white p-12 overflow-hidden mb-24 min-h-[400px] flex items-center shadow-2xl shadow-stone-950/20"
                >
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10"></div>

                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -ml-32 -mb-32"></div>

                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-emerald-500/30 backdrop-blur-md">
                            <Sparkles size={14} className="animate-pulse" />
                            Análisis Inteligente por IA
                        </div>
                        <h2 className="font-serif text-4xl mb-6 leading-tight">¿Recibiste una carta de la Oficina de Extranjería?</h2>
                        <p className="text-stone-300 text-lg font-light mb-10 leading-relaxed">
                            No te preocupes por el lenguaje técnico. Súbela ahora y <span className="text-emerald-400 font-medium italic">STARK lo analizará por ti</span> en segundos.
                        </p>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
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
                                    "group relative px-10 py-5 rounded-full font-serif text-lg transition-all duration-300 flex items-center gap-3 overflow-hidden shadow-xl shadow-emerald-900/10",
                                    uploadStatus === 'success' ? "bg-emerald-500 text-white" : "bg-primary text-white hover:bg-emerald-800"
                                )}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        <span>Procesando...</span>
                                    </>
                                ) : uploadStatus === 'success' ? (
                                    <>
                                        <CheckCircle2 className="w-6 h-6" />
                                        <span>¡Analizado!</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
                                        <span>Subir foto o documento</span>
                                    </>
                                )}
                            </button>

                            {uploadStatus === 'idle' && (
                                <p className="text-stone-500 text-sm italic max-w-xs">
                                    Formatos: PDF, JPG, PNG. <br className="hidden sm:block" />
                                    Privacidad garantizada bajo cifrado.
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
                    currentTier={tier as 'free' | 'pro' | 'business'}
                    limitType="upload_document"
                />
            </div>
        </div>
    );
}
