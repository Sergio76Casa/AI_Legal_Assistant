import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { supabase } from './supabase';

interface GeneratePDFParams {
    templateId: string;
    clientId: string; // ID del "Customer" (User)
    clientProfile: any; // Datos completos del perfil del cliente
    customMappings?: any[]; // Opcional: Para preview
    preloadedTemplateBuffer?: ArrayBuffer; // Opcional: Para evitar redescargar
}

export const generateFilledPDF = async ({ templateId, clientProfile, customMappings, preloadedTemplateBuffer }: GeneratePDFParams): Promise<Uint8Array | null> => {
    try {
        let mappings = customMappings;
        let arrayBuffer = preloadedTemplateBuffer;

        // 1. Obtener datos de la plantilla y mapeos SI NO VEINEN DADOS
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

        // 3. Cargar PDF con pdf-lib
        if (!arrayBuffer || !mappings) throw new Error("Faltan datos para generar PDF");

        let pdfDoc: PDFDocument;
        try {
            pdfDoc = await PDFDocument.load(arrayBuffer);
        } catch (loadErr) {
            console.error('Error loading PDF:', loadErr);
            throw new Error('PDF_LOAD_ERROR'); // Código para i18n
        }

        const pages = pdfDoc.getPages();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // 4. Rellenar campos
        for (const map of mappings) {
            // Obtener valor del perfil del cliente
            let value = clientProfile[map.field_key] || '';

            // Lógica especial: Fecha Actual
            if (map.field_key === 'today_date') {
                value = new Date().toLocaleDateString('es-ES');
            }

            // Ignorar si no hay valor (o dejar vacío)
            if (value === undefined || value === null) continue;

            const pageIndex = map.page_number - 1;
            if (pageIndex >= pages.length) continue;

            const page = pages[pageIndex];
            const { height } = page.getSize();

            // COORDENADAS:
            // pdf-lib usa coordenadas Cartesianas (0,0 en esquina INFERIOR izquierda).
            // Nuestro editor visual (probablemente) guardó coordenadas desde la esquina SUPERIOR izquierda (web standard).
            // Convertimos Y: pdfY = height - visualY - fontSize (ajuste aprox)
            // Ojo: Si guardamos "Puntos PDF" directos en el editor asumiendo origen arriba, hacemos:
            const pdfX = map.x_coordinate;
            const pdfY = height - map.y_coordinate; // Invertir Y

            // LOGICA ESPECIAL: SEXO (Checkboxes Condicionales)
            if (map.field_key === 'sex_male' || map.field_key === 'sex_female') {
                const sex = clientProfile.sex?.toLowerCase();
                const isMale = sex === 'male' || sex === 'hombre' || sex === 'h';
                const isFemale = sex === 'female' || sex === 'mujer' || sex === 'm';

                // Solo dibujar si coincide
                const shouldDraw = (map.field_key === 'sex_male' && isMale) || (map.field_key === 'sex_female' && isFemale);

                if (shouldDraw) {
                    page.drawText('X', {
                        x: pdfX,
                        y: pdfY - (map.font_size || 12),
                        size: map.font_size || 12,
                        font: font,
                        color: rgb(0.1, 0.1, 0.4),
                    });
                }
                continue; // Ya hemos dibujado (o no), pasamos al siguiente campo
            }

            // LOGICA CHECKBOX / BOOLEANO
            const isCheckbox = typeof value === 'boolean' || (typeof value === 'string' && ['si', 'no', 'true', 'false', 'x'].includes(value.toLowerCase()));

            if (isCheckbox) {
                // Si es booleano true, dibujamos X.
                if (value === true || value === 'true' || value === 'si' || value === 'X') {
                    page.drawText('X', {
                        x: pdfX,
                        y: pdfY - (map.font_size || 12), // Ajuste de baseline
                        size: map.font_size || 12,
                        font: font,
                        color: rgb(0.1, 0.1, 0.4), // Azul oscuro "Tinta de Bolígrafo"
                    });
                }
            } else {
                // TEXTO NORMAL
                const text = String(value);
                let fontSize = map.font_size || 11; // Default a 11 (un poco más pequeño que 12 para standard)
                const maxWidth = map.width || 0; // Si es 0 o undefined, no limitamos (o limitamos página)

                // AUTO-SCALE LOGIC
                if (maxWidth > 0) {
                    let textWidth = font.widthOfTextAtSize(text, fontSize);

                    // Si el texto es más ancho que el espacio disponible, reducimos la fuente
                    while (textWidth > maxWidth && fontSize > 6) {
                        fontSize -= 0.5;
                        textWidth = font.widthOfTextAtSize(text, fontSize);
                    }
                }

                page.drawText(text, {
                    x: pdfX,
                    y: pdfY - fontSize, // Ajuste para que la coordenada sea "Top-Left" visualmente
                    size: fontSize,
                    font: font,
                    color: rgb(0.1, 0.1, 0.4), // Azul oscuro profesional
                    maxWidth: maxWidth > 0 ? maxWidth : undefined, // pdf-lib hace wrap si se pasa, pero nosotros ya reducimos
                });
            }
        }

        // 5. Guardar y Retornar
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
