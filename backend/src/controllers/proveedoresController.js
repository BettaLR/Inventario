const { query } = require('../config/db');
const { registrarAuditoria } = require('../utils/auditoria');

const listar = async (req, res) => {
  const { busqueda } = req.query;
  const params = [];
  let where = '';
  if (busqueda) {
    params.push(`%${busqueda}%`);
    where = `WHERE nombre ILIKE $1 OR contacto ILIKE $1`;
  }
  const result = await query(
    `SELECT * FROM proveedores ${where} ORDER BY nombre`,
    params
  );
  res.json(result.rows);
};

const obtener = async (req, res) => {
  const { id } = req.params;
  const proveedor = await query('SELECT * FROM proveedores WHERE id = $1', [id]);
  if (proveedor.rows.length === 0) return res.status(404).json({ message: 'Proveedor no encontrado' });

  const historial = await query(
    `SELECT m.id, m.tipo, m.cantidad, m.created_at, m.referencia, p.nombre AS producto_nombre
     FROM movimientos m
     JOIN productos p ON p.id = m.producto_id
     WHERE m.proveedor_id = $1 AND m.tipo = 'entrada'
     ORDER BY m.created_at DESC
     LIMIT 50`,
    [id]
  );

  res.json({ ...proveedor.rows[0], historialCompras: historial.rows });
};

const crear = async (req, res) => {
  const { nombre, contacto, telefono, email, direccion } = req.body;
  const result = await query(
    `INSERT INTO proveedores (nombre, contacto, telefono, email, direccion)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [nombre, contacto || null, telefono || null, email || null, direccion || null]
  );
  await registrarAuditoria(req, 'proveedores', result.rows[0].id, 'crear', { nombre });
  res.status(201).json(result.rows[0]);
};

const actualizar = async (req, res) => {
  const { id } = req.params;
  const { nombre, contacto, telefono, email, direccion, activo } = req.body;
  const result = await query(
    `UPDATE proveedores SET nombre = $1, contacto = $2, telefono = $3, email = $4, direccion = $5, activo = $6
     WHERE id = $7 RETURNING *`,
    [nombre, contacto || null, telefono || null, email || null, direccion || null, activo ?? true, id]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: 'Proveedor no encontrado' });
  await registrarAuditoria(req, 'proveedores', id, 'actualizar', { nombre });
  res.json(result.rows[0]);
};

const eliminar = async (req, res) => {
  const { id } = req.params;
  const result = await query('UPDATE proveedores SET activo = false WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) return res.status(404).json({ message: 'Proveedor no encontrado' });
  await registrarAuditoria(req, 'proveedores', id, 'eliminar');
  res.json({ message: 'Proveedor desactivado' });
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
