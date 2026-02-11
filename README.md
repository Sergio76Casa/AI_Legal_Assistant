# AI Legal & Halal Compliance Assistant

Un asistente inteligente diseñado para ayudar a la comunidad inmigrante y musulmana en España con trámites de extranjería, contratos legales y certificación Halal.

## Características Principales

- **Chat Legal con IA**: Responde dudas sobre normativa española.
- **RAG (Retrieval-Augmented Generation)**: Sube tus contratos PDF para que la IA los analice.
- **Certificación Halal**: Verifica ingredientes y productos mediante IA.
- **Bot de Telegram**: Asistencia rápida y accesible.

## Documentación

Para poner en marcha el proyecto, consulta las guías específicas:

- [Guía de Despliegue (DEPLOYMENT.md)](./DEPLOYMENT.md): Frontend, Backend, Edge Functions y Bot.
- [Estrategia de Testing (TESTING.md)](./TESTING.md): Pruebas manuales y verificación.

## Stack Tecnológico

- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion.
- **Backend (BaaS)**: Supabase (Auth, Database, Storage, Edge Functions).
- **IA**: Google Gemini 1.5 Flash (Generación y Embeddings).

## Instalación Local

1. Clona el repositorio.
2. Asegúrate de tener Node.js v20+.
3. Instala dependencias:
   ```bash
   cd web-app
   npm install
   ```
4. Configura las variables de entorno (ver `DEPLOYMENT.md`).
5. Corre el servidor de desarrollo:
   ```bash
   npm run dev
   ```
