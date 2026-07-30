-- ============================================
-- Sistema de Control de Inventarios
-- Schema PostgreSQL - Sprint 1
-- ============================================

-- Limpiar si ya existen las tablas (orden inverso por FK)
DROP TABLE IF EXISTS movimientos CASCADE;
DROP TABLE IF EXISTS stock CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS proveedores CASCADE;
DROP TABLE IF EXISTS almacenes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ============================================
-- TABLA 1: roles
-- ============================================
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA 2: usuarios
-- ============================================
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol_id INTEGER NOT NULL REFERENCES roles(id),
  activo BOOLEAN DEFAULT TRUE,
  ultimo_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol_id ON usuarios(rol_id);

-- ============================================
-- TABLA 3: categorias
-- ============================================
CREATE TABLE categorias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA 4: proveedores
-- ============================================
CREATE TABLE proveedores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  contacto VARCHAR(100),
  telefono VARCHAR(20),
  email VARCHAR(150),
  direccion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA 5: almacenes
-- ============================================
CREATE TABLE almacenes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  ubicacion TEXT,
  responsable_id INTEGER REFERENCES usuarios(id),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA 6: productos
-- ============================================
CREATE TABLE productos (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  codigo_barras VARCHAR(100) UNIQUE,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  foto_url TEXT,
  categoria_id INTEGER REFERENCES categorias(id),
  proveedor_id INTEGER REFERENCES proveedores(id),
  unidad_medida VARCHAR(30) DEFAULT 'unidad',
  precio_unitario NUMERIC(12, 2) DEFAULT 0,
  stock_minimo INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_productos_codigo ON productos(codigo);
CREATE INDEX idx_productos_codigo_barras ON productos(codigo_barras);
CREATE INDEX idx_productos_categoria_id ON productos(categoria_id);
CREATE INDEX idx_productos_nombre ON productos USING gin(to_tsvector('spanish', nombre));

-- ============================================
-- TABLA 7: stock
-- ============================================
CREATE TABLE stock (
  id SERIAL PRIMARY KEY,
  producto_id INTEGER NOT NULL REFERENCES productos(id),
  almacen_id INTEGER NOT NULL REFERENCES almacenes(id),
  cantidad INTEGER NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(producto_id, almacen_id)
);

CREATE INDEX idx_stock_producto_id ON stock(producto_id);
CREATE INDEX idx_stock_almacen_id ON stock(almacen_id);

-- ============================================
-- TABLA 8: movimientos (Kardex)
-- ============================================
CREATE TABLE movimientos (
  id SERIAL PRIMARY KEY,
  producto_id INTEGER NOT NULL REFERENCES productos(id),
  almacen_id INTEGER NOT NULL REFERENCES almacenes(id),
  almacen_destino_id INTEGER REFERENCES almacenes(id),
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  tipo VARCHAR(15) NOT NULL CHECK (tipo IN ('entrada', 'salida', 'ajuste', 'transferencia', 'devolucion')),
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  cantidad_anterior INTEGER NOT NULL,
  cantidad_nueva INTEGER NOT NULL,
  motivo VARCHAR(255),
  referencia VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_movimientos_producto_id ON movimientos(producto_id);
CREATE INDEX idx_movimientos_almacen_id ON movimientos(almacen_id);
CREATE INDEX idx_movimientos_usuario_id ON movimientos(usuario_id);
CREATE INDEX idx_movimientos_created_at ON movimientos(created_at DESC);
CREATE INDEX idx_movimientos_tipo ON movimientos(tipo);

-- ============================================
-- FUNCIÓN: actualizar updated_at automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trg_productos_updated_at
  BEFORE UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trg_stock_updated_at
  BEFORE UPDATE ON stock
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
