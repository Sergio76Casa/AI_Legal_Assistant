import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { TenantInfo } from '../../hooks/signature/useSignatureFlow';

interface SignatureLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    tenantInfo: TenantInfo | null;
    documentId: string;
}

export const SignatureLayout: React.FC<SignatureLayoutProps> = ({
    children,
    title,
    subtitle,
    tenantInfo,
    documentId,
}) => (
    <div className="min-h-screen bg-[#050811] text-white flex flex-col font-sans selection:bg-primary/30">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary),0.05)_0%,transparent_50%)] pointer-events-none" />

        <header className="sticky top-0 z-50 bg-[#050811]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <Sparkles size={18} />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-black tracking-tight uppercase">{tenantInfo?.name || 'LegalFlow'}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Protocolo Seguro Stark</span>
                </div>
            </div>
            <div className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400">
                ID: {documentId.substring(0, 8)}
            </div>
        </header>

        <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-10 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
            {(title || subtitle) && (
                <div className="lg:col-span-12 mb-4">
                    <h1 className="text-3xl lg:text-5xl font-black tracking-tighter mb-4 leading-none">{title}</h1>
                    <p className="text-slate-500 text-sm font-medium max-w-2xl">{subtitle}</p>
                </div>
            )}
            <AnimatePresence mode="wait">{children}</AnimatePresence>
        </main>
    </div>
);
