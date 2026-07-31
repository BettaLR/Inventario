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
  const puedeEditar = hasRole('Admin', 'Gerente', 'Administrador', 'Almacenista');
  const puedeEliminar = hasRole('Admin', 'Administrador');
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
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <PageHeader
        title="Catálogo de productos"
        subtitle="Gestión ejecutiva de catálogo, SKU, categorías y control de inventario"
        actions={
          puedeEditar && (
            <Button onClick={abrirNuevo} className="flex items-center gap-1.5 shadow-sm">
              <span>+</span>
              <span>Nuevo producto</span>
            </Button>
          )
        }
      />

      {/* Tarjeta Contenedora Principal ERP */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 overflow-hidden">
        
        {/* Barra Superior de Filtros y Búsqueda */}
        <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/80">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Input de Búsqueda */}
            <div className="relative flex-1 min-w-[240px]">
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, SKU o código..."
                className="w-full pl-9 pr-3.5 py-2 bg-white text-slate-800 rounded-lg text-xs sm:text-sm font-medium border border-slate-300 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all placeholder-slate-400"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Selector de Categorías */}
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="px-3.5 py-2 bg-white text-slate-800 rounded-lg text-xs sm:text-sm font-medium border border-slate-300 outline-none focus:ring-2 focus:ring-orange-500 transition-all min-w-[170px]"
            >
              <option value="">Todas las categorías</option>
              {categorias?.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>

            {/* Checkbox Solo Stock Bajo */}
            <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 cursor-pointer select-none px-1">
              <input
                type="checkbox"
                checked={soloBajoStock}
                onChange={(e) => setSoloBajoStock(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
              />
              <span>Solo stock bajo</span>
            </label>
          </div>

          {/* Botón Acción Secundario en Móvil o Desktop */}
          {puedeEditar && (
            <button
              onClick={abrirNuevo}
              className="md:hidden w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold py-2 px-4 rounded-lg text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>+ Nuevo producto</span>
            </button>
          )}
        </div>

        {/* Tabla Ejecutiva de Productos */}
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Spinner />
          </div>
        ) : !productos?.length ? (
          <EmptyState title="No hay productos registrados" subtitle="Comienza agregando el primer producto a tu catálogo." />
        ) : (
          <div className="overflow-x-auto border border-slate-200/80 rounded-lg">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3 w-10 text-center">
                    <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer" />
                  </th>
                  <th className="py-3 px-4">Producto / SKU</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Proveedor</th>
                  <th className="py-3 px-4 text-right">Precio</th>
                  <th className="py-3 px-4 text-right">Stock</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productos.map((p) => {
                  const bajoStock = p.stock_total <= p.stock_minimo;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Checkbox */}
                      <td className="py-3.5 px-3 text-center align-middle">
                        <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer" />
                      </td>

                      {/* Imagen + Producto / SKU */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex items-center gap-3">
                          {p.foto_url ? (
                            <img
                              src={p.foto_url}
                              alt={p.nombre}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 bg-slate-100 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400 font-bold text-xs">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate tracking-tight">{p.nombre}</p>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                              SKU: {p.codigo}{p.codigo_barras ? ` · ${p.codigo_barras}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Categoría */}
                      <td className="py-3.5 px-4 align-middle font-medium text-slate-700">
                        {p.categoria_nombre ? (
                          <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-md text-xs font-semibold">
                            {p.categoria_nombre}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Proveedor */}
                      <td className="py-3.5 px-4 align-middle font-medium text-slate-600">
                        {p.proveedor_nombre || '—'}
                      </td>

                      {/* Precio */}
                      <td className="py-3.5 px-4 align-middle text-right font-bold text-slate-900">
                        ${Number(p.precio_unitario).toFixed(2)}
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-4 align-middle text-right font-semibold text-slate-900">
                        <span>{p.stock_total}</span>{' '}
                        <span className="text-xs font-normal text-slate-500">{p.unidad_medida}</span>
                      </td>

                      {/* Estado Badge */}
                      <td className="py-3.5 px-4 align-middle text-center">
                        {bajoStock ? (
                          <Badge color="red">Stock bajo</Badge>
                        ) : (
                          <Badge color="green">OK</Badge>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 align-middle text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {puedeEditar && (
                            <Button size="sm" variant="secondary" onClick={() => abrirEditar(p)}>
                              Editar
                            </Button>
                          )}
                          {puedeEliminar && (
                            <Button size="sm" variant="ghost" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => setProductoAEliminar(p)}>
                              Desactivar
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Formulario Producto */}
      <Modal open={modalAbierto} onClose={cerrarModal} title={productoEditando ? 'Editar producto' : 'Nuevo producto'} maxWidth="max-w-2xl">
        <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="SKU / Código" required error={formik.touched.codigo && formik.errors.codigo}>
              <input className={inputClass(formik.touched.codigo && formik.errors.codigo)} {...formik.getFieldProps('codigo')} />
            </Field>
            <Field label="Código de barras" error={formik.touched.codigo_barras && formik.errors.codigo_barras}>
              <input className={inputClass(false)} {...formik.getFieldProps('codigo_barras')} />
            </Field>
          </div>

          <Field label="Nombre del Producto" required error={formik.touched.nombre && formik.errors.nombre}>
            <input className={inputClass(formik.touched.nombre && formik.errors.nombre)} {...formik.getFieldProps('nombre')} />
          </Field>

          <Field label="Descripción">
            <textarea rows={2} className={inputClass(false)} {...formik.getFieldProps('descripcion')} />
          </Field>

          <Field label="URL de Foto del Producto">
            <input className={inputClass(false)} placeholder="https://..." {...formik.getFieldProps('foto_url')} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Unidad de medida">
              <input className={inputClass(false)} {...formik.getFieldProps('unidad_medida')} />
            </Field>
            <Field label="Precio unitario ($)" required error={formik.touched.precio_unitario && formik.errors.precio_unitario}>
              <input type="number" step="0.01" min="0" className={inputClass(formik.touched.precio_unitario && formik.errors.precio_unitario)} {...formik.getFieldProps('precio_unitario')} />
            </Field>
            <Field label="Stock mínimo" required error={formik.touched.stock_minimo && formik.errors.stock_minimo}>
              <input type="number" min="0" className={inputClass(formik.touched.stock_minimo && formik.errors.stock_minimo)} {...formik.getFieldProps('stock_minimo')} />
            </Field>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200">
            <Button type="button" variant="secondary" onClick={cerrarModal}>Cancelar</Button>
            <Button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar'}</Button>
          </div>
        </form>
      </Modal>

      {/* Confirmación Desactivación */}
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
