const { query } = require('../config/db');

const listar = async (req, res) => {
  const result = await query('SELECT * FROM categorias ORDER BY nombre');
  res.json(result.rows);
};

const crear = async (req, res) => {
  const { nombre, descripcion } = req.body;
  try {
    const result = await query(
      'INSERT INTO categorias (nombre, descripcion) VALUES ($1, $2) RETURNING *',
      [nombre, descripcion || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Ya existe una categoría con ese nombre' });
    }
    throw err;
  }
};

const actualizar = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, activo } = req.body;
  const result = await query(
    `UPDATE categorias SET nombre = $1, descripcion = $2, activo = $3 WHERE id = $4 RETURNING *`,
    [nombre, descripcion || null, activo ?? true, id]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: 'Categoría no encontrada' });
  res.json(result.rows[0]);
};

const eliminar = async (req, res) => {
  const { id } = req.params;
  const result = await query('UPDATE categorias SET activo = false WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) return res.status(404).json({ message: 'Categoría no encontrada' });
  res.json({ message: 'Categoría desactivada' });
};

module.exports = { listar, crear, actualizar, eliminar };
