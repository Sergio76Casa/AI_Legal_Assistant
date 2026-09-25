import React from 'react';
import { createPortal } from 'react-dom';
import { X, Info } from 'lucide-react';
import { IconMap } from './FooterLinkColumn';

interface FooterLinkModalProps {
    activeModal: any | null;
    onClose: () => void;
    getLocalized: (link: any, field: 'title' | 'content') => string;
}

export const FooterLinkModal: React.FC<FooterLinkModalProps> = ({ activeModal, onClose, getLocalized }) => {
    if (!activeModal) return null;

    const Icon = IconMap[activeModal.icon] ?? Info;

    return createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-slate-950/85 animate-fade-in">
            <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col my-auto">

                <div className="p-6 sm:p-8 pb-4 flex items-center justify-between border-b border-white/5 shrink-0">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2.5 sm:p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary shrink-0">
                            <Icon size={24} />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                            {getLocalized(activeModal, 'title')}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 sm:p-3 text-slate-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 sm:p-8 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="text-slate-300 leading-relaxed text-base sm:text-lg font-medium whitespace-pre-wrap">
                        {getLocalized(activeModal, 'content')}
                    </div>
                </div>

                <div className="p-6 sm:p-8 pt-4 flex justify-end shrink-0 border-t border-white/5 bg-slate-900/50">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-8 py-3 bg-primary text-slate-900 font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 text-sm uppercase tracking-widest"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
