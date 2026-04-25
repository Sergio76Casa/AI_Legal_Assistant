import React, { useState } from 'react';
import { Upload, Trash2, Eye, FileText, Calendar, Sparkles, File as FileIcon, Loader2, Clock, RefreshCw, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { ViewHeader } from './ViewHeader';

interface GlobalContentTabProps {
    documents: any[];
    isUploading: boolean;
    uploadProgress: number;
    onUpload: (file: File, country: string) => void;
    onView: (doc: any) => void;
    onDelete: (id: string, url: string) => void;
    onToggleLaw: (url: string, currentState: boolean) => void;
    onReprocess: (id: string, url: string) => void;
    isAdmin: boolean;
}

export const GlobalContentTab: React.FC<GlobalContentTabProps> = ({
    documents,
    isUploading,
    uploadProgress,
    onUpload,
    onView,
    onDelete,
    onToggleLaw,
    onReprocess
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [country, setCountry] = useState<string>('ES');

    const handleInternalUpload = () => {
        if (file) {
            onUpload(file, country);
            setFile(null);
        }
    };

    return (
        <div className="page-enter space-y-12">
            <ViewHeader 
                icon={ShieldAlert} 
                title="Leyes Globales" 
                subtitle="Repositorio Estratégico de Normativas"
                badge="Memoria Stark"
                badgeColor="emerald"
            />

            <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-3 gap-8 pb-20">
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
                                    <p className="text-xs text-slate-500 mt-1">PDF · Cualquier tamaño · 200+ páginas OK</p>
                                </div>
                            </div>

                            <button
                                onClick={handleInternalUpload}
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

                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-sm border border-white/10 overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h3 className="font-bold text-white">Repositorio de Leyes</h3>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{documents.length} Documentos</span>
                        </div>
                        <div className="divide-y divide-white/5">
                            {documents.map((doc) => (
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
                                                {doc.status === 'processing' ? (
                                                    <span className="flex items-center gap-1.5 text-amber-400 animate-pulse">
                                                        <Loader2 size={14} className="animate-spin" />
                                                        Procesando fragmentos...
                                                    </span>
                                                ) : doc.status === 'failed' ? (
                                                    <span className="flex items-center gap-1.5 text-red-400">
                                                        <Clock size={14} />
                                                        Error al procesar
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-primary">
                                                        <Sparkles size={14} />
                                                        {doc.kbCount} fragmentos en IA
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-2 text-xs text-slate-500 italic">
                                                IA identifica como: {doc.aiTitle}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5">
                                                <button
                                                    onClick={() => onToggleLaw(doc.url, doc.isEnabled ?? true)}
                                                    className={cn(
                                                        "w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none",
                                                        (doc.isEnabled ?? true) ? "bg-green-500/80" : "bg-white/20"
                                                    )}
                                                >
                                                    <div
                                                        className={cn(
                                                            "w-3 h-3 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out",
                                                            (doc.isEnabled ?? true) ? "translate-x-5" : "translate-x-0"
                                                        )}
                                                    />
                                                </button>
                                                <span className={cn(
                                                    "text-xs font-bold uppercase tracking-wider",
                                                    (doc.isEnabled ?? true) ? "text-green-400" : "text-slate-500"
                                                )}>
                                                    {(doc.isEnabled ?? true) ? "Activa" : "Inactiva"}
                                                </span>
                                            </div>

                                            {(doc.status === 'processing' || doc.status === 'failed') && (
                                                <button
                                                    onClick={() => onReprocess(doc.id, doc.url)}
                                                    title="Re-procesar fragmentos"
                                                    className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-all border border-transparent hover:border-amber-500/20"
                                                >
                                                    <RefreshCw size={18} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => onView(doc)}
                                                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all border border-transparent hover:border-white/10"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(doc.id, doc.url)}
                                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/20"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {documents.length === 0 && !isUploading && (
                                <div className="p-12 text-center">
                                    <FileIcon size={48} className="mx-auto text-slate-600 mb-4" />
                                    <p className="text-slate-500 font-medium italic">No hay documentos globales cargados.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
