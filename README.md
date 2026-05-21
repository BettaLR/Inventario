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

| Email                    | Password   | Rol          |
|--------------------------|------------|--------------|
| erick@inventario.com     | password   | Admin        |
| pedro@inventario.com     | password   | Gerente      |
| manuel@inventario.com    | password   | Gerente      |
| ana@inventario.com       | password   | Almacenista  |
| carlos@inventario.com    | password   | Almacenista  |

> **Nota:** El hash en seeds.sql es `password`. Antes de producción, regenerar con bcrypt.

## Endpoints disponibles (Sprint 1)

| Método | Ruta            | Auth | Descripción          |
|--------|-----------------|------|----------------------|
| GET    | /health         | No   | Estado del servidor  |
| POST   | /api/auth/login | No   | Login, retorna JWT   |
| GET    | /api/auth/me    | Sí   | Usuario autenticado  |

## Sprints

| Sprint | Fechas          | Módulo                        |
|--------|-----------------|-------------------------------|
| S1     | May 11 - Jun 3  | Autenticación + estructura    |
| S2     | Jun 4 - Jun 17  | Kardex + Reportes PDF         |
| S3     | Jun 18 - Jul 1  | Dashboard + Alertas realtime  |
| S4     | Jul 2 - Jul 15  | Lector QR + Cámara            |
| S5     | Jul 16 - Jul 30 | Testing E2E + Producción      |
