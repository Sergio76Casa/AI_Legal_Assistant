import React from 'react';
import { X } from 'lucide-react';

interface ViewContentModalProps {
    doc: { name: string, content: string } | null;
    onClose: () => void;
}

export const ViewContentModal: React.FC<ViewContentModalProps> = ({ doc, onClose }) => {
    if (!doc) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-white/10">
                <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0 bg-white/5">
                    <div>
                        <h3 className="text-lg font-bold text-white">Vista de Memoria IA</h3>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-0.5">{doc.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-8 overflow-y-auto font-mono text-sm leading-relaxed text-slate-300 bg-[#0b1120]">
                    {doc.content.split('\n').map((line, i) => (
                        <p key={i} className="mb-2 whitespace-pre-wrap">{line}</p>
                    ))}
                </div>
                <div className="p-6 border-t border-white/10 bg-white/5 shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-primary text-slate-900 font-bold rounded-xl hover:bg-primary/90 transition-colors"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
};
