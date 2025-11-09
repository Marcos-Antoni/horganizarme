# Instrucciones de Configuración Rápida

## 1. Ejecutar el SQL en Supabase

Ve a tu [Supabase Dashboard](https://supabase.com/dashboard) y ejecuta el siguiente SQL:

```sql
-- Script para crear las tablas de Horganizar en Supabase
-- Copia y pega esto en el SQL Editor de Supabase

-- Tabla de tareas
CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  task_date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de configuración de Pomodoro
CREATE TABLE IF NOT EXISTS pomodoro_settings (
  id BIGSERIAL PRIMARY KEY,
  work_duration INTEGER NOT NULL DEFAULT 25,
  short_break INTEGER NOT NULL DEFAULT 5,
  long_break INTEGER NOT NULL DEFAULT 15,
  sessions_until_long_break INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de sesiones Pomodoro (historial)
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id BIGSERIAL PRIMARY KEY,
  task_id BIGINT REFERENCES tasks(id) ON DELETE SET NULL,
  session_type VARCHAR(20) NOT NULL,
  duration INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(task_date);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_started ON pomodoro_sessions(started_at);

-- Habilitar Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acceso público (para demo)
CREATE POLICY "Allow public read access on tasks"
ON tasks FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on tasks"
ON tasks FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on tasks"
ON tasks FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access on tasks"
ON tasks FOR DELETE USING (true);

CREATE POLICY "Allow public read access on pomodoro_settings"
ON pomodoro_settings FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on pomodoro_settings"
ON pomodoro_settings FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on pomodoro_settings"
ON pomodoro_settings FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on pomodoro_sessions"
ON pomodoro_sessions FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on pomodoro_sessions"
ON pomodoro_sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on pomodoro_sessions"
ON pomodoro_sessions FOR UPDATE USING (true);

-- Insertar configuración por defecto de Pomodoro
INSERT INTO pomodoro_settings (work_duration, short_break, long_break, sessions_until_long_break)
VALUES (25, 5, 15, 4)
ON CONFLICT DO NOTHING;
```

## 2. Ejecutar la aplicación

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 3. Usa la aplicación

- **Calendario**: Haz clic en cualquier día para ver/crear tareas
- **Tareas**: Agrega, completa o elimina tareas del día seleccionado
- **Pomodoro**:
  - Haz clic en "Iniciar" para comenzar una sesión de trabajo
  - Cambia la configuración con el ícono de engranaje
  - El temporizador cambia automáticamente entre trabajo y descansos

¡Listo para usar!
