import React, { useState, useEffect } from 'react';
import { FileText, Trash2, ExternalLink, Plus, FolderOpen, Loader2, AlertCircle, X, CheckCircle2, Home, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { FileUploader } from './FileUploader';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { useChat } from '../lib/ChatContext';
import { UsageDashboard } from './UsageDashboard';
import { UpgradeModal } from './UpgradeModal';
import { useUsageLimits } from '../lib/useUsageLimits';

interface UserDocument {
    id: string;
    name: string;
    url: string;
    status: string;
    created_at: string;
}

interface UserDocumentsProps {
    userId: string;
    onNavigate?: (v: 'home' | 'admin' | 'login' | 'documents') => void;
}

export const UserDocuments: React.FC<UserDocumentsProps> = ({ userId, onNavigate }) => {
    const { t } = useTranslation();
    const { setIsOpen } = useChat();
    const [documents, setDocuments] = useState<UserDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUploader, setShowUploader] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    useUsageLimits(userId, 'upload_document');

    const fetchDocuments = async () => {
        try {
            setLoading(true);

            // Obtener SOLO documentos privados del usuario (no globales)
            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDocuments(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) fetchDocuments();
    }, [userId]);

    const deleteDocument = async (doc: UserDocument) => {
        if (!window.confirm(t('docs.confirm_delete'))) return;

        try {
            // 1. Eliminar de Storage
            const { error: storageError } = await supabase.storage
                .from('user-documents')
                .remove([doc.url]);

            if (storageError) throw storageError;

            // 2. Eliminar de la Database
            const { error: dbError } = await supabase
                .from('documents')
                .delete()
                .eq('id', doc.id);

            if (dbError) throw dbError;

            // 3. Eliminar de knowledge_base
            // 3. Eliminar de knowledge_base
            // Usamos contains para buscar dentro del JSONB de metadata
            const { error: kbError } = await supabase
                .from('knowledge_base')
                .delete()
                .eq('user_id', userId)
                .contains('metadata', { source: doc.url });

            if (kbError) {
                console.error('Error deleting embeddings:', kbError);
                // No lanzamos error para no bloquear la UI si falla la limpieza de embeddings,
                // pero lo logueamos.
            }

            await fetchDocuments();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleView = async (filePath: string) => {
        try {
            const { data, error } = await supabase.storage
                .from('user-documents')
                .createSignedUrl(filePath, 60);

            if (error) throw error;
            window.open(data.signedUrl, '_blank');
        } catch (err: any) {
            alert(err.message);
        }
    };

    const startRename = (doc: UserDocument) => {
        setEditingId(doc.id);
        setEditName(doc.name);
    };

    const saveRename = async (doc: UserDocument) => {
        try {
            const { error } = await supabase
                .from('documents')
                .update({ name: editName })
                .eq('id', doc.id);

            if (error) throw error;
            setEditingId(null);
            await fetchDocuments();
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <div className="flex items-center gap-4 mb-8 text-sm">
                <button
                    onClick={() => onNavigate?.('home')}
                    className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100"
                >
                    <Home size={16} />
                    {t('docs.go_home')}
                </button>
                <button
                    onClick={() => {
                        onNavigate?.('home');
                        setTimeout(() => setIsOpen(true), 100);
                    }}
                    className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100"
                >
                    <MessageSquare size={16} />
                    {t('docs.open_chat')}
                </button>
            </div>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-serif">
                        {t('docs.title')}
                    </h1>
                    <p className="text-slate-500 mt-2">
                        {t('docs.subtitle')}
                    </p>
                </div>
                <button
                    onClick={() => setShowUploader(!showUploader)}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all shadow-lg",
                        showUploader
                            ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            : "bg-primary text-white hover:bg-emerald-800 shadow-primary/20"
                    )}
                >
                    {showUploader ? <X size={18} /> : <Plus size={18} />}
                    {showUploader ? t('docs.cancel') : t('docs.upload_btn')}
                </button>
            </div>

            {/* Dashboard de Uso */}
            <div className="mb-12">
                <UsageDashboard
                    userId={userId}
                    onUpgradeClick={() => setShowUpgradeModal(true)}
                    refreshTrigger={documents.length}
                />
            </div>

            {showUploader && (
                <div className="mb-12 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <FileUploader
                        userId={userId}
                        onUploadSuccess={() => {
                            setShowUploader(false);
                            fetchDocuments();
                        }}
                    />
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Loader2 size={40} className="animate-spin mb-4" />
                    <p>{t('docs.loading')}</p>
                </div>
            ) : documents.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl py-20 text-center text-slate-500">
                    <FolderOpen size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">{t('docs.empty')}</p>
                    <p className="text-sm mt-1">{t('docs.empty_hint')}</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {documents.map((doc) => (
                        <div
                            key={doc.id}
                            className="group bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between hover:border-emerald-200 hover:shadow-md transition-all"
                        >
                            <div className="flex items-center gap-4 flex-1 truncate">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                    <FileText size={24} />
                                </div>
                                <div className="truncate flex-1">
                                    {editingId === doc.id ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') saveRename(doc);
                                                    if (e.key === 'Escape') setEditingId(null);
                                                }}
                                            />
                                            <button
                                                onClick={() => saveRename(doc)}
                                                className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                                            >
                                                <CheckCircle2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <h3
                                                className="font-semibold text-slate-900 truncate pr-4 cursor-pointer hover:text-primary transition-colors"
                                                onClick={() => startRename(doc)}
                                                title={t('docs.rename_tooltip')}
                                            >
                                                {doc.name}
                                            </h3>
                                            {doc.status === 'processing' && (
                                                <span className="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-bold">
                                                    <Loader2 size={10} className="animate-spin" />
                                                    {t('docs.processing_badge')}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleView(doc.url)}
                                    className="p-2.5 text-slate-400 hover:text-primary hover:bg-emerald-50 rounded-xl transition-all"
                                    title={t('docs.view')}
                                >
                                    <ExternalLink size={18} />
                                </button>
                                <button
                                    onClick={() => deleteDocument(doc)}
                                    className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                    title={t('docs.delete')}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {error && (
                <div className="mt-8 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
                    <AlertCircle size={18} />
                    <p>{error}</p>
                </div>
            )}

            {/* Modal de Upgrade */}
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                limitType="upload_document"
            />
        </div>
    );
};
