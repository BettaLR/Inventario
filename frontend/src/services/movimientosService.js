import api from './api';

export const listarMovimientos = (params) => api.get('/movimientos', { params }).then((r) => r.data);
export const registrarMovimiento = (data) => api.post('/movimientos', data).then((r) => r.data);
export const actualizarUbicacion = (productoId, almacenId, ubicacion) =>
  api.put(`/movimientos/stock/${productoId}/${almacenId}/ubicacion`, { ubicacion }).then((r) => r.data);
