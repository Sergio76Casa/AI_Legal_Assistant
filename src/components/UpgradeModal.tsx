"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

import { useTranslations } from "next-intl";

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
    const [loading, setLoading] = useState(false);
    const t = useTranslations('UpgradeModal');

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            // NOTE: Create a Checkout Session on the server (Edge Function) ideally.
            // For now, we simulate or call the endpoint if it exists.
            // const res = await fetch('/api/create-checkout-session', { method: 'POST' });
            // const { url } = await res.json();
            // window.location.href = url;
            alert("Redirection to Stripe Checkout...(Implementation Pending Backend Endpoint)");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full border border-brand-gold/20"
                >
                    <div className="bg-gradient-to-r from-brand-gold/10 to-brand-green/10 p-6 text-center">
                        <h2 className="font-serif text-2xl font-bold text-brand-green mb-2">{t('title')}</h2>
                        <p className="text-gray-600">{t('subtitle')}</p>
                    </div>

                    <div className="p-6">
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="bg-brand-green/10 p-1 rounded-full">
                                    <Check className="w-4 h-4 text-brand-green" />
                                </div>
                                <span className="text-gray-700">{t('feature1')}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-brand-green/10 p-1 rounded-full">
                                    <Check className="w-4 h-4 text-brand-green" />
                                </div>
                                <span className="text-gray-700">{t('feature2')}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-brand-green/10 p-1 rounded-full">
                                    <Check className="w-4 h-4 text-brand-green" />
                                </div>
                                <span className="text-gray-700">{t('feature3')}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-brand-green/10 p-1 rounded-full">
                                    <Check className="w-4 h-4 text-brand-green" />
                                </div>
                                <span className="text-gray-700">{t('feature4')}</span>
                            </div>
                        </div>

                        <div className="text-center mb-6">
                            <span className="text-4xl font-bold text-gray-900">€9</span>
                            <span className="text-gray-500">/{t('pricing')}</span>
                        </div>

                        <button
                            onClick={handleSubscribe}
                            disabled={loading}
                            className="w-full bg-brand-gold hover:bg-yellow-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('subscribeButton')}
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600"
                        >
                            {t('dismissButton')}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
