import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Download, Loader2, X, CheckCircle2, Search } from 'lucide-react';
import { generateFilledPDF, downloadPDF } from '../../lib/pdf-generator';

interface TemplateSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientProfile: any;
    tenantId: string;
}

import { useTranslation } from 'react-i18next';

export const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
    isOpen,
    onClose,
    clientProfile,
    tenantId
}) => {
    const { t } = useTranslation();
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && tenantId) {
            fetchTemplates();
        }
    }, [isOpen, tenantId]);

    const fetchTemplates = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('pdf_templates')
            .select('*')
            .or(`tenant_id.eq.${tenantId},tenant_id.eq.00000000-0000-0000-0000-000000000000`) // Tenant + Global
            .order('name');

        setTemplates(data || []);
        setLoading(false);
    };

    const handleGenerate = async (template: any) => {
        setGenerating(true);
        setStatus(t('templates.status.filling')); // Mensaje solicitado por el usuario

        try {
            // 1. Generar PDF
            const pdfBytes = await generateFilledPDF({
                templateId: template.id,
                clientId: clientProfile.id,
                clientProfile: clientProfile
            });

            if (pdfBytes) {
                // 2. Descargar
                const fileName = `${template.name}_${clientProfile.first_name || t('user_fallback', { defaultValue: 'Cliente' })}_${new Date().toISOString().split('T')[0]}.pdf`;
                downloadPDF(pdfBytes, fileName);

                setStatus(t('templates.status.success'));
                setTimeout(() => {
                    onClose();
                    setStatus(null);
                    setGenerating(false);
                }, 1500);
            } else {
                throw new Error('No se pudo generar el PDF');
            }
        } catch (err: any) {
            console.error(err);
            // Si el error es un código (ej: PDF_LOAD_ERROR), lo traducimos. De lo contrario mostramos el mensaje original.
            const errorMsg = t(`templates.status.${err.message}`, { defaultValue: err.message });
            setStatus(t('templates.status.error', { error: errorMsg }));
            setGenerating(false);
        }
    };

    if (!isOpen) return null;

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.category?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[85vh] flex flex-col border border-white/10">
                {/* Header */}
                <div className="px-6 py-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">{t('templates.generate_title')}</h3>
                        <p className="text-sm text-slate-400 mt-1">
                            {t('templates.for_client')} <span className="font-bold text-primary">{clientProfile.email}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Sub-header / Search */}
                <div className="p-6 border-b border-white/10 bg-slate-900/50 sticky top-0 z-10 backdrop-blur-md">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder={t('templates.search_placeholder')}
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-medium placeholder:text-slate-600"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                            <Loader2 className="animate-spin mb-4 text-primary" size={32} />
                            <p className="text-sm font-medium text-slate-400">{t('templates.loading')}</p>
                        </div>
                    ) : filteredTemplates.length === 0 ? (
                        <div className="text-center py-20 text-slate-500">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                                <FileText size={32} className="opacity-20" />
                            </div>
                            <p className="text-lg font-medium">{t('templates.not_found')}</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredTemplates.map(template => (
                                <button
                                    key={template.id}
                                    onClick={() => handleGenerate(template)}
                                    disabled={generating}
                                    className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-primary/40 hover:bg-white/10 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-primary/5 active:scale-[0.99]"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="p-3 bg-white/10 text-slate-400 rounded-xl group-hover:bg-primary/15 group-hover:text-primary transition-all group-hover:scale-110">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white group-hover:text-primary transition-colors text-lg">
                                                {template.name}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] uppercase tracking-widest font-black text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                                    {template.category || t('templates.category_default')}
                                                </span>
                                                {template.tenant_id === '00000000-0000-0000-0000-000000000000' && (
                                                    <span className="text-[10px] uppercase tracking-widest font-black text-primary/70 bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                                                        Oficial
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                        <Download size={20} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Status Overlay */}
                {generating && (
                    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center z-[60] animate-in fade-in duration-500">
                        {status?.includes('Error') ? (
                            <div className="text-red-400 flex flex-col items-center animate-in zoom-in duration-300">
                                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                                    <X size={48} />
                                </div>
                                <p className="font-black text-2xl mb-2">Error</p>
                                <p className="text-lg text-slate-400">{status}</p>
                                <button
                                    onClick={() => setGenerating(false)}
                                    className="mt-8 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-bold transition-all"
                                >
                                    Cerrar
                                </button>
                            </div>
                        ) : status?.includes('correctamente') ? (
                            <div className="text-primary flex flex-col items-center animate-in zoom-in duration-300">
                                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 border border-primary/20 shadow-2xl shadow-primary/20">
                                    <CheckCircle2 size={56} className="animate-bounce" />
                                </div>
                                <p className="font-black text-3xl tracking-tight">{t('templates.status.ready')}</p>
                            </div>
                        ) : (
                            <div className="text-primary flex flex-col items-center">
                                <div className="relative mb-8">
                                    <Loader2 size={80} className="animate-spin opacity-20" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <FileText size={32} className="text-primary animate-pulse" />
                                    </div>
                                </div>
                                <p className="font-black text-2xl tracking-tight mb-2">{status}</p>
                                <p className="text-slate-500 animate-pulse">{t('templates.status.cross_referencing')}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
