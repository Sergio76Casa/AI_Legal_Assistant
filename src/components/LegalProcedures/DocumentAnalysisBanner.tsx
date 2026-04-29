import React from 'react';
import { Upload, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';
import { cn } from '../../lib/utils';

interface DocumentAnalysisBannerProps {
    isUploading: boolean;
    uploadStatus: 'idle' | 'uploading' | 'success' | 'error';
    uploadError: string | null;
    fileInputRef: React.RefObject<HTMLInputElement>;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onUploadClick: () => void;
}

export const DocumentAnalysisBanner: React.FC<DocumentAnalysisBannerProps> = ({
    isUploading, uploadStatus, uploadError, fileInputRef, onFileSelect, onUploadClick,
}) => {
    const { t } = useTranslation();
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-[2.5rem] bg-slate-900 text-white p-8 sm:p-12 overflow-hidden mb-24 min-h-[400px] flex items-center shadow-2xl border border-white/10"
        >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 blur-[100px] -ml-32 -mb-32" />

            <div className="relative z-10 max-w-2xl w-full text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border border-primary/30 backdrop-blur-md">
                    <Sparkles size={14} className="animate-pulse" />
                    {t('procedures_page.analysis_banner.tag')}
                </div>

                <h2 className="font-serif text-3xl sm:text-4xl mb-6 leading-tight">
                    {t('procedures_page.analysis_banner.title')}
                </h2>
                <p className="text-slate-400 text-base sm:text-lg font-light mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                    <Trans i18nKey="procedures_page.analysis_banner.desc">
                        No te preocupes por el lenguaje técnico. Súbela ahora y{' '}
                        <span className="text-primary font-medium italic">STARK lo analizará por ti</span> en segundos.
                    </Trans>
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,image/png,image/jpeg,image/jpg"
                        onChange={onFileSelect}
                        className="hidden"
                    />
                    <button
                        onClick={onUploadClick}
                        disabled={isUploading}
                        className={cn(
                            'group relative px-10 py-5 rounded-lg font-serif text-lg transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden shadow-xl shadow-primary/20 w-full sm:w-auto',
                            uploadStatus === 'success' ? 'bg-emerald-500 text-white' : 'bg-primary text-slate-900 hover:brightness-110'
                        )}
                    >
                        {isUploading ? (
                            <><Loader2 className="w-6 h-6 animate-spin" /><span>{t('procedures_page.analysis_banner.processing')}</span></>
                        ) : uploadStatus === 'success' ? (
                            <><CheckCircle2 className="w-6 h-6" /><span>{t('procedures_page.analysis_banner.success')}</span></>
                        ) : (
                            <><Upload className="w-6 h-6 group-hover:-translate-y-1 transition-transform" /><span>{t('procedures_page.analysis_banner.upload_btn')}</span></>
                        )}
                    </button>

                    {uploadStatus === 'idle' && (
                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest text-center lg:text-left">
                            {t('procedures_page.analysis_banner.formats')} <br className="hidden sm:block" />
                            {t('procedures_page.analysis_banner.privacy')}
                        </p>
                    )}

                    {uploadStatus === 'error' && (
                        <div className="flex items-center gap-2 text-rose-400 text-sm animate-in fade-in slide-in-from-left-2">
                            <AlertCircle size={18} />
                            <span>{uploadError}</span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
