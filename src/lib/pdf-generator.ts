import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { supabase } from './supabase';

interface GeneratePDFParams {
    templateId: string;
    clientId: string; // ID del "Customer" (User)
    clientProfile: any; // Datos completos del perfil del cliente
    tenantProfile?: any; // Datos de la organización (White Label)
    customMappings?: any[]; // Opcional: Para preview
    preloadedTemplateBuffer?: ArrayBuffer; // Opcional: Para evitar redescargar
}

export const generateFilledPDF = async ({ templateId, clientProfile, tenantProfile, customMappings, preloadedTemplateBuffer }: GeneratePDFParams): Promise<Uint8Array | null> => {
    try {
        let mappings = customMappings;
        let arrayBuffer = preloadedTemplateBuffer;

        // 1. Obtener datos de la plantilla y mapeos SI NO VIENEN DADOS
        if (!mappings || !arrayBuffer) {
            const { data: template, error: tplError } = await supabase
                .from('pdf_templates')
                .select('*')
                .eq('id', templateId)
                .single();

            if (tplError || !template) throw new Error('Plantilla no encontrada');

            if (!mappings) {
                const { data: dbMappings, error: mapError } = await supabase
                    .from('form_fields_mapping')
                    .select('*')
                    .eq('template_id', templateId);

                if (mapError) throw new Error('Error al cargar mapeos');
                mappings = dbMappings;
            }

            if (!arrayBuffer) {
                const { data: fileData, error: fileError } = await supabase.storage
                    .from('templates')
                    .download(template.storage_path);

                if (fileError) throw new Error('Error al descargar el archivo PDF base');
                arrayBuffer = await fileData.arrayBuffer();
            }
        }

        // 2. Cargar PDF con pdf-lib
        if (!arrayBuffer || !mappings) throw new Error("Faltan datos para generar PDF");

        let pdfDoc: PDFDocument;
        try {
            pdfDoc = await PDFDocument.load(arrayBuffer);
        } catch (loadErr) {
            console.error('Error loading PDF:', loadErr);
            throw new Error('PDF_LOAD_ERROR');
        }

        const pages = pdfDoc.getPages();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // 3. Rellenar campos
        for (const map of mappings) {
            let value: any = '';

            // LOGICA DE BINDING (Client vs Organization)
            if (map.field_key.startsWith('org_')) {
                // Organization fields
                if (tenantProfile) {
                    const orgKey = map.field_key.replace('org_', '');
                    switch (orgKey) {
                        case 'name': value = tenantProfile.name; break;
                        case 'address': value = tenantProfile.config?.offices?.[0]?.address || ''; break;
                        case 'phone': value = tenantProfile.config?.contact_phone || ''; break;
                        case 'email': value = tenantProfile.config?.contact_email || ''; break;
                        case 'logo': value = tenantProfile.config?.logo_url || ''; break;
                        default: value = '';
                    }
                }
            } else if (map.field_key === 'today_date') {
                value = new Date().toLocaleDateString('es-ES');
            } else {
                // Client profile fields
                value = clientProfile[map.field_key] || '';
            }

            if (value === undefined || value === null) continue;

            const pageIndex = map.page_number - 1;
            if (pageIndex >= pages.length) continue;

            const page = pages[pageIndex];
            const { height } = page.getSize();
            const pdfX = map.x_coordinate;
            const pdfY = height - map.y_coordinate; // Invertir Y (Web -> PDF Lib)

            // 4. LOGICA DE DIBUJO (Texto vs Checkbox)
            if (map.field_type === 'checkbox') {
                // Checkbox Logic: Compare value with trigger_value
                const trigger = String(map.trigger_value || 'true').toLowerCase();
                const currentVal = String(value).toLowerCase();

                const isMarked = currentVal === trigger ||
                    (trigger === 'true' && (value === true || currentVal === 'si' || currentVal === 'yes'));

                if (isMarked) {
                    page.drawText('X', {
                        x: pdfX + 2, // Slight offset for visual centering
                        y: pdfY - (map.font_size || 12),
                        size: map.font_size || 12,
                        font: font,
                        color: rgb(0.1, 0.1, 0.4),
                    });
                }
            } else if (map.field_type === 'signature') {
                // Digital Signature Branding
                const signatureText = clientProfile.signature_date
                    ? `Firmado Digitalmente: ${new Date(clientProfile.signature_date).toLocaleDateString()}`
                    : `Pendiente de Firma`;

                page.drawRectangle({
                    x: pdfX,
                    y: pdfY - 30,
                    width: map.width || 120,
                    height: 30,
                    borderWidth: 0.5,
                    borderColor: rgb(0.1, 0.1, 0.4),
                    borderDashArray: [2, 2],
                    color: rgb(0.95, 0.95, 1),
                    opacity: 0.5,
                });

                page.drawText(signatureText, {
                    x: pdfX + 5,
                    y: pdfY - 20,
                    size: 7,
                    font: font,
                    color: rgb(0.2, 0.2, 0.6),
                });

                if (clientProfile.full_name) {
                    page.drawText(clientProfile.full_name, {
                        x: pdfX + 5,
                        y: pdfY - 10,
                        size: 8,
                        font: font,
                    });
                }
            } else {
                // Text Logic (Default)
                const text = String(value);
                if (!text || map.field_key === 'org_logo') continue;

                let fontSize = map.font_size || 11;
                const maxWidth = map.width || 0;

                if (maxWidth > 0) {
                    let textWidth = font.widthOfTextAtSize(text, fontSize);
                    while (textWidth > maxWidth && fontSize > 6) {
                        fontSize -= 0.5;
                        textWidth = font.widthOfTextAtSize(text, fontSize);
                    }
                }

                page.drawText(text, {
                    x: pdfX,
                    y: pdfY - fontSize,
                    size: fontSize,
                    font: font,
                    color: rgb(0.1, 0.1, 0.4),
                    maxWidth: maxWidth > 0 ? maxWidth : undefined,
                });
            }
        }

        const pdfBytes = await pdfDoc.save();
        return pdfBytes;

    } catch (err) {
        console.error('Error generating PDF:', err);
        throw err;
    }
};

export const downloadPDF = (pdfBytes: Uint8Array, fileName: string) => {
    const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
};
