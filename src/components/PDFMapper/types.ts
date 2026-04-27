/**
 * PDFMapper — Tipos e Interfaces Central
 * Archivo autoritativo de tipos para el sistema de mapeo de campos PDF.
 */

// ─── Tipos de Campo ───────────────────────────────────────────────────────────

export type FieldType = 'text' | 'checkbox' | 'signature';

// ─── Entidad Principal ────────────────────────────────────────────────────────

export interface FieldMapping {
    id?: string;
    template_id?: string;
    field_key: string;
    page_number: number;
    x_coordinate: number;
    y_coordinate: number;
    width?: number;
    height?: number;
    field_type: FieldType;
    trigger_value?: string;
    font_size?: number;
}

// ─── Grupos de Campos Disponibles ─────────────────────────────────────────────

export interface AvailableField {
    group: string;
    key: string;
    label: string;
}

// ─── Estado de Interacción (Drag & Resize) ────────────────────────────────────

export interface DragState {
    isDragging: boolean;
    isResizing: boolean;
    dragStart: { x: number; y: number } | null;
    initialRect: { x: number; y: number; w: number; h: number } | null;
}

// ─── Props de Componentes ─────────────────────────────────────────────────────

export interface PDFEditorProps {
    templateId: string;
    templateUrl: string;
    onClose: () => void;
}
