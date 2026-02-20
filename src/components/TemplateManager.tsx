import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../lib/TenantContext';
import { PDFUploader } from './PDFMapper/PDFUploader';
import { PDFEditor } from './PDFMapper/PDFEditor';
import { FileText, Map, Trash2, Calendar, Loader2, Plus, LayoutGrid } from 'lucide-react';

export const TemplateManager = () => {
    const { tenant } = useTenant();
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUploader, setShowUploader] = useState(false);
    const [editorTemplate, setEditorTemplate] = useState<any | null>(null);
    const [signedUrl, setSignedUrl] = useState<string | null>(null);

    useEffect(() => {
        if (tenant) fetchTemplates();
    }, [tenant]);

    const fetchTemplates = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('pdf_templates')
            .select('*')
            .eq('tenant_id', tenant?.id)
            .order('created_at', { ascending: false });

        setTemplates(data || []);
        setLoading(false);
    };

    const handleDelete = async (id: string, storagePath: string) => {
        if (!window.confirm('¿Estás seguro de eliminar esta plantilla?')) return;

        // 1. Delete text database
        const { error: dbError } = await supabase.from('pdf_templates').delete().eq('id', id);
        if (dbError) {
            alert('Error al eliminar base de datos: ' + dbError.message);
            return;
        }

        // 2. Delete file (Best effort)
        await supabase.storage.from('templates').remove([storagePath]);

        fetchTemplates();
    };

    const openEditor = async (template: any) => {
        // Create signed URL for the editor
        const { data, error } = await supabase.storage
            .from('templates')
            .createSignedUrl(template.storage_path, 3600); // 1 hour

        if (error || !data) {
            alert('Error al obtener URL del archivo');
            return;
        }

        setSignedUrl(data.signedUrl);
        setEditorTemplate(template);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <LayoutGrid size={24} className="text-primary" />
                        Gestor de Plantillas PDF
                    </h2>
                    <p className="text-slate-400 mt-1 text-sm">Sube formularios y define dónde insertar los datos de tus clientes.</p>
                </div>
                <button
                    onClick={() => setShowUploader(!showUploader)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-slate-900 rounded-full hover:bg-primary/90 transition-all font-bold text-sm shadow-lg shadow-primary/20"
                >
                    {showUploader ? 'Cancelar' : <><Plus size={18} /> Nueva Plantilla</>}
                </button>
            </div>

            {/* Uploader Section */}
            {showUploader && (
                <div className="mb-8 animate-in fade-in slide-in-from-top-4">
                    <PDFUploader onUploadSuccess={() => { setShowUploader(false); fetchTemplates(); }} />
                </div>
            )}

            {/* Template List */}
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-500" size={32} /></div>
            ) : templates.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-2xl border-2 border-dashed border-white/15">
                    <FileText className="mx-auto h-12 w-12 text-slate-600 mb-3" />
                    <p className="text-slate-400 font-medium">No hay plantillas configuradas.</p>
                    <p className="text-sm text-slate-500">Sube tu primer PDF para empezar a automatizar.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((tpl) => (
                        <div key={tpl.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-primary/30 hover:bg-white/10 transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-white/10 rounded-lg text-slate-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                    <FileText size={24} />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEditor(tpl)}
                                        className="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg"
                                        title="Editar Mapeo"
                                    >
                                        <Map size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(tpl.id, tpl.storage_path)}
                                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-bold text-white mb-1 truncate" title={tpl.name}>{tpl.name}</h3>
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-4 bg-white/10 inline-block px-2 py-0.5 rounded">
                                {tpl.category || 'General'}
                            </p>

                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-2 border-t border-white/10 pt-3">
                                <Calendar size={14} />
                                {new Date(tpl.created_at).toLocaleDateString()}
                            </div>

                            <button
                                onClick={() => openEditor(tpl)}
                                className="w-full mt-4 py-2 border border-white/15 rounded-lg text-sm font-medium text-slate-400 hover:border-primary hover:text-primary transition-colors"
                            >
                                Configurar Campos
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Editor Modal */}
            {editorTemplate && signedUrl && (
                <PDFEditor
                    templateId={editorTemplate.id}
                    templateUrl={signedUrl}
                    onClose={() => { setEditorTemplate(null); setSignedUrl(null); }}
                />
            )}
        </div>
    );
};
