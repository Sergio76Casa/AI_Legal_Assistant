# ⚡ Módulo de Compliance Eléctrico y Eficiencia para Gestorías

Este documento detalla el plan de integración del nuevo módulo técnico diseñado para que las gestorías gestionen la normativa de industria y eficiencia energética de sus clientes de forma automatizada.

---

## 1. Mapeo de Capacidades Existentes
Reutilizaremos el motor actual de Lexpats para acelerar el desarrollo:
- **Motor OCR (Google Gemini)**: Para leer facturas de luz y extraer CUPS, Potencia, Excesos de Reactiva y fechas de Boletines (CIE).
- **Sistema RAG**: Para que el gestor pueda preguntar: *"¿Qué normativa aplica a un restaurante en Cataluña para la revisión OCA?"*.
- **Arquitectura Multi-tenant**: Separación total entre carteras de clientes de distintas gestorías.

---

## 2. Nueva Estructura de Datos (Supabase)

Añadiremos estas tablas para gestionar los activos técnicos:

### A. Tabla `electrical_assets`
- `id`: Identificador único.
- `tenant_id`: Vinculación con la organización cliente.
- `cups`: Código Universal de Punto de Suministro (Clave para monitorización).
- `oca_expiry`: Fecha de la próxima inspección técnica obligatoria.
- `cie_expiry`: Fecha de caducidad del Boletín Eléctrico.
- `status`: Estado del semáforo (ok, warning, critical).

### B. Tabla `energy_tickets`
- Vinculada a los activos para rastrear multas de industria o recomendaciones de ahorro generadas por la IA.

---

## 3. Capa de IA Multilingüe (Gestión de Notificaciones)
El módulo usará Gemini para procesar notificaciones de la Administración (Industria):
1. **Detección**: El sistema identifica una notificación de "Inspección Favorable con Defectos".
2. **Resumen**: Extrae los defectos técnicos que el cliente debe arreglar.
3. **Traducción**: Genera automáticamente un informe en **Mandarín, Árabe o Urdu** para que el dueño del negocio (cliente de la gestoría) entienda exactamente qué cable o cuadro debe reparar para evitar la multa.

---

## 4. Interfaz: El "Semáforo de Riesgo" (Dashboard White Label)
Un dashboard centralizado para el gestor con:
- **Widget de Alertas**: Un contador de CIEs/OCAs caducadas.
- **Top Ahorro**: Lista de clientes que tienen contratada más potencia de la que usan realmente (detectado por la IA al leer facturas).
- **Ficha Técnica**: Vista rápida de cada punto de suministro con sus fotos de cuadros eléctricos y documentos legales.

---

## 5. Integración en la Navegación
- **Menú Superadmin**: Nueva pestaña "Compliance Global".
- **Menú Tenant**: Nueva pestaña "Eficiencia & Industria" situada entre "Chat" y "Documentos".

---
*Este plan sigue la directriz de arquitectura de componentes modulares de menos de 300 líneas de código.*
