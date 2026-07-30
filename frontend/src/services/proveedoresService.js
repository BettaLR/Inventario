import api from './api';

export const listarProveedores = (params) => api.get('/proveedores', { params }).then((r) => r.data);
export const obtenerProveedor = (id) => api.get(`/proveedores/${id}`).then((r) => r.data);
export const crearProveedor = (data) => api.post('/proveedores', data).then((r) => r.data);
export const actualizarProveedor = (id, data) => api.put(`/proveedores/${id}`, data).then((r) => r.data);
export const eliminarProveedor = (id) => api.delete(`/proveedores/${id}`).then((r) => r.data);
