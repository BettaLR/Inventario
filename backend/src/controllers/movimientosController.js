const { query, getClient } = require('../config/db');

const LIST_SELECT = `
  SELECT m.*, p.nombre AS producto_nombre, p.codigo AS producto_codigo,
    a.nombre AS almacen_nombre, ad.nombre AS almacen_destino_nombre, u.nombre AS usuario_nombre
  FROM movimientos m
  JOIN productos p ON p.id = m.producto_id
  JOIN almacenes a ON a.id = m.almacen_id
  LEFT JOIN almacenes ad ON ad.id = m.almacen_destino_id
  JOIN usuarios u ON u.id = m.usuario_id
`;

const listar = async (req, res) => {
  const { producto_id, almacen_id, tipo, limit } = req.query;
  const conditions = [];
  const params = [];

  if (producto_id) { params.push(producto_id); conditions.push(`m.producto_id = $${params.length}`); }
  if (almacen_id) { params.push(almacen_id); conditions.push(`m.almacen_id = $${params.length}`); }
  if (tipo) { params.push(tipo); conditions.push(`m.tipo = $${params.length}`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(Math.min(Number(limit) || 100, 500));

  const result = await query(
    `${LIST_SELECT} ${where} ORDER BY m.created_at DESC LIMIT $${params.length}`,
    params
  );
  res.json(result.rows);
};

const obtenerOCrearStock = async (client, producto_id, almacen_id) => {
  const existente = await client.query(
    'SELECT * FROM stock WHERE producto_id = $1 AND almacen_id = $2 FOR UPDATE',
    [producto_id, almacen_id]
  );
  if (existente.rows.length > 0) return existente.rows[0];

  const creado = await client.query(
    'INSERT INTO stock (producto_id, almacen_id, cantidad) VALUES ($1, $2, 0) RETURNING *',
    [producto_id, almacen_id]
  );
  return creado.rows[0];
};

const registrarMovimiento = async (req, res) => {
  const {
    producto_id, almacen_id, almacen_destino_id, tipo, cantidad, cantidad_nueva: cantidadNuevaAjuste,
    motivo, referencia,
  } = req.body;

  if (!['entrada', 'salida', 'ajuste', 'transferencia', 'devolucion'].includes(tipo)) {
    return res.status(400).json({ message: 'Tipo de movimiento inválido' });
  }
  if (tipo === 'transferencia' && !almacen_destino_id) {
    return res.status(400).json({ message: 'La transferencia requiere un almacén destino' });
  }
  if (tipo === 'transferencia' && Number(almacen_destino_id) === Number(almacen_id)) {
    return res.status(400).json({ message: 'El almacén destino debe ser distinto al origen' });
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    const stockOrigen = await obtenerOCrearStock(client, producto_id, almacen_id);
    const anterior = stockOrigen.cantidad;
    let cantidadMovimiento = Number(cantidad);
    let nuevaOrigen;

    if (tipo === 'entrada' || tipo === 'devolucion') {
      nuevaOrigen = anterior + cantidadMovimiento;
    } else if (tipo === 'salida' || tipo === 'transferencia') {
      if (cantidadMovimiento > anterior) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: `Stock insuficiente. Disponible: ${anterior}` });
      }
      nuevaOrigen = anterior - cantidadMovimiento;
    } else if (tipo === 'ajuste') {
      nuevaOrigen = Number(cantidadNuevaAjuste);
      cantidadMovimiento = Math.abs(nuevaOrigen - anterior);
      if (cantidadMovimiento === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'La cantidad ajustada debe ser distinta a la actual' });
      }
    }

    await client.query('UPDATE stock SET cantidad = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [nuevaOrigen, stockOrigen.id]);

    const movimiento = await client.query(
      `INSERT INTO movimientos
        (producto_id, almacen_id, almacen_destino_id, usuario_id, tipo, cantidad, cantidad_anterior, cantidad_nueva, motivo, referencia)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        producto_id, almacen_id, tipo === 'transferencia' ? almacen_destino_id : null,
        req.user.id, tipo, cantidadMovimiento, anterior, nuevaOrigen, motivo || null, referencia || null,
      ]
    );

    if (tipo === 'transferencia') {
      const stockDestino = await obtenerOCrearStock(client, producto_id, almacen_destino_id);
      const nuevaDestino = stockDestino.cantidad + cantidadMovimiento;
      await client.query('UPDATE stock SET cantidad = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [nuevaDestino, stockDestino.id]);
    }

    await client.query('COMMIT');
    res.status(201).json(movimiento.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { listar, registrarMovimiento };
