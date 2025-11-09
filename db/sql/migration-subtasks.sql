-- Migración: Agregar tabla de subtasks
-- Ejecuta SOLO este script si ya tienes las tablas anteriores creadas

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
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_completed ON subtasks(completed);

-- Habilitar Row Level Security (RLS)
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acceso público (para demo)
CREATE POLICY "Allow public read access on subtasks"
ON subtasks FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on subtasks"
ON subtasks FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on subtasks"
ON subtasks FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access on subtasks"
ON subtasks FOR DELETE USING (true);
