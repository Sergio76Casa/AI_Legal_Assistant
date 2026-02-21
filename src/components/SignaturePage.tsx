import { useState, useEffect, useCallback } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { supabase } from '../lib/supabase';
import { SignaturePad } from './SignaturePad';
import {
    CheckCircle2, Clock, Shield, AlertCircle,
    FileText, Download, Loader2, Info, ChevronRight, Pen, UserPlus
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SignatureRequest {
    id: string;
    tenant_id: string;
    template_id: string;
    client_user_id: string;
    requested_by: string;
    status: 'pending' | 'signed' | 'expired' | 'cancelled';
    document_storage_path: string;
    signed_document_path: string | null;
    access_token: string;
    document_name: string;
    expires_at: string;
    signed_at: string | null;
    created_at: string;
}

interface TenantInfo {
    name: string;
    slug: string;
    config: {
        primary_color?: string;
        logo_url?: string;
        contact_email?: string;
    };
}

type SigningState = 'loading' | 'missing_data' | 'ready' | 'signing' | 'processing' | 'success' | 'already_signed' | 'expired' | 'error';

interface SignaturePageProps {
    documentId: string;
}

export const SignaturePage: React.FC<SignaturePageProps> = ({ documentId }) => {
    const { t } = useTranslation();
    const [state, setState] = useState<SigningState>('loading');
    const [request, setRequest] = useState<SignatureRequest | null>(null);
    const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
    const [fieldMappings, setFieldMappings] = useState<any[]>([]);
    const [missingFields, setMissingFields] = useState<any[]>([]);
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [progress, setProgress] = useState('');
    const [progressPct, setProgressPct] = useState(0);
    const [isSavingData, setIsSavingData] = useState(false);

    // Load signature request data using RPC (bypasses RLS for public access)
    useEffect(() => {
        const loadRequest = async () => {
            try {
                // Use RPC function that bypasses RLS via SECURITY DEFINER
                const { data, error } = await supabase
                    .rpc('get_signature_request_by_token', { p_token: documentId });

                if (error || !data) {
                    setState('error');
                    setErrorMessage('Documento no encontrado o enlace inválido.');
                    return;
                }

                // Extract tenant info from the combined response
                const requestData: SignatureRequest = {
                    id: data.id,
                    tenant_id: data.tenant_id,
                    template_id: data.template_id,
                    client_user_id: data.client_user_id,
                    requested_by: data.requested_by,
                    status: data.status,
                    document_storage_path: data.document_storage_path,
                    signed_document_path: data.signed_document_path,
                    access_token: data.access_token,
                    document_name: data.document_name,
                    expires_at: data.expires_at,
                    signed_at: data.signed_at,
                    created_at: data.created_at,
                };

                setRequest(requestData);

                // Set tenant info from the same RPC response
                if (data.tenant_name) {
                    setTenantInfo({
                        name: data.tenant_name,
                        slug: data.tenant_slug || 'global',
                        config: data.tenant_config || {}
                    });
                }

                // Check status
                if (data.status === 'signed') {
                    setState('already_signed');
                    return;
                }

                if (data.status === 'expired' || data.status === 'cancelled') {
                    setState('expired');
                    return;
                }

                // Check expiration
                if (new Date(data.expires_at) < new Date()) {
                    setState('expired');
                    // Mark as expired via RPC
                    await supabase.rpc('mark_signature_expired', { p_token: documentId });
                    return;
                }

                // Generate PDF preview URL
                if (data.document_storage_path) {
                    const { data: signedUrl } = await supabase.storage
                        .from('signatures')
                        .createSignedUrl(data.document_storage_path, 3600);

                    if (signedUrl?.signedUrl) {
                        setPdfPreviewUrl(signedUrl.signedUrl);
                    }
                }

                // 1. Get all mappings for this template
                const { data: mappings } = await supabase.rpc('get_signature_template_mappings', { p_token: documentId });
                setFieldMappings(mappings || []);

                // 2. Get full profile
                const { data: profile } = await supabase.rpc('get_signer_profile_full', { p_token: documentId });

                // 3. Detect missing fields (Only if not already signed)
                if (data.status === 'pending') {
                    const allMappings = mappings || [];
                    const profileData = profile || {};

                    const missing = allMappings.filter((m: any) => {
                        // System fields and signature fields that shouldn't be asked in the form
                        const systemFields = ['today_date', 'client_signature', 'today_day', 'today_month', 'today_year'];
                        if (systemFields.includes(m.field_key)) return false;
                        if (m.field_type === 'signature') return false;

                        const val = profileData[m.field_key];
                        return val === null || val === undefined || String(val).trim() === '';
                    });

                    if (missing.length > 0) {
                        setMissingFields(missing);
                        setState('missing_data');
                        return;
                    }
                }

                setState('ready');
            } catch (err) {
                console.error('Error loading signature request:', err);
                setState('error');
                setErrorMessage('Error al cargar la solicitud de firma.');
            }
        };

        loadRequest();
    }, [documentId]);

    const getClientIP = async () => {
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            return data.ip;
        } catch {
            return 'Desconocida';
        }
    };

    const handleDataSubmit = async (formData: any) => {
        setIsSavingData(true);
        try {
            const { error } = await supabase.rpc('update_signer_data_by_token', {
                p_token: documentId,
                p_updates: formData
            });

            if (error) throw error;

            // Refresh data and check again
            const { data: profile } = await supabase.rpc('get_signer_profile_full', { p_token: documentId });

            const stillMissing = (fieldMappings || []).filter((m: any) => {
                const val = (profile || {})[m.field_key];
                return val === null || val === undefined || String(val).trim() === '';
            });

            if (stillMissing.length === 0) {
                setMissingFields([]);
                setState('ready');
            } else {
                setMissingFields(stillMissing);
            }
        } catch (error) {
            console.error('Error saving data:', error);
            alert('Error al guardar los datos. Por favor, revise los campos y reintente.');
        } finally {
            setIsSavingData(false);
        }
    };

    // SHA-256 hash helper
    const hashData = async (data: string): Promise<string> => {
        const encoder = new TextEncoder();
        const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    // Handle signature confirmation
    const handleSignatureConfirm = useCallback(async (signatureDataUrl: string) => {
        if (!request) return;

        setState('processing');
        setProgress('Iniciando proceso seguro...');
        setProgressPct(5);

        try {
            // 1 & 2. Parallelize data fetching for speed
            const [clientIP, { data: fullProfile }] = await Promise.all([
                getClientIP(),
                supabase.rpc('get_signer_profile_full', {
                    p_token: request.access_token
                })
            ]);

            const userAgent = navigator.userAgent;
            const signerName = fullProfile?.full_name || fullProfile?.username || 'Cliente';

            // Get signer email (separate for safety)
            let signerEmail = '';
            try {
                const { data: userData } = await supabase.auth.getUser();
                signerEmail = userData.user?.email || '';
            } catch { /* Silent */ }

            setProgressPct(30);
            // 3. Convert signature data URL to blob and upload
            setProgress('Guardando firma digital...');
            setProgressPct(40);
            const signatureBlob = await (await fetch(signatureDataUrl)).blob();
            const signaturePath = `${request.tenant_id}/${request.id}/signature_${Date.now()}.png`;

            const { error: uploadErr } = await supabase.storage
                .from('signatures')
                .upload(signaturePath, signatureBlob, {
                    contentType: 'image/png'
                });

            if (uploadErr) throw new Error('Error al guardar la firma');

            // 4. Embed signature into PDF using pdf-lib
            setProgress('Estampando firma en el documento...');
            setProgressPct(55);

            let pdfBytes: Uint8Array | null = null;
            let signedDocPath = '';

            if (request.document_storage_path) {
                // Download the base PDF
                const { data: pdfData, error: dlError } = await supabase.storage
                    .from('signatures')
                    .download(request.document_storage_path);

                if (dlError || !pdfData) throw new Error('Error descargando documento PDF');

                const pdfArrayBuffer = await pdfData.arrayBuffer();
                const pdfDoc = await PDFDocument.load(pdfArrayBuffer);

                // Embed signature image
                const sigImageBytes = await signatureBlob.arrayBuffer();
                const sigImage = await pdfDoc.embedPng(new Uint8Array(sigImageBytes));

                // 3. Get signature field coordinates via RPC (Secured with token)
                const { data: allMappings } = await supabase.rpc('get_signature_template_mappings', {
                    p_token: request.access_token
                });

                const mappingsList = allMappings || [];
                console.log('Document Mappings found:', mappingsList.length);
                const pages = pdfDoc.getPages();
                const textFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

                // FILL TEXT FIELDS
                for (const field of mappingsList) {
                    if (field.field_type === 'signature') continue;

                    const val = fullProfile[field.field_key] || '';
                    const pageIndex = (field.page_number || 1) - 1;
                    if (pageIndex < 0 || pageIndex >= pages.length) continue;

                    const page = pages[pageIndex];
                    const { height: pageHeight } = page.getSize();

                    if (field.field_type === 'checkbox') {
                        const isSelected = String(val).toLowerCase() === String(field.trigger_value || 'true').toLowerCase();
                        if (isSelected) {
                            page.drawText('X', {
                                x: field.x_coordinate + (field.width / 4),
                                y: pageHeight - field.y_coordinate - (field.height * 0.8),
                                size: field.height * 0.8,
                                font: textFont
                            });
                        }
                    } else {
                        page.drawText(String(val), {
                            x: field.x_coordinate + 2,
                            y: pageHeight - field.y_coordinate - (field.height * 0.8),
                            size: (field.height || 12) * 0.7,
                            font: textFont,
                            color: rgb(0, 0, 0)
                        });
                    }
                }

                // EMBED SIGNATURES
                const sigFieldMappings = mappingsList.filter((m: any) => m.field_type === 'signature');

                if (sigFieldMappings.length > 0) {
                    // Place in ALL mapped signature fields
                    for (const field of sigFieldMappings) {
                        const pageIndex = (field.page_number || 1) - 1;
                        if (pageIndex < 0 || pageIndex >= pages.length) continue;

                        const page = pages[pageIndex];
                        const { height: pageHeight } = page.getSize();

                        const sigWidth = field.width || 150;
                        const sigHeight = (sigWidth / sigImage.width) * sigImage.height;
                        const maxHeight = field.height || 50;
                        const finalHeight = Math.min(sigHeight, maxHeight);
                        const finalWidth = (finalHeight / sigImage.height) * sigImage.width;

                        page.drawImage(sigImage, {
                            x: field.x_coordinate,
                            y: pageHeight - field.y_coordinate - finalHeight,
                            width: finalWidth,
                            height: finalHeight,
                        });
                    }
                } else {
                    // Fallback: Place signature at bottom of last page ONLY if no mappings exist
                    const lastPage = pages[pages.length - 1];
                    const { width: pgWidth } = lastPage.getSize();

                    const sigWidth = 150;
                    const sigHeight = (sigWidth / sigImage.width) * sigImage.height;
                    const maxHeight = 60;
                    const finalHeight = Math.min(sigHeight, maxHeight);
                    const finalWidth = (finalHeight / sigImage.height) * sigImage.width;

                    lastPage.drawImage(sigImage, {
                        x: pgWidth / 2 - finalWidth / 2,
                        y: 60,
                        width: finalWidth,
                        height: finalHeight,
                    });
                }

                // --- ADD AUDIT CERTIFICATE PAGE ---
                const auditPage = pdfDoc.addPage();
                const { width: aWidth, height: aHeight } = auditPage.getSize();
                const auditFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
                const auditFontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

                // Header (Branding)
                auditPage.drawRectangle({
                    x: 0,
                    y: aHeight - 80,
                    width: aWidth,
                    height: 80,
                    color: rgb(0.04, 0.09, 0.16), // Dark slate
                });

                auditPage.drawText('CERTIFICADO DE FIRMA DIGITAL', {
                    x: 40,
                    y: aHeight - 45,
                    size: 20,
                    font: auditFontBold,
                    color: rgb(1, 1, 1),
                });

                auditPage.drawText(tenantInfo?.name || 'LegalFlow', {
                    x: 40,
                    y: aHeight - 65,
                    size: 10,
                    font: auditFont,
                    color: rgb(0.7, 0.7, 0.7),
                });

                // Audit Data Table
                const startY = aHeight - 130;
                const rowHeight = 25;
                const drawRow = (label: string, value: string, y: number) => {
                    auditPage.drawText(label, { x: 40, y, size: 10, font: auditFontBold, color: rgb(0.3, 0.3, 0.3) });
                    auditPage.drawText(value || '-', { x: 180, y, size: 10, font: auditFont, color: rgb(0.1, 0.1, 0.1) });
                    auditPage.drawLine({
                        start: { x: 40, y: y - 8 },
                        end: { x: aWidth - 40, y: y - 8 },
                        thickness: 0.5,
                        color: rgb(0.9, 0.9, 0.9),
                    });
                };

                const sigHash = await hashData(signatureDataUrl);

                drawRow('ID de Solicitud:', request.id.substring(0, 18).toUpperCase(), startY);
                drawRow('Firmante:', signerName, startY - rowHeight);
                drawRow('Email:', signerEmail || 'No proporcionado', startY - rowHeight * 2);
                drawRow('Fecha y Hora:', new Date().toLocaleString('es-ES'), startY - rowHeight * 3);
                drawRow('Dirección IP:', clientIP, startY - rowHeight * 4);
                drawRow('Navegador / OS:', userAgent.substring(0, 60), startY - rowHeight * 5);
                drawRow('Hash de Firma:', `${sigHash.substring(0, 32)}...`, startY - rowHeight * 6);
                drawRow('Estado:', 'FIRMA COMPLETA Y VALIDADA', startY - rowHeight * 7);

                // Draw Signature Seal
                auditPage.drawText('SELLO DE FIRMA', {
                    x: 40,
                    y: startY - rowHeight * 9,
                    size: 10,
                    font: auditFontBold,
                    color: rgb(0.3, 0.3, 0.3)
                });

                const sealWidth = 120;
                const sealHeight = (sealWidth / sigImage.width) * sigImage.height;
                auditPage.drawImage(sigImage, {
                    x: 40,
                    y: startY - rowHeight * 9 - sealHeight - 10,
                    width: sealWidth,
                    height: sealHeight,
                });

                // Footer
                auditPage.drawText('Este documento constituye una prueba legal de la aceptación de los términos del documento original por parte del firmante.', {
                    x: 40,
                    y: 60,
                    size: 8,
                    font: auditFont,
                    color: rgb(0.5, 0.5, 0.5),
                });
                auditPage.drawText('LegalFlow Secure Signature Process · Iron Silo™ Technology', {
                    x: 40,
                    y: 45,
                    size: 8,
                    font: auditFontBold,
                    color: rgb(0.1, 0.4, 0.8),
                });

                setProgress('Generando archivo final...');
                setProgressPct(75);
                pdfBytes = await pdfDoc.save();
            }

            // 5. Upload signed PDF
            setProgress('Almacenando documento firmado...');
            setProgressPct(85);
            if (pdfBytes) {
                signedDocPath = `${request.tenant_id}/${request.id}/signed_${Date.now()}.pdf`;

                const { error: signedUpErr } = await supabase.storage
                    .from('signatures')
                    .upload(signedDocPath, new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }), {
                        contentType: 'application/pdf'
                    });

                if (signedUpErr) throw new Error('Error al guardar documento firmado');
            }

            // 6. Generate signature hash for database log
            const finalSignatureHash = await hashData(signatureDataUrl);

            // 7. Complete signature via RPC (atomic: update status + create audit log)
            setProgress('Certificando validez legal...');
            setProgressPct(95);

            const { data: completeResult, error: completeError } = await supabase
                .rpc('complete_signature', {
                    p_token: request.access_token,
                    p_signed_document_path: signedDocPath || '',
                    p_signature_storage_path: signaturePath,
                    p_signature_hash: finalSignatureHash,
                    p_signer_name: signerName,
                    p_signer_email: signerEmail,
                    p_ip_address: clientIP,
                    p_user_agent: userAgent
                });

            if (completeError) throw new Error('Error al completar la firma');
            if (completeResult && !completeResult.success) {
                throw new Error(completeResult.error || 'Error al procesar la firma');
            }

            setProgressPct(100);

            // --- CRITICAL: Update local state so download button knows the path ---
            setRequest(prev => prev ? {
                ...prev,
                status: 'signed',
                signed_document_path: signedDocPath,
                signed_at: new Date().toISOString()
            } : null);

            setState('success');
        } catch (err: unknown) {
            console.error('Error processing signature:', err);
            const msg = err instanceof Error ? err.message : 'Error al procesar la firma';
            alert(`Error: ${msg}`); // Critical alert
            setState('error');
            setErrorMessage(msg);
        }
    }, [request, tenantInfo]);

    // Download signed document
    const handleDownload = async () => {
        const path = request?.signed_document_path;
        if (!path) {
            alert('El documento firmado todavía se está procesando o no está disponible.');
            return;
        }

        try {
            // Use native download method (returns blob) - most robust for mobile/CORS
            const { data, error } = await supabase.storage
                .from('signatures')
                .download(path);

            if (error) throw error;

            // Create local URL for the blob
            const url = window.URL.createObjectURL(data);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            // Sanitize filename
            const safeName = request.document_name.replace(/[/\\?%*:|"<>]/g, '-').replace(/\.[^/.]+$/, "");
            a.download = `${safeName}_firmado.pdf`;

            document.body.appendChild(a);
            a.click();

            // Cleanup
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }, 100);

        } catch (err) {
            console.error('Error downloading document:', err);
            // Last resort fallback: open signed URL
            try {
                const { data: signed } = await supabase.storage
                    .from('signatures')
                    .createSignedUrl(path, 60);
                if (signed?.signedUrl) {
                    window.location.assign(signed.signedUrl);
                } else {
                    alert('No se pudo descargar el archivo. Por favor, reintente en unos momentos.');
                }
            } catch {
                alert('No se pudo descargar el documento.');
            }
        }
    };

    // ─── RENDER STATES ──────────────────────────────────────────

    // Data Entry Form Case
    if (state === 'missing_data') {
        return (
            <div className="min-h-screen bg-slate-50">
                <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-10">
                    <div className="max-w-lg mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <UserPlus className="text-primary" size={16} />
                            </div>
                            <span className="font-bold text-slate-800 tracking-tight">Completar Datos</span>
                        </div>
                    </div>
                </header>

                <main className="max-w-lg mx-auto px-4 py-8">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                                <Info className="text-amber-500" size={24} />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-slate-900 leading-tight">Datos Necesarios</h2>
                                <p className="text-[11px] text-slate-400">Para generar este documento correctamente, necesitamos completar la siguiente información:</p>
                            </div>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget);
                            const updates: any = {};
                            missingFields.forEach(f => {
                                updates[f.field_key] = fd.get(f.field_key);
                            });
                            handleDataSubmit(updates);
                        }} className="space-y-4">
                            {missingFields.map(f => (
                                <div key={f.field_key} className="space-y-1.5">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                        {t(`fields.${f.field_key}`)}
                                    </label>
                                    <input
                                        name={f.field_key}
                                        type={f.field_key.includes('date') ? 'date' : 'text'}
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder={`Escribe el ${t(`fields.${f.field_key}`).toLowerCase()}`}
                                    />
                                </div>
                            ))}

                            <button
                                type="submit"
                                disabled={isSavingData}
                                className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black text-sm mt-4 shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSavingData ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>CONFIRMAR Y CONTINUAR <ChevronRight size={18} /></>
                                )}
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-[10px] text-slate-400 font-medium">Estos datos se guardarán en su expediente para futuros trámites.</p>
                </main>
            </div>
        );
    }

    // Fullscreen Signature Pad
    if (state === 'signing') {
        return (
            <SignaturePad
                onConfirm={handleSignatureConfirm}
                onCancel={() => setState('ready')}
                signerName={tenantInfo?.name}
            />
        );
    }

    // Main Layout (Mobile-First)
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
            {/* Header with branding */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-4 py-3 shrink-0">
                <div className="max-w-lg mx-auto flex items-center justify-between">
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => window.location.href = `${window.location.origin}/${tenantInfo?.slug && tenantInfo.slug !== 'global' ? tenantInfo.slug : ''}`}
                    >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Pen className="text-primary" size={16} />
                        </div>
                        <span className="font-black text-slate-800 tracking-tighter uppercase">
                            {tenantInfo?.name || 'LegalFlow'}
                        </span>
                    </div>
                    <div className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase tracking-wider">
                        Certificado Seguro
                    </div>
                </div>
            </header>

            <main className="max-w-lg mx-auto px-4 py-8 flex-1">
                {/* Loading State */}
                {state === 'loading' && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-primary mb-4" size={32} />
                        <p className="text-slate-500 font-medium">Cargando documento...</p>
                    </div>
                )}

                {/* Processing State */}
                {state === 'processing' && (
                    <div className="flex flex-col items-center justify-center py-20 px-4">
                        <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-8 relative">
                            <Loader2 className="animate-spin text-primary" size={40} />
                            <div className="absolute inset-0 rounded-full border-2 border-primary/10 border-t-primary animate-[spin_2s_linear_infinite]"></div>
                        </div>

                        <h2 className="text-xl font-bold text-slate-800 mb-2">Procesando documento</h2>
                        <p className="text-slate-400 text-sm font-medium mb-8 text-center">{progress}</p>

                        {/* Progress Bar Container */}
                        <div className="w-full max-w-xs bg-slate-100 h-2.5 rounded-full overflow-hidden mb-3 border border-slate-200/50">
                            <div
                                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                                style={{ width: `${progressPct}%` }}
                            ></div>
                        </div>
                        <div className="text-[10px] font-black text-blue-600/60 uppercase tracking-widest">
                            {progressPct}% Completado
                        </div>
                    </div>
                )}

                {/* Ready to Sign */}
                {state === 'ready' && request && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                                    <FileText className="text-blue-600" size={28} />
                                </div>
                                <div className="overflow-hidden">
                                    <h1 className="text-lg font-bold text-slate-900 truncate">
                                        {request.document_name}
                                    </h1>
                                    <p className="text-xs text-slate-400 font-medium">
                                        Documento para firma digital
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <Shield size={16} className="text-emerald-500 shrink-0" />
                                    <div className="text-[11px] leading-tight text-slate-600">
                                        Firma vinculante con certificación de auditoría, IP y hash de integridad.
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <Clock size={16} className="text-amber-500 shrink-0" />
                                    <div className="text-[11px] leading-tight text-slate-600">
                                        Expira el {new Date(request.expires_at).toLocaleDateString('es-ES', {
                                            day: '2-digit', month: 'long', year: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PDF Preview info */}
                        <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                                <Info className="text-blue-500" size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 mb-1">Instrucciones</h3>
                                <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                                    Revise el documento y proceda a firmar pulsando el botón inferior.
                                    Se generará un certificado de firma al finalizar.
                                </p>
                                {pdfPreviewUrl && (
                                    <button
                                        onClick={() => window.open(pdfPreviewUrl, '_blank')}
                                        className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                                    >
                                        Ver documento completo <ChevronRight size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Sign Action */}
                        <div className="pt-4">
                            <button
                                onClick={() => setState('signing')}
                                className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-base shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                            >
                                <Pen size={20} />
                                FIRMAR AHORA
                            </button>
                            <p className="text-center text-[10px] text-slate-400 mt-4 leading-relaxed">
                                Al pulsar en FIRMAR AHORA, acepta el uso de firmas electrónicas bajo la Ley 59/2003 y el Reglamento eIDAS.
                            </p>
                        </div>
                    </div>
                )}

                {/* Success State */}
                {state === 'success' && (
                    <div className="flex flex-col items-center justify-center py-16 animate-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mb-8 relative">
                            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping"></div>
                            <CheckCircle2 size={48} className="text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-3 text-center">¡Documento Firmado!</h2>
                        <p className="text-sm text-slate-500 text-center max-w-xs mb-10">
                            La firma se ha procesado correctamente y el abogado ha sido notificado. Ya puedes descargar tu copia firmada.
                        </p>

                        <div className="w-full space-y-3">
                            <button
                                onClick={handleDownload}
                                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
                            >
                                <Download size={18} />
                                DESCARGAR COPIA FIRMADA
                            </button>
                            <button
                                onClick={() => window.location.href = `${window.location.origin}/${tenantInfo?.slug && tenantInfo.slug !== 'global' ? tenantInfo.slug : ''}`}
                                className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors"
                            >
                                Volver al inicio
                            </button>
                        </div>
                    </div>
                )}

                {/* Already Signed */}
                {state === 'already_signed' && (
                    <div className="flex flex-col items-center justify-center py-16 animate-in fade-in">
                        <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center mb-6">
                            <CheckCircle2 size={40} className="text-blue-500" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Documento ya firmado</h2>
                        <p className="text-sm text-slate-400 text-center max-w-xs">
                            Este documento ya fue firmado el {request?.signed_at ? new Date(request.signed_at).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'long',
                                hour: '2-digit',
                                minute: '2-digit'
                            })
                                : 'una fecha anterior'
                            }.
                        </p>

                        <div className="w-full space-y-3 mt-8">
                            {request?.signed_document_path && (
                                <button
                                    onClick={handleDownload}
                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
                                >
                                    <Download size={18} />
                                    Descargar copia firmada
                                </button>
                            )}

                            <button
                                onClick={() => window.location.href = `${window.location.origin}/${tenantInfo?.slug && tenantInfo.slug !== 'global' ? tenantInfo.slug : ''}`}
                                className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors"
                            >
                                Volver al inicio
                            </button>
                        </div>
                    </div>
                )}

                {/* Expired State */}
                {state === 'expired' && (
                    <div className="flex flex-col items-center justify-center py-16 animate-in fade-in text-center">
                        <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center mb-6">
                            <Clock size={40} className="text-orange-500" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Enlace expirado</h2>
                        <p className="text-sm text-slate-400 max-w-xs mx-auto mb-6">
                            Este enlace de firma ha caducado o ha sido cancelado por seguridad.
                            Contacte con su abogado para solicitar uno nuevo.
                        </p>
                        <div className="flex flex-col gap-4 w-full">
                            {tenantInfo?.config?.contact_email && (
                                <a
                                    href={`mailto:${tenantInfo.config.contact_email}`}
                                    className="text-blue-600 text-sm font-bold hover:underline"
                                >
                                    {tenantInfo.config.contact_email}
                                </a>
                            )}

                            <button
                                onClick={() => window.location.href = `${window.location.origin}/${tenantInfo?.slug && tenantInfo.slug !== 'global' ? tenantInfo.slug : ''}`}
                                className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors"
                            >
                                Volver al inicio
                            </button>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {state === 'error' && (
                    <div className="flex flex-col items-center justify-center py-16 animate-in fade-in text-center">
                        <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mb-6">
                            <AlertCircle size={40} className="text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Error</h2>
                        <p className="text-sm text-slate-400 max-w-xs mx-auto mb-6">
                            {errorMessage || 'Ha ocurrido un problema al cargar el documento.'}
                        </p>
                        <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm"
                            >
                                Reintentar
                            </button>
                            <button
                                onClick={() => window.location.href = `${window.location.origin}/${tenantInfo?.slug && tenantInfo.slug !== 'global' ? tenantInfo.slug : ''}`}
                                className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm"
                            >
                                Volver al inicio
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="max-w-lg mx-auto px-4 py-8 text-center shrink-0">
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                    Seguridad LegalFlow · © {new Date().getFullYear()}
                </p>
            </footer>
        </div>
    );
};
