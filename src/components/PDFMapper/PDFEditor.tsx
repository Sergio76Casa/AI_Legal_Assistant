import React, { useState, useEffect, useRef } from 'react';
import { Document, Page } from 'react-pdf';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { Loader2, Save, MousePointerClick, X, Eye, Trash2, ArrowLeft, ArrowRight, Minus, Plus } from 'lucide-react';
import '../../lib/pdf-worker'; // Import worker config
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { generateFilledPDF } from '../../lib/pdf-generator';

interface PDFEditorProps {
    templateId: string;
    templateUrl: string; // Signed URL
    onClose: () => void;
}

interface FieldMapping {
    id?: string;
    field_key: string;
    page_number: number;
    x_coordinate: number;
    y_coordinate: number;
    width?: number;
    height?: number;
}



export const PDFEditor: React.FC<PDFEditorProps> = ({ templateId, templateUrl, onClose }) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [mappings, setMappings] = useState<FieldMapping[]>([]);
    const [loading, setLoading] = useState(true);
    const [scale, setScale] = useState(1.0);
    const [generatingPreview, setGeneratingPreview] = useState(false);
    const { t } = useTranslation();

    const AVAILABLE_FIELDS = React.useMemo(() => [
        { key: 'first_name', label: t('fields.first_name') },
        { key: 'last_name', label: t('fields.last_name') },
        { key: 'second_last_name', label: t('fields.second_last_name') },
        { key: 'nie', label: t('fields.nie') },
        { key: 'passport_num', label: t('fields.passport_num') }, // EX-15
        { key: 'sex_male', label: t('fields.sex_male') },
        { key: 'sex_female', label: t('fields.sex_female') },
        { key: 'civil_status', label: t('fields.civil_status') }, // EX-15
        { key: 'email', label: t('fields.email') },
        { key: 'phone', label: t('fields.phone') },

        // Filiación
        { key: 'father_name', label: t('fields.father_name') },
        { key: 'mother_name', label: t('fields.mother_name') },

        // Dirección España
        { key: 'address', label: t('fields.address') },
        { key: 'address_street', label: t('fields.address_street') },
        { key: 'address_number', label: t('fields.address_number') },
        { key: 'address_floor', label: t('fields.address_floor') },
        { key: 'city', label: t('fields.city') },
        { key: 'postal_code', label: t('fields.postal_code') },
        { key: 'address_province', label: t('fields.address_province') },

        { key: 'nationality', label: t('fields.nationality') },
        { key: 'birth_date', label: t('fields.birth_date') },

        // Representación
        { key: 'representative_name', label: t('fields.representative_name') },
        { key: 'representative_nie', label: t('fields.representative_nie') },

        { key: 'today_date', label: t('fields.today_date') },
    ], [t]);

    const pdfWrapperRef = useRef<HTMLDivElement>(null);

    // Interaction State
    const [selectedPoint, setSelectedPoint] = useState<{ x: number, y: number } | null>(null);
    const [selectedMappingId, setSelectedMappingId] = useState<string | null>(null);
    // Dragging / Resizing
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null);
    const [initialRect, setInitialRect] = useState<{ x: number, y: number, w: number, h: number } | null>(null);

    useEffect(() => {
        fetchMappings();
    }, [templateId]);

    // Keyboard Listeners for Fine Tuning
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!selectedMappingId) return;

            const mappingIndex = mappings.findIndex(m => m.id === selectedMappingId);
            if (mappingIndex === -1) return;

            const mapping = mappings[mappingIndex];
            const STEP = e.shiftKey ? 10 : 1; // Shift + Arrow = 10px, else 1px

            let updates = {};

            switch (e.key) {
                case 'ArrowUp': updates = { y_coordinate: mapping.y_coordinate - STEP }; break;
                case 'ArrowDown': updates = { y_coordinate: mapping.y_coordinate + STEP }; break;
                case 'ArrowLeft': updates = { x_coordinate: mapping.x_coordinate - STEP }; break;
                case 'ArrowRight': updates = { x_coordinate: mapping.x_coordinate + STEP }; break;
                case 'Delete':
                case 'Backspace':
                    removeMapping(selectedMappingId);
                    return;
                default: return;
            }

            e.preventDefault();
            // Optimistic update
            const updatedMappings = [...mappings];
            updatedMappings[mappingIndex] = { ...mapping, ...updates };
            setMappings(updatedMappings);

            updateMapping(mapping.id!, updates);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedMappingId, mappings]);

    const fetchMappings = async () => {
        const { data } = await supabase
            .from('form_fields_mapping')
            .select('*')
            .eq('template_id', templateId);

        if (data) setMappings(data);
        setLoading(false);
    };

    const updateMapping = async (id: string, updates: Partial<FieldMapping>) => {
        await supabase
            .from('form_fields_mapping')
            .update(updates)
            .eq('id', id);

        setMappings(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    };

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    const handlePreview = async () => {
        setGeneratingPreview(true);
        try {
            const DUMMY_PROFILE = {
                first_name: 'Juan',
                last_name: 'Pérez',
                second_last_name: 'García',
                nie: 'X12345678L',
                passport_num: 'PA123456',
                sex: 'male',
                civil_status: 'Soltero',
                email: 'juan@ejemplo.com',
                phone: '600123456',
                father_name: 'Antonio',
                mother_name: 'María',
                address: 'C/ Mayor, 10',
                address_street: 'Mayor',
                address_number: '10',
                address_floor: '1A',
                city: 'Madrid',
                postal_code: '28001',
                address_province: 'Madrid',
                nationality: 'Venezuela',
                birth_date: '1990-05-15',
                representative_name: 'Abogado Legal',
                representative_nie: 'Y87654321Z'
            };

            const pdfBytes = await generateFilledPDF({
                templateId,
                clientId: 'dummy',
                clientProfile: DUMMY_PROFILE,
                customMappings: mappings
            });

            if (pdfBytes) {
                const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
            }
        } catch (err) {
            console.error(err);
            alert(t('pdf_editor.error_preview'));
        } finally {
            setGeneratingPreview(false);
        }
    };

    const handleAutoDetect = async () => {
        if (!confirm(t('pdf_editor.confirm_analyze'))) return;

        setLoading(true);
        try {
            const { PDFDocument, PDFName } = await import('pdf-lib');

            const response = await fetch(templateUrl);
            const arrayBuffer = await response.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            const newMappings: Omit<FieldMapping, 'id'>[] = [];
            const pages = pdfDoc.getPages();

            for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
                const page = pages[pageIdx];
                const { height } = page.getSize();

                const notifications = page.node.Annots();
                if (!notifications) continue;

                for (let i = 0; i < notifications.size(); i++) {
                    const annot = notifications.lookup(i) as any;
                    const subtype = annot.get(PDFName.of('Subtype'));

                    if (subtype?.toString() === '/Widget') {
                        const rect = annot.get(PDFName.of('Rect'));
                        if (!rect) continue;

                        let fieldName = annot.get(PDFName.of('T'))?.toString();

                        if (fieldName) {
                            fieldName = fieldName.replace(/[()]/g, '');
                        } else {
                            const parent = annot.get(PDFName.of('Parent'));
                            if (parent) {
                                fieldName = parent.get(PDFName.of('T'))?.toString()?.replace(/[()]/g, '');
                            }
                        }

                        if (!fieldName) fieldName = `field_pg${pageIdx + 1}_${i}`;

                        const x = rect.get(0)?.numberValue || 0;
                        const y = rect.get(1)?.numberValue || 0;
                        const w = (rect.get(2)?.numberValue || 0) - x;
                        const h = (rect.get(3)?.numberValue || 0) - y;

                        const visualY = height - (y + h);

                        let matchedKey = fieldName.toLowerCase();

                        newMappings.push({
                            field_key: matchedKey,
                            page_number: pageIdx + 1,
                            x_coordinate: x,
                            y_coordinate: visualY,
                            width: w,
                            height: h
                        });
                    }
                }
            }

            if (newMappings.length === 0) {
                alert(t('pdf_editor.no_fields_found'));
                return;
            }

            const { data, error } = await supabase
                .from('form_fields_mapping')
                .insert(newMappings.map(m => ({ ...m, template_id: templateId })))
                .select();

            if (error) throw error;

            alert(t('pdf_editor.success_detected', { count: data.length }));
            await fetchMappings();

        } catch (e) {
            console.error('Auto-detect error:', e);
            alert(t('pdf_editor.error_analyzing'));
        } finally {
            setLoading(false);
        }
    };

    const handleMouseDown = (e: React.MouseEvent, text: FieldMapping, action: 'drag' | 'resize') => {
        e.stopPropagation();
        setSelectedMappingId(text.id!);
        setSelectedPoint(null);

        setIsDragging(action === 'drag');
        setIsResizing(action === 'resize');
        setDragStart({ x: e.clientX, y: e.clientY });
        setInitialRect({
            x: text.x_coordinate,
            y: text.y_coordinate,
            w: text.width || 100,
            h: text.height || 20
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging && !isResizing) return;
        if (!dragStart || !initialRect || !selectedMappingId) return;

        const deltaX = (e.clientX - dragStart.x) / scale;
        const deltaY = (e.clientY - dragStart.y) / scale;

        const mappingIndex = mappings.findIndex(m => m.id === selectedMappingId);
        if (mappingIndex === -1) return;

        const updatedMappings = [...mappings];

        if (isDragging) {
            updatedMappings[mappingIndex] = {
                ...updatedMappings[mappingIndex],
                x_coordinate: initialRect.x + deltaX,
                y_coordinate: initialRect.y + deltaY
            };
        } else if (isResizing) {
            updatedMappings[mappingIndex] = {
                ...updatedMappings[mappingIndex],
                width: Math.max(20, initialRect.w + deltaX),
            };
        }

        setMappings(updatedMappings);
    };

    const handleMouseUp = async () => {
        if (isDragging || isResizing) {
            if (selectedMappingId) {
                const m = mappings.find(m => m.id === selectedMappingId);
                if (m) {
                    await updateMapping(m.id!, {
                        x_coordinate: m.x_coordinate,
                        y_coordinate: m.y_coordinate,
                        width: m.width,
                        height: m.height
                    });
                }
            }
            setIsDragging(false);
            setIsResizing(false);
            setDragStart(null);
            setInitialRect(null);
        }
    };

    const handlePageClick = (e: React.MouseEvent) => {
        if (isDragging || isResizing) return;
        if (!pdfWrapperRef.current) return;

        const rect = pdfWrapperRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const pdfX = x / scale;
        const pdfY = y / scale;

        setSelectedPoint({ x: pdfX, y: pdfY });
        setSelectedMappingId(null);
    };

    const addMapping = async (fieldKey: string) => {
        if (!selectedPoint) return;

        const isCheckbox = fieldKey.startsWith('sex_') || fieldKey === 'civil_status';

        const newMapping: FieldMapping = {
            field_key: fieldKey,
            page_number: pageNumber,
            x_coordinate: selectedPoint.x,
            y_coordinate: selectedPoint.y,
            width: isCheckbox ? 20 : 150,
            height: 20
        };

        const { data, error } = await supabase
            .from('form_fields_mapping')
            .insert({
                template_id: templateId,
                ...newMapping
            })
            .select()
            .single();

        if (error) console.error('Error adding mapping:', error);

        if (data) {
            setMappings([...mappings, data]);
            setSelectedPoint(null);
            setSelectedMappingId(data.id);
        }
    };

    const removeMapping = async (id: string) => {
        await supabase.from('form_fields_mapping').delete().eq('id', id);
        setMappings(mappings.filter(m => m.id !== id));
        if (selectedMappingId === id) setSelectedMappingId(null);
    };

    return (
        <div
            className="fixed inset-0 bg-slate-950 z-50 flex flex-col overflow-hidden animate-in fade-in duration-300"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            {/* Header Toolbar */}
            <div className="bg-slate-900/95 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-white/10 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                            {t('pdf_editor.title')}
                            <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 uppercase tracking-widest">
                                Editor
                            </span>
                        </h2>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-0.5">
                            {t('pdf_editor.tips')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleAutoDetect}
                        disabled={loading}
                        className="px-4 py-2 text-indigo-400 hover:bg-indigo-500/10 border border-indigo-500/30 rounded-lg flex items-center gap-2 transition-all font-bold text-sm disabled:opacity-50"
                        title={t('pdf_editor.auto_detect')}
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <MousePointerClick size={18} />}
                        {t('pdf_editor.auto_detect')}
                    </button>
                    <button
                        onClick={handlePreview}
                        disabled={generatingPreview}
                        className="px-4 py-2 text-primary hover:bg-primary/10 border border-primary/30 rounded-lg flex items-center gap-2 transition-all font-bold text-sm disabled:opacity-50"
                    >
                        {generatingPreview ? <Loader2 className="animate-spin" size={18} /> : <Eye size={18} />}
                        {t('pdf_editor.preview')}
                    </button>
                    <button onClick={onClose} className="px-5 py-2 bg-primary text-slate-900 rounded-lg flex items-center gap-2 font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all">
                        <Save size={18} /> {t('pdf_editor.save')}
                    </button>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Controls */}
                <div className="w-85 bg-slate-900/50 backdrop-blur-md border-r border-white/10 p-6 overflow-y-auto custom-scrollbar">
                    <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/10">
                        <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-500 mb-3">{t('pdf_editor.instructions_title')}</h3>
                        <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
                            <div className="flex gap-2">
                                <span className="w-4 h-4 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-[8px] shrink-0">1</span>
                                <div dangerouslySetInnerHTML={{ __html: t('pdf_editor.instructions_step1') }} />
                            </div>
                            <div className="flex gap-2">
                                <span className="w-4 h-4 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-[8px] shrink-0">2</span>
                                <div dangerouslySetInnerHTML={{ __html: t('pdf_editor.instructions_step2') }} />
                            </div>
                            <div className="flex gap-2">
                                <span className="w-4 h-4 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-[8px] shrink-0">3</span>
                                <div dangerouslySetInnerHTML={{ __html: t('pdf_editor.instructions_step3') }} />
                            </div>
                            <div className="flex gap-2">
                                <span className="w-4 h-4 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-[8px] shrink-0">4</span>
                                <div dangerouslySetInnerHTML={{ __html: t('pdf_editor.instructions_step4') }} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-white text-sm">{t('pdf_editor.mapped_fields')}</h3>
                            <span className="bg-white/10 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                {mappings.filter(m => m.page_number === pageNumber).length}
                            </span>
                        </div>
                        <div className="space-y-3">
                            {mappings.filter(m => m.page_number === pageNumber).length === 0 ? (
                                <div className="text-center py-8 opacity-40">
                                    <MousePointerClick size={24} className="mx-auto mb-2" />
                                    <p className="text-[10px] uppercase font-black tracking-widest">Sin campos en esta página</p>
                                </div>
                            ) : (
                                mappings.filter(m => m.page_number === pageNumber).map((m) => (
                                    <div
                                        key={m.id}
                                        onClick={() => setSelectedMappingId(m.id!)}
                                        className={`flex items-center justify-between p-4 border rounded-xl text-sm cursor-pointer transition-all ${selectedMappingId === m.id
                                            ? 'bg-primary/10 border-primary ring-1 ring-primary shadow-lg shadow-primary/5'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="flex-1 min-w-0 mr-3">
                                            {selectedMappingId === m.id ? (
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/70">{t('pdf_editor.assign_data')}</label>
                                                    <select
                                                        value={AVAILABLE_FIELDS.find(f => f.key === m.field_key) ? m.field_key : ''}
                                                        onChange={(e) => updateMapping(m.id!, { field_key: e.target.value })}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-full text-xs bg-slate-800 border-white/10 rounded-lg shadow-sm focus:border-primary focus:ring-primary p-2 text-white transition-all outline-none"
                                                    >
                                                        <option value="" disabled className="bg-slate-900 text-slate-500">-- {t('common.select')} --</option>
                                                        {AVAILABLE_FIELDS.map(f => (
                                                            <option key={f.key} value={f.key} className="bg-slate-900 hover:bg-primary">
                                                                {f.label}
                                                            </option>
                                                        ))}
                                                        {!AVAILABLE_FIELDS.find(f => f.key === m.field_key) && (
                                                            <option value={m.field_key} disabled className="bg-slate-900 italic">
                                                                {m.field_key} ({t('pdf_editor.detected')})
                                                            </option>
                                                        )}
                                                    </select>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="font-bold text-white block truncate text-xs" title={m.field_key}>
                                                        {AVAILABLE_FIELDS.find(f => f.key === m.field_key)?.label || m.field_key}
                                                    </span>
                                                    <div className="text-[10px] text-slate-500 font-mono mt-1 opacity-60">
                                                        X:{Math.round(m.x_coordinate)} Y:{Math.round(m.y_coordinate)}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); m.id && removeMapping(m.id); }}
                                            className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all flex-shrink-0"
                                            title="Eliminar campo"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* PDF Canvas area */}
                <div className="flex-1 bg-slate-950 overflow-auto flex justify-center p-12 relative shadow-inner" onClick={() => setSelectedMappingId(null)}>
                    <div className="relative shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5 rounded-sm" ref={pdfWrapperRef}>
                        <Document
                            file={templateUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading={
                                <div className="flex flex-col items-center justify-center p-20 text-primary">
                                    <Loader2 className="animate-spin w-12 h-12 mb-4" />
                                    <span className="text-xs font-black uppercase tracking-widest">Cargando PDF...</span>
                                </div>
                            }
                        >
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                onClick={handlePageClick}
                                className="cursor-crosshair selection:bg-transparent"
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                            />
                        </Document>

                        {mappings.filter(m => m.page_number === pageNumber).map((m) => (
                            <div
                                key={m.id}
                                onMouseDown={(e) => handleMouseDown(e, m, 'drag')}
                                className={`absolute rounded-sm cursor-move group select-none transition-all ${selectedMappingId === m.id
                                    ? 'bg-primary/30 border-2 border-primary z-20 shadow-[0_0_20px_rgba(19,236,200,0.3)]'
                                    : 'bg-primary/10 border border-primary/40 z-10 hover:bg-primary/20 hover:border-primary'
                                    }`}
                                style={{
                                    left: m.x_coordinate * scale,
                                    top: m.y_coordinate * scale,
                                    width: (m.width || 100) * scale,
                                    height: (m.height || 20) * scale,
                                }}
                            >
                                <div className={`absolute -top-7 left-0 bg-primary text-slate-900 text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-widest transition-all shadow-lg pointer-events-none whitespace-nowrap ${selectedMappingId === m.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0'
                                    }`}>
                                    {AVAILABLE_FIELDS.find(f => f.key === m.field_key)?.label || m.field_key}
                                </div>

                                {selectedMappingId === m.id && (
                                    <div
                                        onMouseDown={(e) => handleMouseDown(e, m, 'resize')}
                                        className="absolute bottom-0 right-0 w-5 h-full cursor-e-resize flex items-center justify-center hover:bg-primary/20 transition-all rounded-r-sm"
                                    >
                                        <div className="w-1.5 h-4 bg-primary rounded-full shadow-[0_0_10px_rgba(19,236,200,0.5)]" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {selectedPoint && (
                            <div
                                className="absolute bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-4 z-50 w-72 animate-in zoom-in-95 duration-200"
                                style={{
                                    left: selectedPoint.x * scale,
                                    top: selectedPoint.y * scale + 20,
                                }}
                            >
                                <div className="text-[10px] font-black text-slate-500 mb-4 px-2 uppercase tracking-widest flex items-center justify-between">
                                    {t('pdf_editor.insert_field')}
                                    <button onClick={() => setSelectedPoint(null)} className="hover:text-white"><X size={14} /></button>
                                </div>
                                <div className="max-h-80 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                                    {AVAILABLE_FIELDS.map((field) => (
                                        <button
                                            key={field.key}
                                            onClick={() => addMapping(field.key)}
                                            className="w-full text-left px-4 py-2 text-xs font-bold text-slate-300 hover:bg-primary/10 hover:text-primary rounded-xl transition-all border border-transparent hover:border-primary/20 flex items-center justify-between group"
                                        >
                                            {field.label}
                                            <Plus size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <button
                                        onClick={() => setSelectedPoint(null)}
                                        className="w-full text-center text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-white transition-colors"
                                    >
                                        {t('pdf_editor.cancel')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/95 backdrop-blur-md border-t border-white/10 px-8 py-4 flex justify-between items-center z-10">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <button
                            disabled={pageNumber <= 1}
                            onClick={() => setPageNumber(p => p - 1)}
                            className="w-10 h-10 border border-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="px-6 py-2 bg-white/5 rounded-xl border border-white/10">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-500 mr-2">{t('pdf_editor.page')}</span>
                            <span className="text-sm font-bold text-white">{pageNumber} <span className="text-slate-500">/ {numPages}</span></span>
                        </div>
                        <button
                            disabled={pageNumber >= numPages}
                            onClick={() => setPageNumber(p => p + 1)}
                            className="w-10 h-10 border border-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20"
                        >
                            <ArrowRight size={20} />
                        </button>
                    </div>

                    <div className="h-4 w-px bg-white/10" />

                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Zoom</span>
                        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                            <button onClick={() => setScale(s => Math.max(0.2, s - 0.1))} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                                <Minus size={16} />
                            </button>
                            <span className="text-xs font-mono text-white w-12 text-center font-bold">{Math.round(scale * 100)}%</span>
                            <button onClick={() => setScale(s => Math.min(3.0, s + 0.1))} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded font-mono text-slate-400">Arrows</kbd> Tweak</span>
                    <span className="flex items-center gap-1.5"><kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded font-mono text-slate-400">Del</kbd> Remove</span>
                </div>
            </div>
        </div>
    );
};
