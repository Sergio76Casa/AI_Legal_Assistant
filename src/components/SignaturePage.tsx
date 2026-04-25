import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, CheckCircle2, FileText, Download, ChevronRight, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Hooks
import { useSignatureFlow } from '../hooks/signature/useSignatureFlow';
import { useSignaturePersistence } from '../hooks/signature/useSignaturePersistence';

// Sub-components
import { DocumentViewer } from './Signature/DocumentViewer';
import { SignaturePad } from './Signature/SignaturePad';
import { AuditTrail } from './Signature/AuditTrail';

interface SignaturePageProps {
    documentId: string;
}

export const SignaturePage: React.FC<SignaturePageProps> = ({ documentId }) => {
    const { t } = useTranslation();
    
    // Logic Orchestration
    const {
        state, setState,
        request, setRequest,
        tenantInfo,
        missingFields,
        pdfPreviewUrl,
        errorMessage,
        isSavingData,
        handleDataSubmit
    } = useSignatureFlow(documentId);

    const {
        progress,
        progressPct,
        handleSignatureComplete,
        handleDownload
    } = useSignaturePersistence();

    const [auditData, setAuditData] = React.useState<any>(null);

    const onSignatureConfirm = async (signatureDataUrl: string) => {
        if (!request || !tenantInfo) return;
        setState('processing');
        try {
            const result = await handleSignatureComplete(signatureDataUrl, request, tenantInfo);
            setAuditData(result);
            setState('preview_certificate');
        } catch (err: any) {
            setState('error');
            // Error handling already done in hook or via alert
        }
    };

    // --- RENDER HELPERS ---

    const Layout = ({ children, title, subtitle }: { children: React.ReactNode, title?: string, subtitle?: string }) => (
        <div className="min-h-screen bg-[#050811] text-white flex flex-col font-sans selection:bg-primary/30">
            {/* Optimized Dark Space Background */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary),0.05)_0%,transparent_50%)] pointer-events-none" />
            
            <header className="sticky top-0 z-50 bg-[#050811]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <Sparkles size={18} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-black tracking-tight uppercase">{tenantInfo?.name || 'LegalFlow'}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Protocolo Seguro Stark</span>
                    </div>
                </div>
                <div className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400">
                    ID: {documentId.substring(0, 8)}
                </div>
            </header>

            <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-10 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
                {(title || subtitle) && (
                    <div className="lg:col-span-12 mb-4">
                        <h1 className="text-3xl lg:text-5xl font-black tracking-tighter mb-4 leading-none">
                            {title}
                        </h1>
                        <p className="text-slate-500 text-sm font-medium max-w-2xl">{subtitle}</p>
                    </div>
                )}
                <AnimatePresence mode="wait">
                    {children}
                </AnimatePresence>
            </main>
        </div>
    );

    // --- STATE MACHINE RENDERING ---

    if (state === 'loading') {
        return (
            <Layout>
                <div className="lg:col-span-12 flex flex-col items-center justify-center py-40 gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-2 border-primary/10 border-t-primary rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        </div>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50">Iniciando Sesión Encriptada...</p>
                </div>
            </Layout>
        );
    }

    if (state === 'error') {
        return (
            <Layout title="Error de Acceso" subtitle="No hemos podido cargar el documento solicitado.">
                <div className="lg:col-span-12 flex flex-col items-center max-w-md mx-auto text-center gap-6">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 border border-red-500/20">
                        <AlertCircle size={40} />
                    </div>
                    <p className="text-slate-400 font-medium">{errorMessage}</p>
                    <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-black uppercase tracking-widest text-[10px] border border-white/10 transition-all"> Reintentar </button>
                </div>
            </Layout>
        );
    }

    if (state === 'missing_data') {
        return (
            <Layout title="Datos Requeridos" subtitle="Proporcione la información faltante para generar el certificado de firma.">
                <div className="lg:col-span-7">
                    <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 backdrop-blur-xl">
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget);
                            const updates: any = {};
                            missingFields.forEach(f => updates[f.field_key] = fd.get(f.field_key));
                            handleDataSubmit(updates);
                        }} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {missingFields.map(f => (
                                    <div key={f.field_key} className="flex flex-col gap-2 group">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-primary transition-colors">
                                            {t(`fields.${f.field_key}`)}
                                        </label>
                                        <input
                                            name={f.field_key}
                                            type={f.field_key.includes('date') ? 'date' : 'text'}
                                            required
                                            className="w-full bg-slate-900 border border-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-700"
                                            placeholder={`Ingrese su ${t(`fields.${f.field_key}`).toLowerCase()}`}
                                        />
                                    </div>
                                ))}
                            </div>
                            <button
                                type="submit"
                                disabled={isSavingData}
                                className="w-full bg-white text-slate-900 rounded-2xl py-5 font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {isSavingData ? <Loader2 className="animate-spin" size={20} /> : <>Siguiente Paso <ChevronRight size={18} /></>}
                            </button>
                        </form>
                    </div>
                </div>
                <div className="lg:col-span-5">
                    <AuditTrail status="Esperando Datos de Perfil" requestID={documentId} />
                </div>
            </Layout>
        );
    }

    if (state === 'signing') {
        return (
            <SignaturePad
                onConfirm={onSignatureConfirm}
                onCancel={() => setState('ready')}
                signerName={tenantInfo?.name}
            />
        );
    }

    if (state === 'processing') {
        return (
            <Layout>
                <div className="lg:col-span-12 flex flex-col items-center justify-center py-40 gap-8">
                    <div className="w-full max-w-md bg-white/5 rounded-full h-1 overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPct}%` }}
                            className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                        />
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <p className="text-xl font-black text-white tracking-tight">{progress}</p>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">{progressPct}% COMPLETADO</p>
                    </div>
                    <Loader2 size={32} className="text-primary/20 animate-spin" />
                </div>
            </Layout>
        );
    }

    if (state === 'preview_certificate') {
        return (
            <Layout>
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 overflow-y-auto">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-[#050811]/90 backdrop-blur-sm"
                    />
                    
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="relative w-full max-w-5xl bg-[#0A0F1D]/80 backdrop-blur-3xl border border-white/10 rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                    >
                        {/* Left Side: Document Preview */}
                        <div className="flex-1 min-h-[400px] border-r border-white/5 bg-[#050811]/50">
                            <DocumentViewer pdfUrl={pdfPreviewUrl} title="Vista Previa Firmada" />
                        </div>

                        {/* Right Side: Audit Info */}
                        <div className="w-full md:w-[400px] p-8 md:p-12 flex flex-col gap-8 overflow-y-auto">
                            <div className="space-y-4">
                                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                    <CheckCircle2 size={28} />
                                </div>
                                <h2 className="text-3xl font-black text-white tracking-tighter">Certificado de Integridad</h2>
                                <p className="text-slate-500 text-xs font-medium leading-relaxed uppercase tracking-widest">
                                    Firma procesada exitosamente. Revise los parámetros de seguridad técnica.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Hash de Firma SHA-256</span>
                                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl font-mono text-[9px] text-primary break-all">
                                        {auditData?.signatureHash}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Dirección IP</span>
                                        <p className="text-xs font-bold text-white tracking-wider">{auditData?.ipAddress}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Protocolo</span>
                                        <p className="text-xs font-bold text-emerald-500">Stark SSL v2</p>
                                    </div>
                                </div>

                                <div className="p-5 bg-primary/5 border border-primary/10 rounded-2xl space-y-2">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Loader2 size={12} className="animate-spin" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Timestamp Verificado</span>
                                    </div>
                                    <p className="text-xs font-medium text-slate-400">
                                        {auditData?.timestamp && new Date(auditData.timestamp).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'medium' })}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-auto flex flex-col gap-4">
                                <button
                                    onClick={() => {
                                        setRequest(prev => prev ? {
                                            ...prev,
                                            status: 'signed',
                                            signed_document_path: auditData.signedPath,
                                            signed_at: auditData.timestamp
                                        } : null);
                                        setState('success');
                                    }}
                                    className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Autorizar Archivo Definitivo
                                </button>
                                <button
                                    onClick={() => setState('ready')}
                                    className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-white transition-colors"
                                >
                                    Volver / Corregir
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </Layout>
        );
    }

    if (state === 'success' || state === 'already_signed') {
        return (
            <Layout title="Documento Firmado" subtitle="El proceso se ha completado con éxito. Se ha generado un certificado de integridad legal.">
                <div className="lg:col-span-7 flex flex-col gap-8">
                    <div className="p-10 bg-emerald-500/10 border border-emerald-500/20 rounded-[32px] flex flex-col items-center text-center gap-6">
                        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                            <CheckCircle2 size={40} className="text-slate-900" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white">¡Firma Certificada!</h2>
                            <p className="text-slate-400 text-sm mt-2">Su documento ha sido sellado y almacenado de forma segura.</p>
                        </div>
                        <button
                            onClick={() => handleDownload(request?.signed_document_path || '', request?.document_name || 'documento')}
                            className="w-full max-w-xs py-5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl"
                        >
                            <Download size={20} /> Descargar PDF Firmado
                        </button>
                    </div>
                </div>
                <div className="lg:col-span-5">
                    <AuditTrail status="Protegido por Stark Protocol" requestID={documentId} />
                </div>
            </Layout>
        );
    }

    if (state === 'expired') {
        return (
            <Layout title="Enlace Expirado" subtitle="Esta solicitud de firma ya no es válida o ha sido cancelada.">
                <div className="lg:col-span-12 flex flex-col items-center py-20 gap-6">
                    <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 border border-amber-500/20">
                        <AlertCircle size={40} />
                    </div>
                    <p className="text-slate-400 font-medium text-center max-w-sm">
                        Por motivos de seguridad, los enlaces de firma tienen una validez temporal. Solicite un nuevo enlace al administrador.
                    </p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="lg:col-span-7 space-y-10">
                <DocumentViewer pdfUrl={pdfPreviewUrl} title={request?.document_name || 'Documento'} />
                
                <div className="bg-primary/10 border border-primary/20 rounded-3xl p-6 flex items-start gap-4">
                    <div className="p-3 bg-primary/20 rounded-2xl text-primary shrink-0">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">Revise el documento</h4>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                            Al proceder con la firma, usted acepta los términos y condiciones vinculados a este documento. Su identidad y parámetros técnicos serán registrados.
                        </p>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-5 space-y-8">
                <AuditTrail status="Esperando Firma" requestID={documentId} />
                
                <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(var(--primary),0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setState('signing')}
                    className="w-full py-6 bg-primary text-slate-900 rounded-[32px] font-black text-lg uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 flex items-center justify-center gap-4 group"
                >
                    <Sparkles className="group-hover:rotate-12 transition-transform" />
                    INICIAR FIRMA
                </motion.button>
                
                <p className="text-[10px] text-center text-slate-600 font-bold uppercase tracking-widest">
                    Procesado por Iron Silo™ Signature Engine
                </p>
            </div>
        </Layout>
    );
};
