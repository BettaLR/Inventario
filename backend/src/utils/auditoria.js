const { query } = require('../config/db');

const registrarAuditoria = async (req, entidad, entidad_id, accion, detalle = null) => {
  try {
    await query(
      `INSERT INTO auditoria (usuario_id, entidad, entidad_id, accion, detalle)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user?.id || null, entidad, entidad_id, accion, detalle ? JSON.stringify(detalle) : null]
    );
  } catch (err) {
    console.error('Error registrando auditoría:', err);
  }
};

module.exports = { registrarAuditoria };
