import api from './api';

export const listarProductos = (params) => api.get('/productos', { params }).then((r) => r.data);
export const obtenerProducto = (id) => api.get(`/productos/${id}`).then((r) => r.data);
export const buscarPorCodigoBarras = (codigo) => api.get(`/productos/codigo/${codigo}`).then((r) => r.data);
export const crearProducto = (data) => api.post('/productos', data).then((r) => r.data);
export const actualizarProducto = (id, data) => api.put(`/productos/${id}`, data).then((r) => r.data);
export const eliminarProducto = (id) => api.delete(`/productos/${id}`).then((r) => r.data);
