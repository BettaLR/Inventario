const { query } = require('../config/db');

const stats = async (req, res) => {
  try {
    const [totalProductos, movimientosHoy, alertas, valorInventario, movimientosPorDia, porCategoria] = await Promise.all([
      query('SELECT COUNT(*) AS total FROM productos WHERE activo = true'),
      query(`SELECT COUNT(*) AS total FROM movimientos WHERE created_at::date = CURRENT_DATE`),
      query(`
        SELECT COUNT(*) AS total FROM (
          SELECT p.id, COALESCE(SUM(s.cantidad), 0) AS stock_total
          FROM productos p LEFT JOIN stock s ON s.producto_id = p.id
          WHERE p.activo = true
          GROUP BY p.id, p.stock_minimo
          HAVING COALESCE(SUM(s.cantidad), 0) <= p.stock_minimo
        ) sub
      `),
      query(`
        SELECT COALESCE(SUM(s.cantidad * p.precio_unitario), 0) AS total
        FROM stock s JOIN productos p ON p.id = s.producto_id
      `),
      query(`
        SELECT d.dia::date AS fecha,
          COALESCE(SUM(CASE WHEN m.tipo IN ('entrada','devolucion') THEN m.cantidad ELSE 0 END), 0) AS entradas,
          COALESCE(SUM(CASE WHEN m.tipo = 'salida' THEN m.cantidad ELSE 0 END), 0) AS salidas
        FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day') AS d(dia)
        LEFT JOIN movimientos m ON m.created_at::date = d.dia
        GROUP BY d.dia ORDER BY d.dia
      `),
      query(`
        SELECT c.nombre, COUNT(p.id) AS total
        FROM categorias c LEFT JOIN productos p ON p.categoria_id = c.id AND (p.activo = true)
        GROUP BY c.nombre ORDER BY total DESC
      `),
    ]);

    res.json({
      totalProductos: totalProductos.rows[0]?.total || 0,
      movimientosHoy: movimientosHoy.rows[0]?.total || 0,
      alertasStock: alertas.rows[0]?.total || 0,
      valorInventario: Number(valorInventario.rows[0]?.total || 0),
      movimientosPorDia: movimientosPorDia.rows || [],
      productosPorCategoria: porCategoria.rows || [],
    });
  } catch (err) {
    console.error('Error en dashboard stats:', err);
    res.status(500).json({ message: 'Error interno del servidor en dashboard stats' });
  }
};

module.exports = { stats };
