/**
 * MappingInspector — Panel lateral de edición de campos PDF
 *
 * En esta versión optimizada, funciona como una columna rígida en escritorio
 * o una capa completa en móviles.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Settings, X, Type, CheckSquare, MousePointerClick, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { FieldMapping, AvailableField, FieldType } from './types';

interface MappingInspectorProps {
    mapping:         FieldMapping;
    availableFields: AvailableField[];
    onUpdate:        (id: string, updates: Partial<FieldMapping>) => Promise<void>;
    onDelete:        (id: string) => Promise<void>;
    onClose:         () => void;
}

// ─── Subcomponente: Selector de Tipo de Campo ─────────────────────────────────

interface TypeOption {
    type:  FieldType;
    icon:  React.ElementType;
    label: string;
}

const TYPE_OPTIONS: TypeOption[] = [
    { type: 'text',      icon: Type,             label: 'Texto'   },
    { type: 'checkbox',  icon: CheckSquare,       label: 'Check'   },
    { type: 'signature', icon: MousePointerClick, label: 'Firma'   },
];

const TypeSelector: React.FC<{
    current: FieldType;
    onSelect: (type: FieldType) => void;
}> = ({ current, onSelect }) => (
    <div className="space-y-4">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">
            Tipo de Lógica
        </label>
        <div className="grid grid-cols-3 gap-2">
            {TYPE_OPTIONS.map(({ type, icon: Icon, label }) => (
                <button
                    key={type}
                    onClick={() => onSelect(type)}
                    className={cn(
                        'p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all',
                        current === type
                            ? 'bg-primary border-primary text-slate-950 shadow-[0_0_20px_rgba(var(--primary),0.2)]'
                            : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20 hover:text-white'
                    )}
                >
                    <Icon size={18} />
                    <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
                </button>
            ))}
        </div>
    </div>
);

// ─── Subcomponente: Coordenadas de Posición ───────────────────────────────────

const CoordDisplay: React.FC<{ x: number; y: number }> = ({ x, y }) => (
    <div className="space-y-4">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">
            Posición (PDF Points)
        </label>
        <div className="grid grid-cols-2 gap-2">
            {[{ label: 'X', value: x }, { label: 'Y', value: y }].map(({ label, value }) => (
                <div key={label} className="bg-[#0A0F1D] p-4 rounded-2xl border border-white/5 group hover:border-white/10 transition-colors">
                    <div className="text-[9px] text-slate-600 mb-1 font-black uppercase">{label}</div>
                    <div className="text-sm font-mono text-white flex items-baseline gap-1">
                        {Math.round(value)}
                        <span className="text-[10px] text-slate-700">pt</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// ─── Componente Principal ─────────────────────────────────────────────────────

export const MappingInspector: React.FC<MappingInspectorProps> = ({
    mapping,
    availableFields,
    onUpdate,
    onDelete,
    onClose,
}) => {
    const handleTypeChange = (type: FieldType) => {
        const updates: Partial<FieldMapping> = { field_type: type };
        if (type === 'checkbox') updates.trigger_value = mapping.trigger_value ?? 'true';
        onUpdate(mapping.id!, updates);
    };

    const handleDelete = async () => {
        if (confirm('¿Eliminar este campo del mapeo?')) {
            await onDelete(mapping.id!);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#020617] relative z-50">
            {/* ── Cabecera ─── */}
            <div className="p-6 border-b border-white/5 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                        <Settings size={18} className="text-primary" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm tracking-tight">
                            Inspector
                        </h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-0.5 max-w-[140px] truncate">
                            {mapping.field_key}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-slate-500 hover:text-white transition-all p-1.5 rounded-lg hover:bg-white/5 shrink-0 border border-transparent hover:border-white/5"
                >
                    <X size={18} />
                </button>
            </div>

            {/* ── Cuerpo (scrollable) ────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">

                {/* Tipo de Lógica */}
                <TypeSelector
                    current={mapping.field_type}
                    onSelect={handleTypeChange}
                />

                {/* Vinculación de Campo */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">
                        Vinculación (Smart Binding)
                    </label>
                    <select
                        value={mapping.field_key}
                        onChange={e => onUpdate(mapping.id!, { field_key: e.target.value })}
                        className="w-full bg-[#0A0F1D] border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all appearance-none"
                    >
                        {availableFields.map(f => (
                            <option key={f.key} value={f.key}>{f.label}</option>
                        ))}
                    </select>
                </div>

                {/* Valor de Activación (solo CheckBox) */}
                {mapping.field_type === 'checkbox' && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">
                            Valor de Activación
                        </label>
                        <input
                            type="text"
                            value={mapping.trigger_value ?? ''}
                            onChange={e => onUpdate(mapping.id!, { trigger_value: e.target.value })}
                            placeholder="Ej: true, male, soltero..."
                            className="w-full bg-[#0A0F1D] border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                        />
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                            <p className="text-[10px] text-primary/70 italic leading-relaxed">
                                Si el valor en la base de datos coincide exactamente con este texto, el campo se marcará automáticamente en el PDF.
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Coordenadas */}
                <CoordDisplay x={mapping.x_coordinate} y={mapping.y_coordinate} />
            </div>

            {/* ── Pie: Botón de Eliminar ─── */}
            <div className="p-6 border-t border-white/5 bg-[#020617]">
                <button
                    onClick={handleDelete}
                    className="w-full py-4 rounded-2xl border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 group shadow-xl shadow-red-500/5 hover:shadow-red-500/20"
                >
                    <Trash2 size={14} className="group-hover:rotate-12 transition-transform" />
                    Eliminar Mapeo
                </button>
            </div>
        </div>
    );
};
