# Horganizar

Aplicación web para organizar tu tiempo con calendario, lista de tareas y temporizador Pomodoro. Construida con Next.js y Supabase.

## Características

- **Calendario interactivo**: Visualiza tus tareas por día con indicadores visuales
- **Gestión de tareas**: Crea, edita, completa y elimina tareas diarias
- **Temporizador Pomodoro**: Aumenta tu productividad con sesiones de trabajo personalizables
  - Configuración editable de tiempos de trabajo y descanso
  - Descansos automáticos después de cada sesión
  - Historial de sesiones guardado en la base de datos

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
# Copia las credenciales de Supabase a .env.local

# 3. Crear las tablas en Supabase
# Ejecuta el script db/sql/supabase-schema.sql en el SQL Editor de Supabase

# 4. Ejecutar en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Configuración

Ver [SETUP_DB.md](SETUP_DB.md) para instrucciones detalladas de configuración de Supabase.

### Variables de entorno requeridas

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Estructura del proyecto

```
horganizar/
├── app/
│   ├── api/
│   │   ├── tasks/              # CRUD de tareas
│   │   ├── pomodoro/
│   │   │   ├── settings/       # Configuración Pomodoro
│   │   │   └── sessions/       # Historial de sesiones
│   │   └── users/              # Usuarios (ejemplo)
│   ├── layout.tsx
│   └── page.tsx                # Página principal
├── components/
│   ├── Calendar.tsx            # Componente de calendario
│   ├── TaskList.tsx            # Lista de tareas
│   └── PomodoroTimer.tsx       # Temporizador Pomodoro
├── db/
│   ├── db.ts                   # Clientes de Supabase
│   └── sql/
│       └── supabase-schema.sql # Schema completo de la DB
├── types/
│   └── index.ts                # Tipos TypeScript
├── .env.local                  # Variables de entorno (no se sube a git)
└── SETUP_DB.md                 # Guía de configuración de Supabase
```

## Base de datos

Este proyecto usa Supabase como base de datos PostgreSQL.

### Tablas

- `tasks` - Tareas diarias con fecha, título, descripción y estado
- `pomodoro_settings` - Configuración del temporizador Pomodoro
- `pomodoro_sessions` - Historial de sesiones completadas

### Crear tablas

1. Ve al [Supabase SQL Editor](https://supabase.com/dashboard)
2. Ejecuta el script en `db/sql/supabase-schema.sql`

### API Endpoints

**Tareas:**
- `GET /api/tasks?date=YYYY-MM-DD` - Obtener tareas (opcionalmente filtradas por fecha)
- `POST /api/tasks` - Crear nueva tarea
- `PATCH /api/tasks/[id]` - Actualizar tarea
- `DELETE /api/tasks/[id]` - Eliminar tarea

**Pomodoro:**
- `GET /api/pomodoro/settings` - Obtener configuración
- `PATCH /api/pomodoro/settings` - Actualizar configuración
- `GET /api/pomodoro/sessions` - Obtener historial de sesiones
- `POST /api/pomodoro/sessions` - Crear nueva sesión

## Tecnologías

- **Framework**: Next.js 16 con App Router
- **Base de datos**: Supabase (PostgreSQL)
- **Estilos**: Tailwind CSS
- **UI**: Componentes personalizados con Lucide React icons
- **Fechas**: date-fns
- **Lenguaje**: TypeScript

## Despliegue

El proyecto está configurado para desplegarse en Vercel:

1. Sube el código a GitHub
2. Importa el proyecto en Vercel
3. Agrega las variables de entorno de Supabase
4. Despliega

La base de datos de Supabase ya está lista para producción.

Ver [SETUP_DB.md](SETUP_DB.md) para más detalles.
