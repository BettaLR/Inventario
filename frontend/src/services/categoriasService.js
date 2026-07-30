import api from './api';

export const listarCategorias = () => api.get('/categorias').then((r) => r.data);
export const crearCategoria = (data) => api.post('/categorias', data).then((r) => r.data);
export const actualizarCategoria = (id, data) => api.put(`/categorias/${id}`, data).then((r) => r.data);
export const eliminarCategoria = (id) => api.delete(`/categorias/${id}`).then((r) => r.data);
