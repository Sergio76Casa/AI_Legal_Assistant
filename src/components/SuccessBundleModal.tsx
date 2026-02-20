
import React, { useEffect } from 'react';
import { CheckCircle2, Download } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTranslation } from 'react-i18next';

interface SuccessBundleModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        fileName: string;
        fileCount: number;
        clientName: string;
        bundleName: string;
    } | null;
}

export const SuccessBundleModal: React.FC<SuccessBundleModalProps> = ({ isOpen, onClose, data }) => {
    const { t } = useTranslation();

    useEffect(() => {
        if (isOpen) {
            // Lanza confetti
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }; // High z-index for modal

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);

                // since particles fall down, start a bit higher than random
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [isOpen]);

    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-200 border border-white/10">
                {/* Header */}
                <div className="bg-primary px-6 py-6 text-center relative overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/30 rounded-full translate-x-1/3 translate-y-1/3 blur-xl"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="bg-slate-900 p-3 rounded-full shadow-lg mb-3">
                            <CheckCircle2 size={42} className="text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t('success_bundle.title')}</h2>
                        <p className="text-slate-900/70 text-sm mt-1 font-medium">{t('success_bundle.subtitle')}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <p className="text-slate-300">
                            {t('success_bundle.generated_msg', { bundle: data.bundleName, client: data.clientName })}
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
                            <Download size={16} />
                            {t('success_bundle.docs_generated', { count: data.fileCount })}
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-slate-400 break-all">
                        <span className="block text-xs font-semibold text-slate-500 uppercase mb-1">{t('success_bundle.file_downloaded')}</span>
                        {data.fileName}
                    </div>

                    <p className="text-xs text-center text-slate-500">
                        {t('success_bundle.download_note')}
                    </p>

                    <button
                        onClick={onClose}
                        className="w-full bg-primary text-slate-900 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                        {t('success_bundle.close_btn')}
                    </button>
                </div>
            </div>
        </div>
    );
};

