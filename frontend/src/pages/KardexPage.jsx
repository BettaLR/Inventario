import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { listarMovimientos, registrarMovimiento } from '../services/movimientosService';
import { listarProductos, buscarPorCodigoBarras } from '../services/productosService';
import { listarAlmacenes } from '../services/almacenesService';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Field, { inputClass } from '../components/ui/Field';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import BarcodeScanner from '../components/kardex/BarcodeScanner';

const TIPOS = [
  { value: 'entrada', label: 'Entrada (compra a proveedor)' },
  { value: 'salida', label: 'Salida (venta)' },
  { value: 'devolucion', label: 'Devolución de cliente' },
  { value: 'transferencia', label: 'Transferencia entre almacenes' },
  { value: 'ajuste', label: 'Ajuste de inventario' },
];

const TIPO_COLOR = {
  entrada: 'green', devolucion: 'blue', salida: 'red', transferencia: 'yellow', ajuste: 'slate',
};

export default function KardexPage() {
  const queryClient = useQueryClient();
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
      toast.success('Movimiento registrado');
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
      toast.error(`Ningún producto con código ${codigo}`);
    }
  };

  return (
    <div>
      <PageHeader title="Kardex de movimientos" subtitle="Registra entradas, salidas, transferencias y ajustes de stock" />

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
        <div className="panel p-5 h-fit">
          <h3 className="font-semibold text-ink-900 mb-4 text-xs uppercase tracking-wide">Registrar movimiento</h3>
          <form onSubmit={formik.handleSubmit} noValidate>
            <Field label="Tipo de movimiento" required>
              <select className={inputClass(false)} {...formik.getFieldProps('tipo')}>
                {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>

            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Field label="Producto" required error={formik.touched.producto_id && formik.errors.producto_id}>
                  <select className={inputClass(formik.touched.producto_id && formik.errors.producto_id)} {...formik.getFieldProps('producto_id')}>
                    <option value="">Selecciona...</option>
                    {productos?.map((p) => <option key={p.id} value={p.id}>{p.nombre} ({p.codigo})</option>)}
                  </select>
                </Field>
              </div>
              <Button type="button" variant="secondary" size="sm" className="mb-4" onClick={() => setScannerAbierto(true)} title="Escanear código de barras">
                Escanear
              </Button>
            </div>

            {productoSeleccionado && (
              <p className="text-xs text-ink-400 -mt-2 mb-3">Stock total actual: {productoSeleccionado.stock_total} {productoSeleccionado.unidad_medida}</p>
            )}

            <Field label={formik.values.tipo === 'transferencia' ? 'Almacén origen' : 'Almacén'} required error={formik.touched.almacen_id && formik.errors.almacen_id}>
              <select className={inputClass(formik.touched.almacen_id && formik.errors.almacen_id)} {...formik.getFieldProps('almacen_id')}>
                <option value="">Selecciona...</option>
                {almacenes?.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </Field>

            {formik.values.tipo === 'transferencia' && (
              <Field label="Almacén destino" required error={formik.touched.almacen_destino_id && formik.errors.almacen_destino_id}>
                <select className={inputClass(formik.touched.almacen_destino_id && formik.errors.almacen_destino_id)} {...formik.getFieldProps('almacen_destino_id')}>
                  <option value="">Selecciona...</option>
                  {almacenes?.filter((a) => String(a.id) !== String(formik.values.almacen_id)).map((a) => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                </select>
              </Field>
            )}

            {formik.values.tipo === 'ajuste' ? (
              <Field label="Cantidad final en almacén" required error={formik.touched.cantidad_nueva && formik.errors.cantidad_nueva}>
                <input type="number" min="0" className={inputClass(formik.touched.cantidad_nueva && formik.errors.cantidad_nueva)} {...formik.getFieldProps('cantidad_nueva')} />
              </Field>
            ) : (
              <Field label="Cantidad" required error={formik.touched.cantidad && formik.errors.cantidad}>
                <input type="number" min="1" className={inputClass(formik.touched.cantidad && formik.errors.cantidad)} {...formik.getFieldProps('cantidad')} />
              </Field>
            )}

            <Field label="Motivo">
              <input className={inputClass(false)} placeholder="Ej. Compra inicial, merma, devolución..." {...formik.getFieldProps('motivo')} />
            </Field>
            <Field label="Referencia">
              <input className={inputClass(false)} placeholder="Ej. OC-001, factura..." {...formik.getFieldProps('referencia')} />
            </Field>

            <Button type="submit" className="w-full" disabled={registrarMutation.isPending}>
              {registrarMutation.isPending ? 'Registrando...' : 'Registrar movimiento'}
            </Button>
          </form>
        </div>

        <div>
          <div className="panel p-4 mb-4 flex flex-wrap gap-3">
            <select value={filtroProducto} onChange={(e) => setFiltroProducto(e.target.value)} className={`${inputClass(false)} max-w-[220px]`}>
              <option value="">Todos los productos</option>
              {productos?.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className={`${inputClass(false)} max-w-[220px]`}>
              <option value="">Todos los tipos</option>
              {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="panel overflow-hidden">
            {isLoading ? <Spinner /> : !movimientos?.length ? (
              <EmptyState title="Sin movimientos" subtitle="Registra el primero desde el formulario" />
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Producto</th>
                      <th>Tipo</th>
                      <th>Almacén</th>
                      <th className="text-right!">Cant.</th>
                      <th className="text-right!">Antes → Después</th>
                      <th>Usuario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.map((m) => (
                      <tr key={m.id}>
                        <td className="text-ink-400 whitespace-nowrap">{new Date(m.created_at).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}</td>
                        <td>
                          <p className="font-medium text-ink-900">{m.producto_nombre}</p>
                          <p className="text-xs text-ink-400">{m.producto_codigo}</p>
                        </td>
                        <td><Badge color={TIPO_COLOR[m.tipo]}>{m.tipo}</Badge></td>
                        <td className="text-ink-600">
                          {m.almacen_nombre}{m.almacen_destino_nombre ? ` → ${m.almacen_destino_nombre}` : ''}
                        </td>
                        <td className="text-right text-ink-900">{m.cantidad}</td>
                        <td className="text-right text-ink-400">{m.cantidad_anterior} → {m.cantidad_nueva}</td>
                        <td className="text-ink-600">{m.usuario_nombre}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <BarcodeScanner open={scannerAbierto} onClose={() => setScannerAbierto(false)} onDetected={handleCodigoDetectado} />
    </div>
  );
}
