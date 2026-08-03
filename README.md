# Sistema de Control de Inventarios

Stack: React 19 + Vite | Node.js + Express | PostgreSQL  
Equipo: Erick Guerra, Pedro Diaz, Manuel Cano

## Estructura

```
Inventario/
├── backend/      # API REST con Node.js + Express + JWT
└── frontend/     # SPA con React 19 + Vite + Tailwind CSS
```

## Requisitos

- Node.js 18+
- PostgreSQL 15+

## Setup inicial (una sola vez)

### 1. Base de datos

```bash
# Crear la base de datos en PostgreSQL
psql -U postgres -c "CREATE DATABASE inventario_db;"

# Ejecutar el schema (8 tablas)
psql -U postgres -d inventario_db -f backend/database/schema.sql

# Cargar datos de prueba
psql -U postgres -d inventario_db -f backend/database/seeds.sql
```

> Si ya tenías la base de datos creada antes del Sprint 2, aplica la migración en vez de recrear todo:
> ```bash
> psql -U postgres -d inventario_db -f backend/database/migration_sprint2.sql
> ```
>
> Si ya tenías la base de datos creada antes del Sprint 3 (proveedor en movimientos de entrada + auditoría), aplica:
> ```bash
> psql -U postgres -d inventario_db -f backend/database/migration_sprint3.sql
> ```

> **Nota:** la base de datos es PostgreSQL. Un cambio temporal a SQLite embebido (pensado para simplificar el deploy en Vercel) se revirtió porque rompía el bloqueo de fila (`FOR UPDATE`) que protege el stock ante movimientos concurrentes y varias queries con comparaciones `boolean = integer` que no son válidas en Postgres. Para desplegar en Vercel, usa una instancia Postgres administrada (Neon, Supabase, etc.) y configura sus credenciales como variables de entorno.

### 2. Backend

```bash
cd backend
cp .env.example .env      # Editar con tus credenciales de PostgreSQL
npm install
npm run dev               # Corre en http://localhost:3000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev               # Corre en http://localhost:5173
```

## Usuarios de prueba (seeds)

| Email                      | Password    | Rol            |
|-----------------------------|-------------|----------------|
| admin@inventario.com       | Admin123!   | Administrador  |
| almacen@inventario.com     | Admin123!   | Almacenista    |
| cliente@inventario.com     | Admin123!   | Cliente        |

> **Nota:** Antes de producción, regenerar los hashes de seeds.sql con contraseñas propias.

## Respaldo de la base de datos

```bash
cd backend
npm run db:backup        # respaldo manual con pg_dump a backend/database/backups/
```

Mientras el servidor corre como proceso persistente (`npm run dev` / `npm start`), un job interno (`node-cron`) ejecuta este mismo respaldo todos los días a las 3:00 AM y conserva los últimos 14 días. En despliegues serverless (Vercel) este cron no aplica — usa el respaldo automático que ofrezca tu proveedor de Postgres administrado (Neon, Supabase, etc.).
w
## Endpoints disponibles

| Método | Ruta                                      | Auth  | Descripción                          |
|--------|-------------------------------------------|-------|---------------------------------------|
| GET    | /health                                   | No    | Estado del servidor                   |
| POST   | /api/auth/login                           | No    | Login, retorna JWT                    |
| GET    | /api/auth/me                               | Sí    | Usuario autenticado                   |
| GET/POST/PUT/DELETE | /api/productos                | Sí    | CRUD de productos                     |
| GET    | /api/productos/codigo/:codigo              | Sí    | Buscar producto por SKU/código barras |
| GET/POST/PUT/DELETE | /api/proveedores               | Sí    | CRUD de proveedores + historial compras |
| GET/POST/PUT/DELETE | /api/almacenes                 | Sí    | CRUD de almacenes                     |
| GET/POST/PUT/DELETE | /api/categorias                | Sí    | CRUD de categorías                    |
| GET    | /api/movimientos                           | Sí    | Kardex (filtrable por producto/almacén/tipo) |
| POST   | /api/movimientos                           | Sí    | Registrar entrada/salida/ajuste/transferencia/devolución |
| GET    | /api/dashboard/stats                       | Sí    | Métricas del dashboard                |
| GET    | /api/reportes/inventario-valorizado        | Sí    | Inventario valorizado (JSON)          |
| GET    | /api/reportes/inventario-valorizado/pdf    | Sí    | Exportar a PDF                        |
| GET    | /api/reportes/inventario-valorizado/excel  | Sí    | Exportar a Excel                      |
| GET    | /api/reportes/rotacion                     | Sí    | Rotación de productos                 |
| GET    | /api/reportes/mermas                       | Sí    | Mermas (ajustes que reducen stock)    |
| GET    | /api/reportes/alertas-stock                | Sí    | Productos bajo stock mínimo           |
| GET/PATCH | /api/usuarios                           | Sí (Admin) | Gestión de usuarios              |

## Sprints

| Sprint | Fechas          | Módulo                        |
|--------|-----------------|-------------------------------|
| S1     | May 11 - Jun 3  | Autenticación + estructura    |
| S2     | Jun 4 - Jun 17  | Kardex + Reportes PDF         |
| S3     | Jun 18 - Jul 1  | Dashboard + Alertas realtime  |
| S4     | Jul 2 - Jul 15  | Lector QR + Cámara            |
| S5     | Jul 16 - Jul 30 | Testing E2E + Producción      |
