const { query } = require('../config/db');

const listar = async (req, res) => {
  const result = await query(
    `SELECT a.*, u.nombre AS responsable_nombre,
       COALESCE(SUM(s.cantidad), 0)::int AS total_unidades
     FROM almacenes a
     LEFT JOIN usuarios u ON u.id = a.responsable_id
     LEFT JOIN stock s ON s.almacen_id = a.id
     GROUP BY a.id, u.nombre
     ORDER BY a.nombre`
  );
  res.json(result.rows);
};

const crear = async (req, res) => {
  const { nombre, ubicacion, responsable_id } = req.body;
  try {
    const result = await query(
      `INSERT INTO almacenes (nombre, ubicacion, responsable_id) VALUES ($1, $2, $3) RETURNING *`,
      [nombre, ubicacion || null, responsable_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Ya existe un almacén con ese nombre' });
    }
    throw err;
  }
};

const actualizar = async (req, res) => {
  const { id } = req.params;
  const { nombre, ubicacion, responsable_id, activo } = req.body;
  const result = await query(
    `UPDATE almacenes SET nombre = $1, ubicacion = $2, responsable_id = $3, activo = $4 WHERE id = $5 RETURNING *`,
    [nombre, ubicacion || null, responsable_id || null, activo ?? true, id]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: 'Almacén no encontrado' });
  res.json(result.rows[0]);
};

const eliminar = async (req, res) => {
  const { id } = req.params;
  const result = await query('UPDATE almacenes SET activo = false WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) return res.status(404).json({ message: 'Almacén no encontrado' });
  res.json({ message: 'Almacén desactivado' });
};

module.exports = { listar, crear, actualizar, eliminar };
