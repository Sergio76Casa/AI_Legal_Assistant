import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, CheckCircle2, AlertCircle, Loader2, Globe, Trash2, RefreshCw, Eye, X, Building, Users, Shield, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '../lib/utils';

import { OrganizationPanel } from './OrganizationPanel';

export const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'content' | 'tenants' | 'organization'>('content');
    const [file, setFile] = useState<File | null>(null);
    const [country, setCountry] = useState<string>('ES');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [globalDocuments, setGlobalDocuments] = useState<any[]>([]);
    const [tenants, setTenants] = useState<any[]>([]);
    const [viewingDoc, setViewingDoc] = useState<{ name: string, content: string } | null>(null);

    const fetchGlobalDocuments = async () => {
        setIsUploading(true);
        try {
            const { data: docs, error: docsError } = await supabase
                .from('documents')
                .select('*')
                .order('created_at', { ascending: false });

            if (docsError) throw docsError;

            const { data: kbData } = await supabase
                .from('knowledge_base')
                .select('title, metadata');

            const docsWithKb = docs?.map(doc => {
                const kbEntries = kbData?.filter(kb => kb.metadata?.source === doc.url) || [];
                return {
                    ...doc,
                    kbCount: kbEntries.length,
                    aiTitle: kbEntries[0]?.title || 'Pendiente de procesar'
                };
            });

            setGlobalDocuments(docsWithKb || []);
        } catch (error: any) {
            console.error('Error fetching docs:', error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const fetchTenants = async () => {
        try {
            const { data, error } = await supabase
                .from('tenants')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTenants(data || []);
        } catch (error: any) {
            console.error('Error fetching tenants:', error);
            setStatus({ type: 'error', message: 'Error cargando organizaciones: ' + error.message });
        }
    };

    useEffect(() => {
        fetchGlobalDocuments();
        fetchTenants();
    }, []);

    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(true);
        setStatus(null);
        try {
            const filePath = `${country}/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from('legal-global')
                .upload(filePath, file, {
                    onUploadProgress: (progress: any) => {
                        const percent = (progress.loaded / progress.total) * 100;
                        setUploadProgress(percent);
                    }
                } as any);

            if (uploadError) throw uploadError;

            const { data: docData, error: dbError } = await supabase
                .from('documents')
                .insert({
                    name: file.name,
                    url: filePath,
                    user_id: null,
                    type: 'pdf',
                    status: 'processing',
                    country: country
                })
                .select('id')
                .single();

            if (dbError) throw dbError;

            const { error: processError } = await supabase.functions.invoke('process-pdf', {
                body: {
                    bucket_id: 'legal-global',
                    file_path: filePath,
                    user_id: null,
                    document_id: docData?.id
                }
            });

            if (processError) throw processError;

            setStatus({ type: 'success', message: `¡Documento legal de ${country} cargado y procesado con éxito!` });
            setFile(null);
            fetchGlobalDocuments();
        } catch (error: any) {
            setStatus({ type: 'error', message: `Error: ${error.message}` });
        } finally {
            setIsUploading(false);
        }
    };


    const handleViewContent = async (doc: any) => {
        try {
            const { data, error } = await supabase
                .from('knowledge_base')
                .select('content')
                .eq('metadata->>source', doc.url)
                .order('id', { ascending: true });

            if (error) throw error;

            const fullContent = data?.map(d => d.content).join('\n\n---\n\n') || 'No hay contenido disponible todavía.';
            setViewingDoc({ name: doc.name, content: fullContent });
        } catch (error: any) {
            console.error('Error viewing doc:', error.message);
            alert('No se pudo cargar el contenido del documento.');
        }
    };

    const handleDeleteDoc = async (id: string, url: string) => {
        if (!confirm('¿Estás seguro de eliminar este documento legal? Esto lo borrará de la lista, del almacenamiento y de la memoria de la IA.')) return;
        try {
            await supabase.from('knowledge_base').delete().eq('metadata->>source', url);
            await supabase.storage.from('legal-global').remove([url]);
            const { error: dbError } = await supabase.from('documents').delete().eq('id', id);
            if (dbError) throw dbError;
            setStatus({ type: 'success', message: 'Documento y memoria de IA eliminados correctamente.' });
            fetchGlobalDocuments();
        } catch (error: any) {
            setStatus({ type: 'error', message: `Error al eliminar: ${error.message}` });
        }
    };

    const handleSync = () => {
        fetchGlobalDocuments();
        fetchTenants();
        setStatus({ type: 'success', message: 'Datos sincronizados.' });
    };

    const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
    const [tenantUsers, setTenantUsers] = useState<any[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    const fetchTenantUsers = async (tenantId: string) => {
        setIsLoadingUsers(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('tenant_id', tenantId);

            if (error) throw error;
            setTenantUsers(data || []);
        } catch (error: any) {
            console.error('Error fetching tenant users:', error);
            setStatus({ type: 'error', message: 'Error cargando usuarios: ' + error.message });
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const handleViewTeam = (tenant: any) => {
        setSelectedTenant(tenant);
        fetchTenantUsers(tenant.id);
    };

    return (
        <div className="max-w-7xl mx-auto p-6 pt-24 min-h-screen bg-slate-50">
            {/* Header & Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-900 rounded-xl text-white">
                            <Shield size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Superadmin Console</h1>
                            <p className="text-slate-500">Gestión global de leyes, organizaciones y sistema.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSync}
                            className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                            title="Sincronizar datos"
                        >
                            <RefreshCw size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
                    {[
                        { id: 'content', icon: <Globe size={18} />, label: 'Leyes Globales' },
                        { id: 'tenants', icon: <Building size={18} />, label: 'Organizaciones' },
                        { id: 'organization', icon: <Users size={18} />, label: 'Configuración Propia' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all",
                                activeTab === tab.id
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {status && (
                <div className={cn(
                    "mb-8 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300",
                    status.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                )}>
                    {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium">{status.message}</span>
                    <button onClick={() => setStatus(null)} className="ml-auto p-1.5 hover:bg-black/5 rounded-lg transition-colors">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* TAB: Global Content Management */}
            {activeTab === 'content' && (
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Upload Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Upload size={20} className="text-slate-400" />
                                Subir Nueva Ley
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Región / País</label>
                                    <select
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                                    >
                                        <option value="ES">España (General)</option>
                                        <option value="MA">Marruecos</option>
                                        <option value="DZ">Argelia</option>
                                        <option value="GLOBAL">Internacional / Otros</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Archivo PDF</label>
                                    <div
                                        className={cn(
                                            "border-2 border-dashed rounded-2xl p-8 text-center transition-all group cursor-pointer",
                                            file ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                                        )}
                                        onClick={() => document.getElementById('file-upload')?.click()}
                                    >
                                        <input
                                            id="file-upload"
                                            type="file"
                                            className="hidden"
                                            accept=".pdf"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        />
                                        <FileText className={cn("mx-auto h-12 w-12 mb-4", file ? "text-emerald-500" : "text-slate-300 group-hover:text-slate-400")} />
                                        <p className="text-sm font-bold text-slate-900">{file ? file.name : "Seleccionar PDF"}</p>
                                        <p className="text-xs text-slate-500 mt-1">Límite 20MB</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleUpload}
                                    disabled={!file || isUploading}
                                    className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-900/10 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            {uploadProgress > 0 ? `Subiendo ${Math.round(uploadProgress)}%` : "Procesando..."}
                                        </>
                                    ) : "Subir a Memoria Global"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-bold text-slate-900">Repositorio de Leyes</h3>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{globalDocuments.length} Documentos</span>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {globalDocuments.map((doc) => (
                                    <div key={doc.id} className="p-6 hover:bg-slate-50/80 transition-all group">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
                                                        {doc.country}
                                                    </span>
                                                    <h4 className="font-bold text-slate-900 truncate">{doc.name}</h4>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 font-medium">
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar size={14} />
                                                        {format(new Date(doc.created_at), 'dd MMM yyyy', { locale: es })}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-emerald-600">
                                                        <Sparkles size={14} />
                                                        {doc.kbCount} fragmentos en IA
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-xs text-slate-400 italic">
                                                    IA identifica como: {doc.aiTitle}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleViewContent(doc)}
                                                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100"
                                                    title="Ver contenido procesado"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteDoc(doc.id, doc.url)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-red-100"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {globalDocuments.length === 0 && !isUploading && (
                                    <div className="p-12 text-center">
                                        <File size={48} className="mx-auto text-slate-200 mb-4" />
                                        <p className="text-slate-400 font-medium italic">No hay documentos globales cargados.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: Organizations / Tenants */}
            {activeTab === 'tenants' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-900">Organizaciones en el Sistema</h3>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{tenants.length} Tenants</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                                    <th className="px-6 py-4">Organización</th>
                                    <th className="px-6 py-4">Slug</th>
                                    <th className="px-6 py-4">Creado</th>
                                    <th className="px-6 py-4">Plan</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {tenants.map((tenant) => (
                                    <tr key={tenant.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                                                    {tenant.name.charAt(0)}
                                                </div>
                                                <span className="font-bold text-slate-900">{tenant.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 font-mono gap-2 group-hover:bg-slate-200 transition-colors">
                                                {tenant.slug}
                                                <a
                                                    href={`/${tenant.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title="Ver página pública"
                                                    className="text-slate-400 hover:text-emerald-600 transition-colors"
                                                >
                                                    <ExternalLink size={12} />
                                                </a>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {format(new Date(tenant.created_at), 'dd/MM/yyyy')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase">Enterprise</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleViewTeam(tenant)}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100"
                                            >
                                                <Users size={14} />
                                                Gestionar Equipo
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB: Own Organization (Standard OrganizationPanel) */}
            {activeTab === 'organization' && (
                <OrganizationPanel />
            )}

            {/* Content Preview Modal */}
            {viewingDoc && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setViewingDoc(null)} />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Vista de Memoria IA</h3>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-0.5">{viewingDoc.name}</p>
                            </div>
                            <button onClick={() => setViewingDoc(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto font-mono text-sm leading-relaxed text-slate-600 bg-slate-50/30">
                            {viewingDoc.content.split('\n').map((line, i) => (
                                <p key={i} className="mb-2 whitespace-pre-wrap">{line}</p>
                            ))}
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-white shrink-0">
                            <button
                                onClick={() => setViewingDoc(null)}
                                className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Team Management Modal (Quick view) */}
            {selectedTenant && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedTenant(null)} />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Equipo de {selectedTenant.name}</h3>
                                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">{tenantUsers.length} Miembros activos</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedTenant(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-0 overflow-y-auto">
                            {isLoadingUsers ? (
                                <div className="p-12 text-center">
                                    <Loader2 className="animate-spin mx-auto text-slate-300" size={32} />
                                    <p className="mt-4 text-slate-500 font-medium">Cargando equipo...</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {tenantUsers.map((u) => (
                                        <div key={u.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 border border-slate-200 overflow-hidden">
                                                    {u.username?.charAt(0) || u.email.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{u.username || 'Usuario'}</p>
                                                    <p className="text-sm text-slate-500 font-medium">{u.email}</p>
                                                </div>
                                            </div>
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                u.role === 'admin' ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-slate-50 text-slate-600 border border-slate-100"
                                            )}>
                                                {u.role}
                                            </span>
                                        </div>
                                    ))}
                                    {tenantUsers.length === 0 && (
                                        <div className="p-12 text-center text-slate-400 italic font-medium">
                                            Sin usuarios registrados todavía.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-white shrink-0">
                            <button
                                onClick={() => setSelectedTenant(null)}
                                className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
                            >
                                Cerrar Panel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
