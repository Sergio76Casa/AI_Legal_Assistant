import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useTenant } from '../../lib/TenantContext';
import {
    PenTool, Send, Copy, CheckCircle2, AlertCircle, Loader2,
    MessageCircle, Clock, Shield, X, User, ExternalLink, RefreshCw
} from 'lucide-react';

interface SignatureRequest {
    id: string;
    document_name: string;
    client_user_id: string;
    status: string;
    access_token: string;
    created_at: string;
    signed_at: string | null;
    expires_at: string;
    document_storage_path?: string;
    signed_document_path?: string;
    client_profile?: {
        full_name: string;
        username: string;
    };
}

interface ClientUser {
    id: string;
    full_name: string | null;
    username: string | null;
}

interface SignatureManagerProps {
    templateId: string;
    templateName: string;
}

export const SignatureManager: React.FC<SignatureManagerProps> = ({ templateId, templateName }) => {
    const { tenant } = useTenant();
    const [requests, setRequests] = useState<SignatureRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<ClientUser[]>([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [sending, setSending] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Load existing requests for this template
    useEffect(() => {
        if (!tenant) return;
        loadRequests();
        loadUsers();
    }, [tenant, templateId]);

    const loadRequests = async () => {
        if (!tenant) return;
        setLoading(true);

        let query = supabase
            .from('document_signature_requests')
            .select('*')
            .eq('tenant_id', tenant.id);

        if (templateId !== 'ALL') {
            query = query.eq('template_id', templateId);
        }

        const { data, error: fetchError } = await query.order('created_at', { ascending: false });

        if (!fetchError && data) {
            // Enrich with client profiles
            const enriched = await Promise.all(data.map(async (req) => {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, username')
                    .eq('id', req.client_user_id)
                    .single();
                return { ...req, client_profile: profile || undefined };
            }));
            setRequests(enriched);
        }

        setLoading(false);
    };

    const loadUsers = async () => {
        if (!tenant) return;

        const { data } = await supabase
            .from('profiles')
            .select('id, full_name, username')
            .eq('tenant_id', tenant.id)
            .eq('role', 'user');

        if (data) setUsers(data);
    };

    // Create a new signature request
    const handleCreateRequest = async () => {
        if (!tenant || !selectedUserId) return;

        setSending(true);
        setError(null);
        setSuccess(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No autenticado');

            // 1. Fetch template to get base file
            const { data: template, error: tErr } = await supabase
                .from('pdf_templates')
                .select('storage_path')
                .eq('id', templateId)
                .single();

            if (tErr || !template?.storage_path) {
                throw new Error('No se pudo encontrar el archivo base de la plantilla');
            }

            // 2. Initial copy from 'templates' to 'signatures' bucket
            // This ensures the document is archived for this specific request
            const { data: pdfBlob, error: dlErr } = await supabase.storage
                .from('templates')
                .download(template.storage_path);

            if (dlErr || !pdfBlob) throw new Error('Error al descargar base de plantilla');

            const timestamp = Date.now();
            const storagePath = `${tenant.id}/${templateId}/${timestamp}_base.pdf`;

            const { error: upErr } = await supabase.storage
                .from('signatures')
                .upload(storagePath, pdfBlob);

            if (upErr) throw new Error('Error al preparar archivo para firma');

            // 3. Create the request
            const { data: newRequest, error: insertError } = await supabase
                .from('document_signature_requests')
                .insert({
                    tenant_id: tenant.id,
                    template_id: templateId,
                    client_user_id: selectedUserId,
                    requested_by: user.id,
                    document_name: templateName,
                    document_storage_path: storagePath,
                    status: 'pending'
                })
                .select()
                .single();

            if (insertError) throw insertError;

            if (newRequest) {
                const signUrl = `${window.location.origin}/sign/${newRequest.access_token}`;
                setSuccess(`¡Solicitud creada! Enlace: ${signUrl}`);
                setShowCreateForm(false);
                setSelectedUserId('');
                loadRequests();
            }
        } catch (err: unknown) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Error al crear solicitud');
        } finally {
            setSending(false);
        }
    };

    // Copy link to clipboard
    const copyLink = (token: string, id: string) => {
        const url = `${window.location.origin}/sign/${token}`;
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Open WhatsApp share
    const shareWhatsApp = (token: string, clientName: string, docName: string) => {
        const url = `${window.location.origin}/sign/${token}`;
        const message = encodeURIComponent(
            `Hola ${clientName}, necesito tu firma digital en el documento "${docName}". ` +
            `Puedes firmarlo directamente desde tu móvil aquí:\n\n${url}\n\n` +
            `El enlace es seguro y expira en 7 días. Gracias.`
        );
        window.open(`https://wa.me/?text=${message}`, '_blank');
    };

    // View/Download signed PDF
    const handleViewFile = async (path: string) => {
        try {
            const { data, error } = await supabase.storage
                .from('signatures')
                .createSignedUrl(path, 60);

            if (error) throw error;
            window.open(data.signedUrl, '_blank');
        } catch (err: any) {
            alert('Error al acceder al archivo: ' + err.message);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">
                        <Clock size={10} /> Pendiente
                    </span>
                );
            case 'signed':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                        <CheckCircle2 size={10} /> Firmado
                    </span>
                );
            case 'expired':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-500/10 text-slate-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-slate-500/20">
                        <Clock size={10} /> Expirado
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <PenTool size={14} className="text-blue-400" />
                    Firmas Digitales
                </h4>
                <div className="flex items-center">
                    {templateId !== 'ALL' && (
                        <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-500/20 transition-colors border border-blue-500/20 mr-2"
                        >
                            <Send size={12} />
                            Solicitar Firma
                        </button>
                    )}
                    <button
                        onClick={loadRequests}
                        className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all"
                        title="Refrescar lista"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle size={16} />
                    {error}
                    <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
                </div>
            )}

            {success && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400 text-sm">
                    <CheckCircle2 size={16} />
                    <span className="flex-1 text-xs break-all">{success}</span>
                    <button onClick={() => setSuccess(null)} className="ml-auto"><X size={14} /></button>
                </div>
            )}

            {/* Create Form */}
            {showCreateForm && (
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4 animate-in slide-in-from-top-2">
                    <p className="text-sm text-slate-300 font-medium">
                        Seleccione al cliente que debe firmar <strong className="text-white">{templateName}</strong>:
                    </p>

                    <div className="flex gap-3">
                        <select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-blue-500/50"
                        >
                            <option value="" className="bg-slate-900">Seleccionar cliente...</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id} className="bg-slate-900">
                                    {u.full_name || u.username || 'Sin nombre'}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={handleCreateRequest}
                            disabled={!selectedUserId || sending}
                            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            Enviar
                        </button>
                    </div>
                </div>
            )}

            {/* Request List */}
            {loading ? (
                <div className="text-center py-8">
                    <Loader2 size={20} className="animate-spin text-slate-500 mx-auto" />
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                    <PenTool size={24} className="mx-auto mb-2 opacity-30" />
                    No hay solicitudes de firma para esta plantilla.
                </div>
            ) : (
                <div className="space-y-3">
                    {requests.map((req) => (
                        <div
                            key={req.id}
                            className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all group"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                        <User size={16} className="text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">
                                            {req.client_profile?.full_name || req.client_profile?.username || 'Cliente'}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-medium mb-1">
                                            Doc: {req.document_name}
                                        </p>
                                        <p className="text-[10px] text-slate-500">
                                            {new Date(req.created_at).toLocaleDateString('es-ES', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                {getStatusBadge(req.status)}
                            </div>

                            {/* Actions for pending */}
                            {req.status === 'pending' && (
                                <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                                    <button
                                        onClick={() => copyLink(req.access_token, req.id)}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/10 transition-colors"
                                    >
                                        {copiedId === req.id ? (
                                            <><CheckCircle2 size={12} className="text-emerald-400" /> ¡Copiado!</>
                                        ) : (
                                            <><Copy size={12} /> Copiar enlace</>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => shareWhatsApp(
                                            req.access_token,
                                            req.client_profile?.full_name || 'Cliente',
                                            req.document_name
                                        )}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                    >
                                        <MessageCircle size={12} />
                                        WhatsApp
                                    </button>
                                </div>
                            )}

                            {/* Signed: Show certificate link and file access */}
                            {req.status === 'signed' && (
                                <div className="mt-3 pt-3 border-t border-white/5 flex flex-col gap-3">
                                    <div className="flex items-center gap-2 text-emerald-400">
                                        <Shield size={14} />
                                        <span className="text-xs font-medium">
                                            Firmado el {req.signed_at ? new Date(req.signed_at).toLocaleDateString('es-ES', {
                                                day: '2-digit',
                                                month: 'long',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : 'Recientemente'}
                                        </span>
                                    </div>

                                    {req.signed_document_path ? (
                                        <button
                                            onClick={() => handleViewFile(req.signed_document_path!)}
                                            className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500/20 transition-all border border-emerald-500/20 shadow-sm"
                                        >
                                            <ExternalLink size={14} />
                                            Ver Documento Firmado
                                        </button>
                                    ) : (
                                        <div className="py-2 px-3 bg-white/5 rounded-xl border border-white/10 text-center">
                                            <p className="text-[10px] text-slate-500">
                                                Este documento se firmó antes del arreglo y el PDF no está disponible.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
