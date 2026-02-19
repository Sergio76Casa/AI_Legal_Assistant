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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">{t('templates.generate_title')}</h3>
                        <p className="text-xs text-slate-500">
                            {t('templates.for_client')} <span className="font-semibold text-emerald-600">{clientProfile.email}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Sub-header / Search */}
                <div className="p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder={t('templates.search_placeholder')}
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10 opacity-50">
                            <Loader2 className="animate-spin mb-2" />
                            <p className="text-xs">{t('templates.loading')}</p>
                        </div>
                    ) : filteredTemplates.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                            <FileText size={32} className="mx-auto mb-2 opacity-20" />
                            <p className="text-sm">{t('templates.not_found')}</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {filteredTemplates.map(template => (
                                <button
                                    key={template.id}
                                    onClick={() => handleGenerate(template)}
                                    disabled={generating}
                                    className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
                                                {template.name}
                                            </h4>
                                            <span className="text-xs uppercase tracking-wider font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                {template.category || t('templates.category_default')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Download size={20} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Status Overlay */}
                {generating && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 animate-in fade-in duration-300">
                        {status?.includes('Error') ? (
                            <div className="text-red-500 flex flex-col items-center">
                                <X size={48} className="mb-4" />
                                <p className="font-bold text-lg">Error</p>
                                <p className="text-sm">{status}</p>
                            </div>
                        ) : status?.includes('correctamente') ? (
                            <div className="text-emerald-600 flex flex-col items-center">
                                <CheckCircle2 size={48} className="mb-4 animate-bounce" />
                                <p className="font-bold text-lg">{t('templates.status.ready')}</p>
                            </div>
                        ) : (
                            <div className="text-emerald-600 flex flex-col items-center">
                                <Loader2 size={48} className="animate-spin mb-4" />
                                <p className="font-bold text-lg">{status}</p>
                                <p className="text-xs text-slate-400 mt-2">{t('templates.status.cross_referencing')}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
