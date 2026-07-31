import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { listarUsuarios, crearUsuario, actualizarEstadoUsuario } from '../services/usuariosService';
import Modal from '../components/ui/Modal';
import Field, { inputClass } from '../components/ui/Field';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const schema = Yup.object({
  nombre: Yup.string().required('El nombre es requerido'),
  email: Yup.string().email('Email inválido').required('El email es requerido'),
  password: Yup.string().min(6, 'Mínimo 6 caracteres').required('La contraseña es requerida'),
  rol_id: Yup.string().required('El rol es requerido'),
});

const emptyUsuario = { nombre: '', email: '', password: '', rol_id: '2' };

// Componente Badge de Rol Inspirado Fielmente en el Boceto
function RoleBadge({ rol }) {
  const r = (rol || '').toLowerCase();

  if (r.includes('admin')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
        <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span>Administrador</span>
      </span>
    );
  }

  if (r.includes('almacen')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
        <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <span>Almacenista</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
      <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <span>Cliente</span>
    </span>
  );
}

export default function UsuariosPage() {
  const queryClient = useQueryClient();
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioADesactivar, setUsuarioADesactivar] = useState(null);
  const [menuAbiertoId, setMenuAbiertoId] = useState(null);

  const { data: usuarios, isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: listarUsuarios,
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['usuarios'] });

  const crearMutation = useMutation({
    mutationFn: crearUsuario,
    onSuccess: () => {
      toast.success('Usuario registrado exitosamente');
      invalidar();
      cerrarModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al crear usuario'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, activo }) => actualizarEstadoUsuario(id, activo),
    onSuccess: () => {
      toast.success('Estado de usuario actualizado');
      invalidar();
      setUsuarioADesactivar(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al actualizar estado'),
  });

  const formik = useFormik({
    initialValues: emptyUsuario,
    validationSchema: schema,
    onSubmit: (values) => {
      crearMutation.mutate({
        ...values,
        rol_id: Number(values.rol_id),
      });
    },
  });

  const abrirNuevo = () => {
    formik.resetForm({ values: emptyUsuario });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
  };

  // Filtrado de usuarios por búsqueda
  const usuariosFiltrados = (usuarios || []).filter((u) => {
    if (!busqueda) return true;
    const term = busqueda.toLowerCase();
    return (
      u.nombre?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.rol?.toLowerCase().includes(term)
    );
  });

  // Generador de Iniciales de Avatar
  const getIniciales = (nombre) => {
    if (!nombre) return 'US';
    const partes = nombre.trim().split(' ');
    if (partes.length >= 2) return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
    return nombre.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 pb-8 font-sans w-full">
      {/* 1. Header Principal Estilo Boceto (Título + Subtítulo + Botón "+ Agregar usuario") */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">Usuarios</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Gestiona el acceso, permisos y roles de los usuarios del sistema.
          </p>
        </div>

        {/* Botón "+ Agregar usuario" en Alto Contraste Oscuro Corporativo */}
        <button
          onClick={abrirNuevo}
          className="bg-[#111827] hover:bg-[#1f2937] text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-xs active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Agregar usuario</span>
        </button>
      </div>

      {/* 2. Contenedor Tarjeta Blanca Limpia (Card Container) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
        
        {/* Buscador Superior Izquierdo Integrado */}
        <div className="relative max-w-sm">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 focus:bg-white text-slate-800 rounded-xl text-xs sm:text-sm font-medium border border-slate-200 outline-none focus:ring-2 focus:ring-slate-500/20 transition-all placeholder-slate-400"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* 3. Tabla Maquetada Fiel al Boceto */}
        <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white">
          {isLoading ? (
            <div className="py-20 flex justify-center"><Spinner /></div>
          ) : !usuariosFiltrados.length ? (
            <EmptyState title="No se encontraron usuarios" subtitle="Intenta con otro término o añade un nuevo usuario." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-[28%]">USUARIO</th>
                    <th className="py-3.5 px-4 w-[32%]">CORREO ELECTRÓNICO</th>
                    <th className="py-3.5 px-4 w-[18%]">ROL</th>
                    <th className="py-3.5 px-4 text-center w-[12%]">ESTADO</th>
                    <th className="py-3.5 px-4 text-right w-[10%]">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {usuariosFiltrados.map((u) => {
                    const iniciales = getIniciales(u.nombre);
                    const esActivo = Boolean(u.activo);
                    const menuAbierto = menuAbiertoId === u.id;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors duration-150 group">
                        {/* Columna USUARIO: Avatar Circular Gris + Nombre en Negrita */}
                        <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 font-bold text-xs border border-slate-200/60 flex items-center justify-center shrink-0 shadow-2xs">
                              {iniciales}
                            </div>
                            <p className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-slate-700 transition-colors">
                              {u.nombre}
                            </p>
                          </div>
                        </td>

                        {/* Columna CORREO ELECTRÓNICO */}
                        <td className="py-3.5 px-4 align-middle text-slate-500 text-xs sm:text-sm font-medium whitespace-nowrap">
                          {u.email}
                        </td>

                        {/* Columna ROL: Soft Badge Con Icono (Almacenista/Cliente/Administrador) */}
                        <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                          <RoleBadge rol={u.rol} />
                        </td>

                        {/* Columna ESTADO: Status Dot Verde de 6px + Activo */}
                        <td className="py-3.5 px-4 align-middle text-center whitespace-nowrap">
                          <div className="inline-flex items-center justify-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${esActivo ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            <span className="text-slate-700 text-xs font-medium">
                              {esActivo ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </td>

                        {/* Columna ACCIONES: Icono Lápiz ✏️ + Desplegable 3 Puntos ... */}
                        <td className="py-3.5 px-4 align-middle text-right whitespace-nowrap relative">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <button
                              onClick={() => {
                                toast.success(`Editando permisos de ${u.nombre}`);
                              }}
                              title="Editar usuario"
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>

                            {/* Menu 3 puntos desplegable */}
                            <div className="relative">
                              <button
                                onClick={() => setMenuAbiertoId(menuAbierto ? null : u.id)}
                                title="Más opciones"
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                              </button>

                              {menuAbierto && (
                                <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 text-left text-xs text-slate-700 font-medium">
                                  <button
                                    onClick={() => {
                                      toggleMutation.mutate({ id: u.id, activo: !u.activo });
                                      setMenuAbiertoId(null);
                                    }}
                                    className="w-full px-3 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer text-slate-700"
                                  >
                                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span>{esActivo ? 'Desactivar usuario' : 'Activar usuario'}</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setUsuarioADesactivar(u);
                                      setMenuAbiertoId(null);
                                    }}
                                    className="w-full px-3 py-2 hover:bg-rose-50 flex items-center gap-2 cursor-pointer text-rose-600 font-medium"
                                  >
                                    <svg className="w-3.5 h-3.5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span>Eliminar usuario</span>
                                  </button>
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

        {/* 4. Footer de Paginación Fiel al Boceto */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-500 font-medium">
          <p>
            Mostrando 1 a {usuariosFiltrados.length} de {usuariosFiltrados.length} usuarios
          </p>
          <div className="flex items-center gap-1">
            <button disabled className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 text-slate-300 flex items-center justify-center cursor-not-allowed">
              ‹
            </button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 bg-white font-bold text-slate-800 flex items-center justify-center">
              1
            </button>
            <button disabled className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 text-slate-300 flex items-center justify-center cursor-not-allowed">
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Modal Formulario "Agregar usuario" */}
      <Modal open={modalAbierto} onClose={cerrarModal} title="Agregar usuario" maxWidth="max-w-md">
        <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
          <Field label="Nombre Completo" required error={formik.touched.nombre && formik.errors.nombre}>
            <input className={inputClass(formik.touched.nombre && formik.errors.nombre)} placeholder="Ej. Juan Pérez" {...formik.getFieldProps('nombre')} />
          </Field>

          <Field label="Correo Electrónico" required error={formik.touched.email && formik.errors.email}>
            <input className={inputClass(formik.touched.email && formik.errors.email)} placeholder="usuario@inventario.com" {...formik.getFieldProps('email')} />
          </Field>

          <Field label="Contraseña Inicial" required error={formik.touched.password && formik.errors.password}>
            <input type="password" className={inputClass(formik.touched.password && formik.errors.password)} placeholder="••••••••" {...formik.getFieldProps('password')} />
          </Field>

          <Field label="Rol de Usuario" required error={formik.touched.rol_id && formik.errors.rol_id}>
            <select className={inputClass(formik.touched.rol_id && formik.errors.rol_id)} {...formik.getFieldProps('rol_id')}>
              <option value="1">Administrador</option>
              <option value="2">Almacenista</option>
              <option value="3">Cliente</option>
            </select>
          </Field>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200">
            <button type="button" onClick={cerrarModal} className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm cursor-pointer">
              Cancelar
            </button>
            <button type="submit" disabled={crearMutation.isPending} className="px-5 py-2 bg-[#111827] hover:bg-[#1f2937] text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs cursor-pointer disabled:opacity-50">
              {crearMutation.isPending ? 'Guardando...' : 'Agregar usuario'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmación Desactivación / Eliminación */}
      <ConfirmDialog
        open={!!usuarioADesactivar}
        onClose={() => setUsuarioADesactivar(null)}
        onConfirm={() => toggleMutation.mutate({ id: usuarioADesactivar.id, activo: false })}
        loading={toggleMutation.isPending}
        title="Desactivar usuario"
        message={`¿Seguro que deseas desactivar el acceso de "${usuarioADesactivar?.nombre}" al sistema?`}
      />
    </div>
  );
}
