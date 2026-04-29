import React from 'react';
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-950/80 animate-fade-in">
            <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in">

                <div className="p-8 pb-4 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                            <Icon size={24} />
                        </div>
                        <h3 className="text-2xl font-black text-white tracking-tight uppercase">
                            {getLocalized(activeModal, 'title')}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 text-slate-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <div className="text-slate-300 leading-relaxed text-lg font-medium whitespace-pre-wrap">
                        {getLocalized(activeModal, 'content')}
                    </div>
                </div>

                <div className="p-8 pt-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-primary text-slate-900 font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
};
