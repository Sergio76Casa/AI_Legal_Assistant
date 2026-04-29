import { useProceduresLogic } from '../hooks/useProceduresLogic';
import { ProceduresHero } from './LegalProcedures/ProceduresHero';
import { ProcedureCard } from './LegalProcedures/ProcedureCard';
import { DocumentAnalysisBanner } from './LegalProcedures/DocumentAnalysisBanner';
import { UpgradeModal } from './UpgradeModal';

interface LegalProceduresProps {
    onBack: () => void;
    user: any;
}

export function LegalProcedures({ onBack, user }: LegalProceduresProps) {
    const logic = useProceduresLogic(user);

    return (
        <div className="min-h-screen bg-[#0a0f1d]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
                <ProceduresHero onBack={onBack} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-20">
                    {logic.procedures.map((proc, idx) => (
                        <ProcedureCard
                            key={proc.id}
                            procedure={proc}
                            index={idx}
                            onQuestionClick={logic.sendMessage}
                        />
                    ))}
                </div>

                <DocumentAnalysisBanner
                    isUploading={logic.isUploading}
                    uploadStatus={logic.uploadStatus}
                    uploadError={logic.uploadError}
                    fileInputRef={logic.fileInputRef}
                    onUploadClick={() => logic.fileInputRef.current?.click()}
                    onFileSelect={logic.handleFileSelect}
                />

                <UpgradeModal
                    isOpen={logic.showUpgradeModal}
                    onClose={() => logic.setShowUpgradeModal(false)}
                    limitType="upload_document"
                />
            </div>
        </div>
    );
}
