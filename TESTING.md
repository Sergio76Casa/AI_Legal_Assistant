# Estrategia de Testing: AI Legal & Halal Assistant

Debido a restricciones actuales con la versión de Node.js en el entorno de desarrollo, nos enfocamos en **Pruebas Manuales** y **Verificación Estratégica**.

## 1. Plan de Pruebas Manuales (User Acceptance Testing)

### 1.1 Autenticación
- [ ] **Registro**: Crear cuenta con correo/password y Google.
- [ ] **Login**: Iniciar sesión correctamente.
- [ ] **Protección**: Intentar acceder a `/dashboard` sin sesión (debe redirigir a `/login`).
- [ ] **Logout**: Cerrar sesión y verificar redirección.

### 1.2 Dashboard y Documentos (RAG)
- [ ] **Subida de PDF**: Subir un archivo `.pdf` legal.
    - *Verificación*: Debe aparecer en la tabla con estado "Analizado".
    - *Verificación DB*: Revisar tabla `documents` y `knowledge_base` en Supabase.
- [ ] **Subida Inválida**: Subir un archivo `.exe` o imagen (si solo PDF está soportado). Ver error amigable.

### 1.3 Chat AI (RAG)
- [ ] **Consulta General**: "¿Qué es un contrato de arras?". (Debe responder con conocimiento general).
- [ ] **Consulta Específica**: Preguntar sobre un dato concreto del PDF subido (ej: "¿Cuánto es la fianza?").
    - *Verificación*: La respuesta debe citar el documento o usar la información extraída.

### 1.4 Edge Functions (Skills)
- [ ] **Analizar Contrato**: Clic en botón "Analizar" en Dashboard. (Verificar log o alerta simulada por ahora).
- [ ] **Halal Checker**: Enviar texto de ingredientes dudosos al chat o endpoint.
- [ ] **Telegram Bot**: Enviar "Hola" al bot. Debe responder la IA.

## 2. Estrategia de Automatización (Futuro)

Una vez actualizado Node.js a v20+, se recomienda implementar:

### 2.1 Tests Unitarios (Jest/Vitest)
- Mockear `supabase-js` y `google-generative-ai`.
- Testear `route.ts` de Upload y Chat para asegurar manejo de errores (401, 500).

### 2.2 Tests E2E (Playwright/Cypress)
- Flujo completo: Login -> Subir PDF -> Chat -> Logout.

## 3. Auditoría de Seguridad
- [ ] **RLS**: Verificar que un usuario A no pueda ver documentos del usuario B (intentar consultar `documents` con otro token).
- [ ] **Storage**: Intentar descargar archivo directo de Storage sin token (debe dar 403).
