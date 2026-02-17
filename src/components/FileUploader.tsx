import React, { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { useUsageLimits } from '../lib/useUsageLimits';
import { UpgradeModal } from './UpgradeModal';

interface FileUploaderProps {
    onUploadSuccess?: (filePath: string) => void;
    userId: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUploadSuccess, userId }) => {
    const { t } = useTranslation();
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Límites de uso
    const { canPerformAction, tier, refresh } = useUsageLimits(userId, 'upload_document');

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type === 'application/pdf') {
            setFile(droppedFile);
            setError(null);
        } else {
            setError(t('docs.error_invalid_type') || 'Solo se permiten archivos PDF');
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);
        }
    };

    const uploadFile = async () => {
        if (!file || !userId) return;

        // 0. Verificar límites antes de empezar
        if (!canPerformAction) {
            setShowUpgradeModal(true);
            return;
        }

        setStatus('uploading');
        setError(null);

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        try {
            // Obtener país del usuario
            const { data: { user } } = await supabase.auth.getUser();
            const userCountry = user?.user_metadata?.country || 'ES';

            // 1. Subir a Storage con progreso
            const { error: uploadError } = await supabase.storage
                .from('user-documents')
                .upload(filePath, file, {
                    onUploadProgress: (progress: any) => {
                        const percent = (progress.loaded / progress.total) * 100;
                        setUploadProgress(percent);
                    },
                } as any);

            if (uploadError) throw uploadError;

            // 1.5 Registrar en la tabla de documentos con país
            const { data: docData, error: dbError } = await supabase
                .from('documents')
                .insert({
                    name: file.name,
                    url: filePath,
                    user_id: userId,
                    type: 'pdf',
                    status: 'processing',
                    country: userCountry
                })
                .select('id')
                .single();

            if (dbError) throw dbError;

            // 2. Llamar a la Edge Function para procesar
            setStatus('processing');
            const { data, error: invokeError } = await supabase.functions.invoke('process-pdf', {
                body: {
                    bucket_id: 'user-documents',
                    file_path: filePath,
                    user_id: userId,
                    document_id: docData?.id
                }
            });

            if (invokeError) throw invokeError;
            if (data?.error) throw new Error(data.error);

            setStatus('success');
            onUploadSuccess?.(filePath);
            refresh(); // Actualizar límites tras éxito

            // Reset después de unos segundos
            setTimeout(() => {
                setFile(null);
                setStatus('idle');
            }, 3000);

        } catch (err: any) {
            console.error('Error in upload pipeline:', err);
            setError(err.message);
            setStatus('error');
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto">
            <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={cn(
                    "relative border-2 border-dashed rounded-2xl p-8 transition-all duration-200 text-center",
                    isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-slate-200 bg-slate-50/50 hover:bg-slate-50",
                    status === 'uploading' || status === 'processing' ? "pointer-events-none opacity-80" : ""
                )}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {!file ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-white rounded-full shadow-sm text-slate-400">
                            <Upload size={32} />
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-slate-900">
                                {t('docs.upload_title') || 'Sube tus documentos'}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                                {t('docs.upload_subtitle') || 'Arrastra tu PDF aquí o haz clic para buscar'}
                            </p>
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-2 px-6 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            {t('docs.select_file') || 'Seleccionar Archivo'}
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-slate-100 w-full">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                <File size={24} />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium text-slate-900 truncate max-w-[200px]">
                                    {file.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                            {status === 'idle' && (
                                <button
                                    onClick={() => setFile(null)}
                                    className="p-1 hover:bg-slate-100 rounded-full text-slate-400"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        {status === 'idle' && (
                            <button
                                onClick={uploadFile}
                                className="w-full py-3 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-emerald-800 transition-all"
                            >
                                {t('docs.confirm_upload') || 'Confirmar subida y procesar'}
                            </button>
                        )}

                        {(status === 'uploading' || status === 'processing') && (
                            <div className="flex flex-col items-center gap-3 w-full max-w-xs mx-auto">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="animate-spin text-primary" size={24} />
                                    <p className="text-sm font-medium text-slate-600">
                                        {status === 'uploading' ? t('docs.status_uploading') || 'Subiendo archivo...' : t('docs.status_processing') || 'La IA está analizando tu documento...'}
                                    </p>
                                </div>

                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden shadow-inner">
                                    <div
                                        className="bg-primary h-full transition-all duration-300 ease-out"
                                        style={{ width: `${status === 'processing' ? 100 : uploadProgress}%` }}
                                    />
                                </div>

                                <p className="text-[10px] font-bold text-primary">
                                    {status === 'processing' ? '100' : Math.round(uploadProgress)}%
                                </p>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="flex flex-col items-center gap-2 text-emerald-600">
                                <CheckCircle2 size={32} />
                                <p className="text-sm font-medium">{t('docs.status_success') || '¡Documento listo!'}</p>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="flex flex-col items-center gap-2 text-rose-600">
                                <AlertCircle size={32} />
                                <p className="text-sm font-medium">{error || t('docs.status_error') || 'Error al procesar'}</p>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="text-xs underline font-medium"
                                >
                                    {t('docs.try_again') || 'Reintentar'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <p className="text-[10px] text-slate-400 mt-4 text-center">
                {t('docs.privacy_notice') || 'Tus documentos se procesan de forma segura y solo son accesibles por ti y el asistente de IA durante tu sesión.'}
            </p>

            {/* Modal de Upgrade */}
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                currentTier={tier as 'free' | 'pro' | 'business'}
                limitType="upload_document"
            />
        </div>
    );
};
