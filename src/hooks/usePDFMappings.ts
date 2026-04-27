/**
 * usePDFMappings — Hook central de lógica de PDFEditor
 *
 * Gestiona: persistencia (Supabase), mapeos en memoria y toda la
 * interacción de Drag & Drop / Resize sobre el canvas del PDF.
 *
 * Nota sobre closures: los estados mutables que se leen dentro de
 * handlers de eventos del ratón se espejean en refs para evitar
 * que queden stale cuando React re-renderiza entre eventos.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { FieldMapping } from '../components/PDFMapper/types';

interface UsePDFMappingsOptions {
    templateId: string;
    scale: number;
}

export function usePDFMappings({ templateId, scale }: UsePDFMappingsOptions) {

    // ─── Estado Principal ──────────────────────────────────────────────────
    const [mappings, setMappings]               = useState<FieldMapping[]>([]);
    const [selectedMappingId, setSelectedMappingId] = useState<string | null>(null);
    const [selectedPoint, setSelectedPoint]     = useState<{ x: number; y: number } | null>(null);
    const [isImporting, setIsImporting]         = useState(false);

    // ─── Estado de Drag & Resize (también en refs para evitar stale closures) ──
    const [isDragging, setIsDragging]   = useState(false);
    const [isResizing, setIsResizing]   = useState(false);

    const isDraggingRef         = useRef(false);
    const isResizingRef         = useRef(false);
    const dragStartRef          = useRef<{ x: number; y: number } | null>(null);
    const initialRectRef        = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
    const selectedMappingIdRef  = useRef<string | null>(null);
    const mappingsRef           = useRef<FieldMapping[]>([]);
    const scaleRef              = useRef(scale);

    // Mantener refs sincronizados con state
    useEffect(() => { selectedMappingIdRef.current = selectedMappingId; }, [selectedMappingId]);
    useEffect(() => { mappingsRef.current = mappings; },                  [mappings]);
    useEffect(() => { scaleRef.current = scale; },                        [scale]);

    // ─── Carga Inicial ─────────────────────────────────────────────────────
    useEffect(() => { fetchMappings(); }, [templateId]);

    // ─── Atajos de Teclado (Ajuste Fino) ──────────────────────────────────
    useEffect(() => {
        const handleKeyDown = async (e: KeyboardEvent) => {
            const id = selectedMappingIdRef.current;
            if (!id || isDraggingRef.current || isResizingRef.current) return;

            const step = e.shiftKey ? 10 : 1;
            let dx = 0, dy = 0;

            if      (e.key === 'ArrowLeft')  dx = -step;
            else if (e.key === 'ArrowRight') dx =  step;
            else if (e.key === 'ArrowUp')    dy = -step;
            else if (e.key === 'ArrowDown')  dy =  step;
            else return;

            e.preventDefault();

            setMappings(prev => prev.map(m => {
                if (m.id !== id) return m;
                const newX = m.x_coordinate + dx;
                const newY = m.y_coordinate + dy;
                updateMapping(m.id!, { x_coordinate: newX, y_coordinate: newY });
                return { ...m, x_coordinate: newX, y_coordinate: newY };
            }));
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []); // Sin deps: lee valores siempre frescos a través de refs

    // ─── CRUD Supabase ─────────────────────────────────────────────────────
    const fetchMappings = async () => {
        const { data } = await supabase
            .from('form_fields_mapping')
            .select('*')
            .eq('template_id', templateId);
        if (data) setMappings(data as FieldMapping[]);
    };

    const updateMapping = async (id: string, updates: Partial<FieldMapping>) => {
        await supabase.from('form_fields_mapping').update(updates).eq('id', id);
        setMappings(prev => prev.map(m => (m.id === id ? { ...m, ...updates } : m)));
    };

    const addMapping = async (fieldKey: string, pageNumber: number) => {
        if (!selectedPoint) return;

        const isSignature = fieldKey === 'client_signature';
        const isMale      = fieldKey === 'sex_male';
        const isFemale    = fieldKey === 'sex_female';
        const isX         = fieldKey === 'sex_x';
        const isCheckbox  = isMale || isFemale || isX;

        const newMapping: Omit<FieldMapping, 'id'> = {
            template_id:  templateId,
            field_key:    isCheckbox ? 'sex' : fieldKey,
            page_number:  pageNumber,
            x_coordinate: selectedPoint.x,
            y_coordinate: selectedPoint.y,
            width:        isSignature ? 200 : (isCheckbox ? 20 : 150),
            height:       isSignature ? 60  : 20,
            field_type:   isSignature ? 'signature' : (isCheckbox ? 'checkbox' : 'text'),
            trigger_value: isMale ? 'male' : (isFemale ? 'female' : (isX ? 'other' : undefined)),
        };

        const { data } = await supabase
            .from('form_fields_mapping')
            .insert(newMapping)
            .select()
            .single();

        if (data) {
            setMappings(prev => [...prev, data as FieldMapping]);
            setSelectedPoint(null);
            setSelectedMappingId(data.id);
        }
    };

    const deleteMapping = async (id: string) => {
        setSelectedMappingId(null);
        await supabase.from('form_fields_mapping').delete().eq('id', id);
        await fetchMappings();
    };

    const handleImportMaster = async () => {
        if (!confirm('¿Importar mapeo maestro para este formulario? Se añadirán campos preconfigurados.')) return;
        setIsImporting(true);
        try {
            const { data: masterFields } = await supabase
                .from('form_fields_mapping')
                .select('*')
                .eq('template_id', '00000000-0000-0000-0000-000000000000');

            if (masterFields && masterFields.length > 0) {
                const clones = masterFields.map(({ id: _id, ...f }) => ({ ...f, template_id: templateId }));
                await supabase.from('form_fields_mapping').insert(clones);
                await fetchMappings();
            } else {
                alert('No se encontró un mapeo maestro para este modelo.');
            }
        } catch (e) {
            console.error('[usePDFMappings] importMaster error:', e);
        } finally {
            setIsImporting(false);
        }
    };

    // ─── Handlers de Mouse (Canvas) ────────────────────────────────────────
    // Usan refs internamente para leer estado fresco sin re-crear los handlers.

    const handleMouseDown = useCallback((
        e: React.MouseEvent,
        mapping: FieldMapping,
        action: 'drag' | 'resize'
    ) => {
        e.stopPropagation();
        setSelectedMappingId(mapping.id!);
        setSelectedPoint(null);

        const dragging = action === 'drag';
        setIsDragging(dragging);
        setIsResizing(!dragging);
        isDraggingRef.current = dragging;
        isResizingRef.current = !dragging;

        dragStartRef.current   = { x: e.clientX, y: e.clientY };
        initialRectRef.current = {
            x: mapping.x_coordinate,
            y: mapping.y_coordinate,
            w: mapping.width  ?? 100,
            h: mapping.height ?? 20,
        };
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if ((!isDraggingRef.current && !isResizingRef.current) || !dragStartRef.current || !initialRectRef.current) return;

        const id = selectedMappingIdRef.current;
        if (!id) return;

        const sc = scaleRef.current;
        const deltaX = (e.clientX - dragStartRef.current.x) / sc;
        const deltaY = (e.clientY - dragStartRef.current.y) / sc;
        const rect   = initialRectRef.current;

        setMappings(prev => prev.map(m => {
            if (m.id !== id) return m;
            return isDraggingRef.current
                ? { ...m, x_coordinate: rect.x + deltaX, y_coordinate: rect.y + deltaY }
                : { ...m, width: Math.max(20, rect.w + deltaX) };
        }));
    }, []); // Sin deps: lee todo a través de refs

    const handleMouseUp = useCallback(async () => {
        if ((isDraggingRef.current || isResizingRef.current) && selectedMappingIdRef.current) {
            const m = mappingsRef.current.find(m => m.id === selectedMappingIdRef.current);
            if (m) await updateMapping(m.id!, { x_coordinate: m.x_coordinate, y_coordinate: m.y_coordinate, width: m.width });
        }
        setIsDragging(false);
        setIsResizing(false);
        isDraggingRef.current  = false;
        isResizingRef.current  = false;
    }, []); // Sin deps: lee todo a través de refs

    // ─── API Pública del Hook ──────────────────────────────────────────────
    return {
        // Estado
        mappings, selectedMappingId, selectedPoint, isImporting,
        isDragging, isResizing,
        // Acciones
        setSelectedMappingId, setSelectedPoint,
        addMapping, updateMapping, deleteMapping,
        handleImportMaster,
        // Handlers Canvas
        handleMouseDown, handleMouseMove, handleMouseUp,
    };
}
