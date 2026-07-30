import api from './api';

export const listarAlmacenes = () => api.get('/almacenes').then((r) => r.data);
export const crearAlmacen = (data) => api.post('/almacenes', data).then((r) => r.data);
export const actualizarAlmacen = (id, data) => api.put(`/almacenes/${id}`, data).then((r) => r.data);
export const eliminarAlmacen = (id) => api.delete(`/almacenes/${id}`).then((r) => r.data);
