-- ============================================
-- Migración Sprint 4
-- Ubicación física (estante/rack) por producto dentro de cada almacén
-- + módulo de escaneo QR/código de barras móvil
-- ============================================

ALTER TABLE stock ADD COLUMN IF NOT EXISTS ubicacion VARCHAR(50);

COMMENT ON COLUMN stock.ubicacion IS 'Posición física dentro del almacén (ej. Rack A-3, Estante 2, Pasillo 4)';
