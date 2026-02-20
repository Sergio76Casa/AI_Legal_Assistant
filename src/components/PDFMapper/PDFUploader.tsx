import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTenant } from '../../lib/TenantContext';

interface PDFUploaderProps {
    onUploadSuccess: () => void;
}

export const PDFUploader: React.FC<PDFUploaderProps> = ({ onUploadSuccess }) => {
    const { tenant } = useTenant();
    const [file, setFile] = useState<File | null>(null);
    const [name, setName] = useState('');
    const [category, setCategory] = useState('general');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected && selected.type === 'application/pdf') {
            setFile(selected);
            setName(selected.name.replace('.pdf', ''));
            setError(null);
        } else {
            setError('Solo se permiten archivos PDF');
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !tenant) return;

        setUploading(true);
        setError(null);

        try {
            // 1. Upload to Storage
            const fileExt = 'pdf';
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${tenant.id}/${fileName}`; // Tenant isolation in path

            const { error: uploadError } = await supabase.storage
                .from('templates')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Register in Database
            const { error: dbError } = await supabase
                .from('pdf_templates')
                .insert({
                    tenant_id: tenant.id,
                    name: name,
                    storage_path: filePath,
                    category: category,
                    created_by: (await supabase.auth.getUser()).data.user?.id
                });

            if (dbError) throw dbError;

            setFile(null);
            setName('');
            onUploadSuccess();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error al subir la plantilla');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-primary/15 rounded-lg border border-primary/20">
                    <Upload size={20} className="text-primary" />
                </div>
                Nueva Plantilla PDF
            </h3>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 text-red-400 text-sm rounded-xl flex items-center gap-2 border border-red-500/20">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            <form onSubmit={handleUpload} className="space-y-6">
                {/* File Input */}
                {!file ? (
                    <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 text-center bg-white/5 hover:bg-white/10 transition-all cursor-pointer relative group">
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileSelect}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform bg-white/10">
                            <FileText className="h-8 w-8 text-slate-400 group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-sm font-medium text-slate-300">
                            Haz clic o arrastra un PDF aquí
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Sólo archivos PDF planos</p>
                    </div>
                ) : (
                    <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-xl">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-primary/20 rounded-lg">
                                <FileText className="text-primary" size={24} />
                            </div>
                            <div>
                                <span className="text-sm font-bold text-white block truncate max-w-[200px]">
                                    {file.name}
                                </span>
                                <span className="text-[10px] text-primary/70 uppercase font-bold tracking-wider">Listo para subir</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFile(null)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}

                {/* Metadata Inputs */}
                {file && (
                    <div className="animate-in fade-in slide-in-from-top-2 space-y-6">
                        <div className="grid gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Nombre de la Plantilla
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-white placeholder:text-slate-600 transition-all font-medium"
                                    required
                                    placeholder="Ej: Formulario EX-15"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Categoría
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-white appearance-none transition-all font-medium"
                                >
                                    <option value="general" className="bg-slate-900">General</option>
                                    <option value="immigration" className="bg-slate-900">Extranjería</option>
                                    <option value="taxes" className="bg-slate-900">Fiscal / Hacienda</option>
                                    <option value="legal" className="bg-slate-900">Legal</option>
                                    <option value="housing" className="bg-slate-900">Vivienda</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full py-4 bg-primary text-slate-900 rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20 active:scale-[0.98]"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Subiendo...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={20} />
                                        Guardar Plantilla
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};
