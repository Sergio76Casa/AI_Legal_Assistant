import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, FileText } from 'lucide-react';
import { Document, Page } from 'react-pdf';

// Import local worker configuration
import '../../lib/pdf-worker';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface LazyPageProps {
    pageNumber: number;
    scale: number;
    onVisible: (page: number) => void;
}

const LazyPage: React.FC<LazyPageProps> = ({ pageNumber, scale, onVisible }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    onVisible(pageNumber);
                } else {
                    // Memory optimization: unload pages that are far away
                    // We keep a small buffer to avoid flickering
                    setIsVisible(false);
                }
            },
            { threshold: 0.1, rootMargin: '400px' }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [pageNumber, onVisible]);

    return (
        <div 
            ref={containerRef} 
            className="w-full min-h-[400px] flex items-center justify-center py-4 bg-transparent relative"
        >
            <AnimatePresence mode="wait">
                {isVisible ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden will-change-transform"
                        style={{ transform: 'translate3d(0,0,0)' }} // Hardware Acceleration
                    >
                        <Page 
                            pageNumber={pageNumber} 
                            scale={scale} 
                            loading={<div className="w-full aspect-[1/1.41] bg-white/5 animate-pulse" />}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                        />
                    </motion.div>
                ) : (
                    <div className="w-full aspect-[1/1.41] max-w-sm bg-white/[0.02] rounded-xl border border-white/5 flex items-center justify-center">
                        <FileText size={24} className="text-slate-800 animate-pulse" />
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

interface DocumentViewerProps {
    pdfUrl: string | null;
    title: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ pdfUrl, title }) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [scale, setScale] = useState(0.8);
    const containerRef = useRef<HTMLDivElement>(null);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    // Responsive scaling
    useEffect(() => {
        const updateScale = () => {
            const width = window.innerWidth;
            if (width < 640) setScale(0.65);
            else if (width < 1024) setScale(0.9);
            else setScale(1.0);
        };
        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, []);

    return (
        <div className="relative group flex flex-col h-full overflow-hidden rounded-[40px]">
            {/* Ambient Shadow Physics Layer */}
            <div className="absolute inset-x-10 -bottom-10 h-20 bg-primary/20 blur-[100px] opacity-0 group-hover:opacity-40 transition-opacity duration-1000 pointer-events-none" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-[#0A0F1D]/40 backdrop-blur-3xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col flex-1"
            >
                {/* Fixed Header */}
                <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.03] shrink-0 z-20">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                            <FileText size={18} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] truncate max-w-[200px]">
                                {title}
                            </span>
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                                Documento Validado Stark
                            </span>
                        </div>
                    </div>
                    
                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-wide">Vista Segura</span>
                    </div>
                </div>

                {/* Virtualized Scroll Area */}
                <div 
                    ref={containerRef}
                    className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide p-4 md:p-8 space-y-8 bg-[#050811]/30 scroll-smooth"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    {!pdfUrl ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-600">
                            <Lock size={48} className="opacity-10 animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Inicializando Kernel...</p>
                        </div>
                    ) : (
                        <Document
                            file={pdfUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading={
                                <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-700">
                                    <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                    <p className="text-[9px] font-black uppercase tracking-widest">Descifrando Bytes...</p>
                                </div>
                            }
                        >
                            {Array.from(new Array(numPages), (_, index) => (
                                <LazyPage 
                                    key={`page_${index + 1}`}
                                    pageNumber={index + 1}
                                    scale={scale}
                                    onVisible={setCurrentPage}
                                />
                            ))}
                        </Document>
                    )}
                </div>

                {/* Stark Page Indicator (Floating Bubble) */}
                <AnimatePresence>
                    {numPages > 0 && (
                        <motion.div 
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4"
                        >
                            <div className="px-5 py-2.5 bg-[#0A0F1D]/80 backdrop-blur-2xl border border-white/10 rounded-full flex items-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pag</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-black text-primary">{currentPage}</span>
                                    <span className="text-xs text-slate-700">/</span>
                                    <span className="text-xs font-bold text-slate-400">{numPages}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Interaction Overlay Gradient */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0A0F1D] to-transparent pointer-events-none z-10" />
            </motion.div>
        </div>
    );
};
