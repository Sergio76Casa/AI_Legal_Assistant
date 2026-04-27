/**
 * SignatureModalRequestCard — Tarjeta de solicitud de firma para el modal de cliente
 *
 * Diferencias respecto a SignatureRequestCard (PDFMapper):
 *  - Muestra el documento como dato primario (no el cliente, que ya es el contexto del modal).
 *  - Calcula el estado efectivo incluyendo la expiración por fecha (via resolveRequestStatus).
 *  - Incluye el botón "Certificado" (próximamente) en el estado 'signed'.
 *  - Usa buildWhatsAppMessage del servicio para eliminar strings duplicados.
 */

import React, { useState } from 'react';
import {
    Clock, CheckCircle2, Copy, MessageCircle,
    FileText, Shield, AlertTriangle,
} from 'lucide-react';
import {
    resolveRequestStatus,
    buildWhatsAppMessage,
} from '../services/signatureService';
import type { ModalSignatureRequest } from '../hooks/useSignatureModal';

interface SignatureModalRequestCardProps {
    request:    ModalSignatureRequest;
    clientName: string;
    onDownload: (path: string | null) => Promise<void>;
}

// ─── Badge de estado ──────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    pending: {
        icon: Clock,
        label: 'Pendiente',
        className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    signed: {
        icon: CheckCircle2,
        label: 'Firmado',
        className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    expired: {
        icon: AlertTriangle,
        label: 'Expirado',
        className: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    },
} as const;

type EffectiveStatus = keyof typeof STATUS_CONFIG;

const StatusBadge: React.FC<{ status: EffectiveStatus }> = ({ status }) => {
    const { icon: Icon, label, className } = STATUS_CONFIG[status];
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${className}`}>
            <Icon size={10} /> {label}
        </span>
    );
};

// ─── Acciones: Solicitud pendiente y vigente ──────────────────────────────────

const PendingActions: React.FC<{
    request:    ModalSignatureRequest;
    clientName: string;
}> = ({ request, clientName }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(`${window.location.origin}/sign/${request.access_token}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWhatsApp = () => {
        const message = buildWhatsAppMessage({
            clientName,
            documentName: request.document_name,
            accessToken:  request.access_token,
        });
        window.open(`https://wa.me/?text=${message}`, '_blank');
    };

    return (
        <div className="flex gap-2 mt-3">
            <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-300 hover:bg-white/10 transition-colors"
            >
                {copied
                    ? <><CheckCircle2 size={12} className="text-emerald-400" /> ¡Copiado!</>
                    : <><Copy size={12} /> Copiar enlace</>
                }
            </button>

            <button
                onClick={handleWhatsApp}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
                <MessageCircle size={12} /> WhatsApp
            </button>
        </div>
    );
};

// ─── Acciones: Solicitud firmada ──────────────────────────────────────────────

const SignedActions: React.FC<{
    request:    ModalSignatureRequest;
    onDownload: (path: string | null) => Promise<void>;
}> = ({ request, onDownload }) => {
    const signedDate = request.signed_at
        ? new Date(request.signed_at).toLocaleDateString('es-ES', {
            day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit',
          })
        : 'recientemente';

    return (
        <div className="mt-3 space-y-2">
            {/* Indicador de firma */}
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/5 px-2 py-1.5 rounded-lg border border-emerald-500/10">
                <Shield size={12} className="shrink-0" />
                <span className="text-[10px] font-medium">Firmado el {signedDate}</span>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2">
                <button
                    onClick={() => onDownload(request.signed_document_path)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition-colors"
                >
                    <FileText size={12} /> Descargar PDF
                </button>

                <button
                    disabled
                    title="Próximamente: Certificado de Firma Electrónica"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-500/10 border border-slate-500/20 rounded-lg text-xs font-bold text-slate-500 cursor-not-allowed"
                >
                    <Shield size={12} /> Certificado
                </button>
            </div>
        </div>
    );
};

// ─── Componente principal ────────────────────────────────────────────────────

export const SignatureModalRequestCard: React.FC<SignatureModalRequestCardProps> = ({
    request,
    clientName,
    onDownload,
}) => {
    const effectiveStatus = resolveRequestStatus(request.status, request.expires_at);

    const createdDate = new Date(request.created_at).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

    return (
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all">

            {/* Cabecera de la card */}
            <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-bold text-white truncate flex-1 leading-tight">
                    {request.document_name}
                </p>
                <StatusBadge status={effectiveStatus} />
            </div>

            <p className="text-[10px] text-slate-500 mb-3">
                Creada: {createdDate}
            </p>

            {/* Acciones condicionales por estado */}
            {effectiveStatus === 'pending' && (
                <PendingActions request={request} clientName={clientName} />
            )}

            {effectiveStatus === 'signed' && (
                <SignedActions request={request} onDownload={onDownload} />
            )}

            {effectiveStatus === 'expired' && (
                <p className="text-[10px] text-slate-600 italic text-center py-1">
                    Este enlace de firma ha expirado.
                </p>
            )}
        </div>
    );
};
