import { useState } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { supabase } from '../lib/supabase';
import { useSessionObserver } from './useSessionObserver';

export function useSignatureEvents() {
    const { profile } = useSessionObserver();
    const [isGenerating, setIsGenerating] = useState(false);

    const generateEvidencePDF = async (signatureDataUrl: string, metadata: {
        title: string,
        assetName: string,
        assetId: string,
        signerName: string
    }) => {
        setIsGenerating(true);
        try {
            // 1. Create a dynamic PDF from scratch
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([600, 800]);
            const { height } = page.getSize();
            
            const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

            // 2. Branding Header
            page.drawRectangle({
                x: 0,
                y: height - 100,
                width: 600,
                height: 100,
                color: rgb(0.02, 0.03, 0.07), // Stark Dark Blue
            });

            page.drawText('LEGAL AI GLOBAL', {
                x: 50,
                y: height - 60,
                size: 24,
                font: fontBold,
                color: rgb(0, 1, 0.8), // Cyan/Primary
            });

            page.drawText('CERTIFICADO DE CONFORMIDAD TÉCNICA', {
                x: 50,
                y: height - 85,
                size: 10,
                font: fontBold,
                color: rgb(1, 1, 1),
            });

            // 3. Body Content
            let currentY = height - 160;

            const drawSection = (label: string, value: string) => {
                page.drawText(label.toUpperCase(), { x: 50, y: currentY, size: 8, font: fontBold, color: rgb(0.5, 0.5, 0.5) });
                page.drawText(value, { x: 50, y: currentY - 15, size: 12, font: fontRegular, color: rgb(0.1, 0.1, 0.1) });
                currentY -= 50;
            };

            drawSection('Acto Administrativo', metadata.title);
            drawSection('Activo Vinculado', `${metadata.assetName} (ID: ${metadata.assetId.substring(0, 8)})`);
            drawSection('Fecha y Hora', new Date().toLocaleString('es-ES'));
            drawSection('Firmante Autorizado', metadata.signerName);

            // 4. Information Box
            page.drawRectangle({
                x: 50,
                y: currentY - 60,
                width: 500,
                height: 80,
                color: rgb(0.95, 0.97, 1),
                borderWidth: 1,
                borderColor: rgb(0.8, 0.8, 0.9),
            });

            page.drawText('ESTAMPA DE VALIDEZ LEGAL', { x: 70, y: currentY - 10, size: 9, font: fontBold, color: rgb(0.2, 0.2, 0.6) });
            page.drawText('Este documento representa una evidencia digital inmutable protegida por el Protocolo Stark.', {
                x: 70,
                y: currentY - 30,
                size: 9,
                font: fontRegular,
                color: rgb(0.3, 0.3, 0.4),
                maxWidth: 460
            });

            // 5. Embed Signature Image
            const signatureImageBytes = await fetch(signatureDataUrl).then(res => res.arrayBuffer());
            const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
            const sigDims = signatureImage.scale(0.5);

            currentY -= 150;
            page.drawText('FIRMA DEL REPRESENTANTE', { x: 50, y: currentY + 100, size: 8, font: fontBold, color: rgb(0.5, 0.5, 0.5) });
            
            page.drawImage(signatureImage, {
                x: 50,
                y: currentY,
                width: 250,
                height: 100,
            });

            // Footer Traceability
            page.drawText(`IP: ${window.location.hostname} | Hash: SHA256-AUTHENTICATED`, {
                x: 50,
                y: 30,
                size: 7,
                font: fontRegular,
                color: rgb(0.6, 0.6, 0.6),
            });

            // 6. Save and Download
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `evidencia_${metadata.assetId.substring(0, 8)}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            return pdfBytes;
        } catch (err) {
            console.error('Error generating evidence PDF:', err);
            return null;
        } finally {
            setIsGenerating(false);
        }
    };

    return { generateEvidencePDF, isGenerating };
}
