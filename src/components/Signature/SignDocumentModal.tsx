import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileSignature, CheckCircle2 } from 'lucide-react';
import { SignatureCanvasModule } from './SignatureCanvas';
import { useSignatureEvents } from '../../hooks/useSignatureEvents';
import { useComplianceDocs } from '../../hooks/useComplianceDocs';
import confetti from 'canvas-confetti';

interface SignDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentData: {
        id: string; // Document ID
        title: string;
        assetName: string;
        assetId: string;
        signerName: string;
    };
    onComplete: () => void;
}

export const SignDocumentModal: React.FC<SignDocumentModalProps> = ({ 
    isOpen, 
    onClose, 
    documentData,
    onComplete
}) => {
    const { generateEvidencePDF, isGenerating } = useSignatureEvents();
    const { completeSignature } = useComplianceDocs();
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSaveSignature = async (dataUrl: string) => {
        setIsSaving(true);
        try {
            // 1. Generate and Download PDF (Auto-open handled by Blob/URL in hook or here)
            const pdfBytes = await generateEvidencePDF(dataUrl, documentData);
            
            if (!pdfBytes) throw new Error('PDF Generation failed');

            // 2. Persist to DB and Storage
            const result = await completeSignature(documentData.id, dataUrl, documentData.signerName);
            
            if (!result.success) throw new Error(result.message || 'Error al persistir firma');

            // 3. Success Celebration
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#00FFFF', '#0080FF', '#FFFFFF']
            });

            setShowSuccess(true);
            setTimeout(() => {
                onComplete();
                onClose();
            }, 2000);

        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#050811]/90 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-[32px] shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20">
                                    <FileSignature size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-white">Certificación Stark</h2>
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 min-h-[400px] flex items-center justify-center">
                            {showSuccess ? (
                                <motion.div 
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="flex flex-col items-center gap-4 text-center"
                                >
                                    <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                                        <CheckCircle2 size={40} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white">Documento Certificado</h3>
                                        <p className="text-sm text-slate-400 mt-1">Sello legal aplicado correctamente.</p>
                                    </div>
                                </motion.div>
                            ) : isGenerating || isSaving ? (
                                <div className="flex flex-col items-center justify-center gap-6">
                                    <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin shadow-[0_0_20px_rgba(var(--primary),0.2)]" />
                                    <div className="text-center">
                                        <p className="text-sm font-black text-primary uppercase tracking-[0.4em] animate-pulse">
                                            {isGenerating ? 'Generando PDF...' : 'Encriptando Firma...'}
                                        </p>
                                        <p className="text-[10px] text-slate-600 font-bold uppercase mt-2 tracking-widest">Protocolo Securizado Iron Silo</p>
                                    </div>
                                </div>
                            ) : (
                                <SignatureCanvasModule 
                                    onSave={handleSaveSignature}
                                    onCancel={onClose}
                                    title={documentData.title}
                                    subtitle={`Activo: ${documentData.assetName}`}
                                    isLoading={isSaving}
                                />
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
