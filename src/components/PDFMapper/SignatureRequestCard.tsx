/**
 * SignatureRequestCard — Tarjeta de solicitud de firma digital
 *
 * Muestra el estado (pending / signed / expired), las acciones disponibles
 * y la información del cliente para cada solicitud.
 */

import React, { useState } from 'react';
import {
    User, Clock, CheckCircle2, Shield,
    Copy, MessageCircle, ExternalLink,
} from 'lucide-react';
import type { SignatureRequest } from '../../hooks/useSignatureRequests';

interface SignatureRequestCardProps {
    request:       SignatureRequest;
    onViewFile:    (path: string) => Promise<void>;
}

// ─── Badge de estado ──────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    pending: {
        icon: Clock,
        label: 'Pendiente',
        className: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    },
    signed: {
        icon: CheckCircle2,
        label: 'Firmado',
        className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    expired: {
        icon: Clock,
        label: 'Expirado',
        className: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    },
} as const;

const StatusBadge: React.FC<{ status: SignatureRequest['status'] }> = ({ status }) => {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.expired;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cfg.className}`}>
            <Icon size={10} /> {cfg.label}
        </span>
    );
};

// ─── Acciones para solicitudes pendientes ─────────────────────────────────────

const PendingActions: React.FC<{ request: SignatureRequest }> = ({ request }) => {
    const [copied, setCopied] = useState(false);

    const copyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/sign/${request.access_token}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareWhatsApp = () => {
        const url   = `${window.location.origin}/sign/${request.access_token}`;
        const name  = request.client_profile?.full_name ?? 'Cliente';
        const doc   = request.document_name;
        const msg   = encodeURIComponent(
            `Hola ${name}, necesito tu firma digital en el documento "${doc}". ` +
            `Puedes firmarlo directamente desde tu móvil aquí:\n\n${url}\n\n` +
            `El enlace es seguro y expira en 7 días. Gracias.`
        );
        window.open(`https://wa.me/?text=${msg}`, '_blank');
    };

    return (
        <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
            <button
                onClick={copyLink}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/10 transition-colors"
            >
                {copied ? (
                    <><CheckCircle2 size={12} className="text-emerald-400" /> ¡Copiado!</>
                ) : (
                    <><Copy size={12} /> Copiar enlace</>
                )}
            </button>

            <button
                onClick={shareWhatsApp}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
                <MessageCircle size={12} /> WhatsApp
            </button>
        </div>
    );
};

// ─── Sección de documento firmado ─────────────────────────────────────────────

const SignedSection: React.FC<{
    request:    SignatureRequest;
    onViewFile: (path: string) => Promise<void>;
}> = ({ request, onViewFile }) => {
    const signedDate = request.signed_at
        ? new Date(request.signed_at).toLocaleDateString('es-ES', {
            day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit',
          })
        : 'Recientemente';

    return (
        <div className="mt-3 pt-3 border-t border-white/5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-emerald-400">
                <Shield size={14} />
                <span className="text-xs font-medium">Firmado el {signedDate}</span>
            </div>

            {request.signed_document_path ? (
                <button
                    onClick={() => onViewFile(request.signed_document_path!)}
                    className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500/20 transition-all border border-emerald-500/20"
                >
                    <ExternalLink size={14} /> Ver Documento Firmado
                </button>
            ) : (
                <div className="py-2 px-3 bg-white/5 rounded-xl border border-white/10 text-center">
                    <p className="text-[10px] text-slate-500">
                        Este documento se firmó antes del arreglo y el PDF no está disponible.
                    </p>
                </div>
            )}
        </div>
    );
};

// ─── Componente principal ─────────────────────────────────────────────────────

export const SignatureRequestCard: React.FC<SignatureRequestCardProps> = ({
    request, onViewFile,
}) => {
    const clientName = request.client_profile?.full_name
        ?? request.client_profile?.username
        ?? 'Cliente';

    const createdDate = new Date(request.created_at).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric',
    });

    return (
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all group">
            {/* Cabecera de la card */}
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                        <User size={16} className="text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white leading-tight">{clientName}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                            {request.document_name}
                        </p>
                        <p className="text-[10px] text-slate-500">{createdDate}</p>
                    </div>
                </div>
                <StatusBadge status={request.status} />
            </div>

            {/* Acciones por estado */}
            {request.status === 'pending' && <PendingActions request={request} />}
            {request.status === 'signed'  && <SignedSection  request={request} onViewFile={onViewFile} />}
        </div>
    );
};
