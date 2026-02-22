import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
interface LeadCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    sourceFeature?: string;
}

export function LeadCaptureModal({ isOpen, onClose }: LeadCaptureModalProps) {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulating API call to save lead
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                setEmail('');
                onClose();
            }, 3000);
        }, 1500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-background-dark/80 backdrop-blur-md z-[200] cursor-pointer"
                    />
                    <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-md bg-slate-900/95 backdrop-blur-2xl rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-2xl pointer-events-auto"
                        >
                            <div className="p-6 md:p-8 relative">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 md:top-6 md:right-6 p-2 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all hover:bg-white/10"
                                >
                                    <span className="material-symbols-outlined text-sm md:text-base">close</span>
                                </button>

                                <div className="mb-8">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 mb-4 md:mb-6">
                                        <span className="material-symbols-outlined text-2xl">description</span>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                        Descarga el Whitepaper
                                    </h3>
                                    <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                                        Déjanos tu email profesional y te enviaremos el dossier técnico avanzado sobre la tecnología Iron Silo™ y el Motor STARK 2.0.
                                    </p>
                                </div>

                                {isSuccess ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center space-y-3"
                                    >
                                        <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                                            <span className="material-symbols-outlined text-2xl">check_circle</span>
                                        </div>
                                        <p className="text-emerald-400 font-bold">¡Solicitud recibida!</p>
                                        <p className="text-slate-300 text-sm">Revisa tu bandeja de entrada en los próximos minutos.</p>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label htmlFor="email" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                                Email Profesional
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="tu@empresa.com"
                                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-primary text-slate-900 font-bold py-3 md:py-4 rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <span className="material-symbols-outlined animate-spin text-lg md:text-xl">sync</span>
                                                    Enviando...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-lg md:text-xl">send</span>
                                                    Recibir Dossier Técnico
                                                </>
                                            )}
                                        </button>
                                        <p className="text-[10px] text-slate-500 text-center mt-4">
                                            Tus datos están seguros según nuestra Política de Privacidad y el RGPD.
                                        </p>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
