const { query } = require('../config/db');

const BASE_SELECT = `
  SELECT p.*, c.nombre AS categoria_nombre, pr.nombre AS proveedor_nombre,
    COALESCE(SUM(s.cantidad), 0) AS stock_total
  FROM productos p
  LEFT JOIN categorias c ON c.id = p.categoria_id
  LEFT JOIN proveedores pr ON pr.id = p.proveedor_id
  LEFT JOIN stock s ON s.producto_id = p.id
`;
const GROUP_BY = ' GROUP BY p.id, c.nombre, pr.nombre ';

const listar = async (req, res) => {
  try {
    const { busqueda, categoria_id, bajo_stock } = req.query;
    const conditions = [];
    const params = [];

    if (busqueda) {
      params.push(busqueda);
      conditions.push(`(p.nombre LIKE '%' || $${params.length} || '%'
        OR p.codigo LIKE '%' || $${params.length} || '%'
        OR p.codigo_barras LIKE '%' || $${params.length} || '%')`);
    }
    if (categoria_id) {
      params.push(categoria_id);
      conditions.push(`p.categoria_id = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    let sql = `${BASE_SELECT} ${where} ${GROUP_BY}`;

    if (bajo_stock === 'true') {
      sql += ` HAVING COALESCE(SUM(s.cantidad), 0) <= p.stock_minimo`;
    }
    sql += ' ORDER BY p.nombre';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error en listar productos:', err);
    res.status(500).json({ message: 'Error al listar productos' });
  }
};

const obtener = async (req, res) => {
  const { id } = req.params;
  const result = await query(`${BASE_SELECT} WHERE p.id = $1 ${GROUP_BY}`, [id]);
  if (result.rows.length === 0) return res.status(404).json({ message: 'Producto no encontrado' });

  const stockPorAlmacen = await query(
    `SELECT s.almacen_id, a.nombre AS almacen_nombre, s.cantidad
     FROM stock s JOIN almacenes a ON a.id = s.almacen_id
     WHERE s.producto_id = $1 ORDER BY a.nombre`,
    [id]
  );

  res.json({ ...result.rows[0], stockPorAlmacen: stockPorAlmacen.rows });
};

const crear = async (req, res) => {
  const {
    codigo, codigo_barras, nombre, descripcion, foto_url,
    categoria_id, proveedor_id, unidad_medida, precio_unitario, stock_minimo,
  } = req.body;

  try {
    const result = await query(
      `INSERT INTO productos
        (codigo, codigo_barras, nombre, descripcion, foto_url, categoria_id, proveedor_id, unidad_medida, precio_unitario, stock_minimo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        codigo, codigo_barras || null, nombre, descripcion || null, foto_url || null,
        categoria_id || null, proveedor_id || null, unidad_medida || 'unidad',
        precio_unitario || 0, stock_minimo || 0,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Ya existe un producto con ese código o código de barras' });
    }
    throw err;
  }
};

const actualizar = async (req, res) => {
  const { id } = req.params;
  const {
    codigo, codigo_barras, nombre, descripcion, foto_url,
    categoria_id, proveedor_id, unidad_medida, precio_unitario, stock_minimo, activo,
  } = req.body;

  try {
    const result = await query(
      `UPDATE productos SET
        codigo = $1, codigo_barras = $2, nombre = $3, descripcion = $4, foto_url = $5,
        categoria_id = $6, proveedor_id = $7, unidad_medida = $8, precio_unitario = $9,
        stock_minimo = $10, activo = $11
       WHERE id = $12 RETURNING *`,
      [
        codigo, codigo_barras || null, nombre, descripcion || null, foto_url || null,
        categoria_id || null, proveedor_id || null, unidad_medida || 'unidad',
        precio_unitario || 0, stock_minimo || 0, activo ?? true, id,
      ]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Ya existe un producto con ese código o código de barras' });
    }
    throw err;
  }
};

const eliminar = async (req, res) => {
  const { id } = req.params;
  const result = await query('UPDATE productos SET activo = false WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) return res.status(404).json({ message: 'Producto no encontrado' });
  res.json({ message: 'Producto desactivado' });
};

const buscarPorCodigoBarras = async (req, res) => {
  const { codigo } = req.params;
  const result = await query(`${BASE_SELECT} WHERE p.codigo_barras = $1 OR p.codigo = $1 ${GROUP_BY}`, [codigo]);
  if (result.rows.length === 0) return res.status(404).json({ message: 'Producto no encontrado' });
  res.json(result.rows[0]);
};

module.exports = { listar, obtener, crear, actualizar, eliminar, buscarPorCodigoBarras };
