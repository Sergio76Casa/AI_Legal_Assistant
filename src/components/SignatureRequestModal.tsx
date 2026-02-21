import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
    PenTool, X, Send, Loader2, CheckCircle2, Copy,
    MessageCircle, Clock, Shield, FileText, AlertCircle
} from 'lucide-react';

interface SignatureRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientProfile: {
        id: string;
        full_name?: string;
        username?: string;
        email?: string;
    };
    tenantId: string;
}

interface Template {
    id: string;
    name: string;
    category: string;
}

interface ExistingRequest {
    id: string;
    document_name: string;
    status: string;
    access_token: string;
    created_at: string;
    signed_at: string | null;
    expires_at: string;
    template_id: string;
    signed_document_path: string | null;
}

export const SignatureRequestModal: React.FC<SignatureRequestModalProps> = ({
    isOpen,
    onClose,
    clientProfile,
    tenantId
}) => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [existingRequests, setExistingRequests] = useState<ExistingRequest[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const clientName = clientProfile.full_name || clientProfile.username || clientProfile.email || 'Cliente';

    // Load templates and existing requests
    useEffect(() => {
        if (!isOpen) return;
        loadData();
    }, [isOpen, tenantId, clientProfile.id]);

    const loadData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch templates
            const { data: tplData } = await supabase
                .from('pdf_templates')
                .select('id, name, category')
                .eq('tenant_id', tenantId)
                .order('name');

            setTemplates(tplData || []);

            // Fetch existing signature requests for this client
            const { data: reqData } = await supabase
                .from('document_signature_requests')
                .select('*')
                .eq('tenant_id', tenantId)
                .eq('client_user_id', clientProfile.id)
                .order('created_at', { ascending: false });

            setExistingRequests(reqData || []);
        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Create new signature request
    const handleCreateRequest = useCallback(async () => {
        if (!selectedTemplateId) return;
        setSending(true);
        setError(null);
        setSuccess(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No autenticado');

            const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
            if (!selectedTemplate) throw new Error('Plantilla no encontrada');

            // 1. Get template file path
            const { data: template, error: tErr } = await supabase
                .from('pdf_templates')
                .select('storage_path')
                .eq('id', selectedTemplateId)
                .single();

            if (tErr || !template?.storage_path) {
                throw new Error('No se pudo encontrar el archivo de la plantilla');
            }

            // 2. Archive a copy of the base PDF for this request
            const { data: pdfBlob, error: dlErr } = await supabase.storage
                .from('templates')
                .download(template.storage_path);

            if (dlErr || !pdfBlob) throw new Error('Error al preparar documento base');

            const timestamp = Date.now();
            const storagePath = `${tenantId}/${selectedTemplateId}/${timestamp}_base.pdf`;

            const { error: upErr } = await supabase.storage
                .from('signatures')
                .upload(storagePath, pdfBlob);

            if (upErr) throw new Error('Error al archivar documento para firma');

            // 3. Create the request with the archived path
            const { data: newRequest, error: insertError } = await supabase
                .from('document_signature_requests')
                .insert({
                    tenant_id: tenantId,
                    template_id: selectedTemplateId,
                    client_user_id: clientProfile.id,
                    requested_by: user.id,
                    document_name: selectedTemplate.name,
                    document_storage_path: storagePath,
                    status: 'pending'
                })
                .select()
                .single();

            if (insertError) throw insertError;

            if (newRequest) {
                setSuccess('¡Solicitud creada correctamente!');
                setSelectedTemplateId('');
                loadData(); // Refresh the list
            }
        } catch (err: unknown) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Error al crear solicitud');
        } finally {
            setSending(false);
        }
    }, [selectedTemplateId, tenantId, clientProfile.id, templates]);

    // Copy link
    const copyLink = (token: string, id: string) => {
        const url = `${window.location.origin}/sign/${token}`;
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Share via WhatsApp
    const shareWhatsApp = (token: string, docName: string) => {
        const url = `${window.location.origin}/sign/${token}`;
        const message = encodeURIComponent(
            `Hola ${clientName}, necesito tu firma digital en el documento "${docName}". ` +
            `Puedes firmarlo directamente desde tu móvil aquí:\n\n${url}\n\n` +
            `El enlace es seguro y expira en 7 días. Gracias.`
        );
        window.open(`https://wa.me/?text=${message}`, '_blank');
    };

    // Download document helper
    const handleDownload = async (path: string | null) => {
        if (!path) return;

        try {
            const { data, error } = await supabase.storage
                .from('signatures')
                .createSignedUrl(path, 60);

            if (error) throw error;
            if (data?.signedUrl) {
                window.open(data.signedUrl, '_blank');
            }
        } catch (err) {
            console.error('Error downloading document:', err);
            setError('No se pudo descargar el documento.');
        }
    };

    const getStatusBadge = (req: ExistingRequest) => {
        const isExpired = new Date(req.expires_at) < new Date();
        const status = isExpired && req.status === 'pending' ? 'expired' : req.status;

        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">
                        <Clock size={10} /> Pendiente
                    </span>
                );
            case 'signed':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                        <CheckCircle2 size={10} /> Firmado
                    </span>
                );
            case 'expired':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-500/10 text-slate-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-slate-500/20">
                        <Clock size={10} /> Expirado
                    </span>
                );
            default:
                return null;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-500/5 to-purple-500/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                            <PenTool size={20} className="text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Solicitar Firma</h3>
                            <p className="text-slate-400 text-xs">Cliente: <strong className="text-white">{clientName}</strong></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={loadData}
                            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            title="Refrescar lista"
                        >
                            <Loader2 size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content (scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 size={24} className="animate-spin text-slate-500" />
                        </div>
                    ) : (
                        <>
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
                                    {success}
                                    <button onClick={() => setSuccess(null)} className="ml-auto"><X size={14} /></button>
                                </div>
                            )}

                            <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                                <button
                                    onClick={handleCreateRequest}
                                    disabled={!selectedTemplateId || sending}
                                    className="w-full px-6 py-3 bg-amber-500 text-slate-900 rounded-xl text-sm font-black hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                    SOLICITAR ESTA FIRMA AHORA
                                </button>

                                <select
                                    value={selectedTemplateId}
                                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-amber-500/50 transition-colors"
                                >
                                    <option value="" className="bg-slate-900">Seleccionar documento...</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id} className="bg-slate-900">
                                            {t.name} {t.category ? `(${t.category})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Existing Requests */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <FileText size={12} />
                                    Solicitudes ({existingRequests.length})
                                </h4>

                                {existingRequests.length === 0 ? (
                                    <p className="text-sm text-slate-500 text-center py-4 italic">
                                        No hay solicitudes de firma para este cliente.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {existingRequests.map((req) => (
                                            <div
                                                key={req.id}
                                                className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-sm font-bold text-white truncate flex-1 mr-3">
                                                        {req.document_name}
                                                    </p>
                                                    {getStatusBadge(req)}
                                                </div>

                                                <p className="text-[10px] text-slate-500 mb-3">
                                                    Creada: {new Date(req.created_at).toLocaleDateString('es-ES', {
                                                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>

                                                {/* Actions for pending requests */}
                                                {req.status === 'pending' && new Date(req.expires_at) > new Date() && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => copyLink(req.access_token, req.id)}
                                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-300 hover:bg-white/10 transition-colors"
                                                        >
                                                            {copiedId === req.id ? (
                                                                <><CheckCircle2 size={12} className="text-emerald-400" /> ¡Copiado!</>
                                                            ) : (
                                                                <><Copy size={12} /> Copiar enlace</>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => shareWhatsApp(req.access_token, req.document_name)}
                                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                                        >
                                                            <MessageCircle size={12} />
                                                            WhatsApp
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Signed indicator and Actions */}
                                                {req.status === 'signed' && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                                                            <Shield size={14} />
                                                            <span className="text-xs font-medium">
                                                                Firmado el {req.signed_at ? new Date(req.signed_at).toLocaleDateString('es-ES', {
                                                                    day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit'
                                                                }) : 'recientemente'}
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleDownload(req.signed_document_path)}
                                                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition-colors"
                                                            >
                                                                <FileText size={12} />
                                                                Descargar PDF
                                                            </button>
                                                            <button
                                                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-500/10 border border-slate-500/20 rounded-lg text-xs font-bold text-slate-300 hover:bg-slate-500/20 transition-colors"
                                                                title="Próximamente: Certificado de Firma"
                                                            >
                                                                <Shield size={12} />
                                                                Certificado
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
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
