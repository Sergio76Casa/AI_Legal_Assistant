/**
 * PDFEditorHeader — Barra de herramientas superior del editor PDF
 */

import React from 'react';
import { X, Eye, DownloadCloud, Save, Loader2, Wand2 } from 'lucide-react';

interface PDFEditorHeaderProps {
    onClose:          () => void;
    onPreview:        () => void;
    onImportMaster:   () => void;
    generatingPreview: boolean;
    isImporting:      boolean;
}

export const PDFEditorHeader: React.FC<PDFEditorHeaderProps> = ({
    onClose,
    onPreview,
    onImportMaster,
    generatingPreview,
    isImporting,
}) => {
    return (
        <header className="h-16 bg-[#020617]/95 backdrop-blur-xl border-b border-white/5 px-4 lg:px-8 flex items-center justify-between z-[150] shrink-0">

            {/* Branding */}
            <div className="flex items-center gap-2 lg:gap-6">
                <button
                    onClick={onClose}
                    className="p-2.5 text-slate-400 hover:text-white transition-all rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 group"
                    title="Cerrar editor"
                >
                    <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>

                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg border border-primary/20 hidden sm:block">
                        <Wand2 size={16} className="text-primary" />
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-sm lg:text-base flex items-center gap-2 leading-none">
                            PDF Mapper
                            <span className="hidden xs:inline-block text-[8px] bg-primary text-slate-950 px-1.5 py-0.5 rounded font-black tracking-tighter">
                                PRO
                            </span>
                        </h2>
                        <p className="hidden lg:block text-[9px] text-slate-500 uppercase tracking-widest font-black mt-1">
                            Smart Template Engine
                        </p>
                    </div>
                </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2 lg:gap-3">
                {/* Importar Mapeo Maestro */}
                <button
                    onClick={onImportMaster}
                    disabled={isImporting}
                    className="hidden lg:flex bg-white/5 text-purple-400 border border-white/5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider items-center gap-2 hover:bg-white/10 hover:border-purple-500/30 transition-all disabled:opacity-50"
                >
                    {isImporting
                        ? <Loader2 className="animate-spin" size={14} />
                        : <DownloadCloud size={14} />
                    }
                    <span>Importar Maestro</span>
                </button>

                {/* Preview */}
                <button
                    onClick={onPreview}
                    disabled={generatingPreview}
                    className="bg-white/5 text-primary border border-white/5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 hover:bg-white/10 hover:border-primary/30 transition-all disabled:opacity-50"
                >
                    {generatingPreview
                        ? <Loader2 className="animate-spin" size={14} />
                        : <Eye size={14} />
                    }
                    <span className="hidden sm:inline">Visualizar</span>
                </button>

                {/* Guardar (Action Primary) */}
                <button
                    onClick={onClose}
                    className="bg-primary text-slate-950 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    <Save size={14} />
                    <span>Guardar y Salir</span>
                </button>
            </div>
        </header>
    );
};
