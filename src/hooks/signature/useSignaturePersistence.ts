import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import QRCode from 'qrcode';

export const useSignaturePersistence = () => {
    const [progress, setProgress] = useState('');
    const [progressPct, setProgressPct] = useState(0);

    const getClientIP = async () => {
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            return data.ip;
        } catch {
            return 'Desconocida';
        }
    };

    const hashData = async (data: string): Promise<string> => {
        const encoder = new TextEncoder();
        const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const handleSignatureComplete = async (
        signatureDataUrl: string,
        request: any,
        tenantInfo: any
    ) => {
        setProgress('Iniciando proceso seguro...');
        setProgressPct(5);

        try {
            const [clientIP, { data: fullProfile }] = await Promise.all([
                getClientIP(),
                supabase.rpc('get_signer_profile_full', {
                    p_token: request.access_token
                })
            ]);

            const userAgent = navigator.userAgent;
            const signerName = fullProfile?.full_name || fullProfile?.first_name || fullProfile?.username || 'Cliente';
            
            let signerEmail = '';
            try {
                const { data: userData } = await supabase.auth.getUser();
                signerEmail = userData.user?.email || '';
            } catch { /* Silent */ }

            setProgress('Guardando firma digital...');
            setProgressPct(30);

            const signatureBlob = await (await fetch(signatureDataUrl)).blob();
            const signaturePath = `${request.tenant_id}/${request.id}/signature_${Date.now()}.png`;

            const { error: uploadErr } = await supabase.storage
                .from('signatures')
                .upload(signaturePath, signatureBlob, { contentType: 'image/png' });

            if (uploadErr) throw new Error('Error al guardar la firma');

            setProgress('Estampando firma en el documento...');
            setProgressPct(50);

            let pdfBytes: Uint8Array | null = null;
            let signedDocPath = '';

            if (request.document_storage_path) {
                const { data: pdfData } = await supabase.storage
                    .from('signatures')
                    .download(request.document_storage_path);

                if (!pdfData) throw new Error('Error descargando documento PDF');

                const pdfDoc = await PDFDocument.load(await pdfData.arrayBuffer());
                const sigImage = await pdfDoc.embedPng(await signatureBlob.arrayBuffer());
                
                const { data: mappings } = await supabase.rpc('get_signature_template_mappings', {
                    p_token: request.access_token
                });

                const mappingsList = mappings || [];
                const pages = pdfDoc.getPages();
                const textFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
                
                // --- PRINT TEXT FIELDS ---
                for (const field of mappingsList) {
                    if (field.field_type === 'signature') continue;
                    let val = fullProfile[field.field_key] || '';
                    if (!val && field.field_key === 'first_name') val = fullProfile['full_name'] || '';
                    if (!val && field.field_key === 'full_name') val = fullProfile['first_name'] || '';

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
                    } else if (val) {
                        const fontSize = (field.height || 12) * 0.7;
                        page.drawText(String(val), {
                            x: field.x_coordinate + 2,
                            y: pageHeight - field.y_coordinate - fontSize,
                            size: fontSize,
                            font: textFont,
                            color: rgb(0, 0, 0),
                            maxWidth: field.width > 20 ? field.width - 4 : undefined
                        });
                    }
                }

                // --- PRINT SIGNATURE (Dark Blue - #000080) ---
                const sigFieldMappings = mappingsList.filter((m: any) => m.field_type === 'signature');

                const placeSignature = (page: any, x: number, y: number, w: number, h: number) => {
                    const sigWidth = w || 150;
                    const sigHeight = (sigWidth / sigImage.width) * sigImage.height;
                    const finalHeight = Math.min(sigHeight, h || 50);
                    const finalWidth = (finalHeight / sigImage.height) * sigImage.width;

                    page.drawImage(sigImage, {
                        x,
                        y: page.getSize().height - y - finalHeight,
                        width: finalWidth,
                        height: finalHeight,
                    });
                };

                if (sigFieldMappings.length > 0) {
                    for (const field of sigFieldMappings) {
                        const pageIndex = (field.page_number || 1) - 1;
                        if (pageIndex >= 0 && pageIndex < pages.length) {
                            placeSignature(pages[pageIndex], field.x_coordinate, field.y_coordinate, field.width, field.height);
                        }
                    }
                } else {
                    const lastPage = pages[pages.length - 1];
                    placeSignature(lastPage, lastPage.getSize().width / 2 - 75, lastPage.getSize().height - 120, 150, 60);
                }

                // --- AUDIT PAGE ---
                const auditPage = pdfDoc.addPage();
                const { width: aWidth, height: aHeight } = auditPage.getSize();
                const auditFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
                const auditFontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

                auditPage.drawRectangle({ x: 0, y: aHeight - 80, width: aWidth, height: 80, color: rgb(0.04, 0.09, 0.16) });
                auditPage.drawText('CERTIFICADO DE FIRMA DIGITAL', { x: 40, y: aHeight - 45, size: 20, font: auditFontBold, color: rgb(1, 1, 1) });
                auditPage.drawText(tenantInfo?.name || 'LegalFlow AI', { x: 40, y: aHeight - 65, size: 10, font: auditFont, color: rgb(0.7, 0.7, 0.7) });

                const sigHash = await hashData(signatureDataUrl);
                const drawRow = (label: string, value: string, y: number) => {
                    auditPage.drawText(label, { x: 40, y, size: 10, font: auditFontBold, color: rgb(0.3, 0.3, 0.3) });
                    auditPage.drawText(value || '-', { x: 180, y, size: 10, font: auditFont, color: rgb(0.1, 0.1, 0.1) });
                };

                const startY = aHeight - 130;
                drawRow('ID de Solicitud:', request.id.substring(0, 18).toUpperCase(), startY);
                drawRow('Firmante:', signerName, startY - 25);
                drawRow('Email:', signerEmail || 'No proporcionado', startY - 50);
                drawRow('Fecha y Hora:', new Date().toLocaleString('es-ES'), startY - 75);
                drawRow('Dirección IP:', clientIP, startY - 100);
                drawRow('Hash de Firma:', `${sigHash.substring(0, 32)}...`, startY - 125);

                const verifyUrl = `${window.location.origin}/verify/${request.id}`;
                const qrDataUri = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 100 });
                const qrImage = await pdfDoc.embedPng(qrDataUri);
                auditPage.drawImage(qrImage, { x: aWidth - 140, y: startY - 100, width: 90, height: 90 });
                auditPage.drawText('VERIFICACIÓN PÚBLICA', { x: aWidth - 140, y: startY - 5, size: 8, font: auditFontBold });

                pdfBytes = await pdfDoc.save();
            }

            setProgress('Almacenando documento firmado...');
            setProgressPct(85);

            if (pdfBytes) {
                signedDocPath = `${request.tenant_id}/${request.id}/signed_${Date.now()}.pdf`;
                await supabase.storage
                    .from('signatures')
                    .upload(signedDocPath, new Blob([pdfBytes.slice(0)], { type: 'application/pdf' }), { contentType: 'application/pdf' });
            }

            const finalHash = await hashData(signatureDataUrl);
            const { data: completeResult, error: completeError } = await supabase.rpc('complete_signature', {
                p_token: request.access_token,
                p_signed_document_path: signedDocPath,
                p_signature_storage_path: signaturePath,
                p_signature_hash: finalHash,
                p_signer_name: signerName,
                p_signer_email: signerEmail,
                p_ip_address: clientIP,
                p_user_agent: userAgent
            });

            if (completeError || !completeResult?.success) throw new Error(completeError?.message || 'Fallo en finalización');

            setProgressPct(100);
            return {
                signedPath: signedDocPath,
                signatureHash: finalHash,
                ipAddress: clientIP,
                timestamp: new Date().toISOString()
            };
        } catch (err) {
            console.error('Persistence error:', err);
            throw err;
        }
    };

    const handleDownload = async (path: string, fileName: string) => {
        try {
            const { data, error } = await supabase.storage.from('signatures').download(path);
            if (error) throw error;
            const url = window.URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName.replace(/\s+/g, '_')}_firmado.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download error:', err);
            window.open(`${supabase.storage.from('signatures').getPublicUrl(path).data.publicUrl}`, '_blank');
        }
    };

    return {
        progress,
        progressPct,
        handleSignatureComplete,
        handleDownload
    };
};
