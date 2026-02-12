"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

interface PrivacyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
    const t = useTranslations("PrivacyPolicy");
    // Also get 'Legal' for button labels if needed, or just hardcode "Close" / "Cerrar" or use an icon

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-[70] overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-2xl font-serif font-bold text-gray-900">
                                {t('title')}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto">
                            <div className="space-y-6 text-gray-600">
                                <section>
                                    <h3 className="font-semibold text-gray-900 mb-2">{t('section1_title')}</h3>
                                    <p>{t('section1_content')}</p>
                                </section>

                                <section>
                                    <h3 className="font-semibold text-gray-900 mb-2">{t('section2_title')}</h3>
                                    <p>{t('section2_content')}</p>
                                </section>

                                <section>
                                    <h3 className="font-semibold text-gray-900 mb-2">{t('section3_title')}</h3>
                                    <p>{t('section3_content')}</p>
                                </section>

                                <section>
                                    <h3 className="font-semibold text-gray-900 mb-2">{t('section4_title')}</h3>
                                    <p>{t('section4_content')}</p>
                                </section>

                                <section>
                                    <h3 className="font-semibold text-gray-900 mb-2">{t('section5_title')}</h3>
                                    <p>{t('section5_content')}</p>
                                </section>

                                <p className="text-sm text-gray-400 pt-4 border-t border-gray-100">
                                    {t('last_updated')}: {new Date().toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                            >
                                OK
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
