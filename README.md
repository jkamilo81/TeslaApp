# TeslaApp — Pet Tracker PWA

Aplicación PWA para el seguimiento de salud, gastos y cuidado de mascotas con soporte multi-usuario mediante grupos familiares. Actualmente gestiona a **Tesla** (perro) y **Figo** (gato).

## Stack

- **Next.js 16** (App Router)
- **Supabase** (PostgreSQL, Auth, Storage, RLS)
- **Tailwind CSS v4** con sistema de diseño "Gentle Guardian"
- **Web Push API** para notificaciones
- **TypeScript**

## Funcionalidades

### Grupos Familiares (`/familia`)
- Modelo multi-usuario: las mascotas pertenecen a una familia, no a un usuario individual
- Al primer login se crea automáticamente una familia y se asigna al usuario como admin
- Sistema de invitación por código de 8 caracteres (válido 7 días)
- Roles: admin (invitar/eliminar miembros) y miembro (lectura/escritura de datos)
- Todas las políticas RLS filtran por membresía familiar
- Gestión de miembros desde la página `/familia`

### Dashboard (`/`)
- Tarjetas dinámicas de mascotas (cargadas desde la DB según la familia)
- Alertas de vencimientos próximos (seguro, vacunas, parásitos, certificados)
- Próximas citas veterinarias
- Acceso directo a Historial Médico y Centro de Gastos
- FAB con speed dial para navegación rápida

### Perfiles de Mascota (`/tesla`, `/figo`)
Cada mascota tiene secciones con formularios CRUD completos:
- **Seguro** — póliza, fechas, proveedor
- **Vacunas** — con foto comprobante adjunta (JPEG/PNG)
- **Control de Parásitos** — producto, tipo, fechas
- **Certificados** — tipo, autoridad emisora, número
- **Citas Veterinarias** — motivo, fecha/hora, clínica, estado
- **Exámenes de Laboratorio** — nombre, fecha, veterinario, archivo adjunto (PDF/imagen)
- **Compras de Alimento** — marca, cantidad, unidad (kg/unidades), fecha

Todos los formularios incluyen:
- **Campo de costo (COP)** — opcional en la mayoría, requerido en alimento
- **Distribución de pagos** — asigna montos por pagador cuando hay costo
- **Archivos adjuntos** — en exámenes de laboratorio y vacunas vía Supabase Storage

### Centro de Gastos (`/gastos`)
- Filtro por mascota (Todos, Tesla, Figo)
- Selector de rango de fechas
- Total del período en COP
- Desglose por categoría con barras de progreso
- Desglose por pagador
- Estado vacío cuando no hay gastos

### Historial Médico (`/historial`)
- Timeline cronológica de todos los registros
- Filtros por tipo (vacuna, seguro, parásitos, certificado, cita, examen, alimento)
- Agrupación por mes

### Notificaciones Push
- Recordatorio automático **3 días** y **1 día** antes de citas veterinarias programadas
- Notificaciones enviadas a todos los miembros de la familia de la mascota
- Deduplicación vía `notification_log` (no envía duplicados)
- Limpieza automática de suscripciones inválidas
- Alertas de vencimiento de seguro, vacunas y parásitos (30 días)

### Autenticación
- Login con email/contraseña vía Supabase Auth
- Middleware protege todas las rutas (redirige a `/login` si no hay sesión)
- Callback de auth crea familia automáticamente en primer login

## Base de Datos

### Tablas principales
- `families` — grupos familiares
- `family_members` — membresía con roles (admin/member)
- `family_invitations` — códigos de invitación con expiración
- `pets` — mascotas (vinculadas a familia vía `family_id`)
- `insurance`, `vaccines`, `parasite_control`, `service_certificates`, `vet_appointments` — registros médicos
- `lab_exams` — exámenes de laboratorio con archivo adjunto
- `food_purchases` — compras de alimento
- `payers` — pagadores (vinculados a familia)
- `payment_distributions` — distribución de pagos por registro
- `notification_log` — deduplicación de notificaciones
- `push_subscriptions` — suscripciones push (con `family_id`)

### RLS (Row Level Security)
- Todas las tablas de datos filtran por membresía familiar
- Patrón: `family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())`
- Tablas con `pet_id` filtran a través de `pets.family_id`
- `family_members`: INSERT/DELETE solo para admins
- `notification_log`: solo accesible por service role (cron)

### Storage
- Bucket privado `pet-documents` con RLS por familia
- Tipos aceptados: JPEG, PNG, PDF (máx. 10 MB)
- URLs firmadas con expiración de 1 hora
- Path: `{pet_id}/{tipo_registro}/{registro_id}/{nombre_archivo}`

### Migraciones
```
supabase/migrations/
├── 20260326000001_pet_tracker_schema.sql      # Esquema base
├── 20260326000002_auth_and_rls.sql            # Auth y RLS original
├── 20260326000003_disable_rls_temp.sql        # RLS deshabilitado (temporal)
├── 20260327000001_enhanced_tracking.sql       # Tablas de tracking extendido
├── 20260327000002_enhanced_rls.sql            # RLS para tablas nuevas
├── 20260327000003_storage_bucket.sql          # Bucket de Storage
├── 20260328000001_family_groups_schema.sql    # Tablas de familias + migración de datos
└── 20260328000002_family_groups_rls.sql       # RLS basado en familia (reemplaza todo)
```

## Estructura del Proyecto

```
pet-tracker/
├── app/
│   ├── page.tsx              # Dashboard (dinámico)
│   ├── tesla/page.tsx        # Perfil Tesla
│   ├── figo/page.tsx         # Perfil Figo
│   ├── gastos/page.tsx       # Centro de Gastos
│   ├── historial/page.tsx    # Historial Médico
│   ├── familia/page.tsx      # Gestión de familia
│   ├── login/                # Login
│   └── api/
│       ├── family/
│       │   ├── invite/       # POST — generar código de invitación
│       │   ├── join/         # POST — unirse con código
│       │   └── members/      # GET — listar, DELETE — eliminar miembro
│       ├── reminders/        # Cron diario de notificaciones
│       └── push/             # Subscribe y send push
├── components/
│   ├── PetPage.tsx           # Componente principal de perfil
│   ├── CostInput.tsx         # Input de costo COP
│   ├── FileUpload.tsx        # Carga de archivos
│   ├── PaymentSplit.tsx      # Distribución de pagos
│   ├── RecordCard.tsx        # Tarjeta de registro
│   ├── Modal.tsx             # Modal de formulario
│   ├── BottomNav.tsx         # Navegación inferior
│   ├── Header.tsx            # Header
│   └── StatusBadge.tsx       # Badge de estado
├── lib/
│   ├── format.ts             # formatCOP
│   ├── storage.ts            # Upload, delete, signed URLs
│   ├── supabase.ts           # Cliente browser
│   ├── supabase-server.ts    # Cliente server (service role)
│   └── notifications.ts      # Utilidades de notificaciones
├── types/
│   └── database.types.ts     # Tipos de Supabase
└── supabase/
    └── migrations/           # Migraciones SQL
```

## Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

## Desarrollo

```bash
npm install
npm run dev
```

Para aplicar migraciones a Supabase:
```bash
npx supabase db push
```

## Deploy

Desplegado en Vercel con cron job diario a las 8am para notificaciones (`/api/reminders`).

Las variables de entorno deben configurarse en el dashboard de Vercel (Settings → Environment Variables).
