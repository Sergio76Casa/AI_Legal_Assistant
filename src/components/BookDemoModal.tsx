import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Building2, Users, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BookDemoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function BookDemoModal({ isOpen, onClose }: BookDemoModalProps) {
    const { t } = useTranslation();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simular envío
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
        setIsSubmitted(true);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors z-10 text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="p-8 sm:p-12">
                        {!isSubmitted ? (
                            <>
                                <div className="mb-8">
                                    <h2 className="text-3xl font-serif font-bold text-slate-900 mb-3">
                                        {t('demo.title')}
                                    </h2>
                                    <p className="text-slate-500 leading-relaxed">
                                        {t('demo.subtitle')}
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-slate-700 ml-1">
                                                {t('demo.fields.name')}
                                            </label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50/50"
                                                placeholder={t('demo.placeholders.name')}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-slate-700 ml-1">
                                                {t('demo.fields.email')}
                                            </label>
                                            <input
                                                required
                                                type="email"
                                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50/50"
                                                placeholder={t('demo.placeholders.email')}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-slate-400" />
                                            {t('demo.fields.org')}
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50/50"
                                            placeholder={t('demo.placeholders.org')}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
                                            <Users className="w-4 h-4 text-slate-400" />
                                            {t('demo.fields.size')}
                                        </label>
                                        <select
                                            required
                                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50/50 appearance-none cursor-pointer"
                                        >
                                            <option value="">{t('demo.placeholders.select_size')}</option>
                                            <option value="small">&lt; 50 {t('demo.fields.employees')}</option>
                                            <option value="medium">50-200 {t('demo.fields.employees')}</option>
                                            <option value="large">200+ {t('demo.fields.employees')}</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4 text-slate-400" />
                                            {t('demo.fields.message')}
                                        </label>
                                        <textarea
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50/50 resize-none"
                                            placeholder={t('demo.placeholders.message')}
                                        />
                                    </div>

                                    <button
                                        disabled={loading}
                                        type="submit"
                                        className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-200/50 flex items-center justify-center gap-2 disabled:opacity-50 mt-4 active:scale-[0.98]"
                                    >
                                        {loading ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                                className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                                            />
                                        ) : (
                                            <>
                                                {t('demo.submit')} <Send className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-12 text-center"
                            >
                                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                                </div>
                                <h3 className="text-3xl font-serif font-bold text-slate-900 mb-4">
                                    {t('demo.success_title')}
                                </h3>
                                <p className="text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
                                    {t('demo.success_message')}
                                </p>
                                <button
                                    onClick={onClose}
                                    className="px-8 py-3 border-2 border-slate-200 rounded-full font-bold text-slate-600 hover:bg-slate-50 transition-all"
                                >
                                    {t('demo.close')}
                                </button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
