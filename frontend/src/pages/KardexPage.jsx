import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { listarMovimientos, registrarMovimiento } from '../services/movimientosService';
import { listarProductos, buscarPorCodigoBarras } from '../services/productosService';
import { listarAlmacenes } from '../services/almacenesService';
import Field, { inputClass } from '../components/ui/Field';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import BarcodeScanner from '../components/kardex/BarcodeScanner';

const TIPOS = [
  { value: 'entrada', label: 'Entrada (compra a proveedor)' },
  { value: 'salida', label: 'Salida (venta a cliente)' },
  { value: 'transferencia', label: 'Transferencia entre almacenes' },
  { value: 'ajuste', label: 'Ajuste de inventario / merma' },
  { value: 'devolucion', label: 'Devolución de cliente' },
];

// Badge de Tipo Liso, Neutral y Humano (Status Dot + Texto Limpio)
function MovementBadge({ tipo }) {
  const dots = {
    entrada: 'bg-emerald-500',
    salida: 'bg-rose-500',
    transferencia: 'bg-sky-500',
    ajuste: 'bg-amber-500',
    devolucion: 'bg-indigo-500',
  };

  const labels = {
    entrada: 'Entrada',
    salida: 'Salida',
    transferencia: 'Transferencia',
    ajuste: 'Ajuste',
    devolucion: 'Devolución',
  };

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 whitespace-nowrap justify-center">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dots[tipo] || 'bg-slate-400'}`} />
      <span className="text-slate-700 text-xs font-medium">{labels[tipo] || tipo}</span>
    </div>
  );
}

// Componente Robusto de Imagen con Fallback
function ProductThumb({ src }) {
  const [errorImg, setErrorImg] = useState(false);

  if (!src || errorImg) {
    return (
      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      onError={() => setErrorImg(true)}
      className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-50"
    />
  );
}

export default function KardexPage() {
  const queryClient = useQueryClient();
  const [busqueda, setBusqueda] = useState('');
  const [filtroProducto, setFiltroProducto] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [scannerAbierto, setScannerAbierto] = useState(false);

  const { data: productos } = useQuery({ queryKey: ['productos-lite'], queryFn: () => listarProductos() });
  const { data: almacenes } = useQuery({ queryKey: ['almacenes'], queryFn: listarAlmacenes });
  const { data: movimientos, isLoading } = useQuery({
    queryKey: ['movimientos', filtroProducto, filtroTipo],
    queryFn: () => listarMovimientos({ producto_id: filtroProducto || undefined, tipo: filtroTipo || undefined }),
  });

  const registrarMutation = useMutation({
    mutationFn: registrarMovimiento,
    onSuccess: () => {
      toast.success('Movimiento registrado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['movimientos'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      formik.resetForm();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al registrar movimiento'),
  });

  const formik = useFormik({
    initialValues: {
      producto_id: '', almacen_id: '', almacen_destino_id: '', tipo: 'entrada',
      cantidad: '', cantidad_nueva: '', motivo: '', referencia: '',
    },
    validationSchema: Yup.object({
      producto_id: Yup.string().required('Selecciona un producto'),
      almacen_id: Yup.string().required('Selecciona un almacén'),
      tipo: Yup.string().required(),
      cantidad: Yup.number().when('tipo', {
        is: (t) => t !== 'ajuste',
        then: (s) => s.min(1, 'Debe ser mayor a 0').required('La cantidad es requerida'),
      }),
      cantidad_nueva: Yup.number().when('tipo', {
        is: 'ajuste',
        then: (s) => s.min(0, 'Debe ser positiva').required('La cantidad final es requerida'),
      }),
      almacen_destino_id: Yup.string().when('tipo', {
        is: 'transferencia',
        then: (s) => s.required('Selecciona el almacén destino'),
      }),
    }),
    onSubmit: (values) => {
      const payload = {
        producto_id: Number(values.producto_id),
        almacen_id: Number(values.almacen_id),
        tipo: values.tipo,
        motivo: values.motivo || undefined,
        referencia: values.referencia || undefined,
      };
      if (values.tipo === 'ajuste') payload.cantidad_nueva = Number(values.cantidad_nueva);
      else payload.cantidad = Number(values.cantidad);
      if (values.tipo === 'transferencia') payload.almacen_destino_id = Number(values.almacen_destino_id);
      registrarMutation.mutate(payload);
    },
  });

  const productoSeleccionado = useMemo(
    () => productos?.find((p) => String(p.id) === String(formik.values.producto_id)),
    [productos, formik.values.producto_id]
  );

  const handleCodigoDetectado = async (codigo) => {
    setScannerAbierto(false);
    try {
      const producto = await buscarPorCodigoBarras(codigo);
      formik.setFieldValue('producto_id', String(producto.id));
      toast.success(`Producto encontrado: ${producto.nombre}`);
    } catch {
      toast.error(`Ningún producto encontrado con código ${codigo}`);
    }
  };

  const movimientosFiltrados = (movimientos || []).filter((m) => {
    if (!busqueda) return true;
    const term = busqueda.toLowerCase();
    return (
      m.producto_nombre?.toLowerCase().includes(term) ||
      m.producto_codigo?.toLowerCase().includes(term) ||
      m.referencia?.toLowerCase().includes(term) ||
      m.motivo?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 pb-8 font-sans w-full">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Gestión de Inventarios (Kardex)</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Registro de entradas, salidas, transferencias y trazabilidad histórica de stock
          </p>
        </div>
      </div>

      {/* Grid de 2 Columnas Independientes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMNA IZQUIERDA: Formulario de Registro */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
          <div className="border-b border-slate-200/80 pb-3 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              REGISTRAR MOVIMIENTO
            </h2>
            <span className="w-2 h-2 rounded-full bg-orange-500" />
          </div>

          <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
            {/* Tipo de Movimiento */}
            <Field label="Tipo de Movimiento" required>
              <select className={inputClass(false)} {...formik.getFieldProps('tipo')}>
                {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>

            {/* Producto + Botón Escanear */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Producto <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setScannerAbierto(true)}
                  className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m0 14v1m-7-7h1m14 0h1m-3.172-5.172l-.707.707M6.879 17.121l-.707.707m11.657 0l-.707-.707M6.879 6.879l-.707-.707" />
                  </svg>
                  <span>Escanear código</span>
                </button>
              </div>

              <select
                className={inputClass(formik.touched.producto_id && formik.errors.producto_id)}
                {...formik.getFieldProps('producto_id')}
              >
                <option value="">Seleccionar producto...</option>
                {productos?.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre} ({p.codigo})</option>
                ))}
              </select>

              {formik.touched.producto_id && formik.errors.producto_id && (
                <p className="text-rose-500 text-xs font-semibold mt-1">{formik.errors.producto_id}</p>
              )}

              {productoSeleccionado && (
                <div className="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Stock Total Actual:</span>
                  <span className="font-bold text-slate-900">{productoSeleccionado.stock_total} {productoSeleccionado.unidad_medida}</span>
                </div>
              )}
            </div>

            {/* Almacén Origen */}
            <Field label={formik.values.tipo === 'transferencia' ? 'Almacén Origen' : 'Almacén'} required error={formik.touched.almacen_id && formik.errors.almacen_id}>
              <select className={inputClass(formik.touched.almacen_id && formik.errors.almacen_id)} {...formik.getFieldProps('almacen_id')}>
                <option value="">Seleccionar almacén...</option>
                {almacenes?.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </Field>

            {/* Almacén Destino si es Transferencia */}
            {formik.values.tipo === 'transferencia' && (
              <Field label="Almacén Destino" required error={formik.touched.almacen_destino_id && formik.errors.almacen_destino_id}>
                <select className={inputClass(formik.touched.almacen_destino_id && formik.errors.almacen_destino_id)} {...formik.getFieldProps('almacen_destino_id')}>
                  <option value="">Seleccionar almacén destino...</option>
                  {almacenes?.filter((a) => String(a.id) !== String(formik.values.almacen_id)).map((a) => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                </select>
              </Field>
            )}

            {/* Cantidad / Cantidad Final */}
            {formik.values.tipo === 'ajuste' ? (
              <Field label="Cantidad Final en Almacén" required error={formik.touched.cantidad_nueva && formik.errors.cantidad_nueva}>
                <input type="number" min="0" className={inputClass(formik.touched.cantidad_nueva && formik.errors.cantidad_nueva)} {...formik.getFieldProps('cantidad_nueva')} />
              </Field>
            ) : (
              <Field label="Cantidad" required error={formik.touched.cantidad && formik.errors.cantidad}>
                <input type="number" min="1" className={inputClass(formik.touched.cantidad && formik.errors.cantidad)} {...formik.getFieldProps('cantidad')} />
              </Field>
            )}

            {/* Motivo y Referencia */}
            <Field label="Motivo">
              <input className={inputClass(false)} placeholder="Ej. Compra inicial, merma, venta..." {...formik.getFieldProps('motivo')} />
            </Field>

            <Field label="Referencia">
              <input className={inputClass(false)} placeholder="Ej. OC-2026-089, Venta #1024..." {...formik.getFieldProps('referencia')} />
            </Field>

            {/* Botón Primario de Acción */}
            <button
              type="submit"
              disabled={registrarMutation.isPending}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-sm shadow-orange-950/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {registrarMutation.isPending ? 'Registrando...' : 'Registrar Movimiento'}
            </button>
          </form>
        </div>

        {/* COLUMNA DERECHA: Tabla Histórica de Kardex */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Barra de Filtros Rápida */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por producto, SKU o referencia..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 focus:bg-white text-slate-800 rounded-xl text-xs font-medium border border-slate-200 outline-none focus:ring-2 focus:ring-orange-500/20 transition-all placeholder-slate-400"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filtroProducto}
                onChange={(e) => setFiltroProducto(e.target.value)}
                className="px-3 py-2 bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer max-w-[170px]"
              >
                <option value="">Todos los productos</option>
                {productos?.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>

              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="px-3 py-2 bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer max-w-[140px]"
              >
                <option value="">Todos los tipos</option>
                {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {/* Tabla de Movimientos Kardex */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            {isLoading ? (
              <div className="py-20 flex justify-center">
                <Spinner />
              </div>
            ) : !movimientosFiltrados.length ? (
              <EmptyState title="Sin movimientos registrados" subtitle="Registra el primer movimiento desde el formulario lateral." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-3.5 whitespace-nowrap">Fecha / Hora</th>
                      <th className="py-3.5 px-3.5">Producto / SKU</th>
                      <th className="py-3.5 px-3.5 text-center">Tipo</th>
                      <th className="py-3.5 px-3.5 text-right">Cant.</th>
                      <th className="py-3.5 px-3.5 text-center">Balance</th>
                      <th className="py-3.5 px-4 text-right">Usuario / Ref.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {movimientosFiltrados.map((m) => {
                      const prodObj = productos?.find(p => p.id === m.producto_id);
                      const isPositive = m.tipo === 'entrada' || m.tipo === 'devolucion';
                      const isNegative = m.tipo === 'salida';

                      return (
                        <tr key={m.id} className="hover:bg-slate-50/80 transition-colors duration-150 group">
                          {/* Fecha / Hora */}
                          <td className="py-3.5 px-3.5 align-middle text-slate-500 text-[11px] font-medium whitespace-nowrap">
                            {new Date(m.created_at).toLocaleString('es-MX', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </td>

                          {/* Producto + SKU + Thumbnail */}
                          <td className="py-3.5 px-3.5 align-middle">
                            <div className="flex items-center gap-2.5">
                              <ProductThumb src={prodObj?.foto_url} />
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 text-xs truncate group-hover:text-orange-600 transition-colors">
                                  {m.producto_nombre}
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                  {m.producto_codigo}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Tipo Movement Badge Liso Neutral */}
                          <td className="py-3.5 px-3.5 align-middle text-center whitespace-nowrap">
                            <MovementBadge tipo={m.tipo} />
                          </td>

                          {/* Cantidad Lisa y Humana */}
                          <td className="py-3.5 px-3.5 align-middle text-right font-semibold text-slate-800 text-xs whitespace-nowrap">
                            {isPositive ? `+${m.cantidad}` : isNegative ? `-${m.cantidad}` : m.cantidad}
                          </td>

                          {/* Balance (Antes -> Después) */}
                          <td className="py-3.5 px-3.5 align-middle text-center whitespace-nowrap text-xs font-medium text-slate-600">
                            <span className="text-slate-400">{m.cantidad_anterior}</span>
                            <span className="mx-1 text-slate-400">→</span>
                            <span className="font-bold text-slate-900">{m.cantidad_nueva}</span>
                          </td>

                          {/* Usuario / Ref */}
                          <td className="py-3.5 px-4 align-middle text-right whitespace-nowrap">
                            <p className="font-semibold text-slate-800 text-xs">{m.usuario_nombre || 'Sistema'}</p>
                            {m.referencia && (
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{m.referencia}</p>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Componente Lector de Código de Barras Modal */}
      <BarcodeScanner open={scannerAbierto} onClose={() => setScannerAbierto(false)} onDetected={handleCodigoDetectado} />
    </div>
  );
}
