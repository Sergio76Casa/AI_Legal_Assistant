# 🛡️ Protocolo Maestro de Calidad (Stark QA)

Este documento es el estándar de oro para verificar la integridad técnica, visual y legal de **Legal AI Global**. Cada módulo debe pasar estos protocolos después de cualquier ciclo de refactorización o actualización de núcleo.

---

## 🏗️ Módulo A: Dashboard Industrial (Organización y Dashboard)

### 1. Gestión de Miembros (OrganizationPanel)
- [ ] **Persistencia CRUD**: Crear un nuevo miembro y verificar que aparece instantáneamente en el `MemberDirectory` con su rol correcto.
- [ ] **Animaciones Framer Motion**: Al eliminar un miembro, la fila debe deslizarse suavemente hacia la izquierda (`x: -20, opacity: 0`) antes de desaparecer.
- [ ] **Invitaciones**: Generar una invitación y verificar que el estado pase de `pending` a `active` al "simular" una aceptación en la base de datos.

### 2. Monitor de Cuotas (QuotaMonitor)
- [ ] **Efecto Neón Líquido**: Verificar que la barra de progreso brille con el color del plan (Índigo para Business, Oro para Enterprise).
- [ ] **Lógica de Plan**: Abrir la consola de Supabase, cambiar el límite de casos del tenant y verificar que la UI se actualice sin refrescar la página.

### 3. Analytics de Afiliados (AffiliatePanel)
- [ ] **Precisión de Conversión**: Verificar que el cálculo de `conversionRate` (Registros / Clics Estimados) use el multiplicador x12 definido en el hook.
- [ ] **Gráficos Líquidos**: Inspeccionar los gráficos de Recharts para asegurar que los gradientes `<linearGradient>` tengan IDs únicos y no parpadeen al cambiar de pestaña.

---

## 📡 Módulo B: War Room (Health Monitor)

### 1. Sistema de Latidos (Heartbeats)
- [ ] **Pings Asíncronos**: Observar el panel `War Room`. Todos los servicios (Supabase, IA Engine, Email) deben mostrar el pulso neón verde en condiciones normales.
- [ ] **Force Global Sync**: Pulsar el botón de refresco y verificar que se dispare la animación de barrido de escaneo en todas las tarjetas simultáneamente.

### 2. Simulación de Crisis (Debug Mode)
- [ ] **Fallo Crítico**: En `useHealthCheck.ts`, descomentar el bloque de simulación de error para el "AI Engine". 
- [ ] **Reacción del Sistema**: El panel debe cambiar a Rojo Carmesí instantáneamente. Verificar que se genere una entrada en la terminal de `SystemLogs` con el código de error correspondiente.
- [ ] **Recuperación**: Reestablecer el servicio y verificar que el log registre el evento de "System Recovered".

---

## ✍️ Módulo C: Motor de Firma Mobile-First

### 1. Visor Virtualizado (DocumentViewer)
- [ ] **Virtualized Scrolling**: Cargar un PDF de más de 10 páginas. Hacer scroll rápido y verificar que las páginas se rendericen "on-demand" (Intersection Observer).
- [ ] **Burbuja de Navegación**: Verificar que el indicador flotante "Pag X / Y" aparezca y desaparezca suavemente durante el scroll.
- [ ] **Hardware Acceleration**: En móvil, el scroll no debe presentar "jank" o parpadeos blancos.

### 2. Física de Tinta (SignaturePad)
- [ ] **Simulación de Presión**: Firmar lentamente (trazo grueso) y luego rápidamente (trazo fino). El tapering debe ser fluido y natural.
- [ ] **Contraste Legal**: Verificar que el color de la firma en el lienzo sea **Deep Blue (#000080)**.
- [ ] **Feedback Neón**: Asegurar que alrededor del trazo aparezca el resplandor cian por CSS, pero que no se guarde en la imagen final.

### 3. Certificado de Integridad (Preview Modal)
- [ ] **Capa de Cristal**: Tras firmar, el modal debe aparecer con efecto backdrop-blur.
- [ ] **Validación de Datos**: Comprobar que el SHA-256 Hash y la IP mostrada coincidan con los datos de sesión actuales.

---

## 🔒 Seguridad y Rendimiento Global

- [ ] **RLS Audit**: Intentar acceder a la pestaña `War Room` con una cuenta de usuario básico. El sistema debe denegar el acceso o no mostrar la pestaña.
- [ ] **Mobile Responsive**: Probar en modo "iPhone 12/13" en Chrome DevTools. Ningún panel debe tener desbordamiento horizontal (overflow-x).
- [ ] **Impresión**: Descargar el PDF firmado y verificar que la firma mantenga una resolución de alta densidad al imprimir en escala de grises.

---
> [!IMPORTANT]
> **Nota de Ingenieria**: Este protocolo es obligatorio para cualquier despliegue en rama `main`. El incumplimiento de los estándares estéticos Stark es considerado Deuda Técnica Crítica.
