const bcrypt = require('bcryptjs');
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

const crear = async (req, res) => {
  const { nombre, email, password, rol_id } = req.body;
  if (!nombre || !email || !password) {
    return res.status(400).json({ message: 'Nombre, email y contraseña son requeridos' });
  }

  const hash = await bcrypt.hash(password, 10);
  const rolId = Number(rol_id) || 2;

  const result = await query(
    `INSERT INTO usuarios (nombre, email, password_hash, rol_id, activo)
     VALUES ($1, $2, $3, $4, 1) RETURNING id, nombre, email, activo`,
    [nombre, email, hash, rolId]
  );
  res.status(201).json(result.rows[0]);
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

module.exports = { listar, listarRoles, crear, actualizarEstado };
