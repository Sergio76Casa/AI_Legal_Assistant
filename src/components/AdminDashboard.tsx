import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, CheckCircle2, AlertCircle, Loader2, Globe, Trash2, RefreshCw, Eye, X, Building, Users, Shield, ExternalLink, FileText, Calendar, Sparkles, File as FileIcon, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '../lib/utils';

import { OrganizationPanel } from './OrganizationPanel';
import { AdminEarnings } from './AdminEarnings';

export const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'content' | 'tenants' | 'organization' | 'earnings'>('earnings');
    const [file, setFile] = useState<File | null>(null);
    const [country, setCountry] = useState<string>('ES');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [globalDocuments, setGlobalDocuments] = useState<any[]>([]);
    const [tenants, setTenants] = useState<any[]>([]);
    const [viewingDoc, setViewingDoc] = useState<{ name: string, content: string } | null>(null);
    const [userProfile, setUserProfile] = useState<any>(null);

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
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            setUserProfile(data);
        }
    };

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
    const [updatingPlan, setUpdatingPlan] = useState<string | null>(null);

    const handleUpdatePlan = async (tenantId: string, newPlan: string) => {
        setUpdatingPlan(tenantId);
        try {
            const { error } = await supabase
                .from('tenants')
                .update({ plan: newPlan })
                .eq('id', tenantId);

            if (error) throw error;

            setStatus({ type: 'success', message: '¡Plan actualizado con éxito!' });
            fetchTenants();
        } catch (error: any) {
            console.error('Error updating plan:', error);
            setStatus({ type: 'error', message: 'Error al actualizar plan: ' + error.message });
        } finally {
            setUpdatingPlan(null);
        }
    };

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
        <div className="max-w-7xl mx-auto p-6 pt-24 min-h-screen">
            {/* Header & Tabs */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-sm border border-white/10 p-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/15 rounded-xl text-primary border border-primary/20">
                            <Shield size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Superadmin Console (V2)</h1>
                            <p className="text-slate-400">Gestión global de leyes, organizaciones y sistema.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSync}
                            className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                            title="Sincronizar datos"
                        >
                            <RefreshCw size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl w-fit">
                    {[
                        { id: 'earnings', icon: <TrendingUp size={18} />, label: 'Mis Ganancias' },
                        { id: 'content', icon: <Globe size={18} />, label: 'Leyes Globales' },
                        { id: 'tenants', icon: <Building size={18} />, label: 'Organizaciones (Control)' },
                        { id: 'organization', icon: <Users size={18} />, label: 'Configuración Propia' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all",
                                activeTab === tab.id
                                    ? "bg-white/10 text-white shadow-sm"
                                    : "text-slate-400 hover:text-white"
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
                    status.type === 'success' ? "bg-primary/10 text-primary border border-primary/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                )}>
                    {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium">{status.message}</span>
                    <button onClick={() => setStatus(null)} className="ml-auto p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* TAB: Global Content Management */}
            {activeTab === 'content' && (
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Upload Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-sm border border-white/10 p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Upload size={20} className="text-slate-400" />
                                Subir Nueva Ley
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Región / País</label>
                                    <select
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                                    >
                                        <option value="ES">España (General)</option>
                                        <option value="MA">Marruecos</option>
                                        <option value="DZ">Argelia</option>
                                        <option value="GLOBAL">Internacional / Otros</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Archivo PDF</label>
                                    <div
                                        className={cn(
                                            "border-2 border-dashed rounded-2xl p-8 text-center transition-all group cursor-pointer",
                                            file ? "border-primary/30 bg-primary/5" : "border-white/15 hover:border-white/30 hover:bg-white/5"
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
                                        <FileText className={cn("mx-auto h-12 w-12 mb-4", file ? "text-primary" : "text-slate-500 group-hover:text-slate-400")} />
                                        <p className="text-sm font-bold text-white">{file ? file.name : "Seleccionar PDF"}</p>
                                        <p className="text-xs text-slate-500 mt-1">Límite 20MB</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleUpload}
                                    disabled={!file || isUploading}
                                    className="w-full py-4 bg-primary text-slate-900 font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
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
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-sm border border-white/10 overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <h3 className="font-bold text-white">Repositorio de Leyes</h3>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{globalDocuments.length} Documentos</span>
                            </div>
                            <div className="divide-y divide-white/5">
                                {globalDocuments.map((doc) => (
                                    <div key={doc.id} className="p-6 hover:bg-white/5 transition-all group">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="px-2 py-0.5 rounded bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-wider">
                                                        {doc.country}
                                                    </span>
                                                    <h4 className="font-bold text-white truncate">{doc.name}</h4>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400 font-medium">
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar size={14} />
                                                        {format(new Date(doc.created_at), 'dd MMM yyyy', { locale: es })}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-primary">
                                                        <Sparkles size={14} />
                                                        {doc.kbCount} fragmentos en IA
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-xs text-slate-500 italic">
                                                    IA identifica como: {doc.aiTitle}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleViewContent(doc)}
                                                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all border border-transparent hover:border-white/10"
                                                    title="Ver contenido procesado"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteDoc(doc.id, doc.url)}
                                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/20"
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
                                        <FileIcon size={48} className="mx-auto text-slate-600 mb-4" />
                                        <p className="text-slate-500 font-medium italic">No hay documentos globales cargados.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: Organizations / Tenants */}
            {activeTab === 'tenants' && (
                <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-sm border border-white/10 overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <h3 className="font-bold text-white">Organizaciones en el Sistema</h3>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{tenants.length} Tenants</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-white/10">
                                    <th className="px-6 py-4">Organización</th>
                                    <th className="px-6 py-4">Slug</th>
                                    <th className="px-6 py-4">Creado</th>
                                    <th className="px-6 py-4">Plan</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {tenants.map((tenant) => (
                                    <tr key={tenant.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-primary/15 text-primary flex items-center justify-center font-bold text-xs">
                                                    {tenant.name.charAt(0)}
                                                </div>
                                                <span className="font-bold text-white">{tenant.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-slate-300 font-mono gap-2 group-hover:bg-white/15 transition-colors">
                                                {tenant.slug}
                                                <a
                                                    href={`/${tenant.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title="Ver página pública"
                                                    className="text-slate-400 hover:text-primary transition-colors"
                                                >
                                                    <ExternalLink size={12} />
                                                </a>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400">
                                            {format(new Date(tenant.created_at), 'dd/MM/yyyy')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={tenant.plan || 'free'}
                                                onChange={(e) => handleUpdatePlan(tenant.id, e.target.value)}
                                                disabled={updatingPlan === tenant.id}
                                                className={cn(
                                                    "px-2 py-1 rounded text-[10px] font-bold uppercase border-none focus:ring-1 focus:ring-primary cursor-pointer transition-all",
                                                    tenant.plan === 'enterprise' ? "bg-primary/15 text-primary" :
                                                        tenant.plan === 'business' ? "bg-purple-500/15 text-purple-400" :
                                                            tenant.plan === 'pro' ? "bg-blue-500/15 text-blue-400" :
                                                                "bg-white/10 text-slate-400"
                                                )}
                                            >
                                                <option value="free">Free</option>
                                                <option value="pro">Pro</option>
                                                <option value="business">Business</option>
                                                <option value="enterprise">Enterprise</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleViewTeam(tenant)}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all border border-transparent hover:border-white/10"
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
            {activeTab === 'organization' && userProfile?.tenant_id && (
                <OrganizationPanel tenantId={userProfile.tenant_id} />
            )}

            {activeTab === 'earnings' && (
                <AdminEarnings />
            )}
            {activeTab === 'organization' && !userProfile?.tenant_id && (
                <div className="p-12 text-center bg-white/5 rounded-2xl border border-white/10 italic text-slate-500">
                    No estás asociado a ninguna organización personal.
                </div>
            )}

            {/* Content Preview Modal */}
            {viewingDoc && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewingDoc(null)} />
                    <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-white/10">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0 bg-white/5">
                            <div>
                                <h3 className="text-lg font-bold text-white">Vista de Memoria IA</h3>
                                <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-0.5">{viewingDoc.name}</p>
                            </div>
                            <button onClick={() => setViewingDoc(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto font-mono text-sm leading-relaxed text-slate-300 bg-[#0b1120]">
                            {viewingDoc.content.split('\n').map((line, i) => (
                                <p key={i} className="mb-2 whitespace-pre-wrap">{line}</p>
                            ))}
                        </div>
                        <div className="p-6 border-t border-white/10 bg-white/5 shrink-0">
                            <button
                                onClick={() => setViewingDoc(null)}
                                className="w-full py-3 bg-primary text-slate-900 font-bold rounded-xl hover:bg-primary/90 transition-colors"
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
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTenant(null)} />
                    <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-white/10">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0 bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/15 text-primary rounded-lg border border-primary/20">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Equipo de {selectedTenant.name}</h3>
                                    <p className="text-xs text-primary font-bold uppercase tracking-widest">{tenantUsers.length} Miembros activos</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedTenant(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-0 overflow-y-auto">
                            {isLoadingUsers ? (
                                <div className="p-12 text-center">
                                    <Loader2 className="animate-spin mx-auto text-slate-500" size={32} />
                                    <p className="mt-4 text-slate-400 font-medium">Cargando equipo...</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {tenantUsers.map((u) => (
                                        <div key={u.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-slate-300 border border-white/10 overflow-hidden">
                                                    {u.username?.charAt(0) || u.email.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">{u.username || 'Usuario'}</p>
                                                    <p className="text-sm text-slate-400 font-medium">{u.email}</p>
                                                </div>
                                            </div>
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                u.role === 'admin' ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" : "bg-white/10 text-slate-400 border border-white/10"
                                            )}>
                                                {u.role}
                                            </span>
                                        </div>
                                    ))}
                                    {tenantUsers.length === 0 && (
                                        <div className="p-12 text-center text-slate-500 italic font-medium">
                                            Sin usuarios registrados todavía.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-white/10 bg-white/5 shrink-0">
                            <button
                                onClick={() => setSelectedTenant(null)}
                                className="w-full py-3 bg-primary text-slate-900 font-bold rounded-xl hover:bg-primary/90 transition-colors"
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
