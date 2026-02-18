import { pdfjs } from 'react-pdf';

// Configurar el worker de PDF.js para que funcione en Vite/Webpack
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
