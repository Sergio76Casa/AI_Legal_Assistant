import React, { useState, useEffect, useRef } from 'react';
import { Landmark, Users, Briefcase, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useUsageLimits } from '../lib/useUsageLimits';
import { useChat } from '../lib/ChatContext';

export interface Procedure {
    id: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    questions: string[];
}

export const useProceduresLogic = (user: any) => {
    const { t } = useTranslation();
    const { sendMessage } = useChat();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { canPerformAction, refresh } = useUsageLimits(user?.id, 'upload_document');

    useEffect(() => { window.scrollTo(0, 0); }, []);

    const procedures: Procedure[] = [
        {
            id: 'residencia',
            icon: <Landmark className="w-6 h-6" />,
            title: t('procedures_page.items.residencia.title'),
            description: t('procedures_page.items.residencia.desc'),
            questions: [
                t('procedures_page.items.residencia.q1'),
                t('procedures_page.items.residencia.q2'),
                t('procedures_page.items.residencia.q3'),
            ],
        },
        {
            id: 'nacionalidad',
            icon: <Users className="w-6 h-6" />,
            title: t('procedures_page.items.nacionalidad.title'),
            description: t('procedures_page.items.nacionalidad.desc'),
            questions: [
                t('procedures_page.items.nacionalidad.q1'),
                t('procedures_page.items.nacionalidad.q2'),
                t('procedures_page.items.nacionalidad.q3'),
            ],
        },
        {
            id: 'trabajo',
            icon: <Briefcase className="w-6 h-6" />,
            title: t('procedures_page.items.trabajo.title'),
            description: t('procedures_page.items.trabajo.desc'),
            questions: [
                t('procedures_page.items.trabajo.q1'),
                t('procedures_page.items.trabajo.q2'),
                t('procedures_page.items.trabajo.q3'),
            ],
        },
        {
            id: 'asilo',
            icon: <ShieldCheck className="w-6 h-6" />,
            title: t('procedures_page.items.asilo.title'),
            description: t('procedures_page.items.asilo.desc'),
            questions: [
                t('procedures_page.items.asilo.q1'),
                t('procedures_page.items.asilo.q2'),
                t('procedures_page.items.asilo.q3'),
            ],
        },
    ];

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!user) {
            alert(t('procedures_page.analysis_banner.login_required'));
            return;
        }

        if (!canPerformAction) {
            setShowUpgradeModal(true);
            return;
        }

        const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            setUploadError(t('procedures_page.analysis_banner.error_types'));
            setUploadStatus('error');
            return;
        }

        try {
            setIsUploading(true);
            setUploadStatus('uploading');
            setUploadError(null);

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;
            const userCountry = user?.user_metadata?.country || 'ES';
            const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';

            const { error: storageError } = await supabase.storage
                .from('user-documents')
                .upload(filePath, file);
            if (storageError) throw storageError;

            const { data: docData, error: dbError } = await supabase
                .from('documents')
                .insert({ name: file.name, url: filePath, user_id: user.id, type: fileType, status: 'processing', country: userCountry })
                .select('id')
                .single();
            if (dbError) throw dbError;

            const { error: invokeError } = await supabase.functions.invoke('process-pdf', {
                body: { bucket_id: 'user-documents', file_path: filePath, user_id: user.id, document_id: docData?.id }
            });
            if (invokeError) throw invokeError;

            setUploadStatus('success');
            refresh();

            setTimeout(() => {
                sendMessage(t('procedures_page.analysis_banner.chat_msg', { name: file.name }));
                setUploadStatus('idle');
                setIsUploading(false);
            }, 1500);
        } catch (err: any) {
            console.error('Error:', err);
            setUploadError(err.message);
            setUploadStatus('error');
            setIsUploading(false);
        }
    };

    return {
        procedures,
        sendMessage,
        isUploading,
        uploadStatus,
        uploadError,
        showUpgradeModal,
        setShowUpgradeModal,
        fileInputRef,
        handleFileSelect,
    };
};
