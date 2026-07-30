const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { query } = require('../config/db');

const inventarioValorizadoQuery = `
  SELECT p.codigo, p.nombre, c.nombre AS categoria, p.unidad_medida, p.precio_unitario,
    COALESCE(SUM(s.cantidad), 0)::int AS stock_total,
    (COALESCE(SUM(s.cantidad), 0) * p.precio_unitario)::numeric(14,2) AS valor_total
  FROM productos p
  LEFT JOIN categorias c ON c.id = p.categoria_id
  LEFT JOIN stock s ON s.producto_id = p.id
  WHERE p.activo = true
  GROUP BY p.id, c.nombre
  ORDER BY valor_total DESC
`;

const inventarioValorizado = async (req, res) => {
  const result = await query(inventarioValorizadoQuery);
  const total = result.rows.reduce((acc, r) => acc + Number(r.valor_total), 0);
  res.json({ items: result.rows, total });
};

const rotacion = async (req, res) => {
  const dias = Math.min(Number(req.query.dias) || 30, 365);
  const result = await query(
    `SELECT p.codigo, p.nombre,
       COALESCE(SUM(CASE WHEN m.tipo = 'salida' THEN m.cantidad ELSE 0 END), 0)::int AS unidades_salida,
       COALESCE(SUM(CASE WHEN m.tipo IN ('entrada','devolucion') THEN m.cantidad ELSE 0 END), 0)::int AS unidades_entrada,
       COUNT(m.id)::int AS total_movimientos
     FROM productos p
     LEFT JOIN movimientos m ON m.producto_id = p.id AND m.created_at >= CURRENT_DATE - ($1 || ' days')::interval
     WHERE p.activo = true
     GROUP BY p.id
     ORDER BY unidades_salida DESC`,
    [dias]
  );
  res.json({ dias, items: result.rows });
};

const mermas = async (req, res) => {
  const result = await query(
    `SELECT m.id, p.codigo, p.nombre, a.nombre AS almacen, m.cantidad_anterior, m.cantidad_nueva,
       (m.cantidad_anterior - m.cantidad_nueva) AS unidades_perdidas, m.motivo, m.created_at, u.nombre AS usuario_nombre
     FROM movimientos m
     JOIN productos p ON p.id = m.producto_id
     JOIN almacenes a ON a.id = m.almacen_id
     JOIN usuarios u ON u.id = m.usuario_id
     WHERE m.tipo = 'ajuste' AND m.cantidad_nueva < m.cantidad_anterior
     ORDER BY m.created_at DESC
     LIMIT 200`
  );
  res.json(result.rows);
};

const alertasStock = async (req, res) => {
  const result = await query(
    `SELECT p.id, p.codigo, p.nombre, p.stock_minimo, c.nombre AS categoria,
       COALESCE(SUM(s.cantidad), 0)::int AS stock_total
     FROM productos p
     LEFT JOIN categorias c ON c.id = p.categoria_id
     LEFT JOIN stock s ON s.producto_id = p.id
     WHERE p.activo = true
     GROUP BY p.id, c.nombre
     HAVING COALESCE(SUM(s.cantidad), 0) <= p.stock_minimo
     ORDER BY stock_total ASC`
  );
  res.json(result.rows);
};

const inventarioValorizadoPdf = async (req, res) => {
  const result = await query(inventarioValorizadoQuery);
  const total = result.rows.reduce((acc, r) => acc + Number(r.valor_total), 0);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="inventario-valorizado.pdf"');

  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  doc.pipe(res);

  doc.fontSize(16).text('Reporte de Inventario Valorizado', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(9).fillColor('#64748b').text(`Generado: ${new Date().toLocaleString('es-MX')}`, { align: 'center' });
  doc.moveDown(1);

  const colWidths = [70, 170, 90, 60, 70, 80];
  const headers = ['Código', 'Producto', 'Categoría', 'Stock', 'Precio', 'Valor total'];
  let y = doc.y;
  doc.fontSize(9).fillColor('#0f172a').font('Helvetica-Bold');
  let x = doc.page.margins.left;
  headers.forEach((h, i) => { doc.text(h, x, y, { width: colWidths[i] }); x += colWidths[i]; });
  doc.moveTo(doc.page.margins.left, y + 14).lineTo(doc.page.width - doc.page.margins.right, y + 14).strokeColor('#cbd5e1').stroke();

  doc.font('Helvetica').fillColor('#334155');
  y += 20;
  result.rows.forEach((row) => {
    if (y > doc.page.height - 80) {
      doc.addPage();
      y = doc.page.margins.top;
    }
    x = doc.page.margins.left;
    const values = [
      row.codigo, row.nombre, row.categoria || '—', String(row.stock_total),
      `$${Number(row.precio_unitario).toFixed(2)}`, `$${Number(row.valor_total).toFixed(2)}`,
    ];
    values.forEach((v, i) => { doc.text(v, x, y, { width: colWidths[i] }); x += colWidths[i]; });
    y += 18;
  });

  doc.moveTo(doc.page.margins.left, y + 4).lineTo(doc.page.width - doc.page.margins.right, y + 4).strokeColor('#cbd5e1').stroke();
  doc.font('Helvetica-Bold').fontSize(11).text(`Valor total del inventario: $${total.toFixed(2)}`, doc.page.margins.left, y + 12);

  doc.end();
};

const inventarioValorizadoExcel = async (req, res) => {
  const result = await query(inventarioValorizadoQuery);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistema de Control de Inventarios';
  const sheet = workbook.addWorksheet('Inventario Valorizado');

  sheet.columns = [
    { header: 'Código', key: 'codigo', width: 15 },
    { header: 'Producto', key: 'nombre', width: 35 },
    { header: 'Categoría', key: 'categoria', width: 20 },
    { header: 'Unidad', key: 'unidad_medida', width: 12 },
    { header: 'Stock total', key: 'stock_total', width: 12 },
    { header: 'Precio unitario', key: 'precio_unitario', width: 16 },
    { header: 'Valor total', key: 'valor_total', width: 16 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };

  result.rows.forEach((row) => sheet.addRow(row));

  sheet.getColumn('precio_unitario').numFmt = '$#,##0.00';
  sheet.getColumn('valor_total').numFmt = '$#,##0.00';

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="inventario-valorizado.xlsx"');

  await workbook.xlsx.write(res);
  res.end();
};

module.exports = {
  inventarioValorizado, rotacion, mermas, alertasStock,
  inventarioValorizadoPdf, inventarioValorizadoExcel,
};
