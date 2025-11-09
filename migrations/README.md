# Migraciones de Base de Datos

Esta carpeta contiene las migraciones SQL para la base de datos de Horganizar.

## Cómo ejecutar las migraciones

### Opción 1: Desde la interfaz de Supabase (Recomendado)

1. Ir a [app.supabase.com](https://app.supabase.com)
2. Seleccionar tu proyecto
3. Ir a **SQL Editor** en el menú lateral
4. Copiar y pegar el contenido del archivo de migración
5. Ejecutar la consulta

### Opción 2: Usando psql (línea de comandos)

```bash
psql -h db.your-project.supabase.co -U postgres -d postgres -f migrations/001_add_scheduled_time.sql
```

## Migraciones disponibles

### 001_add_scheduled_time.sql
- **Fecha:** 2025-11-09
- **Descripción:** Agrega el campo `scheduled_time` a las tablas `tasks` y `subtasks`
- **Propósito:** Permite programar tareas/subtareas a horas específicas para resaltarlas en tiempo real en el Pomodoro

**Campos agregados:**
- `tasks.scheduled_time` (TIME, NULL)
- `subtasks.scheduled_time` (TIME, NULL)

## Rollback

Si necesitas revertir una migración, ejecuta:

```sql
-- Rollback de 001_add_scheduled_time.sql
ALTER TABLE tasks DROP COLUMN scheduled_time;
ALTER TABLE subtasks DROP COLUMN scheduled_time;
```

## Notas

- Las migraciones se numeran secuencialmente (001, 002, etc.)
- Siempre ejecuta las migraciones en orden
- Mantén un registro de qué migraciones has aplicado a cada entorno
