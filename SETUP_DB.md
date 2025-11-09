# Configuración de Supabase

## Ya está configurado y listo para usar

Las credenciales de Supabase ya están en tu archivo `.env.local`. Solo necesitas crear la tabla en Supabase.

## Pasos para crear la tabla de usuarios:

### 1. Crear la tabla en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Haz clic en "SQL Editor" en el menú lateral
3. Clic en "+ New query"
4. Copia el contenido de `db/sql/supabase-schema.sql` o este SQL:

```sql
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a todos
CREATE POLICY "Allow public read access"
ON users FOR SELECT
USING (true);

-- Política para permitir inserción a todos (puedes cambiar esto según tus necesidades)
CREATE POLICY "Allow public insert access"
ON users FOR INSERT
WITH CHECK (true);
```

5. Clic en "Run" o presiona Ctrl+Enter

### 2. Probar la API

```bash
# Crear un usuario
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Marco","email":"marco@example.com"}'

# Obtener usuarios
curl http://localhost:3000/api/users
```

## Desarrollo Local

1. Instala dependencias (ya instaladas):
```bash
npm install
```

2. Las variables de entorno ya están configuradas en `.env.local`

3. Ejecuta el proyecto:
```bash
npm run dev
```

4. Crea la tabla en Supabase usando el SQL de arriba

5. Prueba la API con los comandos curl

## Despliegue a Vercel

1. Sube tu código a GitHub

2. Importa el proyecto en Vercel

3. Agrega las variables de entorno en Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

4. Despliega

## Archivos creados

- `db/db.ts` - Clientes de Supabase (servidor y navegador)
- `db/sql/supabase-schema.sql` - Script SQL para crear las tablas
- `app/api/users/route.ts` - API para manejar usuarios (GET, POST)

## Notas importantes

- Las credenciales ya están configuradas en `.env.local`
- No subas el archivo `.env.local` a git (ya está en `.gitignore`)
- Supabase incluye autenticación, storage, realtime y más funcionalidades
- Puedes ver tus datos en el dashboard de Supabase en la sección "Table Editor"
- Row Level Security (RLS) está habilitado para seguridad
