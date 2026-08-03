-- ============================================
-- Migración Sprint 3 — Proveedor en movimientos de entrada + Auditoría
-- Segura de re-ejecutar sobre una BD que ya corrió schema.sql/migration_sprint2.sql
-- ============================================

ALTER TABLE movimientos ADD COLUMN IF NOT EXISTS proveedor_id INTEGER REFERENCES proveedores(id);
CREATE INDEX IF NOT EXISTS idx_movimientos_proveedor_id ON movimientos(proveedor_id);

-- ============================================
-- TABLA: auditoria
-- Registra quién hizo cada cambio de CRUD sobre los catálogos
-- (los movimientos de Kardex ya se auditan vía movimientos.usuario_id)
-- ============================================
CREATE TABLE IF NOT EXISTS auditoria (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  entidad VARCHAR(50) NOT NULL,
  entidad_id INTEGER NOT NULL,
  accion VARCHAR(10) NOT NULL CHECK (accion IN ('crear', 'actualizar', 'eliminar')),
  detalle JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auditoria_entidad ON auditoria(entidad, entidad_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario_id ON auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_created_at ON auditoria(created_at DESC);
