import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, CheckCircle2, Download, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SignatureLayout } from './SignatureLayout';
import { DocumentViewer } from './DocumentViewer';
import { AuditTrail } from './AuditTrail';
import type { TenantInfo, SignatureRequest } from '../../hooks/signature/useSignatureFlow';

export interface AuditResult {
    signedPath: string;
    signatureHash: string;
    ipAddress: string;
    timestamp: string;
}

interface BaseProps {
    tenantInfo: TenantInfo | null;
    documentId: string;
}

// --- LOADING ---

export const SignatureLoadingScreen: React.FC<BaseProps> = (props) => (
    <SignatureLayout {...props}>
        <div className="lg:col-span-12 flex flex-col items-center justify-center py-40 gap-6">
            <div className="relative">
                <div className="w-16 h-16 border-2 border-primary/10 border-t-primary rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50">Iniciando Sesión Encriptada...</p>
        </div>
    </SignatureLayout>
);

// --- ERROR ---

interface ErrorProps extends BaseProps { errorMessage: string; }

export const SignatureErrorScreen: React.FC<ErrorProps> = ({ errorMessage, ...base }) => (
    <SignatureLayout {...base} title="Error de Acceso" subtitle="No hemos podido cargar el documento solicitado.">
        <div className="lg:col-span-12 flex flex-col items-center max-w-md mx-auto text-center gap-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 border border-red-500/20">
                <AlertCircle size={40} />
            </div>
            <p className="text-slate-400 font-medium">{errorMessage}</p>
            <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-black uppercase tracking-widest text-[10px] border border-white/10 transition-all"
            >
                Reintentar
            </button>
        </div>
    </SignatureLayout>
);

// --- MISSING DATA ---

interface MissingDataProps extends BaseProps {
    missingFields: any[];
    isSavingData: boolean;
    onSubmit: (data: Record<string, string>) => void;
}

export const MissingDataForm: React.FC<MissingDataProps> = ({ missingFields, isSavingData, onSubmit, ...base }) => {
    const { t } = useTranslation();
    return (
        <SignatureLayout {...base} title="Datos Requeridos" subtitle="Proporcione la información faltante para generar el certificado de firma.">
            <div className="lg:col-span-7">
                <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 backdrop-blur-xl">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget);
                            const updates: Record<string, string> = {};
                            missingFields.forEach(f => { updates[f.field_key] = fd.get(f.field_key) as string; });
                            onSubmit(updates);
                        }}
                        className="space-y-6"
                    >
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
                            {isSavingData
                                ? <Loader2 className="animate-spin" size={20} />
                                : <>Siguiente Paso <ChevronRight size={18} /></>}
                        </button>
                    </form>
                </div>
            </div>
            <div className="lg:col-span-5">
                <AuditTrail status="Esperando Datos de Perfil" requestID={base.documentId} />
            </div>
        </SignatureLayout>
    );
};

// --- PROCESSING ---

interface ProcessingProps extends BaseProps {
    progress: string;
    progressPct: number;
}

export const SignatureProcessingScreen: React.FC<ProcessingProps> = ({ progress, progressPct, ...base }) => (
    <SignatureLayout {...base}>
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
    </SignatureLayout>
);

// --- CERTIFICATE PREVIEW ---

interface CertificatePreviewProps extends BaseProps {
    auditData: AuditResult | null;
    pdfPreviewUrl: string | null;
    onConfirm: () => void;
    onBack: () => void;
}

export const CertificatePreviewModal: React.FC<CertificatePreviewProps> = ({
    auditData, pdfPreviewUrl, onConfirm, onBack, ...base
}) => (
    <SignatureLayout {...base}>
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
                <div className="flex-1 min-h-[400px] border-r border-white/5 bg-[#050811]/50">
                    <DocumentViewer pdfUrl={pdfPreviewUrl} title="Vista Previa Firmada" />
                </div>
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
                            onClick={onConfirm}
                            className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            Autorizar Archivo Definitivo
                        </button>
                        <button
                            onClick={onBack}
                            className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-white transition-colors"
                        >
                            Volver / Corregir
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    </SignatureLayout>
);

// --- SUCCESS ---

interface SuccessProps extends BaseProps {
    request: SignatureRequest | null;
    onDownload: (path: string, fileName: string) => void;
}

export const SignatureSuccessScreen: React.FC<SuccessProps> = ({ request, onDownload, ...base }) => (
    <SignatureLayout {...base} title="Documento Firmado" subtitle="El proceso se ha completado con éxito. Se ha generado un certificado de integridad legal.">
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
                    onClick={() => onDownload(request?.signed_document_path || '', request?.document_name || 'documento')}
                    className="w-full max-w-xs py-5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl"
                >
                    <Download size={20} /> Descargar PDF Firmado
                </button>
            </div>
        </div>
        <div className="lg:col-span-5">
            <AuditTrail status="Protegido por Stark Protocol" requestID={base.documentId} />
        </div>
    </SignatureLayout>
);

// --- EXPIRED ---

export const SignatureExpiredScreen: React.FC<BaseProps> = (props) => (
    <SignatureLayout {...props} title="Enlace Expirado" subtitle="Esta solicitud de firma ya no es válida o ha sido cancelada.">
        <div className="lg:col-span-12 flex flex-col items-center py-20 gap-6">
            <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 border border-amber-500/20">
                <AlertCircle size={40} />
            </div>
            <p className="text-slate-400 font-medium text-center max-w-sm">
                Por motivos de seguridad, los enlaces de firma tienen una validez temporal. Solicite un nuevo enlace al administrador.
            </p>
        </div>
    </SignatureLayout>
);
