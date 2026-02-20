import React, { useState, useEffect } from 'react';
import { FileText, Trash2, ExternalLink, Plus, FolderOpen, Loader2, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { FileUploader } from './FileUploader';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
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
}

export const UserDocuments: React.FC<UserDocumentsProps> = ({ userId }) => {
    const { t } = useTranslation();
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
            const { error: storageError } = await supabase.storage
                .from('user-documents')
                .remove([doc.url]);
            if (storageError) throw storageError;

            const { error: dbError } = await supabase
                .from('documents')
                .delete()
                .eq('id', doc.id);
            if (dbError) throw dbError;

            const { error: kbError } = await supabase
                .from('knowledge_base')
                .delete()
                .eq('user_id', userId)
                .contains('metadata', { source: doc.url });

            if (kbError) {
                console.error('Error deleting embeddings:', kbError);
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <FileText size={24} className="text-primary" />
                        {t('docs.title')}
                    </h2>
                    <p className="text-slate-400 mt-1 text-sm">
                        {t('docs.subtitle')}
                    </p>
                </div>
                <button
                    onClick={() => setShowUploader(!showUploader)}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg",
                        showUploader
                            ? "bg-white/10 text-slate-300 hover:bg-white/15 border border-white/10"
                            : "bg-primary text-slate-900 hover:bg-primary/90 shadow-primary/20"
                    )}
                >
                    {showUploader ? <X size={18} /> : <Plus size={18} />}
                    <span className="hidden md:inline">{showUploader ? t('docs.cancel') : t('docs.upload_btn')}</span>
                </button>
            </div>

            {/* Usage Dashboard */}
            <div className="mb-12">
                <UsageDashboard
                    userId={userId}
                    onUpgradeClick={() => setShowUpgradeModal(true)}
                    refreshTrigger={documents.length}
                />
            </div>

            {showUploader && (
                <div className="mb-12 bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
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
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <Loader2 size={40} className="animate-spin mb-4 text-primary" />
                    <p>{t('docs.loading')}</p>
                </div>
            ) : documents.length === 0 ? (
                <div className="bg-white/5 border-2 border-dashed border-white/10 rounded-2xl py-20 text-center text-slate-500">
                    <FolderOpen size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">{t('docs.empty')}</p>
                    <p className="text-sm mt-1">{t('docs.empty_hint')}</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {documents.map((doc) => (
                        <div
                            key={doc.id}
                            className="group bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between hover:border-primary/30 hover:bg-primary/5 transition-all"
                        >
                            <div className="flex items-center gap-4 flex-1 truncate">
                                <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-slate-900 transition-colors border border-primary/20">
                                    <FileText size={24} />
                                </div>
                                <div className="truncate flex-1">
                                    {editingId === doc.id ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') saveRename(doc);
                                                    if (e.key === 'Escape') setEditingId(null);
                                                }}
                                            />
                                            <button
                                                onClick={() => saveRename(doc)}
                                                className="p-1.5 bg-primary text-slate-900 rounded-lg hover:bg-primary/90"
                                            >
                                                <CheckCircle2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="p-1.5 bg-white/10 text-slate-400 rounded-lg hover:bg-white/20"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <h3
                                                className="font-semibold text-lg text-white truncate pr-4 cursor-pointer hover:text-primary transition-colors"
                                                onClick={() => startRename(doc)}
                                                title={t('docs.rename_tooltip')}
                                            >
                                                {doc.name}
                                            </h3>
                                            {doc.status === 'processing' && (
                                                <span className="flex items-center gap-1 text-[11px] bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full font-bold border border-amber-500/20">
                                                    <Loader2 size={12} className="animate-spin" />
                                                    {t('docs.processing_badge')}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1.5 font-medium">
                                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleView(doc.url)}
                                    className="p-2.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                                    title={t('docs.view')}
                                >
                                    <ExternalLink size={18} />
                                </button>
                                <button
                                    onClick={() => deleteDocument(doc)}
                                    className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
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
                <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                    <AlertCircle size={18} />
                    <p>{error}</p>
                </div>
            )}

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                limitType="upload_document"
            />
        </div>
    );
};
