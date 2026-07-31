import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  listarProveedores, crearProveedor, actualizarProveedor, eliminarProveedor, obtenerProveedor,
} from '../services/proveedoresService';
import {
  listarAlmacenes, crearAlmacen, actualizarAlmacen, eliminarAlmacen,
} from '../services/almacenesService';
import {
  listarCategorias, crearCategoria, actualizarCategoria, eliminarCategoria,
} from '../services/categoriasService';
import { listarUsuarios } from '../services/usuariosService';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/ui/Modal';
import Field, { inputClass } from '../components/ui/Field';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const TABS = [
  { key: 'proveedores', label: 'Proveedores', countKey: 'proveedores' },
  { key: 'almacenes', label: 'Almacenes', countKey: 'almacenes' },
  { key: 'categorias', label: 'Categorías', countKey: 'categorias' },
];

export default function CatalogosPage() {
  const [tab, setTab] = useState('proveedores');
  const [busqueda, setBusqueda] = useState('');

  const { data: proveedores } = useQuery({ queryKey: ['proveedores'], queryFn: () => listarProveedores() });
  const { data: almacenes } = useQuery({ queryKey: ['almacenes'], queryFn: listarAlmacenes });
  const { data: categorias } = useQuery({ queryKey: ['categorias'], queryFn: listarCategorias });

  const getCount = (key) => {
    if (key === 'proveedores') return proveedores?.length || 0;
    if (key === 'almacenes') return almacenes?.length || 0;
    if (key === 'categorias') return categorias?.length || 0;
    return 0;
  };

  return (
    <div className="space-y-5 pb-8 font-sans w-full">
      {/* 1. Header Principal Estilo Enterprise SaaS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">Gestión de Catálogos</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Administra los proveedores, almacenes y categorías configurados en el sistema
          </p>
        </div>
      </div>

      {/* 2. Contenedor Plano Liso en Tarjeta Blanca (Estilo Stripe / Vercel) */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-5">
        
        {/* Pestañas Superiores Lisas */}
        <div className="border-b border-slate-200/80 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-6 text-xs sm:text-sm whitespace-nowrap">
            {TABS.map((t) => {
              const esActivo = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`pb-3 font-semibold transition-all relative flex items-center gap-2 cursor-pointer ${
                    esActivo
                      ? 'text-slate-900 font-bold border-b-2 border-slate-900 -mb-[1px]'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>{t.label}</span>
                  <span
                    className={`px-2 py-0.5 text-[11px] rounded-md font-semibold ${
                      esActivo ? 'bg-slate-100 text-slate-900 font-bold' : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    {getCount(t.key)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Menú Desplegable Filtro Neutral */}
          <div className="hidden sm:flex items-center gap-2 pb-2">
            <select className="px-3 py-1.5 bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 outline-none focus:ring-2 focus:ring-slate-500/20 cursor-pointer">
              <option value="todos">Todos los registros</option>
              <option value="activos">Sólo Activos</option>
            </select>
          </div>
        </div>

        {/* Renderizado de la Pestaña Seleccionada */}
        {tab === 'proveedores' && <ProveedoresTab busqueda={busqueda} setBusqueda={setBusqueda} />}
        {tab === 'almacenes' && <AlmacenesTab busqueda={busqueda} setBusqueda={setBusqueda} />}
        {tab === 'categorias' && <CategoriasTab busqueda={busqueda} setBusqueda={setBusqueda} />}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// TAB PROVEEDORES ESTILO STRIPE / VERCEL NEUTRAL
// ----------------------------------------------------------------------
function ProveedoresTab({ busqueda, setBusqueda }) {
  const { hasRole } = useAuth();
  const puedeEditar = hasRole('Admin', 'Gerente', 'Administrador', 'Almacenista');
  const puedeEliminar = hasRole('Admin', 'Administrador');
  const queryClient = useQueryClient();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);
  const [verDetalle, setVerDetalle] = useState(null);

  const { data: proveedores, isLoading } = useQuery({ queryKey: ['proveedores'], queryFn: () => listarProveedores() });
  const { data: detalle } = useQuery({
    queryKey: ['proveedor-detalle', verDetalle],
    queryFn: () => obtenerProveedor(verDetalle),
    enabled: !!verDetalle,
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['proveedores'] });

  const crearMutation = useMutation({
    mutationFn: crearProveedor,
    onSuccess: () => { toast.success('Proveedor creado exitosamente'); invalidar(); cerrar(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al crear proveedor'),
  });
  const actualizarMutation = useMutation({
    mutationFn: ({ id, data }) => actualizarProveedor(id, data),
    onSuccess: () => { toast.success('Proveedor actualizado exitosamente'); invalidar(); cerrar(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al actualizar proveedor'),
  });
  const eliminarMutation = useMutation({
    mutationFn: eliminarProveedor,
    onSuccess: () => { toast.success('Proveedor desactivado'); invalidar(); setAEliminar(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al desactivar proveedor'),
  });

  const formik = useFormik({
    initialValues: { nombre: '', contacto: '', telefono: '', email: '', direccion: '' },
    enableReinitialize: true,
    validationSchema: Yup.object({
      nombre: Yup.string().required('El nombre es requerido'),
      email: Yup.string().email('Email inválido').nullable(),
    }),
    onSubmit: (values) => {
      if (editando) actualizarMutation.mutate({ id: editando.id, data: values });
      else crearMutation.mutate(values);
    },
  });

  const abrirNuevo = () => { setEditando(null); formik.resetForm(); setModalAbierto(true); };
  const abrirEditar = (p) => {
    setEditando(p);
    formik.resetForm({ values: { nombre: p.nombre, contacto: p.contacto || '', telefono: p.telefono || '', email: p.email || '', direccion: p.direccion || '' } });
    setModalAbierto(true);
  };
  const cerrar = () => { setModalAbierto(false); setEditando(null); };

  const filtrados = (proveedores || []).filter((p) => {
    if (!busqueda) return true;
    const term = busqueda.toLowerCase();
    return (
      p.nombre?.toLowerCase().includes(term) ||
      p.contacto?.toLowerCase().includes(term) ||
      p.email?.toLowerCase().includes(term) ||
      p.telefono?.toLowerCase().includes(term)
    );
  });

  // Generador de Iniciales Sobrias en Fondo Neutro Slate
  const getAvatar = (nombre) => {
    const iniciales = nombre ? nombre.substring(0, 2).toUpperCase() : 'PV';
    return iniciales;
  };

  return (
    <div className="space-y-4">
      {/* Toolbar y Botón Primario Corporativo Neutro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, contacto, teléfono o email..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 focus:bg-white text-slate-800 rounded-xl text-xs sm:text-sm font-medium border border-slate-200 outline-none focus:ring-2 focus:ring-slate-500/20 transition-all placeholder-slate-400"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {puedeEditar && (
          <button
            onClick={abrirNuevo}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-xs active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>+ Nuevo Proveedor</span>
          </button>
        )}
      </div>

      {/* Tabla Maquetada y Densificada Lisa */}
      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white">
        {isLoading ? (
          <div className="py-20 flex justify-center"><Spinner /></div>
        ) : !filtrados.length ? (
          <EmptyState title="No se encontraron proveedores" subtitle="Agrega un nuevo proveedor para comenzar." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Proveedor</th>
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4">Teléfono</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtrados.map((p) => {
                  const iniciales = getAvatar(p.nombre);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors duration-150 group">
                      {/* Proveedor Iniciales Sobrias Slate + Nombre */}
                      <td className="py-3 px-4 align-middle whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-semibold text-xs border border-slate-200 flex items-center justify-center shrink-0">
                            {iniciales}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-xs sm:text-sm group-hover:text-slate-700 transition-colors">
                              {p.nombre}
                            </p>
                            {p.direccion && (
                              <p className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">
                                {p.direccion}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contacto Encargado */}
                      <td className="py-3 px-4 align-middle text-slate-700 font-medium text-xs sm:text-sm whitespace-nowrap">
                        {p.contacto || '—'}
                      </td>

                      {/* Teléfono Formateado Separado */}
                      <td className="py-3 px-4 align-middle text-slate-600 font-mono text-xs whitespace-nowrap">
                        {p.telefono ? p.telefono : '—'}
                      </td>

                      {/* Email Separado */}
                      <td className="py-3 px-4 align-middle text-slate-600 text-xs sm:text-sm whitespace-nowrap">
                        {p.email ? p.email : '—'}
                      </td>

                      {/* Estado Dot Neutral 6px esmeralda (Sin pill fosforescente) */}
                      <td className="py-3 px-4 align-middle text-center whitespace-nowrap">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span className="text-slate-700 text-xs font-medium">Activo</span>
                        </div>
                      </td>

                      {/* Botonera de Acciones Icónicas Sutiles */}
                      <td className="py-3 px-4 align-middle text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <button
                            onClick={() => setVerDetalle(p.id)}
                            title="Ver historial de compras"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>

                          {puedeEditar && (
                            <button
                              onClick={() => abrirEditar(p)}
                              title="Editar proveedor"
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}

                          {puedeEliminar && (
                            <button
                              onClick={() => setAEliminar(p)}
                              title="Desactivar proveedor"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
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

      {/* Modal Formulario Proveedor */}
      <Modal open={modalAbierto} onClose={cerrar} title={editando ? 'Editar proveedor' : 'Nuevo proveedor'}>
        <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
          <Field label="Nombre Comercial" required error={formik.touched.nombre && formik.errors.nombre}>
            <input className={inputClass(formik.touched.nombre && formik.errors.nombre)} {...formik.getFieldProps('nombre')} />
          </Field>
          <Field label="Persona de Contacto">
            <input className={inputClass(false)} {...formik.getFieldProps('contacto')} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Teléfono">
              <input className={inputClass(false)} placeholder="555-0102" {...formik.getFieldProps('telefono')} />
            </Field>
            <Field label="Correo Electrónico" error={formik.touched.email && formik.errors.email}>
              <input className={inputClass(formik.touched.email && formik.errors.email)} placeholder="contacto@empresa.com" {...formik.getFieldProps('email')} />
            </Field>
          </div>
          <Field label="Dirección Física">
            <textarea rows={2} className={inputClass(false)} {...formik.getFieldProps('direccion')} />
          </Field>
          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200">
            <button type="button" onClick={cerrar} className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm cursor-pointer">Cancelar</button>
            <button type="submit" disabled={crearMutation.isPending || actualizarMutation.isPending} className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs cursor-pointer">Guardar Proveedor</button>
          </div>
        </form>
      </Modal>

      {/* Modal Historial de Compras */}
      <Modal open={!!verDetalle} onClose={() => setVerDetalle(null)} title={`Historial de compras — ${detalle?.nombre || ''}`} maxWidth="max-w-xl">
        {!detalle?.historialCompras?.length ? (
          <EmptyState title="Sin compras registradas" subtitle="No hay movimientos asociados a este proveedor." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {detalle.historialCompras.map((h) => (
              <li key={h.id} className="py-3 flex justify-between text-xs sm:text-sm">
                <div>
                  <p className="font-semibold text-slate-900">{h.producto_nombre}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{h.referencia || 'Sin referencia'} · {new Date(h.created_at).toLocaleDateString('es-MX')}</p>
                </div>
                <span className="font-bold text-slate-800">+{h.cantidad} unidades</span>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      {/* Confirmación Desactivación */}
      <ConfirmDialog
        open={!!aEliminar}
        onClose={() => setAEliminar(null)}
        onConfirm={() => eliminarMutation.mutate(aEliminar.id)}
        loading={eliminarMutation.isPending}
        title="Desactivar proveedor"
        message={`¿Seguro que deseas desactivar "${aEliminar?.nombre}"?`}
      />
    </div>
  );
}

// ----------------------------------------------------------------------
// TAB ALMACENES ESTILO STRIPE / VERCEL NEUTRAL
// ----------------------------------------------------------------------
function AlmacenesTab({ busqueda, setBusqueda }) {
  const { hasRole } = useAuth();
  const puedeEditar = hasRole('Admin', 'Gerente', 'Administrador', 'Almacenista');
  const puedeEliminar = hasRole('Admin', 'Administrador');
  const queryClient = useQueryClient();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);

  const { data: almacenes, isLoading } = useQuery({ queryKey: ['almacenes'], queryFn: listarAlmacenes });
  const { data: usuarios } = useQuery({ queryKey: ['usuarios-lite'], queryFn: listarUsuarios });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['almacenes'] });

  const crearMutation = useMutation({
    mutationFn: crearAlmacen,
    onSuccess: () => { toast.success('Almacén creado exitosamente'); invalidar(); cerrar(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al crear almacén'),
  });
  const actualizarMutation = useMutation({
    mutationFn: ({ id, data }) => actualizarAlmacen(id, data),
    onSuccess: () => { toast.success('Almacén actualizado exitosamente'); invalidar(); cerrar(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al actualizar almacén'),
  });
  const eliminarMutation = useMutation({
    mutationFn: eliminarAlmacen,
    onSuccess: () => { toast.success('Almacén desactivado'); invalidar(); setAEliminar(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al desactivar almacén'),
  });

  const formik = useFormik({
    initialValues: { nombre: '', ubicacion: '', responsable_id: '' },
    enableReinitialize: true,
    validationSchema: Yup.object({ nombre: Yup.string().required('El nombre es requerido') }),
    onSubmit: (values) => {
      const payload = { ...values, responsable_id: values.responsable_id || null };
      if (editando) actualizarMutation.mutate({ id: editando.id, data: payload });
      else crearMutation.mutate(payload);
    },
  });

  const abrirNuevo = () => { setEditando(null); formik.resetForm(); setModalAbierto(true); };
  const abrirEditar = (a) => {
    setEditando(a);
    formik.resetForm({ values: { nombre: a.nombre, ubicacion: a.ubicacion || '', responsable_id: a.responsable_id || '' } });
    setModalAbierto(true);
  };
  const cerrar = () => { setModalAbierto(false); setEditando(null); };

  const filtrados = (almacenes || []).filter((a) => {
    if (!busqueda) return true;
    const term = busqueda.toLowerCase();
    return (
      a.nombre?.toLowerCase().includes(term) ||
      a.ubicacion?.toLowerCase().includes(term) ||
      a.responsable_nombre?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      {/* Toolbar y Botón Primario */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar almacén por nombre o ubicación..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 focus:bg-white text-slate-800 rounded-xl text-xs sm:text-sm font-medium border border-slate-200 outline-none focus:ring-2 focus:ring-slate-500/20 transition-all placeholder-slate-400"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {puedeEditar && (
          <button
            onClick={abrirNuevo}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-xs active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>+ Nuevo Almacén</span>
          </button>
        )}
      </div>

      {/* Tabla Almacenes Kinsta */}
      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white">
        {isLoading ? (
          <div className="py-20 flex justify-center"><Spinner /></div>
        ) : !filtrados.length ? (
          <EmptyState title="No se encontraron almacenes" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Almacén</th>
                  <th className="py-3 px-4">Ubicación / Zona</th>
                  <th className="py-3 px-4">Responsable</th>
                  <th className="py-3 px-4 text-right">Unidades Totales</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtrados.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors duration-150 group">
                    <td className="py-3 px-4 align-middle whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 font-bold flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <p className="font-semibold text-slate-900 text-xs sm:text-sm group-hover:text-slate-700 transition-colors">
                          {a.nombre}
                        </p>
                      </div>
                    </td>

                    <td className="py-3 px-4 align-middle text-slate-600 text-xs font-medium whitespace-nowrap">
                      {a.ubicacion || '—'}
                    </td>

                    <td className="py-3 px-4 align-middle text-slate-700 font-medium text-xs whitespace-nowrap">
                      {a.responsable_nombre || 'Sin asignar'}
                    </td>

                    <td className="py-3 px-4 align-middle text-right font-bold text-slate-900 whitespace-nowrap">
                      {a.total_unidades || 0} pzs
                    </td>

                    <td className="py-3 px-4 align-middle text-center whitespace-nowrap">
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="text-slate-700 text-xs font-medium">Activo</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 align-middle text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 justify-end">
                        {puedeEditar && (
                          <button
                            onClick={() => abrirEditar(a)}
                            title="Editar almacén"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}

                        {puedeEliminar && (
                          <button
                            onClick={() => setAEliminar(a)}
                            title="Desactivar almacén"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Formulario Almacén */}
      <Modal open={modalAbierto} onClose={cerrar} title={editando ? 'Editar almacén' : 'Nuevo almacén'}>
        <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
          <Field label="Nombre del Almacén" required error={formik.touched.nombre && formik.errors.nombre}>
            <input className={inputClass(formik.touched.nombre && formik.errors.nombre)} {...formik.getFieldProps('nombre')} />
          </Field>
          <Field label="Ubicación (Estante/Rack/Bodega)">
            <input className={inputClass(false)} placeholder="Zona A - Rack 3" {...formik.getFieldProps('ubicacion')} />
          </Field>
          {usuarios && (
            <Field label="Responsable del Almacén">
              <select className={inputClass(false)} {...formik.getFieldProps('responsable_id')}>
                <option value="">Sin asignar</option>
                {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
              </select>
            </Field>
          )}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200">
            <button type="button" onClick={cerrar} className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm cursor-pointer">Cancelar</button>
            <button type="submit" disabled={crearMutation.isPending || actualizarMutation.isPending} className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs cursor-pointer">Guardar Almacén</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!aEliminar}
        onClose={() => setAEliminar(null)}
        onConfirm={() => eliminarMutation.mutate(aEliminar.id)}
        loading={eliminarMutation.isPending}
        title="Desactivar almacén"
        message={`¿Seguro que deseas desactivar "${aEliminar?.nombre}"?`}
      />
    </div>
  );
}

// ----------------------------------------------------------------------
// TAB CATEGORÍAS ESTILO STRIPE / VERCEL NEUTRAL
// ----------------------------------------------------------------------
function CategoriasTab({ busqueda, setBusqueda }) {
  const { hasRole } = useAuth();
  const puedeEditar = hasRole('Admin', 'Gerente', 'Administrador', 'Almacenista');
  const puedeEliminar = hasRole('Admin', 'Administrador');
  const queryClient = useQueryClient();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);

  const { data: categorias, isLoading } = useQuery({ queryKey: ['categorias'], queryFn: listarCategorias });
  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['categorias'] });

  const crearMutation = useMutation({
    mutationFn: crearCategoria,
    onSuccess: () => { toast.success('Categoría creada exitosamente'); invalidar(); cerrar(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al crear categoría'),
  });
  const actualizarMutation = useMutation({
    mutationFn: ({ id, data }) => actualizarCategoria(id, data),
    onSuccess: () => { toast.success('Categoría actualizada exitosamente'); invalidar(); cerrar(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al actualizar categoría'),
  });
  const eliminarMutation = useMutation({
    mutationFn: eliminarCategoria,
    onSuccess: () => { toast.success('Categoría desactivada'); invalidar(); setAEliminar(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al desactivar categoría'),
  });

  const formik = useFormik({
    initialValues: { nombre: '', descripcion: '' },
    enableReinitialize: true,
    validationSchema: Yup.object({ nombre: Yup.string().required('El nombre es requerido') }),
    onSubmit: (values) => {
      if (editando) actualizarMutation.mutate({ id: editando.id, data: values });
      else crearMutation.mutate(values);
    },
  });

  const abrirNuevo = () => { setEditando(null); formik.resetForm(); setModalAbierto(true); };
  const abrirEditar = (c) => {
    setEditando(c);
    formik.resetForm({ values: { nombre: c.nombre, descripcion: c.descripcion || '' } });
    setModalAbierto(true);
  };
  const cerrar = () => { setModalAbierto(false); setEditando(null); };

  const filtrados = (categorias || []).filter((c) => {
    if (!busqueda) return true;
    const term = busqueda.toLowerCase();
    return (
      c.nombre?.toLowerCase().includes(term) ||
      c.descripcion?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      {/* Toolbar y Botón Primario */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar categoría por nombre o descripción..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 focus:bg-white text-slate-800 rounded-xl text-xs sm:text-sm font-medium border border-slate-200 outline-none focus:ring-2 focus:ring-slate-500/20 transition-all placeholder-slate-400"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {puedeEditar && (
          <button
            onClick={abrirNuevo}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-xs active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>+ Nueva Categoría</span>
          </button>
        )}
      </div>

      {/* Tabla Categorías Kinsta */}
      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white">
        {isLoading ? (
          <div className="py-20 flex justify-center"><Spinner /></div>
        ) : !filtrados.length ? (
          <EmptyState title="No se encontraron categorías" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Descripción</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtrados.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors duration-150 group">
                    <td className="py-3 px-4 align-middle whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 font-bold flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        <p className="font-semibold text-slate-900 text-xs sm:text-sm group-hover:text-slate-700 transition-colors">
                          {c.nombre}
                        </p>
                      </div>
                    </td>

                    <td className="py-3 px-4 align-middle text-slate-600 text-xs font-medium">
                      {c.descripcion || '—'}
                    </td>

                    <td className="py-3 px-4 align-middle text-center whitespace-nowrap">
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="text-slate-700 text-xs font-medium">Activo</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 align-middle text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 justify-end">
                        {puedeEditar && (
                          <button
                            onClick={() => abrirEditar(c)}
                            title="Editar categoría"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}

                        {puedeEliminar && (
                          <button
                            onClick={() => setAEliminar(c)}
                            title="Desactivar categoría"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Formulario Categoría */}
      <Modal open={modalAbierto} onClose={cerrar} title={editando ? 'Editar categoría' : 'Nueva categoría'}>
        <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
          <Field label="Nombre de la Categoría" required error={formik.touched.nombre && formik.errors.nombre}>
            <input className={inputClass(formik.touched.nombre && formik.errors.nombre)} {...formik.getFieldProps('nombre')} />
          </Field>
          <Field label="Descripción">
            <textarea rows={2} className={inputClass(false)} {...formik.getFieldProps('descripcion')} />
          </Field>
          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200">
            <button type="button" onClick={cerrar} className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm cursor-pointer">Cancelar</button>
            <button type="submit" disabled={crearMutation.isPending || actualizarMutation.isPending} className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs cursor-pointer">Guardar Categoría</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!aEliminar}
        onClose={() => setAEliminar(null)}
        onConfirm={() => eliminarMutation.mutate(aEliminar.id)}
        loading={eliminarMutation.isPending}
        title="Desactivar categoría"
        message={`¿Seguro que deseas desactivar "${aEliminar?.nombre}"?`}
      />
    </div>
  );
}
