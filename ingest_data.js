const URL = 'https://lkdfesfidxkaolcetseq.supabase.co/functions/v1/ingest';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrZGZlc2ZpZHhrYW9sY2V0c2VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MTQ3OTcsImV4cCI6MjA4NjM5MDc5N30.cQBdtQ0tZ4oMiX7hyS3eVWd0h4JSOJR4T6giPdp6p9U';

const documents = [
    {
        content: "El NIE (Número de Identidad de Extranjero) es un número personal e intransferible que se asigna a los extranjeros para su identificación. Es necesario para trabajar, abrir una cuenta bancaria o comprar una propiedad en España. Se solicita en la Comisaría de Policía o en la Oficina de Extranjería.",
        metadata: { source: "manual_entry", category: "legal" }
    },
    {
        content: "La TIE (Tarjeta de Identidad de Extranjero) es el documento físico que acredita la residencia legal en España para extranjeros de fuera de la UE. El NIE es el número, mientras que la TIE es la tarjeta física que lo contiene.",
        metadata: { source: "manual_entry", category: "legal" }
    },
    {
        content: "El Certificado de Empadronamiento es el documento que acredita que una persona reside en un municipio específico en España. Es obligatorio para acceder a servicios públicos como la salud y la educación, y para realizar trámites de extranjería.",
        metadata: { source: "manual_entry", category: "legal" }
    }
];

async function ingest() {
    for (const doc of documents) {
        console.log(`Ingesting: ${doc.content.substring(0, 30)}...`);
        try {
            const response = await fetch(URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(doc)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Error (${response.status}):`, errorText);
            } else {
                const result = await response.json();
                console.log('Result:', result);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }
}

ingest();
