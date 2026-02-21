import { useRef, useState, useEffect, useCallback } from 'react';
import { X, RotateCcw, Check, Pen } from 'lucide-react';

interface SignaturePadProps {
    onConfirm: (signatureDataUrl: string) => void;
    onCancel: () => void;
    signerName?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onConfirm, onCancel, signerName }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    // Setup canvas - measure container, not window
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const updateSize = () => {
            const rect = container.getBoundingClientRect();
            setCanvasSize({
                width: rect.width,
                height: rect.height
            });
        };

        // Use ResizeObserver for accurate container sizing
        const observer = new ResizeObserver(() => updateSize());
        observer.observe(container);
        updateSize();

        // Lock body scroll
        document.body.style.overflow = 'hidden';

        return () => {
            observer.disconnect();
            document.body.style.overflow = '';
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || canvasSize.width === 0) return;

        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Fill white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw signing area guide
        const padding = 40;
        const guideY = canvas.height * 0.65;
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(padding, guideY);
        ctx.lineTo(canvas.width - padding, guideY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Guide text
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Firme arriba de esta línea', canvas.width / 2, guideY + 25);
    }, [canvasSize]);

    // Drawing functions
    const getPos = useCallback((e: React.TouchEvent | React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();

        if ('touches' in e) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        }
        return {
            x: (e as React.MouseEvent).clientX - rect.left,
            y: (e as React.MouseEvent).clientY - rect.top
        };
    }, []);

    const startDrawing = useCallback((e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;

        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        setIsDrawing(true);
    }, [getPos]);

    const draw = useCallback((e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;

        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        setHasDrawn(true);
    }, [isDrawing, getPos]);

    const stopDrawing = useCallback((e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        setIsDrawing(false);
    }, []);

    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Redraw guide
        const padding = 40;
        const guideY = canvas.height * 0.65;
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(padding, guideY);
        ctx.lineTo(canvas.width - padding, guideY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Firme arriba de esta línea', canvas.width / 2, guideY + 25);

        setHasDrawn(false);
    }, []);

    const handleConfirm = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !hasDrawn) return;

        // Create a cropped version of just the signature area
        const signatureDataUrl = canvas.toDataURL('image/png');
        onConfirm(signatureDataUrl);
    }, [hasDrawn, onConfirm]);

    return (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200 safe-area-top">
                <button
                    onClick={onCancel}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                >
                    <X size={18} />
                    Cancelar
                </button>

                <div className="flex items-center gap-2 text-slate-700">
                    <Pen size={16} className="text-blue-600" />
                    <span className="text-sm font-bold">
                        {signerName ? `Firma de ${signerName}` : 'Firma Digital'}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={clearCanvas}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-500 hover:text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                        <RotateCcw size={16} />
                        Limpiar
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div ref={containerRef} className="flex-1 relative touch-none overflow-hidden">
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
            </div>

            {/* Footer */}
            <div className="px-4 py-4 bg-slate-50 border-t border-slate-200 safe-area-bottom">
                <button
                    onClick={handleConfirm}
                    disabled={!hasDrawn}
                    className={`
                        w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all active:scale-[0.98]
                        ${hasDrawn
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }
                    `}
                >
                    <Check size={22} />
                    Confirmar Firma
                </button>
                <p className="text-center text-xs text-slate-400 mt-2">
                    Al confirmar, acepta que esta firma tiene validez legal.
                </p>
            </div>
        </div>
    );
};
