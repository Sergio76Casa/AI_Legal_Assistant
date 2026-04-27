import React, { useState, useRef, useMemo } from 'react';
import { Document, Page } from 'react-pdf';
import { useTranslation } from 'react-i18next';
import { Loader2, ArrowLeft, ArrowRight, Minus, Plus, List, Settings as SettingsIcon, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import '../../lib/pdf-worker';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { generateFilledPDF } from '../../lib/pdf-generator';
import { cn } from '../../lib/utils';
import { useTenant } from '../../lib/TenantContext';

import { usePDFMappings }   from '../../hooks/usePDFMappings';
import { getAvailableFields } from './constants';
import { PDFEditorHeader }   from './PDFEditorHeader';
import { MappingInspector }  from './MappingInspector';
import type { PDFEditorProps } from './types';

export const PDFEditor: React.FC<PDFEditorProps> = ({ templateId, templateUrl, onClose }) => {
    const { t }       = useTranslation();
    const { tenant }  = useTenant();

    // ─── Estado local de canvas ────────────────────────────────────────────
    const [numPages,          setNumPages]          = useState(0);
    const [pageNumber,        setPageNumber]        = useState(1);
    const [scale,             setScale]             = useState(1.0);
    const [generatingPreview, setGeneratingPreview] = useState(false);
    const [mobileLayer,       setMobileLayer]       = useState<'pdf' | 'fields' | 'config'>('pdf');

    // ref vinculado al div que envuelve el <Page> del PDF
    const pdfWrapperRef = useRef<HTMLDivElement>(null);

    // ─── Hook central ──────────────────────────────────────────────────────
    const {
        mappings, selectedMappingId, selectedPoint,
        isImporting, isDragging, isResizing,
        setSelectedMappingId, setSelectedPoint,
        addMapping, updateMapping, deleteMapping,
        handleImportMaster,
        handleMouseDown, handleMouseMove, handleMouseUp,
    } = usePDFMappings({ templateId, scale });

    const availableFields  = useMemo(() => getAvailableFields(t), [t]);
    const selectedMapping  = mappings.find(m => m.id === selectedMappingId);

    // Agrupar campos para la lista de referencia
    const fieldGroups = useMemo(() => {
        const groups: Record<string, typeof availableFields> = {};
        availableFields.forEach(f => {
            if (!groups[f.group]) groups[f.group] = [];
            groups[f.group].push(f);
        });
        return groups;
    }, [availableFields]);

    // ─── Preview PDF ───────────────────────────────────────────────────────
    const handlePreview = async () => {
        setGeneratingPreview(true);
        try {
            const pdfBytes = await generateFilledPDF({
                templateId,
                clientId: 'preview',
                clientProfile: {
                    first_name: 'JUAN', last_name: 'PÉREZ',
                    second_last_name: 'GARCÍA', full_name: 'JUAN PÉREZ GARCÍA',
                    nie: 'X12345678L', sex: 'male',
                    signature_date: new Date().toISOString(),
                },
                tenantProfile: tenant,
                customMappings: mappings,
            });
            if (pdfBytes) {
                const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
                window.open(URL.createObjectURL(blob), '_blank');
            }
        } finally {
            setGeneratingPreview(false);
        }
    };

    // ─── Click en canvas → seleccionar punto para nuevo campo ─────────────
    const handleCanvasClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isDragging || isResizing) return;
        const rect = pdfWrapperRef.current!.getBoundingClientRect();
        setSelectedPoint({
            x: (e.clientX - rect.left) / scale,
            y: (e.clientY - rect.top)  / scale,
        });
        setSelectedMappingId(null);
    };

    const clearSelection = () => {
        setSelectedMappingId(null);
        setSelectedPoint(null);
    };

    // ─── Render ────────────────────────────────────────────────────────────
    return (
        <div
            className="fixed inset-0 bg-[#020617] z-[110] flex flex-col overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            <PDFEditorHeader
                onClose={onClose}
                onPreview={handlePreview}
                onImportMaster={handleImportMaster}
                generatingPreview={generatingPreview}
                isImporting={isImporting}
            />

            <div className="flex-1 flex overflow-hidden lg:h-[calc(100vh-64px)] relative">
                
                {/* ── Columna Izquierda: Referencia de Campos (Desktop o Layer fields) ── */}
                <aside className={cn(
                    "w-72 bg-[#0A0F1D]/60 border-r border-white/5 flex flex-col transition-all duration-300",
                    mobileLayer === 'fields' ? "flex fixed inset-0 z-40 bg-[#020617] pt-16" : "hidden xl:flex h-full"
                )}>
                    <div className="p-6 border-b border-white/5 shrink-0">
                        <h3 className="text-white font-bold text-sm tracking-tight mb-1">Diccionario de Campos</h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Smart Binding Available</p>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scrollbar-thin">
                        {Object.entries(fieldGroups).map(([group, fields]) => (
                            <div key={group} className="space-y-2">
                                <h4 className="px-2 text-[9px] font-black text-primary/50 uppercase tracking-[0.2em]">{group}</h4>
                                <div className="space-y-1">
                                    {fields.map(f => (
                                        <div key={f.key} className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-[11px] font-bold text-slate-300 hover:border-primary/20 hover:bg-primary/5 transition-all cursor-default">
                                            {f.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <div className="h-32 lg:h-10" /> {/* Spacer */}
                    </div>
                </aside>

                {/* ── Centro: Canvas PDF ───────────────────────────── */}
                <main 
                    className={cn(
                        "flex-1 bg-[#0A0F1D] overflow-y-auto overflow-x-auto flex flex-col items-center scrollbar-thin relative transition-all duration-300 h-full",
                        mobileLayer !== 'pdf' && "hidden lg:flex",
                        "px-4 py-6 lg:px-8 lg:py-6"
                    )}
                    onClick={clearSelection}
                >
                    <div className="relative shadow-[0_0_100px_rgba(0,0,0,0.6)] border border-white/5 bg-[#020617] shrink-0 m-auto" ref={pdfWrapperRef}>
                        <Document
                            file={templateUrl}
                            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                            loading={<Loader2 className="animate-spin text-primary" size={40} />}
                        >
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                onClick={handleCanvasClick}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                className="cursor-crosshair shadow-2xl"
                            />
                        </Document>

                        {/* Overlays de campos */}
                        {mappings.filter(m => m.page_number === pageNumber).map(m => (
                            <div
                                key={m.id}
                                onMouseDown={e => handleMouseDown(e, m, 'drag')}
                                onClick={e => {
                                    e.stopPropagation();
                                    setSelectedMappingId(m.id!);
                                    if (window.innerWidth < 1024) setMobileLayer('config');
                                }}
                                className={cn(
                                    'absolute rounded-sm border transition-all cursor-move group',
                                    selectedMappingId === m.id
                                        ? 'bg-primary/20 border-primary ring-2 ring-primary/20 z-30 shadow-xl scale-[1.02]'
                                        : 'bg-primary/5 border-primary/30 z-10'
                                )}
                                style={{
                                    left:   m.x_coordinate  * scale,
                                    top:    m.y_coordinate  * scale,
                                    width:  (m.width  ?? 100) * scale,
                                    height: (m.height ?? 20)  * scale,
                                }}
                            >
                                <div className="absolute -top-6 left-0 text-[9px] font-black text-white bg-slate-950 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-white/10 shadow-xl">
                                    {availableFields.find(f => f.key === m.field_key)?.label ?? m.field_key}
                                </div>
                                {selectedMappingId === m.id && (
                                    <div
                                        onMouseDown={e => handleMouseDown(e, m, 'resize')}
                                        className="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize hover:bg-primary/50"
                                    />
                                )}
                            </div>
                        ))}

                        {/* Popover de selección de campo */}
                        <AnimatePresence>
                            {selectedPoint && (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1,   opacity: 1 }}
                                    exit={{   scale: 0.9, opacity: 0 }}
                                    className="absolute bg-[#020617] border border-white/10 rounded-2xl p-4 shadow-2xl z-[120] w-64 backdrop-blur-3xl"
                                    style={{ 
                                        left: Math.min(selectedPoint.x * scale, (pdfWrapperRef.current?.offsetWidth || 0) - 260), 
                                        top: selectedPoint.y * scale + 10 
                                    }}
                                    onClick={e => e.stopPropagation()}
                                >
                                    <h4 className="text-[10px] font-black uppercase text-slate-500 mb-3 tracking-widest flex items-center gap-2">
                                        <Plus size={10} className="text-primary" />
                                        Asignar Campo
                                    </h4>
                                    <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar pr-2">
                                        {availableFields.map(f => (
                                            <button
                                                key={f.key}
                                                onClick={() => {
                                                    addMapping(f.key, pageNumber);
                                                    if (window.innerWidth < 1024) setMobileLayer('pdf');
                                                }}
                                                className="w-full text-left p-2.5 rounded-xl text-[11px] font-bold text-slate-300 hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-between group border border-transparent hover:border-primary/10"
                                            >
                                                {f.label}
                                                <Plus size={10} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Spacer bottom to ignore toolbar visibility issues */}
                    <div className="h-40 shrink-0" />

                    {/* ── Toolbar Flotante (Glassmorphism) ── */}
                    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-[#0A0F1D]/80 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[130]">
                        
                        {/* Navegación Páginas */}
                        <div className="flex items-center gap-1 bg-white/5 rounded-full px-1 p-0.5">
                            <button 
                                onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                                className="p-2.5 text-slate-400 hover:text-white transition-colors disabled:opacity-20"
                                disabled={pageNumber === 1}
                            >
                                <ArrowLeft size={18} />
                            </button>
                            <div className="px-4 text-[11px] font-black text-white min-w-[80px] text-center border-x border-white/5">
                                {pageNumber} / {numPages}
                            </div>
                            <button 
                                onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
                                className="p-2.5 text-slate-400 hover:text-white transition-colors disabled:opacity-20"
                                disabled={pageNumber === numPages}
                            >
                                <ArrowRight size={18} />
                            </button>
                        </div>

                        <div className="w-px h-6 bg-white/10 mx-1 lg:mx-2" />

                        {/* Zoom */}
                        <div className="flex items-center gap-1">
                            <button onClick={() => setScale(s => Math.max(0.2, s - 0.1))} className="p-2.5 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-full hover:bg-white/10"><Minus size={18} /></button>
                            <span className="text-[10px] font-black text-white w-14 text-center uppercase tracking-tighter">{Math.round(scale * 100)}%</span>
                            <button onClick={() => setScale(s => Math.min(3.0, s + 0.1))} className="p-2.5 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-full hover:bg-white/10"><Plus size={18} /></button>
                        </div>
                    </div>
                </main>

                {/* ── Columna Derecha: Inspector Panel (Desktop o Layer config) ── */}
                <aside className={cn(
                    "w-80 bg-[#020617] border-l border-white/5 shrink-0 transition-all duration-300 h-full",
                    mobileLayer === 'config' ? "flex fixed inset-0 z-40 pt-16 h-screen" : "hidden lg:flex"
                )}>
                    <div className="flex-1 overflow-y-auto scrollbar-thin h-full">
                        <AnimatePresence mode="wait">
                            {selectedMapping ? (
                                <MappingInspector
                                    key={selectedMapping.id}
                                    mapping={selectedMapping}
                                    availableFields={availableFields}
                                    onUpdate={updateMapping}
                                    onDelete={deleteMapping}
                                    onClose={clearSelection}
                                />
                            ) : (
                                <div className="flex-1 h-full flex flex-col items-center justify-center p-12 text-center opacity-20">
                                    <SettingsIcon size={48} className="text-slate-700 mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 leading-relaxed">Selecciona un elemento<br/>para configurar</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </aside>

                {/* ── Mobile Layer Selector (Only visible on < lg) ── */}
                <div className="lg:hidden fixed bottom-6 left-6 right-6 h-16 bg-[#0A0F1D]/90 backdrop-blur-3xl border border-white/10 rounded-[28px] overflow-hidden flex z-[140] shadow-2xl">
                    {[
                        { id: 'fields', icon: List, label: 'Campos' },
                        { id: 'pdf',    icon: FileText, label: 'Documento' },
                        { id: 'config', icon: SettingsIcon, label: 'Ajustes' }
                    ].map((btn) => (
                        <button
                            key={btn.id}
                            onClick={() => setMobileLayer(btn.id as any)}
                            className={cn(
                                "flex-1 flex flex-col items-center justify-center gap-1 transition-all",
                                mobileLayer === btn.id ? "text-primary bg-primary/5" : "text-slate-500"
                            )}
                        >
                            <btn.icon size={20} className={mobileLayer === btn.id ? "scale-110" : ""} />
                            <span className="text-[9px] font-black uppercase tracking-widest">{btn.label}</span>
                        </button>
                    ))}
                </div>

                {/* Atajos de teclado ayuda (Desktop) */}
                <div className="hidden 2xl:block fixed left-[295px] bottom-10 px-4 py-2 bg-[#020617]/80 backdrop-blur-xl rounded-xl border border-white/10 text-[9px] font-black text-slate-500 uppercase tracking-widest z-10">
                    <span className="text-primary mr-2 opacity-60">Tip:</span> Flechas para ajuste fino
                </div>

            </div>
        </div>
    );
};
