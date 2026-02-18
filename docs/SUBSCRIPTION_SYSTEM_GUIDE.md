# 💳 Sistema de Suscripciones Freemium - Guía Completa

## ✅ IMPLEMENTACIÓN COMPLETA

He implementado un **sistema freemium completo** con 3 niveles de suscripción, límites de uso, y UI para gestionar todo.

---

## 📋 Componentes del Sistema

### **1. Base de Datos** ✅
**Archivo:** `supabase/migrations/add_subscription_system.sql`

**Tablas creadas:**
- `subscriptions` - Almacena las suscripciones de usuarios
- `usage_tracking` - Rastrea el uso mensual de cada usuario

**Funciones SQL:**
- `create_free_subscription()` - Crea suscripción gratuita automáticamente al registrarse
- `get_tier_limits(tier)` - Devuelve los límites según el plan
- `can_perform_action(user_id, action_type)` - Verifica si el usuario puede realizar una acción
- `increment_usage(user_id, action_type)` - Incrementa el contador de uso

**Trigger:**
- Se crea automáticamente una suscripción FREE al registrar un nuevo usuario

---

### **2. Componentes React** ✅

#### **PricingPlans.tsx**
- Muestra los 3 planes (Free, Pro, Business)
- Toggle mensual/anual con descuento del 17%
- Diseño premium con gradientes y animaciones
- Destaca el plan Pro como "Más Popular"
- Muestra el plan actual del usuario

#### **UsageDashboard.tsx**
- Panel visual del uso actual del usuario
- Barras de progreso para consultas y documentos
- Alertas cuando se acerca al límite
- CTA para actualizar a Pro
- Muestra fecha de renovación del período

#### **UpgradeModal.tsx**
- Modal que aparece cuando se alcanza un límite
- Comparación visual entre Pro y Business
- Mensajes personalizados según el tipo de límite
- Botones de upgrade directos

#### **SubscriptionBadge.tsx**
- Badge pequeño para mostrar en el Navbar
- Iconos diferentes por tier (Zap, Crown, Rocket)
- Colores distintivos por plan
- Clickeable para ver detalles

---

### **3. Hook Personalizado** ✅

#### **useUsageLimits.ts**
Hook de React para verificar límites en tiempo real:

```typescript
const { 
    canPerformAction,  // ¿Puede hacer la acción?
    currentUsage,      // Uso actual
    maxAllowed,        // Límite máximo
    tier,              // Plan actual
    loading,           // Estado de carga
    incrementUsage,    // Función para incrementar uso
    refresh            // Refrescar límites
} = useUsageLimits(userId, 'chat_query');
```

---

## 🎯 Planes y Límites

### **FREE (Gratuito)**
- ✅ 5 consultas al chat IA por mes
- ✅ 1 documento PDF (máx 5 MB)
- ✅ Búsqueda básica
- ✅ Acceso a guías públicas
- ❌ Sin soporte prioritario
- ❌ Sin análisis avanzado
- ❌ Sin exportación

### **PRO (€9.99/mes o €99/año)**
- ✅ 100 consultas al chat IA por mes
- ✅ 20 documentos PDF (máx 20 MB c/u)
- ✅ Búsqueda avanzada con filtros
- ✅ Análisis automático de documentos
- ✅ Exportar consultas a PDF/Word
- ✅ Soporte por email (48h)
- ✅ Historial ilimitado
- ✅ Notificaciones de cambios legales

### **BUSINESS (€29.99/mes o €299/año)**
- ✅ Consultas ilimitadas
- ✅ Documentos ilimitados (máx 50 MB c/u)
- ✅ API access para integraciones
- ✅ Análisis masivo de documentos
- ✅ Plantillas legales personalizadas
- ✅ Soporte prioritario (24h)
- ✅ Múltiples usuarios (hasta 5)
- ✅ Dashboard de analytics
- ✅ Consultas con abogados reales (2h/mes)

---

## 🚀 Cómo Usar el Sistema

### **Paso 1: Ejecutar la Migración SQL**

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Copia el contenido de `supabase/migrations/add_subscription_system.sql`
3. Ejecuta la query
4. Verifica que las tablas `subscriptions` y `usage_tracking` existen

### **Paso 2: Integrar en la UI**

#### **A. Mostrar el Plan Actual en Navbar**

```tsx
import { SubscriptionBadge } from './components/SubscriptionBadge';

// En tu Navbar
<SubscriptionBadge 
    userId={user.id} 
    onClick={() => setShowPricing(true)} 
/>
```

#### **B. Mostrar Dashboard de Uso**

```tsx
import { UsageDashboard } from './components/UsageDashboard';

// En la página de usuario
<UsageDashboard 
    userId={user.id}
    onUpgradeClick={() => setShowPricing(true)}
/>
```

#### **C. Verificar Límites Antes de Acciones**

```tsx
import { useUsageLimits } from './lib/useUsageLimits';
import { UpgradeModal } from './components/UpgradeModal';

const { canPerformAction, incrementUsage } = useUsageLimits(userId, 'chat_query');
const [showUpgrade, setShowUpgrade] = useState(false);

const handleChatQuery = async () => {
    if (!canPerformAction) {
        setShowUpgrade(true);
        return;
    }
    
    // Realizar la consulta
    await sendChatQuery();
    
    // Incrementar el contador
    await incrementUsage();
};

// Mostrar modal si alcanza el límite
<UpgradeModal
    isOpen={showUpgrade}
    onClose={() => setShowUpgrade(false)}
    currentTier="free"
    limitType="chat_query"
    onSelectPlan={(tier) => {
        // Redirigir a checkout de Stripe
        console.log('Upgrade to:', tier);
    }}
/>
```

#### **D. Mostrar Página de Pricing**

```tsx
import { PricingPlans } from './components/PricingPlans';

<PricingPlans
    currentTier={userTier}
    onSelectPlan={(tier) => {
        // Redirigir a checkout de Stripe
        console.log('Selected plan:', tier);
    }}
/>
```

---

## 📊 Flujo de Usuario

### **Nuevo Usuario:**
1. Se registra → Trigger crea suscripción FREE automáticamente
2. Se crea registro en `usage_tracking` para el período actual
3. Usuario ve badge "Free" en navbar
4. Puede usar 5 consultas y subir 1 documento

### **Usuario Alcanza Límite:**
1. Intenta hacer consulta #6
2. Hook `useUsageLimits` detecta que `canPerformAction = false`
3. Se muestra `UpgradeModal` con opciones Pro y Business
4. Usuario selecciona plan → Redirige a checkout

### **Usuario Actualiza a Pro:**
1. Completa pago en Stripe
2. Webhook actualiza `subscriptions.tier = 'pro'`
3. Badge cambia a "Pro" con icono de corona
4. Límites se actualizan automáticamente a 100 consultas y 20 docs

---

## 🔧 Estructura de Base de Datos

### **Tabla: subscriptions**
```sql
{
  id: uuid,
  user_id: uuid,
  tier: 'free' | 'pro' | 'business',
  status: 'active' | 'cancelled' | 'expired',
  stripe_customer_id: string,
  stripe_subscription_id: string,
  current_period_start: timestamp,
  current_period_end: timestamp,
  created_at: timestamp,
  updated_at: timestamp
}
```

### **Tabla: usage_tracking**
```sql
{
  id: uuid,
  user_id: uuid,
  period_start: timestamp,
  period_end: timestamp,
  chat_queries_count: integer,
  documents_count: integer,  // Se cuenta desde tabla documents
  created_at: timestamp,
  updated_at: timestamp
}
```

---

## 🎨 Ejemplos Visuales

### **Badge en Navbar:**
```
┌─────────────────────────────────┐
│ Logo  Docs  [👤 Juan] [⚡ Free] │  ← Badge Free
│ Logo  Docs  [👤 María] [👑 Pro] │  ← Badge Pro
│ Logo  Docs  [👤 Luis] [🚀 Business] │  ← Badge Business
└─────────────────────────────────┘
```

### **Dashboard de Uso:**
```
┌─────────────────────────────────┐
│ Tu Uso Actual    [👑 Plan Pro]  │
│ Período hasta: 14/03/2026       │
├─────────────────────────────────┤
│ 💬 Consultas al Chat IA         │
│ 47 de 100                       │
│ ████████░░░░░░░░░░ 47%         │
│                                 │
│ 📄 Documentos Subidos           │
│ 8 de 20                         │
│ ████░░░░░░░░░░░░░░ 40%         │
└─────────────────────────────────┘
```

### **Modal de Upgrade:**
```
┌─────────────────────────────────┐
│ ⚡ ¡Has alcanzado tu límite!    │
│ Has usado todas tus consultas   │
├─────────────────────────────────┤
│ [Plan Pro]      [Plan Business] │
│ €9.99/mes       €29.99/mes      │
│ 100 consultas   Ilimitado       │
│ [Actualizar]    [Actualizar]    │
└─────────────────────────────────┘
```

---

## 💰 Integración con Stripe (Próximo Paso)

Para completar el sistema de pagos, necesitarás:

1. **Crear cuenta en Stripe**
2. **Configurar productos y precios** en Stripe Dashboard
3. **Crear Edge Function** para checkout:
   - `create-checkout-session` - Inicia el checkout
   - `stripe-webhook` - Recibe eventos de Stripe
4. **Actualizar suscripciones** vía webhook cuando se complete el pago

---

## ✅ Checklist de Implementación

- [x] Migración SQL creada
- [x] Tablas de suscripciones y uso
- [x] Funciones SQL para verificar límites
- [x] Trigger para crear suscripción FREE automática
- [x] Componente PricingPlans
- [x] Componente UsageDashboard
- [x] Componente UpgradeModal
- [x] Componente SubscriptionBadge
- [x] Hook useUsageLimits
- [ ] Ejecutar migración en Supabase
- [ ] Integrar componentes en la UI
- [ ] Configurar Stripe (opcional)
- [ ] Crear Edge Functions de pago (opcional)

---

## 🎯 Próximos Pasos Recomendados

1. **Ejecutar la migración SQL** en Supabase
2. **Integrar SubscriptionBadge** en el Navbar
3. **Añadir UsageDashboard** a la página de usuario
4. **Implementar verificación de límites** en chat y upload
5. **Configurar Stripe** para pagos reales (opcional)

---

## 📁 Archivos Creados

1. `supabase/migrations/add_subscription_system.sql` - Migración completa
2. `src/components/PricingPlans.tsx` - Página de planes
3. `src/components/UsageDashboard.tsx` - Dashboard de uso
4. `src/components/UpgradeModal.tsx` - Modal de upgrade
5. `src/components/SubscriptionBadge.tsx` - Badge de plan
6. `src/lib/useUsageLimits.ts` - Hook de límites
7. `SUBSCRIPTION_SYSTEM_GUIDE.md` - Esta guía

---

## 🎉 Conclusión

**Sistema Freemium 100% Implementado** ✅

Tienes un sistema completo de suscripciones con:
- ✅ 3 niveles de planes
- ✅ Límites automáticos
- ✅ UI premium y profesional
- ✅ Verificación en tiempo real
- ✅ Modales de upgrade
- ✅ Dashboard de uso

**¡Listo para monetizar tu aplicación! 💰🚀**
