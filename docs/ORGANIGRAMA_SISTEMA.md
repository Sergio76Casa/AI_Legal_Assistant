# 🏗️ Organigrama y Arquitectura del Sistema - Lexpats

Este documento detalla la estructura jerárquica, funcional y técnica de la plataforma Lexpats, desde el control global del Superadmin hasta el cliente final.

---

## 1. Mapa de Jerarquía de Usuarios

```mermaid
graph TD
    %% Roles de Usuario
    Superadmin[<b>SUPERADMIN</b><br/>Dueño de Lexpats]
    TenantAdmin[<b>TENANT ADMIN</b><br/>Gerente de Franquicia/Agencia]
    Staff[<b>STAFF / AGENTE</b><br/>Empleado del Tenant]
    EndUser[<b>CLIENTE FINAL</b><br/>Usuario de la App]

    %% Estructura de Datos
    GlobalKB[(<b>Global Knowledge Base</b><br/>Leyes y Documentación Matriz)]
    TenantTable[[<b>Tenant (Organización)</b><br/>Configuración, Logo, Plan, Márgenes]]
    ProfilesTable{{<b>Profiles</b><br/>Usuarios vinculados a un TenantID}}

    %% Relaciones
    Superadmin -- "Gestiona Todo" --> GlobalKB
    Superadmin -- "Crea/Controla" --> TenantTable
    TenantTable -- "Hereda Leyes" --> GlobalKB
    TenantAdmin -- "Administra su" --> TenantTable
    TenantAdmin -- "Gestiona su" --> Staff
    Staff -- "Atiende al" --> EndUser
    
    %% Seguridad
    subgraph "Aislamiento (Iron Silo)"
        TenantTable
        ProfilesTable
    end

    style Superadmin fill:#13ecc8,stroke:#fff,stroke-width:2px,color:#000
    style TenantAdmin fill:#3b82f6,stroke:#fff,color:#fff
    style GlobalKB fill:#f59e0b,stroke:#fff,color:#fff
```

---

## 2. Niveles de Acceso y Responsabilidades

| Nivel | Rol | Acceso | Responsabilidades Principales |
| :--- | :--- | :--- | :--- |
| **L1** | **Superadmin** | **Global (Control Maestro)** | Gestionar leyes globales, crear/suspender organizaciones, definir planes de precios, controlar el sistema de afiliados. |
| **L2** | **Tenant Admin** | **Específico de su Organización** | Configurar su marca (logo/nombre), ver sus métricas de ingresos, invitar a trabajadores (Staff). |
| **L3** | **Staff / Agente** | **Dashboard de Soporte** | Responder chats de clientes, cargar documentos específicos de su oficina, gestionar incidencias. |
| **L4** | **Usuario Final** | **Aplicación Web/Móvil** | Realizar consultas legales a la IA, descargar sus contratos, gestionar su suscripción mensual. |

---

## 3. Arquitectura Técnica: El Patrón "Iron Silo"

La web está construida bajo una arquitectura **Multi-Tenant**. Esto significa que existe una única aplicación procesando a múltiples empresas, pero sus datos nunca se mezclan.

### A. Aislamiento de Datos
Todas las tablas críticas (documentos, chats, perfiles, configuración) contienen una columna llamada **`tenant_id`**.
- El sistema utiliza **Row Level Security (RLS)** en Supabase.
- Ninguna solicitud de base de datos puede ejecutarse sin filtrar por el `tenant_id` del usuario actual.

### B. Herencia de Conocimiento (RAG)
Cuando un usuario hace una pregunta legal:
1. **Memoria Global**: La IA busca en el repositorio de leyes subido por el **Superadmin**.
2. **Memoria Privada**: La IA busca en los documentos subidos por esa **Agencia** específica.
3. **Respuesta**: Combina ambos mundos para dar una respuesta precisa.

### C. Sistema de Afiliados
Los **Partners** generan códigos de referido. Cuando un nuevo **Tenant** se crea usando su código, el sistema vincula porcentajes de ganancia automáticos que el **Superadmin** monitoriza desde la consola central.

---

## 4. Tablas Principales de Referencia

- `tenants`: Información de las empresas (nombre, slug, logo, plan).
- `profiles`: Datos de los usuarios y su rol (superadmin, admin, staff).
- `documents`: Metadatos de los archivos PDF cargados.
- `knowledge_base`: Los fragmentos de texto vectorizados que lee la IA.
- `affiliates`: Registro de partners y sus ganancias.

---
*Documento generado automáticamente por Antigravity para la referencia técnica de Lexpats.*
