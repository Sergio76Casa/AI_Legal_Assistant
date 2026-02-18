import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';
import { useTenant } from '../../lib/TenantContext';

interface PDFUploaderProps {
    onUploadSuccess: () => void;
}

export const PDFUploader: React.FC<PDFUploaderProps> = ({ onUploadSuccess }) => {
    const { t } = useTranslation();
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
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Upload size={20} className="text-emerald-600" />
                Nueva Plantilla PDF
            </h3>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
                {/* File Input */}
                {!file ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileSelect}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <FileText className="mx-auto h-10 w-10 text-slate-400 mb-2" />
                        <p className="text-sm font-medium text-slate-600">
                            Haz clic o arrastra un PDF aquí
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Sólo archivos PDF planos</p>
                    </div>
                ) : (
                    <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                        <div className="flex items-center gap-3">
                            <FileText className="text-emerald-600" size={20} />
                            <span className="text-sm font-medium text-emerald-900 truncate max-w-[200px]">
                                {file.name}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFile(null)}
                            className="text-emerald-700 hover:text-emerald-900"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}

                {/* Metadata Inputs */}
                {file && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <div className="grid gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Nombre de la Plantilla
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Categoría
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                >
                                    <option value="general">General</option>
                                    <option value="immigration">Extranjería</option>
                                    <option value="taxes">Fiscal / Hacienda</option>
                                    <option value="legal">Legal</option>
                                    <option value="housing">Vivienda</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Subiendo...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={18} />
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
