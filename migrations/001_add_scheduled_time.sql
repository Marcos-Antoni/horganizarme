-- Migración: Agregar campo scheduled_time a las tablas tasks y subtasks
-- Fecha: 2025-11-09
-- Descripción: Permite asignar una hora programada a las tareas y subtareas
--              para resaltarlas en tiempo real en el Pomodoro

-- Agregar columna scheduled_time a la tabla tasks
-- Tipo: TIME (solo hora, sin fecha)
-- Permite NULL (opcional, no todas las tareas tienen hora programada)
ALTER TABLE tasks
ADD COLUMN scheduled_time TIME;

-- Agregar columna scheduled_time a la tabla subtasks
-- Tipo: TIME (solo hora, sin fecha)
-- Permite NULL (opcional, no todas las subtareas tienen hora programada)
ALTER TABLE subtasks
ADD COLUMN scheduled_time TIME;

-- Comentarios para las columnas
COMMENT ON COLUMN tasks.scheduled_time IS 'Hora programada para ejecutar la tarea (formato HH:mm)';
COMMENT ON COLUMN subtasks.scheduled_time IS 'Hora programada para ejecutar la subtarea (formato HH:mm)';
