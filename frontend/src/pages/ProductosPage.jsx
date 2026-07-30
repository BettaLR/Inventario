import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  listarProductos, crearProducto, actualizarProducto, eliminarProducto,
} from '../services/productosService';
import { listarCategorias } from '../services/categoriasService';
import { listarProveedores } from '../services/proveedoresService';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Field, { inputClass } from '../components/ui/Field';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const schema = Yup.object({
  codigo: Yup.string().required('El código (SKU) es requerido'),
  nombre: Yup.string().required('El nombre es requerido'),
  codigo_barras: Yup.string().nullable(),
  categoria_id: Yup.string().nullable(),
  proveedor_id: Yup.string().nullable(),
  unidad_medida: Yup.string(),
  precio_unitario: Yup.number().min(0, 'Debe ser positivo').required('El precio es requerido'),
  stock_minimo: Yup.number().min(0, 'Debe ser positivo').required('El stock mínimo es requerido'),
  foto_url: Yup.string().nullable(),
});

const emptyProducto = {
  codigo: '', codigo_barras: '', nombre: '', descripcion: '', foto_url: '',
  categoria_id: '', proveedor_id: '', unidad_medida: 'unidad', precio_unitario: '', stock_minimo: '',
};

export default function ProductosPage() {
  const { hasRole } = useAuth();
  const puedeEditar = hasRole('Admin', 'Gerente');
  const puedeEliminar = hasRole('Admin');
  const queryClient = useQueryClient();

  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [soloBajoStock, setSoloBajoStock] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [productoAEliminar, setProductoAEliminar] = useState(null);

  const { data: productos, isLoading } = useQuery({
    queryKey: ['productos', busqueda, categoriaFiltro, soloBajoStock],
    queryFn: () => listarProductos({
      busqueda: busqueda || undefined,
      categoria_id: categoriaFiltro || undefined,
      bajo_stock: soloBajoStock || undefined,
    }),
  });

  const { data: categorias } = useQuery({ queryKey: ['categorias'], queryFn: listarCategorias });
  const { data: proveedores } = useQuery({ queryKey: ['proveedores-lite'], queryFn: () => listarProveedores() });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['productos'] });

  const crearMutation = useMutation({
    mutationFn: crearProducto,
    onSuccess: () => { toast.success('Producto creado'); invalidar(); cerrarModal(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Error al crear producto'),
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ id, data }) => actualizarProducto(id, data),
    onSuccess: () => { toast.success('Producto actualizado'); invalidar(); cerrarModal(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Error al actualizar producto'),
  });

  const eliminarMutation = useMutation({
    mutationFn: eliminarProducto,
    onSuccess: () => { toast.success('Producto desactivado'); invalidar(); setProductoAEliminar(null); },
    onError: (err) => toast.error(err.response?.data?.message || 'Error al desactivar producto'),
  });

  const formik = useFormik({
    initialValues: emptyProducto,
    validationSchema: schema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const payload = {
        ...values,
        categoria_id: values.categoria_id || null,
        proveedor_id: values.proveedor_id || null,
        precio_unitario: Number(values.precio_unitario),
        stock_minimo: Number(values.stock_minimo),
      };
      if (productoEditando) {
        actualizarMutation.mutate({ id: productoEditando.id, data: payload });
      } else {
        crearMutation.mutate(payload);
      }
    },
  });

  const abrirNuevo = () => {
    setProductoEditando(null);
    formik.resetForm({ values: emptyProducto });
    setModalAbierto(true);
  };

  const abrirEditar = (producto) => {
    setProductoEditando(producto);
    formik.resetForm({
      values: {
        codigo: producto.codigo,
        codigo_barras: producto.codigo_barras || '',
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        foto_url: producto.foto_url || '',
        categoria_id: producto.categoria_id || '',
        proveedor_id: producto.proveedor_id || '',
        unidad_medida: producto.unidad_medida || 'unidad',
        precio_unitario: producto.precio_unitario,
        stock_minimo: producto.stock_minimo,
      },
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setProductoEditando(null);
  };

  const guardando = crearMutation.isPending || actualizarMutation.isPending;

  return (
    <div>
      <PageHeader
        title="Catálogo de productos"
        subtitle="CRUD de productos con SKU, código de barras, categoría y foto"
        actions={puedeEditar && <Button onClick={abrirNuevo}>Nuevo producto</Button>}
      />

      <div className="panel p-4 mb-4 flex flex-wrap gap-3 items-center">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, SKU o código de barras..."
          className={`${inputClass(false)} max-w-xs`}
        />
        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className={`${inputClass(false)} max-w-[180px]`}
        >
          <option value="">Todas las categorías</option>
          {categorias?.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-ink-600 cursor-pointer">
          <input type="checkbox" checked={soloBajoStock} onChange={(e) => setSoloBajoStock(e.target.checked)} />
          Solo stock bajo
        </label>
      </div>

      <div className="panel overflow-hidden">
        {isLoading ? (
          <Spinner />
        ) : !productos?.length ? (
          <EmptyState title="No hay productos" subtitle="Crea el primero con el botón de arriba" />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Proveedor</th>
                  <th className="text-right!">Precio</th>
                  <th className="text-right!">Stock</th>
                  <th>Estado</th>
                  <th className="text-right!">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => {
                  const bajoStock = p.stock_total <= p.stock_minimo;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          {p.foto_url ? (
                            <img src={p.foto_url} alt={p.nombre} className="w-9 h-9 rounded-[2px] object-cover border border-line" />
                          ) : (
                            <div className="w-9 h-9 rounded-[2px] bg-thead border border-line" />
                          )}
                          <div>
                            <p className="font-medium text-ink-900">{p.nombre}</p>
                            <p className="text-xs text-ink-400">SKU {p.codigo}{p.codigo_barras ? ` · ${p.codigo_barras}` : ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-ink-600">{p.categoria_nombre || '—'}</td>
                      <td className="text-ink-600">{p.proveedor_nombre || '—'}</td>
                      <td className="text-right text-ink-900">${Number(p.precio_unitario).toFixed(2)}</td>
                      <td className="text-right font-medium text-ink-900">{p.stock_total} {p.unidad_medida}</td>
                      <td>
                        {bajoStock ? <Badge color="red">Stock bajo</Badge> : <Badge color="green">OK</Badge>}
                      </td>
                      <td className="text-right space-x-2 whitespace-nowrap">
                        {puedeEditar && (
                          <Button size="sm" variant="secondary" onClick={() => abrirEditar(p)}>Editar</Button>
                        )}
                        {puedeEliminar && (
                          <Button size="sm" variant="ghost" onClick={() => setProductoAEliminar(p)}>Desactivar</Button>
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

      <Modal open={modalAbierto} onClose={cerrarModal} title={productoEditando ? 'Editar producto' : 'Nuevo producto'} maxWidth="max-w-2xl">
        <form onSubmit={formik.handleSubmit} noValidate>
          <div className="grid grid-cols-2 gap-x-4">
            <Field label="SKU / Código" required error={formik.touched.codigo && formik.errors.codigo}>
              <input className={inputClass(formik.touched.codigo && formik.errors.codigo)} {...formik.getFieldProps('codigo')} />
            </Field>
            <Field label="Código de barras" error={formik.touched.codigo_barras && formik.errors.codigo_barras}>
              <input className={inputClass(false)} {...formik.getFieldProps('codigo_barras')} />
            </Field>
          </div>

          <Field label="Nombre" required error={formik.touched.nombre && formik.errors.nombre}>
            <input className={inputClass(formik.touched.nombre && formik.errors.nombre)} {...formik.getFieldProps('nombre')} />
          </Field>

          <Field label="Descripción">
            <textarea rows={2} className={inputClass(false)} {...formik.getFieldProps('descripcion')} />
          </Field>

          <Field label="URL de foto">
            <input className={inputClass(false)} placeholder="https://..." {...formik.getFieldProps('foto_url')} />
          </Field>

          <div className="grid grid-cols-2 gap-x-4">
            <Field label="Categoría">
              <select className={inputClass(false)} {...formik.getFieldProps('categoria_id')}>
                <option value="">Sin categoría</option>
                {categorias?.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </Field>
            <Field label="Proveedor">
              <select className={inputClass(false)} {...formik.getFieldProps('proveedor_id')}>
                <option value="">Sin proveedor</option>
                {proveedores?.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-x-4">
            <Field label="Unidad de medida">
              <input className={inputClass(false)} {...formik.getFieldProps('unidad_medida')} />
            </Field>
            <Field label="Precio unitario" required error={formik.touched.precio_unitario && formik.errors.precio_unitario}>
              <input type="number" step="0.01" min="0" className={inputClass(formik.touched.precio_unitario && formik.errors.precio_unitario)} {...formik.getFieldProps('precio_unitario')} />
            </Field>
            <Field label="Stock mínimo" required error={formik.touched.stock_minimo && formik.errors.stock_minimo}>
              <input type="number" min="0" className={inputClass(formik.touched.stock_minimo && formik.errors.stock_minimo)} {...formik.getFieldProps('stock_minimo')} />
            </Field>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="secondary" onClick={cerrarModal}>Cancelar</Button>
            <Button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!productoAEliminar}
        onClose={() => setProductoAEliminar(null)}
        onConfirm={() => eliminarMutation.mutate(productoAEliminar.id)}
        loading={eliminarMutation.isPending}
        title="Desactivar producto"
        message={`¿Seguro que deseas desactivar "${productoAEliminar?.nombre}"? Podrás reactivarlo después editándolo.`}
      />
    </div>
  );
}
