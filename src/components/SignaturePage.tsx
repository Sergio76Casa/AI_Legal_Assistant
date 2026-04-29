import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Sparkles } from 'lucide-react';

import { useSignatureFlow } from '../hooks/signature/useSignatureFlow';
import { useSignaturePersistence } from '../hooks/signature/useSignaturePersistence';
import { SignatureLayout } from './Signature/SignatureLayout';
import {
    type AuditResult,
    SignatureLoadingScreen,
    SignatureErrorScreen,
    MissingDataForm,
    SignatureProcessingScreen,
    CertificatePreviewModal,
    SignatureSuccessScreen,
    SignatureExpiredScreen,
} from './Signature/SignatureStates';
import { DocumentViewer } from './Signature/DocumentViewer';
import { SignaturePad } from './Signature/SignaturePad';
import { AuditTrail } from './Signature/AuditTrail';

interface SignaturePageProps {
    documentId: string;
}

export const SignaturePage: React.FC<SignaturePageProps> = ({ documentId }) => {
    const flow = useSignatureFlow(documentId);
    const persistence = useSignaturePersistence();
    const [auditData, setAuditData] = React.useState<AuditResult | null>(null);

    const onSignatureConfirm = async (signatureDataUrl: string) => {
        if (!flow.request || !flow.tenantInfo) return;
        flow.setState('processing');
        try {
            const result = await persistence.handleSignatureComplete(signatureDataUrl, flow.request, flow.tenantInfo);
            setAuditData(result);
            flow.setState('preview_certificate');
        } catch {
            flow.setState('error');
        }
    };

    const base = { tenantInfo: flow.tenantInfo, documentId };

    if (flow.state === 'loading')
        return <SignatureLoadingScreen {...base} />;

    if (flow.state === 'error')
        return <SignatureErrorScreen {...base} errorMessage={flow.errorMessage} />;

    if (flow.state === 'missing_data')
        return (
            <MissingDataForm
                {...base}
                missingFields={flow.missingFields}
                isSavingData={flow.isSavingData}
                onSubmit={flow.handleDataSubmit}
            />
        );

    if (flow.state === 'signing')
        return (
            <SignaturePad
                onConfirm={onSignatureConfirm}
                onCancel={() => flow.setState('ready')}
                signerName={flow.tenantInfo?.name}
            />
        );

    if (flow.state === 'processing')
        return (
            <SignatureProcessingScreen
                {...base}
                progress={persistence.progress}
                progressPct={persistence.progressPct}
            />
        );

    if (flow.state === 'preview_certificate')
        return (
            <CertificatePreviewModal
                {...base}
                auditData={auditData}
                pdfPreviewUrl={flow.pdfPreviewUrl}
                onConfirm={() => {
                    flow.setRequest(prev => prev ? {
                        ...prev,
                        status: 'signed',
                        signed_document_path: auditData?.signedPath ?? null,
                        signed_at: auditData?.timestamp ?? null,
                    } : null);
                    flow.setState('success');
                }}
                onBack={() => flow.setState('ready')}
            />
        );

    if (flow.state === 'success' || flow.state === 'already_signed')
        return (
            <SignatureSuccessScreen
                {...base}
                request={flow.request}
                onDownload={persistence.handleDownload}
            />
        );

    if (flow.state === 'expired')
        return <SignatureExpiredScreen {...base} />;

    // state === 'ready'
    return (
        <SignatureLayout {...base}>
            <div className="lg:col-span-7 space-y-10">
                <DocumentViewer pdfUrl={flow.pdfPreviewUrl} title={flow.request?.document_name || 'Documento'} />
                <div className="bg-primary/10 border border-primary/20 rounded-3xl p-6 flex items-start gap-4">
                    <div className="p-3 bg-primary/20 rounded-2xl text-primary shrink-0">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">Revise el documento</h4>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                            Al proceder con la firma, usted acepta los términos y condiciones vinculados a este documento. Su identidad y parámetros técnicos serán registrados.
                        </p>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-5 space-y-8">
                <AuditTrail status="Esperando Firma" requestID={documentId} />
                <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(var(--primary),0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => flow.setState('signing')}
                    className="w-full py-6 bg-primary text-slate-900 rounded-[32px] font-black text-lg uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 flex items-center justify-center gap-4 group"
                >
                    <Sparkles className="group-hover:rotate-12 transition-transform" />
                    INICIAR FIRMA
                </motion.button>
                <p className="text-[10px] text-center text-slate-600 font-bold uppercase tracking-widest">
                    Procesado por Iron Silo™ Signature Engine
                </p>
            </div>
        </SignatureLayout>
    );
};
