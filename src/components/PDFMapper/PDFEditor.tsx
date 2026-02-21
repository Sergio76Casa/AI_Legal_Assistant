import React, { useState, useEffect, useRef } from 'react';
import { Document, Page } from 'react-pdf';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import {
    Loader2, MousePointerClick, X, Eye, Trash2,
    ArrowLeft, ArrowRight, Minus, Plus, Settings,
    CheckSquare, Type, DownloadCloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../lib/pdf-worker'; // Import worker config
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { generateFilledPDF } from '../../lib/pdf-generator';
import { cn } from '../../lib/utils';
import { useTenant } from '../../lib/TenantContext';

interface FieldMapping {
    id?: string;
    field_key: string;
    page_number: number;
    x_coordinate: number;
    y_coordinate: number;
    width?: number;
    height?: number;
    field_type: 'text' | 'checkbox' | 'signature';
    trigger_value?: string;
    font_size?: number;
}

export const PDFEditor: React.FC<{ templateId: string, templateUrl: string, onClose: () => void }> = ({ templateId, templateUrl, onClose }) => {
    const { t } = useTranslation();
    const { tenant } = useTenant();
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [mappings, setMappings] = useState<FieldMapping[]>([]);
    const [scale, setScale] = useState(1.0);
    const [generatingPreview, setGeneratingPreview] = useState(false);
    const [selectedMappingId, setSelectedMappingId] = useState<string | null>(null);
    const [selectedPoint, setSelectedPoint] = useState<{ x: number, y: number } | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    // Interaction State
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null);
    const [initialRect, setInitialRect] = useState<{ x: number, y: number, w: number, h: number } | null>(null);

    const pdfWrapperRef = useRef<HTMLDivElement>(null);

    const AVAILABLE_FIELDS = React.useMemo(() => [
        // Personal
        { group: 'Datos Personales', key: 'first_name', label: t('fields.first_name') },
        { group: 'Datos Personales', key: 'last_name', label: t('fields.last_name') },
        { group: 'Datos Personales', key: 'second_last_name', label: t('fields.second_last_name') },
        { group: 'Datos Personales', key: 'nie', label: t('fields.nie') },
        { group: 'Datos Personales', key: 'passport_num', label: t('fields.passport_num') },
        { group: 'Datos Personales', key: 'birth_date', label: t('fields.birth_date') },
        { group: 'Datos Personales', key: 'birth_day', label: t('fields.birth_day') },
        { group: 'Datos Personales', key: 'birth_month', label: t('fields.birth_month') },
        { group: 'Datos Personales', key: 'birth_year', label: t('fields.birth_year') },
        { group: 'Datos Personales', key: 'birth_place', label: t('fields.birth_place') },
        { group: 'Datos Personales', key: 'birth_country', label: t('fields.birth_country') },
        { group: 'Datos Personales', key: 'nationality', label: t('fields.nationality') },
        { group: 'Datos Personales', key: 'sex', label: t('fields.sex') },
        { group: 'Datos Personales', key: 'sex_male', label: t('fields.sex_male') },
        { group: 'Datos Personales', key: 'sex_female', label: t('fields.sex_female') },
        { group: 'Datos Personales', key: 'sex_x', label: t('fields.sex_x') },
        { group: 'Datos Personales', key: 'civil_status', label: t('fields.civil_status') },

        // Family
        { group: 'Filiación', key: 'father_name', label: t('fields.father_name') },
        { group: 'Filiación', key: 'mother_name', label: t('fields.mother_name') },

        // Contact & Address
        { group: 'Contacto y Dirección', key: 'email', label: t('fields.email') },
        { group: 'Contacto y Dirección', key: 'phone', label: t('fields.phone') },
        { group: 'Contacto y Dirección', key: 'address', label: t('fields.address') },
        { group: 'Contacto y Dirección', key: 'address_street', label: t('fields.address_street') },
        { group: 'Contacto y Dirección', key: 'address_number', label: t('fields.address_number') },
        { group: 'Contacto y Dirección', key: 'address_floor', label: t('fields.address_floor') },
        { group: 'Contacto y Dirección', key: 'city', label: t('fields.city') },
        { group: 'Contacto y Dirección', key: 'postal_code', label: t('fields.postal_code') },
        { group: 'Contacto y Dirección', key: 'address_province', label: t('fields.address_province') },

        // Representation
        { group: 'Representación', key: 'representative_name', label: t('fields.representative_name') },
        { group: 'Representación', key: 'representative_nie', label: t('fields.representative_nie') },

        // System
        { group: 'Sistema', key: 'today_date', label: t('fields.today_date') },
        { group: 'Sistema', key: 'today_day', label: t('fields.today_day') },
        { group: 'Sistema', key: 'today_month', label: t('fields.today_month') },
        { group: 'Sistema', key: 'today_year', label: t('fields.today_year') },

        // Actions
        { group: 'Acciones', key: 'client_signature', label: 'Firma del Cliente' },
    ], [t]);

    useEffect(() => {
        fetchMappings();
    }, [templateId]);

    // Keyboard shortcuts for fine-tuning
    useEffect(() => {
        const handleKeyDown = async (e: KeyboardEvent) => {
            if (!selectedMappingId || isDragging || isResizing) return;

            const step = e.shiftKey ? 10 : 1;
            let dx = 0;
            let dy = 0;

            if (e.key === 'ArrowLeft') dx = -step;
            else if (e.key === 'ArrowRight') dx = step;
            else if (e.key === 'ArrowUp') dy = -step;
            else if (e.key === 'ArrowDown') dy = step;
            else return;

            e.preventDefault();

            setMappings(prev => prev.map(m => {
                if (m.id === selectedMappingId) {
                    const newX = m.x_coordinate + dx;
                    const newY = m.y_coordinate + dy;
                    // Auto-save to DB (debounced or immediate)
                    updateMapping(m.id!, { x_coordinate: newX, y_coordinate: newY });
                    return { ...m, x_coordinate: newX, y_coordinate: newY };
                }
                return m;
            }));
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedMappingId, isDragging, isResizing]);

    const fetchMappings = async () => {
        const { data } = await supabase
            .from('form_fields_mapping')
            .select('*')
            .eq('template_id', templateId);

        if (data) setMappings(data as FieldMapping[]);
    };

    const updateMapping = async (id: string, updates: Partial<FieldMapping>) => {
        await supabase.from('form_fields_mapping').update(updates).eq('id', id);
        setMappings(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m as FieldMapping));
    };

    const addMapping = async (fieldKey: string) => {
        if (!selectedPoint) return;

        const isSignature = fieldKey === 'client_signature';
        const isSexMale = fieldKey === 'sex_male';
        const isSexFemale = fieldKey === 'sex_female';
        const isSexX = fieldKey === 'sex_x';

        const newMapping: any = {
            template_id: templateId,
            field_key: (isSexMale || isSexFemale || isSexX) ? 'sex' : fieldKey,
            page_number: pageNumber,
            x_coordinate: selectedPoint.x,
            y_coordinate: selectedPoint.y,
            width: isSignature ? 200 : (isSexMale || isSexFemale || isSexX ? 20 : 150),
            height: isSignature ? 60 : (isSexMale || isSexFemale || isSexX ? 20 : 20),
            field_type: isSignature ? 'signature' : ((isSexMale || isSexFemale || isSexX) ? 'checkbox' : 'text'),
            trigger_value: isSexMale ? 'male' : (isSexFemale ? 'female' : (isSexX ? 'other' : undefined))
        };

        const { data } = await supabase.from('form_fields_mapping').insert(newMapping).select().single();
        if (data) {
            setMappings([...mappings, data as FieldMapping]);
            setSelectedPoint(null);
            setSelectedMappingId(data.id);
        }
    };

    const handleImportMaster = async () => {
        if (!confirm('¿Importar mapeo maestro para este formulario? Se añadirán campos preconfigurados.')) return;
        setIsImporting(true);
        try {
            // Check for a master template by name or common categories
            const { data: masterFields } = await supabase
                .from('form_fields_mapping')
                .select('*')
                .eq('template_id', '00000000-0000-0000-0000-000000000000'); // Simulated global ID

            if (masterFields && masterFields.length > 0) {
                const clones = masterFields.map(f => ({
                    ...f,
                    id: undefined,
                    template_id: templateId
                }));
                await supabase.from('form_fields_mapping').insert(clones);
                await fetchMappings();
            } else {
                alert('No se encontró un mapeo maestro para este modelo.');
            }
        } catch (e) { console.error(e); }
        finally { setIsImporting(false); }
    };

    const handleMouseDown = (e: React.MouseEvent, text: FieldMapping, action: 'drag' | 'resize') => {
        e.stopPropagation();
        setSelectedMappingId(text.id!);
        setSelectedPoint(null);
        setIsDragging(action === 'drag');
        setIsResizing(action === 'resize');
        setDragStart({ x: e.clientX, y: e.clientY });
        setInitialRect({ x: text.x_coordinate, y: text.y_coordinate, w: text.width || 100, h: text.height || 20 });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if ((!isDragging && !isResizing) || !dragStart || !initialRect || !selectedMappingId) return;
        const deltaX = (e.clientX - dragStart.x) / scale;
        const deltaY = (e.clientY - dragStart.y) / scale;
        const idx = mappings.findIndex(m => m.id === selectedMappingId);
        if (idx === -1) return;
        const updated = [...mappings];
        if (isDragging) {
            updated[idx] = { ...updated[idx], x_coordinate: initialRect.x + deltaX, y_coordinate: initialRect.y + deltaY };
        } else {
            updated[idx] = { ...updated[idx], width: Math.max(20, initialRect.w + deltaX) };
        }
        setMappings(updated);
    };

    const handleMouseUp = async () => {
        if ((isDragging || isResizing) && selectedMappingId) {
            const m = mappings.find(m => m.id === selectedMappingId);
            if (m) await updateMapping(m.id!, { x_coordinate: m.x_coordinate, y_coordinate: m.y_coordinate, width: m.width });
        }
        setIsDragging(false); setIsResizing(false);
    };

    const handlePreview = async () => {
        setGeneratingPreview(true);
        try {
            const pdfBytes = await generateFilledPDF({
                templateId,
                clientId: 'preview',
                clientProfile: {
                    first_name: 'JUAN',
                    last_name: 'PÉREZ',
                    second_last_name: 'GARCÍA',
                    full_name: 'JUAN PÉREZ GARCÍA',
                    nie: 'X12345678L',
                    sex: 'male',
                    signature_date: new Date().toISOString()
                },
                tenantProfile: tenant,
                customMappings: mappings
            });
            if (pdfBytes) {
                const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
                window.open(URL.createObjectURL(blob), '_blank');
            }
        } finally { setGeneratingPreview(false); }
    };

    const selectedMapping = mappings.find(m => m.id === selectedMappingId);

    return (
        <div className="fixed inset-0 bg-[#020617] z-[60] flex flex-col overflow-hidden" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
            {/* Header */}
            <header className="h-16 bg-[#0f172a]/95 border-b border-white/5 px-6 flex items-center justify-between z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
                    <h2 className="text-white font-bold flex items-center gap-2">PDF Mapper <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">v2.0</span></h2>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleImportMaster} disabled={isImporting} className="bg-white/5 text-indigo-400 px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-white/10 transition-all">
                        {isImporting ? <Loader2 className="animate-spin" size={14} /> : <DownloadCloud size={14} />}
                        Importar Mapeo Maestro
                    </button>
                    <button onClick={handlePreview} className="bg-white/5 text-primary px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-white/10 transition-all">
                        {generatingPreview ? <Loader2 className="animate-spin" size={14} /> : <Eye size={14} />}
                        Preview
                    </button>
                    <button onClick={onClose} className="bg-primary text-slate-950 px-6 py-2 rounded-xl text-xs font-black uppercase shadow-lg shadow-primary/20">Guardar Plantilla</button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                {/* PDF Canvas area */}
                <div className="flex-1 bg-slate-900 overflow-auto flex justify-center p-20 scrollbar-hide" onClick={() => { setSelectedMappingId(null); setSelectedPoint(null); }}>
                    <div className="relative shadow-2xl" ref={pdfWrapperRef}>
                        <Document file={templateUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)} loading={<Loader2 className="animate-spin text-primary" size={40} />}>
                            <Page pageNumber={pageNumber} scale={scale} onClick={(e) => {
                                e.stopPropagation();
                                if (isDragging || isResizing) return;
                                const rect = pdfWrapperRef.current!.getBoundingClientRect();
                                setSelectedPoint({ x: (e.clientX - rect.left) / scale, y: (e.clientY - rect.top) / scale });
                                setSelectedMappingId(null);
                            }} renderTextLayer={false} renderAnnotationLayer={false} className="cursor-crosshair" />
                        </Document>

                        {/* Mappings Layer */}
                        {mappings.filter(m => m.page_number === pageNumber).map(m => (
                            <div
                                key={m.id}
                                onMouseDown={(e) => handleMouseDown(e, m, 'drag')}
                                onClick={(e) => e.stopPropagation()}
                                className={cn(
                                    "absolute rounded-sm border transition-all cursor-move group",
                                    selectedMappingId === m.id ? "bg-primary/20 border-primary ring-2 ring-primary/20 z-30 shadow-xl" : "bg-primary/5 border-primary/30 z-10"
                                )}
                                style={{ left: m.x_coordinate * scale, top: m.y_coordinate * scale, width: (m.width || 100) * scale, height: (m.height || 20) * scale }}
                            >
                                <div className="absolute -top-6 left-0 text-[9px] font-black text-white bg-slate-950 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {AVAILABLE_FIELDS.find(f => f.key === m.field_key)?.label || m.field_key}
                                </div>
                                {selectedMappingId === m.id && (
                                    <div onMouseDown={(e) => handleMouseDown(e, m, 'resize')} className="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize hover:bg-primary/50" />
                                )}
                            </div>
                        ))}

                        {/* Point Selector Popup */}
                        <AnimatePresence>
                            {selectedPoint && (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                                    className="absolute bg-slate-950 border border-white/10 rounded-2xl p-4 shadow-2xl z-50 w-64"
                                    style={{ left: selectedPoint.x * scale, top: selectedPoint.y * scale + 10 }}
                                    onClick={e => e.stopPropagation()}
                                >
                                    <h4 className="text-[10px] font-black uppercase text-slate-500 mb-2">Asignar Campo</h4>
                                    <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
                                        {AVAILABLE_FIELDS.map(f => (
                                            <button key={f.key} onClick={() => addMapping(f.key)} className="w-full text-left p-2 rounded-lg text-[11px] font-bold text-slate-300 hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-between group">
                                                {f.label} <Plus size={10} className="opacity-0 group-hover:opacity-100" />
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <AnimatePresence>
                    {selectedMapping && (
                        <motion.aside
                            initial={{ x: 320, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 320, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute top-0 right-0 h-full w-80 bg-[#0f172a]/95 border-l border-white/10 p-6 flex flex-col z-50 backdrop-blur-xl shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <Settings size={14} className="text-primary" /> Inspector de Campo
                                </h3>
                                <button onClick={() => setSelectedMappingId(null)} className="text-slate-500 hover:text-white"><X size={18} /></button>
                            </div>

                            <div className="space-y-6 flex-1">
                                {/* Type Selector */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipo de Lógica</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => updateMapping(selectedMapping.id!, { field_type: 'text' })}
                                            className={cn("p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all", selectedMapping.field_type === 'text' ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/5 text-slate-500")}
                                        >
                                            <Type size={18} /> <span className="text-[9px] font-black uppercase">Texto</span>
                                        </button>
                                        <button
                                            onClick={() => updateMapping(selectedMapping.id!, { field_type: 'checkbox', trigger_value: selectedMapping.trigger_value || 'true' })}
                                            className={cn("p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all", selectedMapping.field_type === 'checkbox' ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/5 text-slate-500")}
                                        >
                                            <CheckSquare size={18} /> <span className="text-[9px] font-black uppercase">Checkbox</span>
                                        </button>
                                        <button
                                            onClick={() => updateMapping(selectedMapping.id!, { field_type: 'signature' })}
                                            className={cn("p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all", selectedMapping.field_type === 'signature' ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/5 text-slate-500")}
                                        >
                                            <MousePointerClick size={18} /> <span className="text-[9px] font-black uppercase">Firma</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Binding Selector */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vinculación (Smart Binding)</label>
                                    <select
                                        value={selectedMapping.field_key}
                                        onChange={(e) => updateMapping(selectedMapping.id!, { field_key: e.target.value })}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-primary"
                                    >
                                        {AVAILABLE_FIELDS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
                                    </select>
                                </div>

                                {/* Trigger Value (only for checkboxes) */}
                                {selectedMapping.field_type === 'checkbox' && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Valor de Activación</label>
                                        <input
                                            type="text" value={selectedMapping.trigger_value || ''}
                                            onChange={(e) => updateMapping(selectedMapping.id!, { trigger_value: e.target.value })}
                                            placeholder="Ej: true, male, soltero..."
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-primary"
                                        />
                                        <p className="text-[9px] text-slate-600 italic">Si el campo en la DB es igual a este valor, se marcará una 'X'.</p>
                                    </motion.div>
                                )}

                                {/* Geometry */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Posición Precisa (PDF Points)</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                            <div className="text-[9px] text-slate-500 mb-1">X</div>
                                            <div className="text-xs font-mono text-white">{Math.round(selectedMapping.x_coordinate)}pt</div>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                            <div className="text-[9px] text-slate-500 mb-1">Y</div>
                                            <div className="text-xs font-mono text-white">{Math.round(selectedMapping.y_coordinate)}pt</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => { if (confirm('¿Borrar mapeo?')) { setSelectedMappingId(null); supabase.from('form_fields_mapping').delete().eq('id', selectedMapping.id).then(() => fetchMappings()); } }}
                                className="w-full py-4 border border-red-500/30 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all mt-auto"
                            >
                                <Trash2 size={12} className="inline mr-2" /> Eliminar Campo
                            </button>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Left Mini Sidebar - Tool Tips */}
                <div className="absolute left-6 bottom-6 flex flex-col gap-2 z-10">
                    <div className="bg-slate-950/80 border border-white/5 rounded-2xl p-4 backdrop-blur-md">
                        <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><kbd className="bg-white/10 px-1.5 py-0.5 rounded border border-white/10">S</kbd> Escala</span>
                            <div className="w-px h-3 bg-white/10 mx-1" />
                            <span className="flex items-center gap-1.5"><kbd className="bg-white/10 px-1.5 py-0.5 rounded border border-white/10">Arrows</kbd> Ajuste Fino</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setPageNumber(p => Math.max(1, p - 1))} className="p-3 bg-slate-950 text-white rounded-xl border border-white/10 hover:bg-primary hover:text-slate-950 transition-all shadow-xl"><ArrowLeft size={16} /></button>
                        <div className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-xs font-black text-white">{pageNumber} / {numPages}</div>
                        <button onClick={() => setPageNumber(p => Math.min(numPages, p + 1))} className="p-3 bg-slate-950 text-white rounded-xl border border-white/10 hover:bg-primary hover:text-slate-950 transition-all shadow-xl"><ArrowRight size={16} /></button>
                    </div>
                </div>

                {/* Zoom Controls */}
                <div className="absolute right-6 bottom-6 flex items-center gap-1 bg-slate-950 border border-white/10 p-1 rounded-2xl z-10">
                    <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-3 text-white hover:bg-white/5 rounded-xl"><Minus size={16} /></button>
                    <span className="text-[10px] font-black text-white w-10 text-center">{Math.round(scale * 100)}%</span>
                    <button onClick={() => setScale(s => Math.min(2.0, s + 0.1))} className="p-3 text-white hover:bg-white/5 rounded-xl"><Plus size={16} /></button>
                </div>
            </div>
        </div>
    );
};
