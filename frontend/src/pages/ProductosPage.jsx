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
import Modal from '../components/ui/Modal';
import Field, { inputClass } from '../components/ui/Field';
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

// Componente Robusto de Imagen con Fallback anti-imágenes rotas
function ProductImage({ src, nombre }) {
  const [errorImg, setErrorImg] = useState(false);

  if (!src || errorImg) {
    return (
      <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 text-slate-400 shadow-2xs">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      onError={(e) => {
        e.currentTarget.onerror = null;
        setErrorImg(true);
      }}
      className="w-11 h-11 rounded-xl object-cover border border-slate-200/80 shrink-0 shadow-2xs bg-slate-50"
    />
  );
}

export default function ProductosPage() {
  const { hasRole } = useAuth();
  const puedeEditar = hasRole('Admin', 'Gerente', 'Administrador', 'Almacenista');
  const puedeEliminar = hasRole('Admin', 'Administrador');
  const queryClient = useQueryClient();

  const [tabActiva, setTabActiva] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [menuAbiertoId, setMenuAbiertoId] = useState(null);

  const soloBajoStock = tabActiva === 'bajo_stock';

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
    onSuccess: () => { toast.success('Producto creado exitosamente'); invalidar(); cerrarModal(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Error al crear producto'),
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ id, data }) => actualizarProducto(id, data),
    onSuccess: () => { toast.success('Producto actualizado exitosamente'); invalidar(); cerrarModal(); },
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
    setMenuAbiertoId(null);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setProductoEditando(null);
  };

  const guardando = crearMutation.isPending || actualizarMutation.isPending;

  // Filtrado dinámico por pestaña
  const productosFiltrados = (productos || []).filter((p) => {
    if (tabActiva === 'online') return p.stock_total > p.stock_minimo;
    if (tabActiva === 'bajo_stock') return p.stock_total <= p.stock_minimo;
    if (tabActiva === 'pendientes') return p.stock_total === 0;
    if (tabActiva === 'borradores') return false;
    return true;
  });

  const countBajoStock = (productos || []).filter(p => p.stock_total <= p.stock_minimo).length;
  const countOnline = (productos || []).filter(p => p.stock_total > p.stock_minimo).length;

  return (
    <div className="space-y-5 pb-8 font-sans w-full">
      {/* 1. Header Superior Limpio */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Gestión de Productos</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Administra catálogo, precios, categorías y control de inventario en tiempo real
          </p>
        </div>

        {/* Acciones Superiores */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => toast.success('Exportando catálogo de productos a CSV...')}
            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl text-xs sm:text-sm shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Exportar</span>
          </button>

          {puedeEditar && (
            <button
              onClick={abrirNuevo}
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-sm shadow-orange-950/20 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>+ Nuevo Producto</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Tabs Bar */}
      <div className="border-b border-slate-200/80 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar pt-1">
        <div className="flex items-center gap-6 text-xs sm:text-sm whitespace-nowrap">
          {[
            { id: 'todos', label: 'Todos los productos', count: productos?.length || 0 },
            { id: 'online', label: 'Online / Disponibles', count: countOnline },
            { id: 'bajo_stock', label: 'Bajo Stock', count: countBajoStock, badgeColor: 'bg-amber-100 text-amber-700' },
            { id: 'pendientes', label: 'Agotados', count: 0 },
            { id: 'borradores', label: 'Borradores', count: 0 },
          ].map((tab) => {
            const esActivo = tabActiva === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTabActiva(tab.id)}
                className={`pb-3 font-semibold transition-all relative flex items-center gap-2 cursor-pointer ${
                  esActivo
                    ? 'text-orange-600 font-bold border-b-2 border-orange-600 -mb-[1px]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 text-[11px] rounded-full font-bold ${
                    tab.badgeColor || (esActivo ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-600')
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selector de Categorías Rápido */}
        <div className="hidden md:flex items-center gap-2 pb-2">
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="px-3 py-1.5 bg-white text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
          >
            <option value="">Todas las categorías</option>
            {categorias?.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Toolbar de Búsqueda */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, SKU o código de barras..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50/70 focus:bg-white text-slate-800 rounded-xl text-xs sm:text-sm font-medium border border-slate-200/80 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder-slate-400"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* 4. Tabla Plana Ampliada y Dilatada sin Cortes (min-w-[980px]) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden w-full">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Spinner />
          </div>
        ) : !productosFiltrados.length ? (
          <EmptyState title="No se encontraron productos" subtitle="No hay productos en esta sección o con los filtros aplicados." />
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[980px] text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-3 w-10 text-center">
                    <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer" />
                  </th>
                  <th className="py-3.5 px-3 w-[32%]">Producto</th>
                  <th className="py-3.5 px-3 w-[12%]">Categoría</th>
                  <th className="py-3.5 px-3 w-[13%]">Proveedor</th>
                  <th className="py-3.5 px-3 w-[12%] text-right">Precio</th>
                  <th className="py-3.5 px-3 w-[11%] text-right">Stock</th>
                  <th className="py-3.5 px-3 w-[10%] text-center">Estado</th>
                  <th className="py-3.5 px-4 w-[10%] text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {productosFiltrados.map((p) => {
                  const bajoStock = p.stock_total <= p.stock_minimo;
                  const menuAbierto = menuAbiertoId === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors duration-150 group">
                      {/* Checkbox */}
                      <td className="py-3.5 px-3 text-center align-middle">
                        <input
                          type="checkbox"
                          className="w-3.5 h-3.5 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                        />
                      </td>

                      {/* Columna Producto */}
                      <td className="py-3.5 px-3 align-middle">
                        <div className="flex items-center gap-3">
                          <ProductImage src={p.foto_url} nombre={p.nombre} />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 text-xs sm:text-sm truncate group-hover:text-orange-600 transition-colors">
                              {p.nombre}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                              SKU: {p.codigo}{p.codigo_barras ? ` · ${p.codigo_barras}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Categoría Badge */}
                      <td className="py-3.5 px-3 align-middle font-medium whitespace-nowrap">
                        {p.categoria_nombre ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/70">
                            {p.categoria_nombre}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Proveedor */}
                      <td className="py-3.5 px-3 align-middle font-medium text-slate-600 whitespace-nowrap">
                        {p.proveedor_nombre || '—'}
                      </td>

                      {/* Precio */}
                      <td className="py-3.5 px-3 align-middle text-right whitespace-nowrap">
                        <p className="font-bold text-slate-900 text-xs sm:text-sm">
                          ${Number(p.precio_unitario).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">MXN / {p.unidad_medida}</p>
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-3 align-middle text-right whitespace-nowrap">
                        <p className={`font-semibold text-xs sm:text-sm ${bajoStock ? 'text-amber-700 font-bold' : 'text-slate-800'}`}>
                          {p.stock_total} unidades
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium">
                          (Mín. {p.stock_minimo})
                        </p>
                      </td>

                      {/* Estado Sobrio */}
                      <td className="py-3.5 px-3 align-middle text-center whitespace-nowrap">
                        {bajoStock ? (
                          <div className="inline-flex items-center justify-center gap-1.5 px-2 py-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            <span className="text-amber-700 text-xs font-medium">Bajo Stock</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center gap-1.5 px-2 py-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span className="text-slate-700 text-xs font-medium">Disponible</span>
                          </div>
                        )}
                      </td>

                      {/* Acciones Completa Visibilidad */}
                      <td className="py-3.5 px-4 align-middle text-right whitespace-nowrap relative">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {puedeEditar && (
                            <button
                              onClick={() => abrirEditar(p)}
                              title="Editar producto"
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200/80 shadow-2xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all cursor-pointer flex items-center gap-1"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span>Editar</span>
                            </button>
                          )}

                          {/* Botón 3 Puntos con Dropdown Menu */}
                          <div className="relative">
                            <button
                              onClick={() => setMenuAbiertoId(menuAbierto ? null : p.id)}
                              title="Más opciones"
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                menuAbierto ? 'bg-slate-200 text-slate-900' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </button>

                            {/* Dropdown Menu Desplegable */}
                            {menuAbierto && (
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 text-left text-xs text-slate-700 font-medium">
                                <button
                                  onClick={() => {
                                    toast.success(`Detalles de ${p.nombre}: SKU ${p.codigo}`);
                                    setMenuAbiertoId(null);
                                  }}
                                  className="w-full px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer text-slate-700"
                                >
                                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  <span>Ver Detalles</span>
                                </button>

                                <button
                                  onClick={() => abrirEditar(p)}
                                  className="w-full px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer text-slate-700"
                                >
                                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  <span>Editar Producto</span>
                                </button>

                                <button
                                  onClick={() => {
                                    toast.success(`Copiando registro de "${p.nombre}"...`);
                                    setMenuAbiertoId(null);
                                  }}
                                  className="w-full px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer text-slate-700"
                                >
                                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  <span>Duplicar Registro</span>
                                </button>

                                <button
                                  onClick={() => {
                                    toast.success(`Estado de "${p.nombre}" actualizado.`);
                                    setMenuAbiertoId(null);
                                  }}
                                  className="w-full px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer text-slate-700"
                                >
                                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                  <span>Cambiar Estado</span>
                                </button>

                                <div className="border-t border-slate-100 my-1" />

                                {puedeEliminar && (
                                  <button
                                    onClick={() => {
                                      setProductoAEliminar(p);
                                      setMenuAbiertoId(null);
                                    }}
                                    className="w-full px-3.5 py-2 hover:bg-rose-50 flex items-center gap-2 cursor-pointer text-rose-600 font-medium"
                                  >
                                    <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span>Eliminar Producto</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
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

          <Field label="URL de Foto del Producto (Unsplash / HTTP)">
            <input className={inputClass(false)} placeholder="https://images.unsplash.com/photo-..." {...formik.getFieldProps('foto_url')} />
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
            <button
              type="button"
              onClick={cerrarModal}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs shadow-orange-950/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : 'Guardar Producto'}
            </button>
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
