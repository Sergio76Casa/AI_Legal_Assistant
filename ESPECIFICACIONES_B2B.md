# PROYECTO: PLATAFORMA B2B "GESTORÍA 2.0" (Marca Blanca)

## 1. Visión del Producto
Una plataforma **SaaS Multi-Tenant** que permite a Gestorías, Abogados y ONGs ofrecer un **"Asistente Legal IA Personalizado"** a sus clientes finales.
El objetivo es automatizar el 80% de consultas repetitivas usando la documentación propia de la gestoría + la ley vigente.

---

## 2. Actores y Roles

### A. Superadmin (Tú - Dueño de la Plataforma)
*   **Visión:** Global (ve todas las gestorías, usuarios y métricas).
*   **Acciones Clave:**
    *   Crear/Suspender Gestorías (Tenants).
    *   Gestionar Planes de Suscripción (Billing).
    *   Subir "Conocimiento Base Global" (Leyes de Extranjería, BOE, etc.).
    *   Ver estadísticas de uso global (tokens IA, almacenamiento).

### B. Admin de Gestoría (Tu Cliente - B2B)
*   **Visión:** Solo su Organización (Tenant).
*   **Acciones Clave:**
    *   **Branding:** Subir Logo y Colores Corporativos.
    *   **Gestión de Usuarios:** Invitar/Borrar clientes (o empleados).
    *   **Gestión Documental:** Subir PDFs internos (Guías de Visados, Plantillas de Contrato).
    *   **Privacidad:** Definir si sus documentos son visibles para todos sus clientes o privados por cliente.
    *   Ver historial de chats de sus clientes (opcional, por calidad).

### C. Usuario Final (Cliente de la Gestoría)
*   **Visión:** Solo sus datos y lo que la gestoría le permita ver.
*   **Acciones Clave:**
    *   Login simple (o Magic Link).
    *   **Chat IA:** Preguntar dudas sobre sus trámites.
    *   **Mis Documentos:** Subir sus papeles personales (Pasaporte, Empadronamiento) para análisis.
    *   Ver guías oficiales de SU gestoría.

---

## 3. Funcionalidades Core (MVP)

### 🏢 Módulo Multi-Tenant (Aislamiento Total)
*   Cada Gestoría tiene un ID único (`tenant_id`).
*   **Seguridad RLS:** Un cliente de "Gestoría A" JAMÁS puede ver datos de "Gestoría B".
*   **RAG Híbrido:** La IA busca respuestas en este orden:
    1.  Documentos Privados del Cliente (si los hay).
    2.  Guías Oficiales de la Gestoría.
    3.  Base Global (Leyes del Estado).

### 🎨 Personalización (White Label - Nivel 1)
*   Logo en la esquina superior.
*   Nombre de la Organización en el título.
*   (Futuro) Dominio personalizado `clientes.gestoriaX.com`.

### 🤖 Chat Inteligente (Legal & Halal)
*   **Contexto:** La IA sabe quién es el usuario y a qué gestoría pertenece.
*   **Tono:** Profesional pero cercano.
*   **Citas:** La IA debe citar la fuente ("Según el documento 'Guía Arraigo' de tu gestoría...").

### 📂 Gestión Documental Inteligente
*   **Admin Gestoría:** Sube "Políticas" o "Plantillas".
*   **Usuario:** Sube "Evidencias" (DNI, Nóminas).
*   **IA:** Lee ambos tipos para dar respuestas precisas.

---

## 4. Estrategia de Monetización

### Plan Starter (199€/mes)
*   Hasta 100 Clientes Activos.
*   Branding Básico (Logo).
*   Chat IA Ilimitado.
*   5GB Almacenamiento.

### Plan Pro (499€/mes)
*   Hasta 500 Clientes.
*   Branding Avanzado (Colores, Dominio Personalizado).
*   Panel de Analítica (¿Qué preguntan mis clientes?).
*   Soporte Prioritario.
*   20GB Almacenamiento.

### Plan Enterprise (A medida)
*   Clientes Ilimitados.
*   API para integración con su CRM.
*   Entrenamiento de IA a medida.

---

## 5. Hoja de Ruta Técnica (Fases de Implementación)

### 🚀 FASE ACTUAL: Portal Privado B2B
Centrada en que la Gestoría tenga un **Panel de Control** para gestionar a sus clientes **dentro de nuestra plataforma**.
1.  **✔️ Fase 1: Arquitectura Base** (RLS, Tenants, Auth) -> **COMPLETADO**
2.  **🔄 Fase 2: Panel Admin de Gestoría** (Gestión de Usuarios, Invitaciones) -> **EN PROCESO**
3.  **🔜 Fase 3: Personalización** (Subida de Logo, Interfaz Dinámica).
4.  **🔜 Fase 4: Gestión Documental Privada** (Que la gestoría suba sus propios PDFs).
5.  **🔜 Fase 5: Billing** (Integración con Stripe para cobrar a las gestorías).

### 🔮 FUTURO: Expansión de Canales

#### Opción 2: Widget Embebido ("Tipo Intercom")
*   **Concepto:** La gestoría pega un script `<script...>` en SU propia web corporativa `www.gestorialopez.com`.
*   **Experiencia:** Aparece una burbuja de chat flotante en la esquina inferior derecha.
*   **Ventaja:** El cliente final NO sale de la web de la gestoría.
*   **Reto Técnico:** Manejo de sesiones *cross-origin* (CORS) y autenticación simplificada.

#### Opción 3: Marca Blanca Total (Dominio Personalizado) -> "El Ferrari"
*   **Concepto:** El portal completo vive en `clientes.gestorialopez.com` (Subdominio del cliente).
*   **Experiencia:** Desaparece totalmente "Legal & Halal" de la URL. Parece tecnología 100% propia de ellos.
*   **Ventaja:** Imagen premium y profesionalidad máxima. Se cobra mucho más caro.
*   **Reto Técnico:** Configuración dinámica de DNS (CNAME records) y certificados SSL automáticos (ej: usando Vercel Domains API).

---

## 6. Siguiente Paso Inmediato
Terminar el **Panel de Gestión de Usuarios (Fase 2)** para que una Gestoría pueda invitar a sus clientes reales al Portal Privado actual.
