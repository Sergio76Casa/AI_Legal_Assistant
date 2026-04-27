/**
 * SignatureManager — Orquestador del sistema de firmas digitales
 *
 * Compone: useSignatureRequests + SignatureCreateForm + SignatureRequestCard
 * Implementa el estándar de cabecera corporativo: Icono + Serif + Subtítulo.
 */

import React, { useState } from 'react';
import { PenTool, Send, RefreshCw, AlertCircle, CheckCircle2, X, Loader2 } from 'lucide-react';
import { useTenant } from '../../lib/TenantContext';
import { useSignatureRequests } from '../../hooks/useSignatureRequests';
import { SignatureRequestCard }  from './SignatureRequestCard';
import { SignatureCreateForm }   from './SignatureCreateForm';

const NIL_UUID = '00000000-0000-0000-0000-000000000000';
const isValidId = (id: string | undefined): id is string => !!id && id !== NIL_UUID;

interface SignatureManagerProps {
    templateId:   string;
    templateName: string;
    tenantId?:    string;
}

export const SignatureManager: React.FC<SignatureManagerProps> = ({ templateId, templateName, tenantId: tenantIdProp }) => {
    const { tenant } = useTenant();
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Prioridad: prop explícito (si es válido) > contexto.
    // Evita que el nil UUID del superadmin pise el tenant real pasado desde el padre.
    const tenantId = isValidId(tenantIdProp) ? tenantIdProp : (tenant?.id ?? '');

    const {
        requests, users, loading, sending, error, success, selectedUserId,
        setSelectedUserId, setError, setSuccess,
        loadRequests, handleCreateRequest, handleViewFile,
    } = useSignatureRequests({
        templateId,
        templateName,
        tenantId,
    });

    const handleSubmit = async () => {
        await handleCreateRequest();
        setShowCreateForm(false);
    };

    return (
        <div className="space-y-5">

            {/* ── Cabecera corporativa: Icono + Serif + Subtítulo ── */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 shrink-0">
                        <PenTool size={16} className="text-blue-400" />
                    </div>
                    <div>
                        <h4 className="font-serif text-base font-bold text-white leading-tight">
                            Firmas Digitales
                        </h4>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-0.5">
                            Solicitudes · {templateId === 'ALL' ? 'Todas las plantillas' : templateName}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {templateId !== 'ALL' && (
                        <button
                            onClick={() => setShowCreateForm(v => !v)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-500/20 transition-colors border border-blue-500/20"
                        >
                            <Send size={12} />
                            Solicitar Firma
                        </button>
                    )}
                    <button
                        onClick={loadRequests}
                        disabled={loading}
                        className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all disabled:opacity-50"
                        title="Refrescar lista"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* ── Mensajes de error / éxito ── */}
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle size={16} className="shrink-0" />
                    <span className="flex-1 text-xs">{error}</span>
                    <button onClick={() => setError(null)} className="shrink-0 hover:text-red-300 transition-colors">
                        <X size={14} />
                    </button>
                </div>
            )}

            {success && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400 text-sm">
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span className="flex-1 text-xs break-all">{success}</span>
                    <button onClick={() => setSuccess(null)} className="shrink-0 hover:text-emerald-300 transition-colors">
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* ── Formulario de creación (toggle) ── */}
            {showCreateForm && (
                <SignatureCreateForm
                    templateName={templateName}
                    users={users}
                    selectedUserId={selectedUserId}
                    sending={sending}
                    onSelectUser={setSelectedUserId}
                    onSubmit={handleSubmit}
                />
            )}

            {/* ── Lista de solicitudes ── */}
            {loading ? (
                <div className="flex items-center justify-center py-10">
                    <Loader2 size={22} className="animate-spin text-slate-500" />
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                    <PenTool size={28} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-medium">No hay solicitudes de firma todavía.</p>
                    {templateId !== 'ALL' && (
                        <p className="text-xs text-slate-600 mt-1">
                            Usa "Solicitar Firma" para crear la primera.
                        </p>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {requests.map(req => (
                        <SignatureRequestCard
                            key={req.id}
                            request={req}
                            onViewFile={handleViewFile}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
