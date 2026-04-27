/**
 * SignatureCreateForm — Formulario de creación de solicitud de firma
 *
 * Permite al admin seleccionar a qué cliente enviar una solicitud
 * de firma digital para un documento concreto.
 */

import React from 'react';
import { Send, Loader2 } from 'lucide-react';
import type { ClientUser } from '../../hooks/useSignatureRequests';

interface SignatureCreateFormProps {
    templateName:     string;
    users:            ClientUser[];
    selectedUserId:   string;
    sending:          boolean;
    onSelectUser:     (id: string) => void;
    onSubmit:         () => Promise<void>;
}

export const SignatureCreateForm: React.FC<SignatureCreateFormProps> = ({
    templateName,
    users,
    selectedUserId,
    sending,
    onSelectUser,
    onSubmit,
}) => {
    return (
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4 animate-in slide-in-from-top-2">
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
                Selecciona al cliente que debe firmar{' '}
                <strong className="text-white">{templateName}</strong>:
            </p>

            <div className="flex gap-3">
                <select
                    value={selectedUserId}
                    onChange={e => onSelectUser(e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-blue-500/50 transition-colors"
                >
                    <option value="" className="bg-slate-900">
                        Seleccionar cliente...
                    </option>
                    {users.map(u => (
                        <option key={u.id} value={u.id} className="bg-slate-900">
                            {u.full_name ?? u.username ?? 'Sin nombre'}
                        </option>
                    ))}
                </select>

                <button
                    onClick={onSubmit}
                    disabled={!selectedUserId || sending}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                >
                    {sending
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Send size={14} />
                    }
                    Enviar
                </button>
            </div>
        </div>
    );
};
