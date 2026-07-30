-- ============================================
-- Migración Sprint 2 — Catálogos, Kardex, Alertas y Reportes
-- Segura de re-ejecutar sobre una BD que ya corrió schema.sql original
-- ============================================

ALTER TABLE productos ADD COLUMN IF NOT EXISTS foto_url TEXT;

ALTER TABLE movimientos ADD COLUMN IF NOT EXISTS almacen_destino_id INTEGER REFERENCES almacenes(id);

ALTER TABLE movimientos DROP CONSTRAINT IF EXISTS movimientos_tipo_check;
ALTER TABLE movimientos ADD CONSTRAINT movimientos_tipo_check
  CHECK (tipo IN ('entrada', 'salida', 'ajuste', 'transferencia', 'devolucion'));

ALTER TABLE movimientos ALTER COLUMN tipo TYPE VARCHAR(15);
