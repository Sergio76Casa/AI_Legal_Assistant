# Arquitectura Actual: Legal AI Global

Este documento describe la arquitectura real detectada en la base de código del proyecto, incluyendo la estructura de base de datos, el enrutado frontend y la lógica de validación de planes (Pricing).

## 1. Tablas en la Base de Datos (Supabase)

A partir de las migraciones SQL en `supabase/migrations/`, se identifican las siguientes tablas principales que conforman el núcleo del sistema:

*   **`tenants`**: Almacena las organizaciones o inquilinos (arquitectura Multi-Tenant).
*   **`subscriptions`**: Registra las suscripciones de los usuarios (`free`, `pro`, `business`).
*   **`usage_tracking`**: Rastrea el consumo mensual por usuario (cantidad de consultas al chat y documentos subidos).
*   **`affiliates`** / **`affiliate_referrals`** / **`affiliate_commissions`**: Sistema de afiliados para rastrear referidos y comisiones (integración con Stripe).
*   **`document_signature_requests`** / **`document_signature_logs`**: Gestión de firmas digitales y pistas de auditoría.
*   **`pdf_templates`** / **`form_fields_mapping`**: Plantillas PDF y mapeo de campos (Smart Forms).
*   **`pdf_bundles`** / **`bundle_templates`**: Agrupación de documentos y plantillas.
*   **`organization_settings`**: Configuración dinámica (ej. pie de página) por organización.

## 2. Definición de Rutas (Frontend URLs)

El frontend utiliza React sin una librería estricta como react-router; en su lugar, gestiona la navegación mediante estado (`view`) y el historial del navegador (`window.history.pushState`) en `src/App.tsx`. 

Las rutas principales detectadas son:

*   **Públicas y de Ingreso**:
    *   `/` o `/home` -> Landing Page principal.
    *   `/login` -> Formulario de Autenticación.
    *   `/join` -> Página para unirse a un Tenant por invitación (`?token=...`).
    *   `/create-org` -> Creación de una nueva organización.
*   **Dashboard de Usuarios / Tenants**:
    *   `/dashboard` -> Vista principal (Hero / BentoGrid).
    *   `/dashboard/documents` -> Gestión de documentos.
    *   `/dashboard/templates` -> Gestión de plantillas PDF.
    *   `/dashboard/signatures` -> Gestión de firmas.
    *   `/dashboard/affiliates` -> Panel de afiliados (tenant).
    *   `/dashboard/organization` -> Ajustes de la organización.
    *   `/dashboard/settings` -> Configuración del usuario.
*   **Administración Global**:
    *   `/dashboard/admin` -> Panel de Superadmin (solo accesible para roles admin o emails específicos).
*   **Páginas Legales y Estáticas**:
    *   `/privacy`, `/cookies` -> Políticas de privacidad y cookies.
    *   `/legal-procedures`, `/halal-culture`, `/housing-guide` -> Guías informativas públicas.
*   **Sistema de Afiliados Público**:
    *   `/afiliados-terminos`, `/register-affiliate`, `/affiliate-kit` -> Páginas de captación y recursos para afiliados.
*   **Firmas y URLs Públicas de Tenant**:
    *   `/sign/[token]` -> Interfaz pública para firmar un documento.
    *   `/[slug]` -> Página pública (Landing Page específica) del Tenant.

## 3. Lógica de Validación de Planes (Starter, Business, Enterprise)

### Mapeo de Nombres (UI vs. Base de Datos)
El componente de React (`Pricing.tsx`) muestra los planes al usuario final como **Starter**, **Business** y **Enterprise**. A nivel de base de datos (en la función `get_tier_limits`), estos se mapean a los valores **`free`**, **`pro`** y **`business`**:

*   **Starter (`free`)**:
    *   Consultas al Chat Máximas: 5
    *   Documentos Máximos: 1
    *   Acceso API: No
    *   Soporte Prioritario: No
*   **Business (`pro`)**:
    *   Consultas al Chat Máximas: 100
    *   Documentos Máximos: 20
    *   Acceso API: No
    *   Soporte Prioritario: Sí
*   **Enterprise (`business`)**:
    *   Ilimitado (`-1`) tanto en chat como en documentos.
    *   Acceso API: Sí
    *   Soporte Prioritario: Sí

### Mecanismo de Validación
La validación ocurre en la base de datos (PostgreSQL) usando la función `can_perform_action(p_user_id, p_action_type)` (`add_subscription_system.sql`).

1.  **Detección de Plan**: Se obtiene el nivel de suscripción actual activo del usuario buscando en la tabla `subscriptions`. Si no existe, se le asigna por defecto el plan `free` (Starter).
2.  **Conteo de Uso**:
    *   Para `chat_query`: Busca en la tabla `usage_tracking` el registro dentro del ciclo de facturación actual (`period_start` a `period_end`).
    *   Para `upload_document`: Cuenta la cantidad total de documentos que posee el usuario en la tabla `documents`.
3.  **Comparación**: Se cruza el conteo obtenido con el límite estipulado por `get_tier_limits`. Si el límite es infinito (`-1`), la acción se aprueba automáticamente; de lo contrario, permite la acción si el **uso actual es estrictamente menor** al máximo permitido. Cada acción aprobada detona la función `increment_usage` que actualiza los contadores.
