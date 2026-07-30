const { query } = require('../config/db');

const listar = async (req, res) => {
  const result = await query(
    `SELECT u.id, u.nombre, u.email, r.nombre AS rol, u.activo, u.ultimo_login, u.created_at
     FROM usuarios u JOIN roles r ON r.id = u.rol_id
     ORDER BY u.nombre`
  );
  res.json(result.rows);
};

const listarRoles = async (req, res) => {
  const result = await query('SELECT * FROM roles ORDER BY id');
  res.json(result.rows);
};

const actualizarEstado = async (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;
  const result = await query(
    'UPDATE usuarios SET activo = $1 WHERE id = $2 RETURNING id, nombre, activo',
    [activo, id]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json(result.rows[0]);
};

module.exports = { listar, listarRoles, actualizarEstado };
