# Guía de Despliegue: AI Legal & Halal Assistant

Este documento detalla los pasos para desplegar la aplicación completa, incluyendo el Frontend (Next.js), el Backend (Supabase), las Edge Functions (Skills) y el Bot de Telegram.

## 1. Requisitos Previos

- **Node.js**: Asegúrate de tener la versión v20.9.0 o superior (Local).
- **Supabase CLI**: Instalado y autenticado (`npm install -g supabase`).
- **Cuenta de Vercel**: Para desplegar el frontend.
- **Cuenta de Telegram**: Para crear el bot.

## 2. Configuración de Variables de Entorno

Asegúrate de tener las siguientes claves en tu archivo `.env.local` y en el Dashboard de Supabase/Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" # Solo Backend/Edge Functions
GOOGLE_API_KEY="your-gemini-api-key"
TELEGRAM_BOT_TOKEN="your-telegram-bot-token" # Solo Edge Functions
```

## 3. Despliegue de Base de Datos (Supabase)

Si no has aplicado las migraciones aún:

1. Ve al SQL Editor en tu Dashboard de Supabase.
2. Copia y ejecuta el contenido de `supabase/migrations/20260211_initial_schema.sql`.
3. Copia y ejecuta el contenido de `supabase/migrations/20260211_rag_schema.sql`.

## 4. Despliegue de Edge Functions (Skills)

Estas funciones corren en el servidor de Supabase y requieren despliegue manual via CLI.

### Paso 4.1: Login en CLI
```bash
supabase login
supabase link --project-ref <tu-project-id>
```

### Paso 4.2: Configurar Secretos
Sube las variables de entorno a las Edge Functions:
```bash
supabase secrets set GOOGLE_API_KEY=tu_clave_gemini
supabase secrets set SUPABASE_URL=https://tu-project.supabase.co
supabase secrets set SUPABASE_ANON_KEY=tu_anon_key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
supabase secrets set TELEGRAM_BOT_TOKEN=tu_telegram_token
```

### Paso 4.3: Desplegar Funciones
```bash
supabase functions deploy analyze-contract
supabase functions deploy halal-checker
supabase functions deploy telegram-bot
```

Obtendrás URLs como: `https://<project-id>.supabase.co/functions/v1/analyze-contract`.

## 5. Configuración del Bot de Telegram

1. Habla con [@BotFather](https://t.me/botfather) en Telegram para crear un nuevo bot y obtener el `TOKEN`.
2. Configura el **Webhook** para que Telegram envíe los mensajes a tu Edge Function:

```bash
curl -F "url=https://<project-id>.supabase.co/functions/v1/telegram-bot" https://api.telegram.org/bot<TU_TOKEN>/setWebhook
```

## 6. Despliegue del Frontend (Vercel)

1. Sube tu código a GitHub.
2. Importa el repositorio en Vercel.
3. Configura las variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GOOGLE_API_KEY`).
4. Despliega.

## 7. Verificación Final

- **Frontend**: Entra a tu dominio (`https://tu-app.vercel.app`), inicia sesión y prueba subir un PDF.
- **Bot**: Envía un mensaje a tu bot en Telegram ("Hola, ¿es haram invertir en cripto?").
- **Skills**: Usa el botón "Analizar" en el Dashboard (requiere actualizar la URL de la función en el código del frontend si no usas el proxy de Next.js).
