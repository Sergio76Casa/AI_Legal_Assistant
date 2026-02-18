
import JSZip from 'jszip';
import { supabase } from './supabase';
import { generateFilledPDF } from './pdf-generator';

interface BundleTemplate {
    template_id: string;
    display_order: number;
    pdf_templates: {
        name: string;
        storage_path: string;
    };
}

interface BundleResult {
    blob: Blob;
    fileName: string;
    fileCount: number;
    clientName: string;
    bundleName: string;
}

export const generateBundleZIP = async (
    bundleId: string,
    userId: string,
    onProgress?: (msg: string) => void
): Promise<BundleResult> => {
    try {
        // 1. Fetch Bundle Details & Templates
        onProgress?.('Obteniendo información del pack...');

        const { data: bundle, error: bundleError } = await supabase
            .from('pdf_bundles')
            .select('*, bundle_templates(template_id, display_order, pdf_templates(name, storage_path))')
            .eq('id', bundleId)
            .single();

        if (bundleError || !bundle) throw new Error('Error al cargar el pack de documentos');

        // Sort templates by order
        const templates: BundleTemplate[] = bundle.bundle_templates?.sort((a: any, b: any) => a.display_order - b.display_order) || [];

        if (templates.length === 0) throw new Error('Este pack no contiene plantillas');

        // 2. Fetch User Profile Data
        onProgress?.('Cargando datos del cliente...');
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (profileError || !profile) throw new Error('Error al cargar datos del cliente');

        // 3. Initialize ZIP
        const zip = new JSZip();
        // Construct Folder Name inside ZIP (optional, but good practice)
        // Format: EXPEDIENTE_[CLIENT]_[DATE]
        const dateStr = new Date().toLocaleDateString('es-ES').replace(/\//g, '-');
        const clientNameClean = `${profile.first_name}_${profile.last_name}`.toUpperCase().replace(/\s+/g, '_');
        const zipFileName = `EXPEDIENTE_${clientNameClean}_${dateStr}.zip`;

        const rootFolder = zip.folder(zipFileName.replace('.zip', ''));

        if (!rootFolder) throw new Error('Error al crear archivo comprimido');

        let generatedCount = 0;

        // 4. Process each template
        for (let i = 0; i < templates.length; i++) {
            const tmpl = templates[i];
            const templateName = tmpl.pdf_templates.name;
            const fileName = `${String(i + 1).padStart(2, '0')}_${templateName.replace(/[^a-z0-9]/gi, '_')}.pdf`;

            onProgress?.(`Generando documento ${i + 1} de ${templates.length}: ${templateName}...`);

            // Generate individual PDF
            // generateFilledPDF fetches template and mappings internally based on templateId
            const filledPdfBytes = await generateFilledPDF({
                templateId: tmpl.template_id,
                clientId: userId,
                clientProfile: profile
            });

            // But wait, if I use `generateFilledPDF`, it returns Uint8Array | null.
            if (filledPdfBytes) {
                rootFolder.file(fileName, filledPdfBytes);
                generatedCount++;
            }
        }

        onProgress?.('Comprimiendo expediente completo...');

        // 5. Generate ZIP Blob
        const content = await zip.generateAsync({ type: 'blob' });

        return {
            blob: content,
            fileName: zipFileName,
            fileCount: generatedCount,
            clientName: `${profile.first_name} ${profile.last_name}`,
            bundleName: bundle.name
        };

    } catch (error) {
        console.error('Error generating bundle:', error);
        throw error;
    }
};
