import React from 'react';
import { ArrowLeft, ArrowRight, Minus, Plus } from 'lucide-react';

interface PDFFloatingToolbarProps {
    pageNumber: number;
    numPages: number;
    scale: number;
    setPageNumber: React.Dispatch<React.SetStateAction<number>>;
    setScale: React.Dispatch<React.SetStateAction<number>>;
}

export const PDFFloatingToolbar: React.FC<PDFFloatingToolbarProps> = ({
    pageNumber,
    numPages,
    scale,
    setPageNumber,
    setScale
}) => {
    return (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-[#0A0F1D]/80 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[130]">
            <div className="flex items-center gap-1 bg-white/5 rounded-full px-1 p-0.5">
                <button
                    onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                    className="p-2.5 text-slate-400 hover:text-white transition-colors disabled:opacity-20"
                    disabled={pageNumber === 1}
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="px-4 text-[11px] font-black text-white min-w-[80px] text-center border-x border-white/5">
                    {pageNumber} / {numPages}
                </div>
                <button
                    onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
                    className="p-2.5 text-slate-400 hover:text-white transition-colors disabled:opacity-20"
                    disabled={pageNumber === numPages}
                >
                    <ArrowRight size={18} />
                </button>
            </div>

            <div className="w-px h-6 bg-white/10 mx-1 lg:mx-2" />

            <div className="flex items-center gap-1">
                <button
                    onClick={() => setScale(s => Math.max(0.2, s - 0.1))}
                    className="p-2.5 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-full hover:bg-white/10"
                >
                    <Minus size={18} />
                </button>
                <span className="text-[10px] font-black text-white w-14 text-center uppercase tracking-tighter">
                    {Math.round(scale * 100)}%
                </span>
                <button
                    onClick={() => setScale(s => Math.min(3.0, s + 0.1))}
                    className="p-2.5 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-full hover:bg-white/10"
                >
                    <Plus size={18} />
                </button>
            </div>
        </div>
    );
};
