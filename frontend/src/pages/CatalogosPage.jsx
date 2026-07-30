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
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Field, { inputClass } from '../components/ui/Field';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const TABS = [
  { key: 'proveedores', label: 'Proveedores' },
  { key: 'almacenes', label: 'Almacenes' },
  { key: 'categorias', label: 'Categorías' },
];

export default function CatalogosPage() {
  const [tab, setTab] = useState('proveedores');

  return (
    <div>
      <PageHeader title="Catálogos" subtitle="Proveedores, almacenes y categorías del sistema" />

      <div className="flex gap-1 mb-4 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`tab-btn ${tab === t.key ? 'tab-btn-active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'proveedores' && <ProveedoresTab />}
      {tab === 'almacenes' && <AlmacenesTab />}
      {tab === 'categorias' && <CategoriasTab />}
    </div>
  );
}

function ProveedoresTab() {
  const { hasRole } = useAuth();
  const puedeEditar = hasRole('Admin', 'Gerente');
  const puedeEliminar = hasRole('Admin');
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
    onSuccess: () => { toast.success('Proveedor creado'); invalidar(); cerrar(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al crear proveedor'),
  });
  const actualizarMutation = useMutation({
    mutationFn: ({ id, data }) => actualizarProveedor(id, data),
    onSuccess: () => { toast.success('Proveedor actualizado'); invalidar(); cerrar(); },
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

  return (
    <div>
      {puedeEditar && (
        <div className="flex justify-end mb-3">
          <Button onClick={abrirNuevo}>Nuevo proveedor</Button>
        </div>
      )}

      <div className="panel overflow-hidden">
        {isLoading ? <Spinner /> : !proveedores?.length ? (
          <EmptyState title="No hay proveedores" />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Contacto</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th className="text-right!">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map((p) => (
                <tr key={p.id}>
                  <td className="font-medium text-ink-900">{p.nombre}</td>
                  <td className="text-ink-600">{p.contacto || '—'}</td>
                  <td className="text-ink-600">{p.telefono || '—'}</td>
                  <td className="text-ink-600">{p.email || '—'}</td>
                  <td className="text-right space-x-2 whitespace-nowrap">
                    <Button size="sm" variant="secondary" onClick={() => setVerDetalle(p.id)}>Historial</Button>
                    {puedeEditar && <Button size="sm" variant="secondary" onClick={() => abrirEditar(p)}>Editar</Button>}
                    {puedeEliminar && <Button size="sm" variant="ghost" onClick={() => setAEliminar(p)}>Desactivar</Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalAbierto} onClose={cerrar} title={editando ? 'Editar proveedor' : 'Nuevo proveedor'}>
        <form onSubmit={formik.handleSubmit} noValidate>
          <Field label="Nombre" required error={formik.touched.nombre && formik.errors.nombre}>
            <input className={inputClass(formik.touched.nombre && formik.errors.nombre)} {...formik.getFieldProps('nombre')} />
          </Field>
          <Field label="Contacto">
            <input className={inputClass(false)} {...formik.getFieldProps('contacto')} />
          </Field>
          <div className="grid grid-cols-2 gap-x-4">
            <Field label="Teléfono">
              <input className={inputClass(false)} {...formik.getFieldProps('telefono')} />
            </Field>
            <Field label="Email" error={formik.touched.email && formik.errors.email}>
              <input className={inputClass(formik.touched.email && formik.errors.email)} {...formik.getFieldProps('email')} />
            </Field>
          </div>
          <Field label="Dirección">
            <textarea rows={2} className={inputClass(false)} {...formik.getFieldProps('direccion')} />
          </Field>
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="secondary" onClick={cerrar}>Cancelar</Button>
            <Button type="submit" disabled={crearMutation.isPending || actualizarMutation.isPending}>Guardar</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!verDetalle} onClose={() => setVerDetalle(null)} title={`Historial de compras — ${detalle?.nombre || ''}`} maxWidth="max-w-xl">
        {!detalle?.historialCompras?.length ? (
          <EmptyState title="Sin compras registradas" />
        ) : (
          <ul className="divide-y divide-line">
            {detalle.historialCompras.map((h) => (
              <li key={h.id} className="py-2 flex justify-between text-sm">
                <div>
                  <p className="font-medium text-ink-900">{h.producto_nombre}</p>
                  <p className="text-xs text-ink-400">{h.referencia || 'Sin referencia'} · {new Date(h.created_at).toLocaleDateString('es-MX')}</p>
                </div>
                <span className="text-ink-600">+{h.cantidad}</span>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      <ConfirmDialog
        open={!!aEliminar}
        onClose={() => setAEliminar(null)}
        onConfirm={() => eliminarMutation.mutate(aEliminar.id)}
        loading={eliminarMutation.isPending}
        title="Desactivar proveedor"
        message={`¿Desactivar "${aEliminar?.nombre}"?`}
      />
    </div>
  );
}

function AlmacenesTab() {
  const { hasRole } = useAuth();
  const puedeEditar = hasRole('Admin', 'Gerente');
  const puedeEliminar = hasRole('Admin');
  const queryClient = useQueryClient();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);

  const { data: almacenes, isLoading } = useQuery({ queryKey: ['almacenes'], queryFn: listarAlmacenes });
  const { data: usuarios } = useQuery({ queryKey: ['usuarios-lite'], queryFn: listarUsuarios, enabled: hasRole('Admin') });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['almacenes'] });

  const crearMutation = useMutation({
    mutationFn: crearAlmacen,
    onSuccess: () => { toast.success('Almacén creado'); invalidar(); cerrar(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al crear almacén'),
  });
  const actualizarMutation = useMutation({
    mutationFn: ({ id, data }) => actualizarAlmacen(id, data),
    onSuccess: () => { toast.success('Almacén actualizado'); invalidar(); cerrar(); },
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

  return (
    <div>
      {puedeEditar && (
        <div className="flex justify-end mb-3">
          <Button onClick={abrirNuevo}>Nuevo almacén</Button>
        </div>
      )}

      <div className="panel overflow-hidden">
        {isLoading ? <Spinner /> : !almacenes?.length ? (
          <EmptyState title="No hay almacenes" />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Ubicación</th>
                <th>Responsable</th>
                <th className="text-right!">Unidades totales</th>
                <th className="text-right!">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {almacenes.map((a) => (
                <tr key={a.id}>
                  <td className="font-medium text-ink-900">{a.nombre}</td>
                  <td className="text-ink-600">{a.ubicacion || '—'}</td>
                  <td className="text-ink-600">{a.responsable_nombre || '—'}</td>
                  <td className="text-right text-ink-900">{a.total_unidades}</td>
                  <td className="text-right space-x-2 whitespace-nowrap">
                    {puedeEditar && <Button size="sm" variant="secondary" onClick={() => abrirEditar(a)}>Editar</Button>}
                    {puedeEliminar && <Button size="sm" variant="ghost" onClick={() => setAEliminar(a)}>Desactivar</Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalAbierto} onClose={cerrar} title={editando ? 'Editar almacén' : 'Nuevo almacén'}>
        <form onSubmit={formik.handleSubmit} noValidate>
          <Field label="Nombre" required error={formik.touched.nombre && formik.errors.nombre}>
            <input className={inputClass(formik.touched.nombre && formik.errors.nombre)} {...formik.getFieldProps('nombre')} />
          </Field>
          <Field label="Ubicación (estante/rack/bodega)">
            <input className={inputClass(false)} {...formik.getFieldProps('ubicacion')} />
          </Field>
          {usuarios && (
            <Field label="Responsable">
              <select className={inputClass(false)} {...formik.getFieldProps('responsable_id')}>
                <option value="">Sin asignar</option>
                {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
              </select>
            </Field>
          )}
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="secondary" onClick={cerrar}>Cancelar</Button>
            <Button type="submit" disabled={crearMutation.isPending || actualizarMutation.isPending}>Guardar</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!aEliminar}
        onClose={() => setAEliminar(null)}
        onConfirm={() => eliminarMutation.mutate(aEliminar.id)}
        loading={eliminarMutation.isPending}
        title="Desactivar almacén"
        message={`¿Desactivar "${aEliminar?.nombre}"?`}
      />
    </div>
  );
}

function CategoriasTab() {
  const { hasRole } = useAuth();
  const puedeEditar = hasRole('Admin', 'Gerente');
  const puedeEliminar = hasRole('Admin');
  const queryClient = useQueryClient();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);

  const { data: categorias, isLoading } = useQuery({ queryKey: ['categorias'], queryFn: listarCategorias });
  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['categorias'] });

  const crearMutation = useMutation({
    mutationFn: crearCategoria,
    onSuccess: () => { toast.success('Categoría creada'); invalidar(); cerrar(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al crear categoría'),
  });
  const actualizarMutation = useMutation({
    mutationFn: ({ id, data }) => actualizarCategoria(id, data),
    onSuccess: () => { toast.success('Categoría actualizada'); invalidar(); cerrar(); },
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

  return (
    <div>
      {puedeEditar && (
        <div className="flex justify-end mb-3">
          <Button onClick={abrirNuevo}>Nueva categoría</Button>
        </div>
      )}

      <div className="panel overflow-hidden">
        {isLoading ? <Spinner /> : !categorias?.length ? (
          <EmptyState title="No hay categorías" />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th className="text-right!">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium text-ink-900">{c.nombre}</td>
                  <td className="text-ink-600">{c.descripcion || '—'}</td>
                  <td className="text-right space-x-2 whitespace-nowrap">
                    {puedeEditar && <Button size="sm" variant="secondary" onClick={() => abrirEditar(c)}>Editar</Button>}
                    {puedeEliminar && <Button size="sm" variant="ghost" onClick={() => setAEliminar(c)}>Desactivar</Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalAbierto} onClose={cerrar} title={editando ? 'Editar categoría' : 'Nueva categoría'}>
        <form onSubmit={formik.handleSubmit} noValidate>
          <Field label="Nombre" required error={formik.touched.nombre && formik.errors.nombre}>
            <input className={inputClass(formik.touched.nombre && formik.errors.nombre)} {...formik.getFieldProps('nombre')} />
          </Field>
          <Field label="Descripción">
            <textarea rows={2} className={inputClass(false)} {...formik.getFieldProps('descripcion')} />
          </Field>
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="secondary" onClick={cerrar}>Cancelar</Button>
            <Button type="submit" disabled={crearMutation.isPending || actualizarMutation.isPending}>Guardar</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!aEliminar}
        onClose={() => setAEliminar(null)}
        onConfirm={() => eliminarMutation.mutate(aEliminar.id)}
        loading={eliminarMutation.isPending}
        title="Desactivar categoría"
        message={`¿Desactivar "${aEliminar?.nombre}"?`}
      />
    </div>
  );
}
