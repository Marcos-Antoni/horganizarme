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
  work_duration INTEGER NOT NULL DEFAULT 25, -- minutos
  short_break INTEGER NOT NULL DEFAULT 5,    -- minutos
  long_break INTEGER NOT NULL DEFAULT 15,    -- minutos
  sessions_until_long_break INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de sesiones Pomodoro (historial)
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id BIGSERIAL PRIMARY KEY,
  task_id BIGINT REFERENCES tasks(id) ON DELETE SET NULL,
  session_type VARCHAR(20) NOT NULL, -- 'work', 'short_break', 'long_break'
  duration INTEGER NOT NULL, -- minutos
  completed BOOLEAN DEFAULT false,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Tabla de subtareas (mini tareas para Pomodoro)
CREATE TABLE IF NOT EXISTS subtasks (
  id BIGSERIAL PRIMARY KEY,
  task_id BIGINT REFERENCES tasks(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  estimated_minutes INTEGER NOT NULL, -- tiempo estimado en minutos
  completed BOOLEAN DEFAULT false,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(task_date);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_started ON pomodoro_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_completed ON subtasks(completed);

-- Habilitar Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acceso público (para demo)
-- En producción, deberías usar autenticación de Supabase

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

CREATE POLICY "Allow public read access on subtasks"
ON subtasks FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on subtasks"
ON subtasks FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on subtasks"
ON subtasks FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access on subtasks"
ON subtasks FOR DELETE USING (true);

-- Insertar configuración por defecto de Pomodoro
INSERT INTO pomodoro_settings (work_duration, short_break, long_break, sessions_until_long_break)
VALUES (25, 5, 15, 4)
ON CONFLICT DO NOTHING;

-- Comentarios útiles:
-- Para ver las tareas: SELECT * FROM tasks ORDER BY task_date DESC;
-- Para ver subtareas: SELECT * FROM subtasks ORDER BY created_at DESC;
-- Para ver configuración Pomodoro: SELECT * FROM pomodoro_settings;
-- Para ver historial Pomodoro: SELECT * FROM pomodoro_sessions ORDER BY started_at DESC;
