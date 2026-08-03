-- ============================================
-- Seeds de datos de prueba - Sprint 1
-- Passwords: Admin123! / Gerente123! / Almacen123!
-- ============================================

-- Roles
INSERT INTO roles (nombre, descripcion) VALUES
  ('Administrador', 'Acceso total al sistema'),
  ('Almacenista', 'Registro de movimientos y consulta de stock'),
  ('Cliente', 'Consulta de inventario y pedidos');

-- Usuarios (password: Admin123!)
INSERT INTO usuarios (nombre, email, password_hash, rol_id) VALUES
  ('Erick Guerra',   'admin@inventario.com',   '$2a$10$xLsOzaEaxbgYl2QrLTpgAeBqpXCo9lsn9nPMk.LYetTzq0BU8/m9G', 1),
  ('Ana López',      'almacen@inventario.com', '$2a$10$xLsOzaEaxbgYl2QrLTpgAeBqpXCo9lsn9nPMk.LYetTzq0BU8/m9G', 2),
  ('Carlos Cliente', 'cliente@inventario.com', '$2a$10$xLsOzaEaxbgYl2QrLTpgAeBqpXCo9lsn9nPMk.LYetTzq0BU8/m9G', 3);

-- Categorias
INSERT INTO categorias (nombre, descripcion) VALUES
  ('Electrónica', 'Equipos y accesorios electrónicos'),
  ('Oficina', 'Papelería y suministros de oficina'),
  ('Herramientas', 'Herramientas manuales y eléctricas'),
  ('Limpieza', 'Productos de limpieza e higiene');

-- Proveedores
INSERT INTO proveedores (nombre, contacto, telefono, email) VALUES
  ('Tech Supplies S.A.',  'Juan Mora',    '555-0101', 'ventas@techsupplies.com'),
  ('OfficeMax',           'María García', '555-0202', 'pedidos@officemax.com'),
  ('ToolMaster',          'Roberto Lima', '555-0303', 'info@toolmaster.com');

-- Almacenes
INSERT INTO almacenes (nombre, ubicacion, responsable_id) VALUES
  ('Almacén Principal',   'Bodega A - Planta Baja',  4),
  ('Almacén Secundario',  'Bodega B - Planta Alta',  5);

-- Productos (10 productos de prueba)
INSERT INTO productos (codigo, codigo_barras, nombre, descripcion, categoria_id, proveedor_id, precio_unitario, stock_minimo) VALUES
  ('ELEC-001', '7501000001001', 'Laptop HP 15"',          'Laptop HP Core i5 8GB RAM',      1, 1, 8500.00, 2),
  ('ELEC-002', '7501000001002', 'Mouse Inalámbrico',       'Mouse Logitech M185',            1, 1, 250.00,  5),
  ('ELEC-003', '7501000001003', 'Teclado USB',             'Teclado HP estándar español',    1, 1, 350.00,  5),
  ('ELEC-004', '7501000001004', 'Monitor 24"',             'Monitor LG Full HD',             1, 1, 3200.00, 2),
  ('OFIC-001', '7501000002001', 'Resma Papel Carta',       'Papel Bond 75gr 500 hojas',      2, 2, 85.00,  10),
  ('OFIC-002', '7501000002002', 'Boligrafos Caja x12',     'Bolígrafos azules BIC',          2, 2, 45.00,  20),
  ('OFIC-003', '7501000002003', 'Folder Manila x50',       'Folders tamaño carta',           2, 2, 120.00, 10),
  ('HERR-001', '7501000003001', 'Taladro Eléctrico',       'Taladro Black&Decker 500W',      3, 3, 1200.00, 1),
  ('LIMP-001', '7501000004001', 'Desinfectante 1L',        'Desinfectante multiusos 1 litro',4, 2, 55.00,  15),
  ('LIMP-002', '7501000004002', 'Jabón Líquido 5L',        'Jabón líquido para manos galón', 4, 2, 180.00, 10);

-- Stock inicial
INSERT INTO stock (producto_id, almacen_id, cantidad) VALUES
  (1, 1, 5),  (1, 2, 2),
  (2, 1, 20), (2, 2, 10),
  (3, 1, 15), (3, 2, 8),
  (4, 1, 4),  (4, 2, 1),
  (5, 1, 30), (5, 2, 20),
  (6, 1, 50), (6, 2, 30),
  (7, 1, 40), (7, 2, 25),
  (8, 1, 3),  (8, 2, 2),
  (9, 1, 25), (9, 2, 18),
  (10,1, 8),  (10,2, 5);

-- Movimientos de prueba (historial Kardex)
INSERT INTO movimientos (producto_id, almacen_id, usuario_id, tipo, cantidad, cantidad_anterior, cantidad_nueva, motivo, referencia) VALUES
  (1, 1, 1, 'entrada',  5, 0,  5,  'Compra inicial',       'OC-001'),
  (1, 1, 4, 'salida',   1, 5,  4,  'Entrega a sistemas',   'REQ-001'),
  (2, 1, 1, 'entrada', 25, 0, 25,  'Compra inicial',       'OC-001'),
  (2, 1, 4, 'salida',   5, 25,20,  'Dotación empleados',   'REQ-002'),
  (5, 1, 1, 'entrada', 30, 0, 30,  'Compra inicial',       'OC-002'),
  (9, 1, 4, 'salida',   5, 30,25,  'Limpieza semanal',     'REQ-003'),
  (8, 1, 1, 'entrada',  3, 0,  3,  'Compra inicial',       'OC-003'),
  (3, 1, 5, 'entrada', 15, 0, 15,  'Compra inicial',       'OC-001'),
  (4, 1, 1, 'entrada',  4, 0,  4,  'Compra inicial',       'OC-001'),
  (6, 1, 5, 'salida',   3, 53,50,  'Reposición oficinas',  'REQ-004');
