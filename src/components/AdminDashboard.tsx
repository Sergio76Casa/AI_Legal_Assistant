import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Globe, Calendar, Trash2, RefreshCw, File, Eye, X, Building, Users, Shield, ExternalLink } from 'lucide-react';
import { StatsPanel } from './StatsPanel';
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
    const [isViewing, setIsViewing] = useState(false);

    const fetchGlobalDocuments = async () => {
        setIsUploading(true);
        try {
            const { data: docs, error: docsError } = await supabase
                .from('documents')
                .select('*')
                // .or('tenant_id.eq.0000...,tenant_id.is.null') // REMOVED: Fetching ALL for debug/superadmin
                .order('created_at', { ascending: false });

            if (docsError) throw docsError;

            const { data: kbData } = await supabase
                .from('knowledge_base')
                .select('title, metadata');
            // .or('tenant_id.eq.0000...,tenant_id.is.null');

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
            // Obtenemos TODOS los tenants (El RLS actualizado permitirá al Superadmin ver todos)
            const { data, error } = await supabase
                .from('tenants')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            console.log('Tenants fetched for Superadmin:', data);
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
        setIsViewing(true);
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
        } finally {
            setIsViewing(false);
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
                            <p className="text-slate-500 text-sm">Control central de {tenants.length} organizaciones y conocimiento global</p>
                        </div>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('content')}
                            className={cn(
                                "px-6 py-2 rounded-md text-sm font-medium transition-all",
                                activeTab === 'content' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <Globe size={16} />
                                <span>Base Global</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('tenants')}
                            className={cn(
                                "px-6 py-2 rounded-md text-sm font-medium transition-all",
                                activeTab === 'tenants' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <Building size={16} />
                                <span>Organizaciones</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('organization')}
                            className={cn(
                                "px-6 py-2 rounded-md text-sm font-medium transition-all",
                                activeTab === 'organization' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <Users size={16} />
                                <span>Mi Equipo</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Status Messages */}
                {status && (
                    <div className={cn(
                        "p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300",
                        status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                    )}>
                        {status.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                        <span className="font-medium">{status.message}</span>
                    </div>
                )}

                {/* DEBUG PANEL - TEMPORARY */}

            </div>

            {/* Content: Global Knowledge */}
            {activeTab === 'content' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Upload size={20} className="text-blue-500" />
                                Ingesta de Leyes (PDF)
                            </h3>
                            {/* País Selector */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Jurisdicción
                                </label>
                                <select
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="ES">🇪🇸 España</option>
                                    <option value="FR">🇫🇷 Francia</option>
                                    <option value="GB">🇬🇧 Reino Unido</option>
                                    <option value="MA">🇲🇦 Marruecos</option>
                                    <option value="US">🇺🇸 Estados Unidos</option>
                                </select>
                            </div>

                            {/* Upload Box */}
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-400 transition-colors bg-slate-50/50 mb-6 group">
                                <input
                                    type="file"
                                    id="pdf-upload"
                                    className="hidden"
                                    accept=".pdf"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                                <label htmlFor="pdf-upload" className="cursor-pointer block">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className="h-8 w-8 text-blue-500" />
                                    </div>
                                    <span className="text-slate-900 font-medium block">
                                        {file ? file.name : 'Arrastra o selecciona un PDF'}
                                    </span>
                                    <span className="text-xs text-slate-400 mt-1 block">Solo archivos oficiales</span>
                                </label>
                            </div>

                            <button
                                onClick={handleUpload}
                                disabled={!file || isUploading}
                                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>Procesando... {Math.round(uploadProgress)}%</span>
                                    </>
                                ) : 'Subir a Memoria Global'}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Globe size={20} className="text-emerald-500" />
                                    Docs Activos
                                </h3>
                                <button onClick={handleSync} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                    <RefreshCw size={16} className={cn("text-slate-500", isUploading && "animate-spin")} />
                                </button>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-slate-100">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500 font-medium">
                                        <tr>
                                            <th className="px-4 py-3">Documento</th>
                                            <th className="px-4 py-3 text-center">País</th>
                                            <th className="px-4 py-3 text-center">Estado</th>
                                            <th className="px-4 py-3 text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {globalDocuments.map((doc) => (
                                            <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-slate-900 truncate max-w-[180px]" title={doc.name}>{doc.name}</div>
                                                    <div className="text-xs text-slate-400">{format(new Date(doc.created_at), 'dd MMM yyyy', { locale: es })}</div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                                                        {doc.country}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <div className={cn("w-2 h-2 rounded-full", doc.kbCount > 0 ? "bg-emerald-500" : "bg-amber-400 animate-pulse")} />
                                                        <span className="text-xs text-slate-500">{doc.kbCount > 0 ? 'Indexed' : 'Processing'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <button onClick={() => handleViewContent(doc)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                                            <Eye size={16} />
                                                        </button>
                                                        <button onClick={() => handleDeleteDoc(doc.id, doc.url)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Content: Organizations (Tenants) */}
            {activeTab === 'tenants' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg mb-1">Organizaciones Registradas</h3>
                            <p className="text-sm text-slate-500">Gestión de Tenants y sus estados</p>
                        </div>
                        <button onClick={fetchTenants} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs">Total: {tenants.length}</span>
                            <RefreshCw size={16} />
                            Actualizar
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                    <th className="px-6 py-4">Organización</th>
                                    <th className="px-6 py-4">Slug / ID</th>
                                    <th className="px-6 py-4">Plan</th>
                                    <th className="px-6 py-4">Creación</th>
                                    <th className="px-6 py-4 text-center">Usuarios</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tenants.map((tenant) => (
                                    <tr key={tenant.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                                                    {tenant.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{tenant.name}</div>
                                                    <div className="text-xs text-slate-400 font-mono">{tenant.id}</div>
                                                </div>
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
                                        <td className="p-4">
                                            <select
                                                value={tenant.plan || 'free'}
                                                onChange={async (e) => {
                                                    const newPlan = e.target.value;
                                                    if (!confirm(`¿Cambiar plan de ${tenant.name} a ${newPlan}?`)) return;

                                                    try {
                                                        const { error } = await supabase
                                                            .rpc('update_tenant_plan', {
                                                                target_tenant_id: tenant.id,
                                                                new_plan: newPlan
                                                            });

                                                        if (error) throw error;
                                                        setStatus({ type: 'success', message: `Plan actualizado a ${newPlan}` });
                                                        fetchTenants();
                                                    } catch (err: any) {
                                                        setStatus({ type: 'error', message: err.message });
                                                    }
                                                }}
                                                className={cn(
                                                    "text-xs px-2 py-1 rounded-full font-bold border-none outline-none cursor-pointer appearance-none text-center min-w-[80px]",
                                                    tenant.plan === 'business' ? 'bg-purple-100 text-purple-700' :
                                                        tenant.plan === 'pro' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-600'
                                                )}
                                            >
                                                <option value="free">Free</option>
                                                <option value="pro">Pro</option>
                                                <option value="business">Business</option>
                                                <option value="enterprise">Enterprise</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {format(new Date(tenant.created_at), 'dd MMM yyyy', { locale: es })}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleViewTeam(tenant)}
                                                className="text-slate-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-1 mx-auto hover:bg-blue-50 px-3 py-1.5 rounded-lg"
                                            >
                                                <Users size={16} />
                                                <span className="text-xs font-medium">Ver Equipo</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {tenants.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                            No se encontraron organizaciones.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Viewer Modal */}
            {viewingDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{viewingDoc.name}</h3>
                                <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Contenido Indexado en IA</p>
                            </div>
                            <button
                                onClick={() => setViewingDoc(null)}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                            >
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto bg-white text-slate-700 leading-relaxed font-mono text-sm whitespace-pre-wrap">
                            {viewingDoc.content}
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <button
                                onClick={() => setViewingDoc(null)}
                                className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Team Modal */}
            {selectedTenant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                                    {selectedTenant.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{selectedTenant.name}</h3>
                                    <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Gestión de Equipo</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedTenant(null)}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                            >
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        <div className="p-0 overflow-y-auto bg-white">
                            {isLoadingUsers ? (
                                <div className="p-12 flex flex-col items-center justify-center text-slate-400">
                                    <Loader2 className="animate-spin mb-2" size={32} />
                                    <p>Cargando usuarios...</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-3">Usuario</th>
                                            <th className="px-6 py-3">Email</th>
                                            <th className="px-6 py-3 text-center">Rol</th>
                                            <th className="px-6 py-3 text-right">Fecha Ingreso</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {tenantUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-900">
                                                        {user.username || 'Usuario'}
                                                    </div>
                                                    <div className="text-xs text-slate-400 font-mono">{user.id.substring(0, 8)}...</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {user.email}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={cn(
                                                        "inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                                                        user.role === 'admin' || user.role === 'superadmin'
                                                            ? "bg-purple-100 text-purple-700"
                                                            : "bg-slate-100 text-slate-600"
                                                    )}>
                                                        {user.role || 'member'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm text-slate-500">
                                                    {user.created_at ? format(new Date(user.created_at), 'dd MMM yyyy', { locale: es }) : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                        {tenantUsers.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                                    No hay usuarios registrados en este tenant.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                            <button
                                onClick={() => setSelectedTenant(null)}
                                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Content: My Organization */}
            {activeTab === 'organization' && (
                <OrganizationPanel tenantId="00000000-0000-0000-0000-000000000000" />
            )}
        </div>
    );
};
