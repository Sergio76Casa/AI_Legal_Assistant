import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnterpriseLeadForm } from './EnterpriseLeadForm';

interface EnterpriseModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const EnterpriseModal: React.FC<EnterpriseModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10"
                >
                    <EnterpriseLeadForm onClose={onClose} />
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
