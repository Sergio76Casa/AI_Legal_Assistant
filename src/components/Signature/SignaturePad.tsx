import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Check, X, Shield, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SignaturePadProps {
    onConfirm: (dataUrl: string) => void;
    onCancel: () => void;
    signerName?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onConfirm, onCancel, signerName }) => {
    const sigCanvas = useRef<SignatureCanvas>(null);
    const [isEmpty, setIsEmpty] = useState(true);
    const [isDrawing, setIsDrawing] = useState(false);

    const clear = () => {
        sigCanvas.current?.clear();
        setIsEmpty(true);
    };

    const handleConfirm = () => {
        if (!sigCanvas.current || isEmpty) return;
        const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
        onConfirm(dataUrl);
        // Haptic Feedback
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(15);
        }
    };

    const handleBegin = () => {
        setIsDrawing(true);
        setIsEmpty(false);
    };

    const handleEnd = () => {
        setIsDrawing(false);
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(5);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#050811]/95 flex flex-col items-center justify-center p-4 md:p-10"
        >
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-2xl flex flex-col gap-6 relative z-10">
                <div className="flex items-center justify-between px-2">
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-black text-white tracking-tighter flex items-center gap-3">
                            Firma Digital <Sparkles size={20} className="text-primary" />
                        </h2>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                            Estampando como: <span className="text-white">{signerName || 'Usuario Registrado'}</span>
                        </p>
                    </div>
                </div>

                {/* Pad Container */}
                <div className={cn(
                    "relative w-full aspect-[2/1] bg-slate-900 shadow-2xl border transition-all duration-500 rounded-[32px] overflow-hidden group",
                    isDrawing ? "border-primary/50 ring-4 ring-primary/10" : "border-white/10"
                )}>
                    {/* Interior Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

                    <SignatureCanvas
                        ref={sigCanvas}
                        penColor="#000080" // Strictly Dark Blue for legal validity
                        onBegin={handleBegin}
                        onEnd={handleEnd}
                        velocityFilterWeight={0.6} // Tapers strokes based on speed
                        minWidth={0.5}
                        maxWidth={3.0} // Thicker 'wet' start, thinner fast finish
                        canvasProps={{
                            className: cn(
                                "w-full h-full cursor-crosshair transition-all duration-300",
                                isDrawing && "drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]" // Neon feedback in UI only
                            ),
                        }}
                    />

                    <AnimatePresence>
                        {isEmpty && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                            >
                                <div className="p-4 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm">
                                    <RotateCcw className="text-slate-600 animate-spin-slow" size={32} />
                                </div>
                                <p className="mt-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Dibuje su firma aquí</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Technical Info Overlay */}
                    <div className="absolute bottom-4 right-6 flex items-center gap-2 opacity-30">
                        <Shield size={10} className="text-primary" />
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Secure Link Pro 2.0</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                        onClick={onCancel}
                        className="py-4 px-6 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl flex items-center justify-center gap-3 transition-all"
                    >
                        <X size={18} className="text-slate-400" />
                        <span className="text-xs font-black text-white uppercase tracking-widest">Cancelar</span>
                    </button>

                    <button
                        onClick={clear}
                        className="py-4 px-6 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl flex items-center justify-center gap-3 transition-all"
                    >
                        <RotateCcw size={18} className="text-slate-400" />
                        <span className="text-xs font-black text-white uppercase tracking-widest">Borrar</span>
                    </button>

                    <button
                        onClick={handleConfirm}
                        disabled={isEmpty}
                        className={cn(
                            "col-span-2 py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all font-black text-sm uppercase tracking-widest shadow-xl",
                            isEmpty 
                                ? "bg-slate-800 text-slate-600 cursor-not-allowed border border-white/5" 
                                : "bg-primary text-slate-900 shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                        )}
                    >
                        <Check size={20} />
                        Confirmar Firma
                    </button>
                </div>

                <div className="flex items-center justify-center gap-2.5 opacity-20 mt-4">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white">Encriptación de punto a punto activa</p>
                    <div className="w-1 h-1 rounded-full bg-primary" />
                </div>
            </div>
        </motion.div>
    );
};
