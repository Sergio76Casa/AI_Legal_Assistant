import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Check, X, Shield, Sparkles, PenTool } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SignatureCanvasProps {
    onSave: (dataUrl: string) => void;
    onCancel: () => void;
    title?: string;
    subtitle?: string;
    penColor?: string;
    description?: string;
    isLoading?: boolean;
}

export const SignatureCanvasModule: React.FC<SignatureCanvasProps> = ({ 
    onSave, 
    onCancel, 
    title = 'Firma de Conformidad',
    subtitle = 'Portal de Cumplimiento Stark',
    penColor = '#000080', // Legal blue by default
    description = 'Su firma será estampada en un documento certificado con validez técnica.',
    isLoading = false
}) => {
    const sigCanvas = useRef<SignatureCanvas>(null);
    const [isEmpty, setIsEmpty] = useState(true);
    const [isDrawing, setIsDrawing] = useState(false);

    const clear = () => {
        sigCanvas.current?.clear();
        setIsEmpty(true);
    };

    const handleSave = () => {
        if (!sigCanvas.current || isEmpty) return;

        try {
            let dataUrl;
            try {
                const trimmedCanvas = sigCanvas.current.getTrimmedCanvas();
                dataUrl = trimmedCanvas.toDataURL('image/png');
            } catch (trimError) {
                const rawCanvas = sigCanvas.current.getCanvas();
                dataUrl = rawCanvas.toDataURL('image/png');
            }

            onSave(dataUrl);
            
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(20);
            }
        } catch (error) {
            alert('Error crítico al procesar la firma. Por favor, reinicie el proceso.');
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full max-w-xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary">
                    <PenTool size={16} />
                    <h3 className="text-lg font-black uppercase tracking-tight text-white">{title}</h3>
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{subtitle}</p>
            </div>

            <div className={cn(
                "relative aspect-[2/1] bg-slate-950 rounded-[24px] border-2 transition-all duration-300 shadow-2xl overflow-hidden",
                isDrawing ? "border-primary shadow-primary/10" : "border-white/10"
            )}>
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor={penColor}
                    onBegin={() => { setIsDrawing(true); setIsEmpty(false); }}
                    onEnd={() => setIsDrawing(false)}
                    velocityFilterWeight={0.7}
                    minWidth={0.8}
                    maxWidth={2.5}
                    canvasProps={{
                        className: "w-full h-full cursor-crosshair",
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
                            <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">Firme aquí</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-20">
                    <Shield size={10} className="text-primary" />
                    <span className="text-[7px] font-bold text-white uppercase tracking-tighter">Encrypted Canvas v4</span>
                </div>
            </div>

            <div className="space-y-4">
                <p className="text-[11px] text-slate-500 italic leading-tight px-2 text-center">
                    {description}
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-4 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-black text-slate-400 uppercase tracking-widest transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={clear}
                        className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all"
                        title="Borrar firma"
                    >
                        <RotateCcw size={18} className="text-slate-400" />
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isEmpty || isLoading}
                        className={cn(
                            "flex-[2] py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all font-black text-xs uppercase tracking-widest shadow-xl",
                            (isEmpty || isLoading)
                                ? "bg-slate-800 text-slate-600 border border-white/5 cursor-not-allowed" 
                                : "bg-primary text-slate-900 shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                        )}
                    >
                        {isLoading ? (
                            <>
                                <RotateCcw size={18} className="animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Check size={18} />
                                Guardar Firma
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
