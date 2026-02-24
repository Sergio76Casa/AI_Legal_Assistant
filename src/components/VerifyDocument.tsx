import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Loader2, AlertCircle, FileText, Fingerprint, Lock, Globe, Clock, ChevronLeft, CheckCircle2 } from 'lucide-react';

interface VerifyDocumentProps {
    documentId: string;
}

interface VerificationData {
    success: boolean;
    error?: string;
    document_name?: string;
    signed_at?: string;
    signer_name?: string;
    ip_obfuscated?: string;
    signature_hash?: string;
    tenant_id?: string;
}

export const VerifyDocument: React.FC<VerifyDocumentProps> = ({ documentId }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<VerificationData | null>(null);

    useEffect(() => {
        const verifyDocument = async () => {
            // Frontend Rate Limiting Logic (Security measure against brute-force)
            const ATTEMPTS_KEY = 'legalflow_verify_attempts';
            const BLOCK_TIME_KEY = 'legalflow_verify_blocked_until';

            const blockedUntil = localStorage.getItem(BLOCK_TIME_KEY);
            if (blockedUntil && new Date().getTime() < parseInt(blockedUntil)) {
                setData({ success: false, error: 'Demasiados intentos. Por razones de seguridad, espere 15 minutos.' });
                setLoading(false);
                return;
            }

            if (!documentId) {
                setData({ success: false, error: 'ID de documento no proporcionado.' });
                setLoading(false);
                return;
            }

            try {
                // Call public RPC
                const { data: result, error } = await supabase.rpc('verify_document_public', {
                    p_request_id: documentId
                });

                if (error) throw error;
                setData(result);

                // Reset attempts on success
                localStorage.removeItem(ATTEMPTS_KEY);
                localStorage.removeItem(BLOCK_TIME_KEY);
            } catch (err: any) {
                console.error('Verification error:', err);

                // Increment failed attempts
                const attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0') + 1;
                localStorage.setItem(ATTEMPTS_KEY, attempts.toString());
                if (attempts >= 5) {
                    localStorage.setItem(BLOCK_TIME_KEY, (new Date().getTime() + 15 * 60000).toString());
                }

                // Si la ID no es un UUID válido, supabase lanza error de sintaxis en el RPC.
                setData({ success: false, error: 'Identificador de documento inválido o no encontrado.' });
            } finally {
                setLoading(false);
            }
        };

        verifyDocument();
    }, [documentId]);

    const handleBack = () => {
        window.history.pushState({}, '', '/');
        // Usar evento de popstate o forzar recarga si no hay listener global
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0f1d] flex flex-col items-center justify-center p-4">
                <Loader2 className="animate-spin text-primary mb-4" size={40} />
                <p className="text-slate-400 font-medium tracking-wide">Analizando Integridad Criptográfica...</p>
                <div className="mt-8 flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
                    <Lock size={14} /> Iron Silo™ Security
                </div>
            </div>
        );
    }

    if (!data?.success) {
        return (
            <div className="min-h-screen bg-[#0a0f1d] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-[#0f172a] rounded-3xl p-8 border border-red-500/20 shadow-2xl text-center relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500/50 via-red-500/20 to-transparent"></div>
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="text-red-500" size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-white mb-2">Verificación Fallida</h1>
                    <p className="text-slate-400 mb-8">{data?.error || 'No se pudo verificar la integridad del documento.'}</p>
                    <button
                        onClick={handleBack}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                        <ChevronLeft size={18} /> Volver
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0f1d] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="max-w-lg w-full bg-[#0f172a]/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative z-10">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                        <div className="w-24 h-24 bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-primary/30 rounded-2xl flex items-center justify-center relative shadow-lg">
                            <ShieldCheck className="text-primary" size={48} />

                            {/* Decorative scan line */}
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/50 shadow-[0_0_8px_theme(colors.primary.DEFAULT)] animate-[scan_2s_ease-in-out_infinite]"></div>
                        </div>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">Original & Íntegro</h1>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
                        <CheckCircle2 size={12} /> Certificado Válido
                    </div>
                </div>

                {/* Data Layout */}
                <div className="space-y-4 mb-10">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-start gap-4">
                            <FileText className="text-slate-400 shrink-0 mt-1" size={20} />
                            <div className="overflow-hidden">
                                <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-1">Documento</p>
                                <p className="text-sm font-bold text-white truncate">{data.document_name}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors flex items-start gap-4">
                        <Fingerprint className="text-primary shrink-0 mt-1" size={20} />
                        <div className="overflow-hidden w-full">
                            <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-1">Hash Criptográfico (SHA-256)</p>
                            <p className="text-xs font-mono text-slate-300 break-all leading-relaxed bg-[#0a0f1d] p-3 rounded-xl border border-white/5">
                                {data.signature_hash}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <Clock className="text-slate-400 mb-2" size={16} />
                            <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-1">Fecha de Firma</p>
                            <p className="text-xs font-bold text-white">
                                {new Date(data.signed_at!).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                            </p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <Globe className="text-slate-400 mb-2" size={16} />
                            <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-1">IP Auditoría</p>
                            <p className="text-xs font-bold text-white">
                                {data.ip_obfuscated}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Notes */}
                <div className="text-center">
                    <p className="text-[10px] text-slate-500 leading-relaxed mb-6 px-4">
                        Este documento está protegido por el protocolo <strong className="text-slate-300">Iron Silo™</strong>.
                        Cualquier modificación posterior a la firma invalidará el identificador criptográfico mostrado arriba.
                    </p>

                    <button
                        onClick={() => {
                            window.history.pushState({}, '', '/');
                            window.location.reload();
                        }}
                        className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
                    >
                        Volver a la plataforma
                    </button>
                </div>

            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes scan {
                    0%, 100% { top: 0%; opacity: 0; }
                    10%, 90% { opacity: 1; }
                    50% { top: 100%; opacity: 1; }
                }
            `}} />
        </div>
    );
};
