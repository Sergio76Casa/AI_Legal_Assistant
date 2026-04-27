/**
 * SignatureRequestModal — Orquestador del modal de firmas por cliente
 *
 * Ensambla: useSignatureModal + SignatureModalRequestCard
 * Sigue el estándar corporativo de cabecera: Icono + Serif + Subtítulo.
 */

import React from 'react';
import { PenTool, X, Send, Loader2, AlertCircle, CheckCircle2, FileText, RefreshCw } from 'lucide-react';
import { useSignatureModal } from '../hooks/useSignatureModal';
import { SignatureModalRequestCard } from './SignatureModalRequestCard';

interface SignatureRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientProfile: {
        id:        string;
        full_name?: string;
        username?:  string;
        email?:     string;
    };
    tenantId: string;
}

export const SignatureRequestModal: React.FC<SignatureRequestModalProps> = ({
    isOpen,
    onClose,
    clientProfile,
    tenantId,
}) => {
    const clientName =
        clientProfile.full_name ??
        clientProfile.username  ??
        clientProfile.email     ??
        'Cliente';

    const {
        templates, existingRequests,
        selectedTemplateId,
        loading, sending, error, success,
        setSelectedTemplateId, setError, setSuccess,
        loadData, handleCreateRequest, handleDownload,
    } = useSignatureModal({
        isOpen,
        tenantId,
        clientId:   clientProfile.id,
        clientName,
    });

    if (!isOpen) return null;

    return (
        /* ── Backdrop ─────────────────────────────────────────────────────── */
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* ── Panel del modal ────────────────────────────────────────── */}
            <div
                className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* ── Cabecera: Icono + Serif + Subtítulo ────────────────── */}
                <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-500/5 to-purple-500/5 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0">
                            <PenTool size={18} className="text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-serif text-lg font-bold text-white leading-tight">
                                Solicitar Firma Digital
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Cliente: <strong className="text-white">{clientName}</strong>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            onClick={loadData}
                            disabled={loading}
                            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-40"
                            title="Refrescar lista"
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            aria-label="Cerrar modal"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* ── Contenido scrollable ───────────────────────────────── */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 size={24} className="animate-spin text-slate-500" />
                        </div>
                    ) : (
                        <>
                            {/* Alertas de error / éxito */}
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                                    <AlertCircle size={15} className="shrink-0" />
                                    <span className="flex-1 text-xs">{error}</span>
                                    <button onClick={() => setError(null)} className="shrink-0 hover:text-red-300 transition-colors">
                                        <X size={13} />
                                    </button>
                                </div>
                            )}

                            {success && (
                                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400 text-sm">
                                    <CheckCircle2 size={15} className="shrink-0" />
                                    <span className="flex-1 text-xs">{success}</span>
                                    <button onClick={() => setSuccess(null)} className="shrink-0 hover:text-emerald-300 transition-colors">
                                        <X size={13} />
                                    </button>
                                </div>
                            )}

                            {/* ── Formulario de nueva solicitud ────────────── */}
                            <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                                <select
                                    value={selectedTemplateId}
                                    onChange={e => setSelectedTemplateId(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-amber-500/50 transition-colors"
                                >
                                    <option value="" className="bg-slate-900">
                                        Seleccionar documento...
                                    </option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id} className="bg-slate-900">
                                            {t.name}{t.category ? ` (${t.category})` : ''}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    onClick={handleCreateRequest}
                                    disabled={!selectedTemplateId || sending}
                                    className="w-full px-6 py-3 bg-amber-500 text-slate-900 rounded-xl text-sm font-black hover:bg-amber-400 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {sending
                                        ? <Loader2 size={14} className="animate-spin" />
                                        : <Send size={14} />
                                    }
                                    SOLICITAR ESTA FIRMA AHORA
                                </button>
                            </div>

                            {/* ── Lista de solicitudes existentes ──────────── */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <FileText size={11} />
                                    Solicitudes ({existingRequests.length})
                                </h4>

                                {existingRequests.length === 0 ? (
                                    <p className="text-sm text-slate-500 text-center py-6 italic">
                                        No hay solicitudes de firma para este cliente.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {existingRequests.map(req => (
                                            <SignatureModalRequestCard
                                                key={req.id}
                                                request={req}
                                                clientName={clientName}
                                                onDownload={handleDownload}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
